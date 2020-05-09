// pages/my/my.js
import {Address} from '../../utils/address.js';
import {Order} from '../order/order-model.js';
import {My} from '../my/my-model.js';

var address=new Address();
var order=new Order();
var my=new My();

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    addressInfo:null,
    pageIndex:1,
    isLoadedAll:false,
    loadingHidden:false,
    orderArr:[],
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
    this._getOrders();
    // order.execSetStorageSync(false);  //更新标志位
    this._getAddressInfo();
  },

  _loadData:function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function(e) {  //???
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**地址信息**/
  _getAddressInfo:function(){
    var that=this;
    address.getAddress((addressInfo)=>{
        that.setData({
          addressInfo:addressInfo
        });
    });
  },



    /*订单信息*/
    _getOrders:function(callback){
      var that=this;
      order.getOrders(this.data.pageIndex,(res)=>{
          var data=res.data;
          that.setData({
              loadingHidden: true
          });
          if(data.length>0) {
              that.data.orderArr.push.apply(that.data.orderArr,res.data);  //数组合并
              that.setData({
                  orderArr: that.data.orderArr
              });
          }else{
              that.data.isLoadedAll=true;  //已经全部加载完毕
              that.data.pageIndex=1;
          }
          callback && callback();
      });
  },

  /*显示订单的具体信息*/
  showOrderDetailInfo:function(event){
      var id=order.getDataSet(event,'id');
      wx.navigateTo({
          url:'../order/order?from=order&id='+id
      });
  },

  rePay:function (event) {
    var order_id = order.getDataSet(event,'id');
    var index = order.getDataSet(event,'index');
            //online 上线实例，屏蔽支付功能
            if(order.onPay) {
              this._execPay(order_id,index);
          }else {
              this.showTips('支付提示','本产品仅用于演示，支付系统已屏蔽');
          }
  },



  /*支付*/
_execPay:function(id,index){
    var that=this;
    order.preOrderAndPay(id,(statusCode)=>{
        if(statusCode>0){
            var flag=statusCode==2;

            //更新订单显示状态
            if(flag){
                that.data.orderArr[index].status=2;
                that.setData({
                    orderArr: that.data.orderArr
                });
            }

            //跳转到 成功页面
            wx.navigateTo({
                url: '../pay-result/pay-result?id='+id+'&flag='+flag+'&from=my'
            });
        }else{
            that.showTips('支付失败','商品已下架或库存不足');
        }
    });
},


      /*
     * 提示窗口
     * params:
     * title - {string}标题
     * content - {string}内容
     * flag - {bool}是否跳转到 "我的页面"
     */
    showTips:function(title,content){
      wx.showModal({
          title: title,
          content: content,
          showCancel:false,
          success: function(res) {

          }
      });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
        //更新订单,相当自动下拉刷新,只有  非第一次打开 “我的”页面，且有新的订单时 才调用。
        var newOrderFlag=order.hasNewOrder();
        if(this.data.loadingHidden &&newOrderFlag){
            this.onPullDownRefresh();
        }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(){
    var that=this;
    this.data.orderArr=[];  //订单初始化
    this._getOrders(()=>{
        that.data.isLoadedAll=false;  //是否加载完全
        that.data.pageIndex=1;
        wx.stopPullDownRefresh();
        order.execSetStorageSync(false);  //更新标志位
    });
},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.isLoadedAll) {
        this.data.pageIndex++;
        this._getOrders();
    }
  },

  // editAddress:function (event) {
  //   var that = this;
  //   wx.chooseAddress({
  //     success: (wxAddrRes) => {
  //         // console.log(wxAddrRes);
  //         wxAddrRes.telNumber = '013342186975';//test用
  //         var addressInfo={
  //           name:wxAddrRes.userName,
  //           mobile:wxAddrRes.telNumber,
  //           detailAddress:address.assembleWxAddress(wxAddrRes),
  //         };
  //         that.setData({
  //           addressInfo:addressInfo,
  //         });
  //         address.submitAddress(wxAddrRes,(res)=>{
  //           if(res==false){
  //             this.showTips('操作提示','地址信息更新数据库失败');
  //           }
  //         });
  //     },
  //   })
  // },

      /*修改或者添加地址信息*/
      editAddress:function(){
        var that=this;
        wx.chooseAddress({
            success: function (res) {
                var addressInfo = {
                    name:res.userName,
                    mobile:res.telNumber,
                    totalDetail:address.assembleWxAddress(res)
                };
                if(res.telNumber) {
                  that.setData({
                    addressInfo:addressInfo,
                  });
                    //保存地址
                    address.submitAddress(res, (flag)=> {
                        if (!flag) {
                            that.showTips('操作提示', '地址信息更新失败！');
                        }
                    });
                }
                //模拟器上使用
                else{
                    that.showTips('操作提示', '地址信息更新失败,手机号码信息为空！');
                }
            }
        })
    },

})