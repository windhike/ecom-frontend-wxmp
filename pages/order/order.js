// pages/order/order.js
import {Order} from 'order-model.js';
import {Address} from '../../utils/address.js';
import {Cart} from '../cart/cart-model.js';
import {Config} from '../../utils/config';
var order = new Order();
var address = new Address();
var cart = new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatus:0,  // 就是DB order表中的 status 标志。 代表：$order->status = OrderStatusEnum::UNPAID; //订单执行状态： 1:未支付， 2：已支付，3：已发货 , 4: 已支付，但库存不足。
    //同时 orderStatus=0 表示前端刚生成的未提交的新订单。
    order_id:-1,
    orderPrice:0,
    isAuthorized:false, //用户是否已授权订阅消息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.from=='cart' && options.orderPrice > 0){
      this.data.orderPrice=options.orderPrice;
      this._fromCart(this.data.orderPrice);
    }
    if(options.from=='order' && options.id >0){ //从‘我的/My’里面的已有未支付订单来
      this.data.order_id = options.id;
      this._fromExistOrder(this.data.order_id);
    }
   
  },

  _fromCart:function (orderPrice){
    var that=this;
    var orderData = order.getOrderDataFromLocal();
    this.setData({
      orderData:orderData,
      orderPrice:orderPrice,
      orderStatus:0
    });
      address.getAddress((dbAddrRes)=>{
      var addressInfo={
        name:dbAddrRes.name,
        mobile:dbAddrRes.mobile,
        detailAddress:address.assembleDbAddress(dbAddrRes),
      };
      that.setData({
        addressInfo:addressInfo,
      })
    });
  },

    //旧订单,在‘我的’里面的已有未支付订单
  _fromExistOrder:function (order_id) {
  var that = this;
  //下单后，支付成功或者失败后，点左上角返回时能够更新订单状态 所以放在onshow中
  var id = order_id;
  order.getOrderInfoById(id, (data)=> { //支付失败返回时，认为订单已在服务器生成，所以从服务器读订单详情。--- 但是问题：支付失败，订单一定生成了吗？？？
      that.setData({
          orderStatus: data.status,
          orderData: data.snap_items,
          orderPrice: data.total_price,
          basicInfo: {
              orderTime: data.create_time,
              orderNo: data.order_no
          },
      });

      // 快照地址
      var addressInfo=data.snap_address;
      addressInfo.detailAddress = address.assembleDbAddress(addressInfo);
// addressInfo 结构 ={
//   name:wxAddrRes.userName,
//   mobile:wxAddrRes.telNumber,
//   detailAddress:address.assembleWxAddress(wxAddrRes),
// };
      that.setData({
        addressInfo: addressInfo
      });
  });
},

    
   /**
   * 生命周期函数--监听页面显示
   */
  // 页面路由
  // 页面返回	调用 API wx.navigateBack
  // 使用组件<navigator open-type="navigateBack">
  // 用户按左上角返回按钮	onUnload	onShow
  //从其他页面返回，要放在onShow里面
  onShow: function () {
    if(this.data.order_id >0){ //第一次进入付款页面时，没有生成order_id（order_id=-1），服务器DB里也没这个订单的记录，所以初始化（order_id=-1），不用去服务器查找订单数据。
      this._fromExistOrder(this.data.order_id);
    }   
  },

  editAddress:function (event) {
    var that = this;
    wx.chooseAddress({
      success: (wxAddrRes) => {
          // console.log(wxAddrRes);
          wxAddrRes.telNumber = '013342186975';//test用
          var addressInfo={
            name:wxAddrRes.userName,
            mobile:wxAddrRes.telNumber,
            detailAddress:address.assembleWxAddress(wxAddrRes),
          };
          that.setData({
            addressInfo:addressInfo,
          });
          address.submitAddress(wxAddrRes,(res)=>{
            if(res==false){
              this.showTips('操作提示','地址信息更新数据库失败');
            }
          });
      },
    })
  },

  /*下单和付款*/
  pay:function(){ //不用event了？
    if(!this.data.addressInfo){ //这里增加地址判断时因为进入pay函数的入口有2个地方，新增order或者历史订单
        this.showTips('下单提示','请填写您的收货地址');
        return;
    }
    if(this.data.orderStatus==0){  //orderStatus=0 表示前端刚生成的未提交的新订单；orderStatus=1 表示‘未支付’的订单；
        this._firstTimePay();
    }else{
        this._existOrderPay(); //在‘我的’里面的已有未支付订单
    }
  },

  /*第一次支付*/
  _firstTimePay:function(){
      var orderInfo=[],
          procuctInfo=this.data.orderData,
          order=new Order();
      for(let i=0;i<procuctInfo.length;i++){
          orderInfo.push({  //生成服务器要的order数据模式：product_id + count 
              product_id:procuctInfo[i].id,
              count:procuctInfo[i].counts 
          });
      }

      var that=this;
      //支付分两步，第一步是生成订单号，然后根据订单号支付
      /*    placeOrder后db返回给客户端的OrderStatus结构如下：
    return $orderStatus [
    'inStock'=>true/false,
    'order_no'=>$orderNo,
    'order_id'=>$orderId,
    'create_time'=>$createTime,
    ];*/
      order.placeOrder(orderInfo,(dbOrderStatus)=>{
          //订单生成成功
          if(dbOrderStatus.inStock) {
              //更新订单状态
              var order_id=dbOrderStatus.order_id; //order_no呢？
              that.data.order_id=order_id;

              //开始支付
              that._preOrderAndPay(order_id);
          }else{
              that._orderFail(dbOrderStatus);  // 下单失败
          }
      });
  },

  /*
  *下单失败
  * params:
  * data - {obj} 订单结果信息
  * */
