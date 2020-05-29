import {Base} from '../../utils/base.js';

class My extends Base{
  constructor(){
    super();
  }

    //得到用户信息
    getUserInfo(callback){
        var that = this;
        wx.login({
            success: function () {
                wx.getUserInfo({
                    success: function (res) {
                        const data = {
                            auth: true,
                            userInfo: res.userInfo
                        }
                        typeof callback == "function" && callback(data);

                        //将用户昵称 提交到服务器
                        if (!that.onPay) {
                            // that._updateUserInfo(res.userInfo); //将用户的微信info存入后端数据库，暂未支持；
                        }

                    },
                    fail: function (res) {
                        const data = {
                            auth: false,
                            userInfo: {
                                avatarUrl: '../../imgs/icon/user@default.png',
                                nickName: '点击获取用户信息'
                            }
                        }
                        typeof callback == "function" && callback(data);
                    }
                })
            },
        })
    }

  /*更新用户信息到服务器*/
  _updateUserInfo(res){
      var nickName=res.nickName;
    //   delete res.avatarUrl;  //将昵称去除
      delete res.nickName;  //将昵称去除
      var allParams = {
          url: 'user/wx_info'+'?XDEBUG_SESSION_START=19402',
          data:{nickname:nickName,extend:JSON.stringify(res)},
          method:'post',
          sCallback: function (data) {
          }
      };
      this.request(allParams);

  }


}
export{My}