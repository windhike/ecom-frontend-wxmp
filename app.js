//app.js
import {Token} from './utils/token.js';
import {Cart} from './pages/cart/cart-model.js';


App({
  globalData: {
    userInfo: null
  },

  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    var token = new Token();
    token.verifyToken();
    
    wx.setStorageSync('trueEmpty', false);//判断cart是否trueEmpty，防止错误删除服务器DB数据；只有trueEmpty才会删；
    
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },

  onHide () {
    // Do something when hide.
    var cart = new Cart();
    var cartData = wx.getStorageSync('cart');
    cart.updateServerCartData(cartData, res=>{
      if(res==false){
        this.showTips('更新购物车数据库失败');
      }
    });
  },

})