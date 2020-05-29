// pages/cart/cart.js
import {Cart} from 'cart-model.js';
var cart = new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      selectedCounts:0,
      selectedTypes:0,
      selectedTotalPrice:0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var localCartData = cart.getCartDataFromLocal();   
 
    if(localCartData.length==0){
      cart.getCartDataFromServer(res=>{
        var serverCartData = res;
        if(serverCartData.length!=0){
          wx.setStorageSync('cart',serverCartData);  //更新本地缓存
          wx.setStorageSync('trueEmpty', false);//判断cart是否trueEmpty，防止错误删除服务器DB数据；只有trueEmpty才会删；
        }
        else{
          wx.setStorageSync('trueEmpty', true);
        }

        var calcResult = this._calcSelectedPriceAndCounts(serverCartData);
        this.setData({
          selectedCounts:calcResult.selectedCounts,
          selectedTypes:calcResult.selectedTypes,
          selectedTotalPrice:calcResult.selectedTotalPrice,
          cartData:serverCartData,
        });
      })             
    }
    else{
      wx.setStorageSync('trueEmpty', false);
      var calcResult = this._calcSelectedPriceAndCounts(localCartData);
      this.setData({
        selectedCounts:calcResult.selectedCounts,
        selectedTypes:calcResult.selectedTypes,
        selectedTotalPrice:calcResult.selectedTotalPrice,
        cartData:localCartData,
      });
    }   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    var localCartData = cart.getCartDataFromLocal();   
 
    // if(localCartData.length!=0){
      var calcResult = this._calcSelectedPriceAndCounts(localCartData);
      this.setData({
        selectedCounts:calcResult.selectedCounts,
        selectedTypes:calcResult.selectedTypes,
        selectedTotalPrice:calcResult.selectedTotalPrice,
        cartData:localCartData,
      });
    // }
  },

  _calcSelectedPriceAndCounts:function(cartData){
    var length = cartData.length;
    var selectedTotalPrice = 0;
    var selectedCounts= 0;
    var selectedTypes=0;
    let multiple =100;
    for(let i=0;i<length;i++){
      if(cartData[i].selectedStatus){
        selectedTotalPrice += cartData[i].counts*multiple*Number(cartData[i].price)*multiple; // 避免JavaScript 浮点运算出现误差问题：0.05+0.01=0.06000000000000005; 所以浮点运算多乘100*100;
        selectedCounts += cartData[i].counts;
        selectedTypes ++;
      }
    }
    return {
      selectedTotalPrice:selectedTotalPrice/(multiple*multiple),//还原
      selectedCounts,
      selectedTypes
    }
  },

  toggleSelect:function(event){
    var id = cart.getDataSet(event,'id');
    this.data.cartData[id].selectedStatus = !this.data.cartData[id].selectedStatus
    var calcResult = this._calcSelectedPriceAndCounts(this.data.cartData);
    this.setData({
      selectedCounts:calcResult.selectedCounts,
      selectedTypes:calcResult.selectedTypes,
      selectedTotalPrice:calcResult.selectedTotalPrice,
      cartData:this.data.cartData,
    });
    this._updateCartDataObj(this.data.cartData);//刷新AppData里面的相关参数
    // cart.updateLocalCartData(this.data.cartData); //写数据库/本地缓存里面的cartData，这样下次进入本页面不会状态丢失，统一在onHide时进行
    
  },

  toggleSelectAll:function(event){
    var status = cart.getDataSet(event,'status') == 'true'; //判断当前状态是否在全选态还是非全选态
    for(let i=0; i<this.data.cartData.length;i++){
      this.data.cartData[i].selectedStatus = !status;
    }
    this._updateCartDataObj(this.data.cartData);//刷新AppData里面的相关参数
    // cart.updateLocalCartData(this.data.cartData); //刷新数据库/storage里面的cartData；这样下次进入本页面不会状态丢失，统一在onHide时进行
 
  },

  _updateCartDataObj(cartData){
    var calcResult = this._calcSelectedPriceAndCounts(cartData);
    this.setData({
      selectedCounts:calcResult.selectedCounts,
      selectedTypes:calcResult.selectedTypes,
      selectedTotalPrice:calcResult.selectedTotalPrice,
      cartData:cartData,
    });
  },

  changeCounts:function(event){
    var id = cart.getDataSet(event,'id');
    var type = cart.getDataSet(event,'type');
    if(type=='minus' && this.data.cartData[id].counts>1){
      this.data.cartData[id].counts--;
    }
    if(type=='add' && this.data.cartData[id].counts<500){ //最大500
      this.data.cartData[id].counts++;
    }
    this._updateCartDataObj(this.data.cartData);
    // cart.updateLocalCartData(this.data.cartData);//统一在onHide时进行
  },

  deleteCartItem:function(event){
    var id = cart.getDataSet(event,'id');
    this.data.cartData.splice(id,1);
    this._updateCartDataObj(this.data.cartData);
    // cart.updateLocalCartData(this.data.cartData);//统一在onHide时进行
  },
 
  submitOrder:function(event){
    wx.navigateTo({
      url: '../order/order?orderPrice='+this.data.selectedTotalPrice+'&from=cart'
    });
  },

  toProductsItemTap : function(event) {
    var id = cart.getDataSet(event,'pid');
    // console.log(id);
    wx.navigateTo({
      url: '../product/product?id='+id
    });    
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {  //在离开本页面时，统一更新本地缓存/数据库
    cart.updateLocalCartData(this.data.cartData); 
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