_orderFail:function(data){
  var nameArr=[],
      name='',
      str='',
      stock=0,
      stockArr=[],
      pArr=data.pStatusArray;
  for(let i=0;i<pArr.length;i++){
      if(!pArr[i].inStock){
          name=pArr[i].name;
          stock=pArr[i].stock;
          stockArr.push(stock);
          if(name.length>15){
              name = name.substr(0,12)+'...';
          }
          nameArr.push(name);
          if(nameArr.length>=2){
              break;
          }
      }
  }
  // str+=nameArr.join('、');
  str+=nameArr[0];
  if(nameArr.length>=2){
      str+=' 等';
  }
  str+=' 缺货';
  str+='\n'+nameArr[0]+'仅余'+stockArr[0]+'件';
  wx.showModal({
      title: '下单失败',
      content: str,
      showCancel:false,
      success: function(res) {

      }
  });
},

/* 再次次支付*/
_existOrderPay:function(){
  this._preOrderAndPay(this.data.order_id);
},

/*
*开始支付
* params:
* id - {int}订单id
*/
_preOrderAndPay:function(id){ //原文为_execPay()
  if(!order.onPay) {
      this.showTips('支付提示','本产品仅用于演示，支付系统已屏蔽',true);//屏蔽支付，提示
      this.deleteProducts(); //将已经下单的商品从购物车删除
      return;
  }
  var that=this;
  order.preOrderAndPay(id,(statusCode)=>{
      if(statusCode!=0){
          that.deleteProducts(); //将已经下单的商品从购物车删除   可能值 0:商品缺货等原因导致订单不能支付(后端或者wx服务器端preOrder处理就不让支付);  1: 支付失败或者支付取消(wx服务器端真正支付处理出错，此时会在DB生成记录，但状态为未支付的订单--orderStauts/DB order表中的status标志位=1--未支付)； 2:支付成功；

          //用户下单时，请求订阅消息权限；
          if(!that.data.isAuthorized){  
            wx.requestSubscribeMessage({
              tmplIds: [Config.templateMsgId],
              success: function (res) {
                if (res.errMsg == 'requestSubscribeMessage:ok'){
                  that.setData({
                    isAuthorized : true,
                  });
                  // wx.showToast({
                  //   title: '订阅OK！',
                  // })
                }
                // console.log(res)
                //成功
              },
              fail(err) {
                //失败
                console.error(err);
              }
            })
          }
          //-------------------------------
          var flag = statusCode == 2; //flag==true，表示支付成功
          wx.navigateTo({
              url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order'
          });
      }
  });
},

//将已经下单的商品从购物车删除
deleteProducts:function() {
  var ids=[],arr=this.data.orderData;
  for(let i=0;i<arr.length;i++){
      ids.push(arr[i].id);
  }
  cart.delete(ids); // cart对象中的批量删除函数
},

      /*
      * 提示窗口
      * params:
      * title - {string}标题
      * content - {string}内容
      * flag - {bool}是否跳转到 "我的页面"
      */
      showTips:function(title,content,flag){
      wx.showModal({
          title: title,
          content: content,
          showCancel:false,
          success: function(res) {
              if(flag) {
                  wx.switchTab({
                      url: '/pages/my/my'
                  });
              }
          }
      });
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})