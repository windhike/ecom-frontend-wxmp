
import { Config } from 'config.js';


class Token {
  constructor(){
  };

  verifyToken(){
    var token = wx.getStorageSync('token');
    if(!token){
      this.getTokenFromServer();
    }
    else{
      this._verifyTokenFromServer(token);
    }
    
  }

  getTokenFromServer (callback) {
    //调用登录接口
    wx.login({
      success: function (res) {
        // var code = res.code;
        // console.log('code');
        // console.log(code);
        wx.request({
          url: Config.restUrl + 'token/user',
          data: {
            code: res.code
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          success: function (res) {
            // console.log(res.data);
            wx.setStorageSync('token', res.data.token);
            callback&&callback(res.data.token);
          },
         
        })
      }
    })
  };

  _verifyTokenFromServer (token) {
    var that = this; //保存回调函数回调前的环境变量；
    //调用登录接口
    wx.request({
      url: Config.restUrl + 'token/verify',
      header: {
        'token': token
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (isValid) {
        // console.log(res.data);
        if(!isValid){
          that.getTokenFromServer();
        }
      },
      
    })
  };

}
export{Token}