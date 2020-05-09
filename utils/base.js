import {Config} from '../utils/config.js';
import { Token } from './token.js';

class Base{
  constructor(){
    this.baseRequestUrl = Config.restUrl;
    this.onPay=Config.onPay;
  }
  
  request(params,noRefech){  //noRefetch=true，就不做重取操作。
    //用noRefetch控制只重取1次；防止无限调用。第一次调用request时，一个参数如果调用时没有复制则为false
    var that = this;
    var url = this.baseRequestUrl+params.url;
    if(!params.method){
        params.method = 'GET';
    }
    wx.request({
      url: url,
      data:params.data,
      method: params.method, //给个默认值‘GET'
      header: {
        'content-type':'application/json',
        'token':wx.getStorageSync('token'), // token存在缓存里；
      },
      success:function (res) { 
        var httpCode = res.statusCode.toString(); //返回的code
        var startChar = httpCode.charAt(0); //首字符
        if (startChar=='2'){ //2xx:200,201,202.. is normal
          params.sCallback && params.sCallback(res.data); //s stand for success
        }
        else{ //4xx:400,401,403,404 or 5xx.. is abnormal
          if(httpCode=='401' && !noRefech){  //401 means 没有权限，没有携带token/token已过期
            //token.getTokenFromServer
            //this.request;
            //在回调函数内部，不能用this.xxx, 只能在回调函数外用that = this 先保存当前环境，在内部用that
            that._refetch(params);
          }
          if(noRefech){
            params.eCallback && params.eCallback(res.data); //如果还在尝试重取，就不要进行eCallback，只有不进行重取了，才进行错误显示；
          }
          
        }
        
      } ,
      //这个fail不是服务器返回4xx的fail，而是客户端自己的调用错误，比如网口down。而服务器的4xx错误要在success中自己处理。
      fail:function (err) { 
        console.log(err); 
      }
        
    })
  }

  _refetch(params){
    var token = new Token();
    token.getTokenFromServer((token)=>{
      this.request(params,true);  //true: noRefetch again
      //这也在回调函数内部，为啥能用this？因为用=>箭头函数的优点就是可以保持环境变量不变，所以可以用this；而用success:callback这种方式就要用that；      
    });
  }

  getDataSet(event,key){
    return event.currentTarget.dataset[key];
  }

}

export{Base};