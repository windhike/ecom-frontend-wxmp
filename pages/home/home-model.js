import {Base} from '../../utils/base.js';

class Home extends Base{
  constructor(){
    super(); //要调用基类的构造函数 
  }
 
  getBannerData(id,callback){
    var params = {
      url: 'banner/'+id,
      method:'GET',
      sCallback:function (res) {  //回调函数的意思：当success 得到异步返回结果时，不能直接return res，而是调用callback 函数
        callback && callback(res.items); //callBack && ... 是指先判断callback是否为空/false，如果不是则执行...
      },
    }
    this.request(params); // 调用base基类的request函数；
  }

  getThemeList(ids,callback){
    var params = {
      url: 'theme/'+ids,
      method:'GET',
      sCallback:function (res) {  //回调函数的意思：当success 得到异步返回结果时，不能直接return res，而是调用callback 函数
        callback && callback(res); //callBack && ... 是指先判断callback是否为空，如果不是则执行...
      },
    }
    this.request(params); // 调用base基类的request函数；
  }
 
  getRecentProducts(count,callback){
    var params = {
      url: 'product/recent'+'?count='+count, //参数:?count=xx(default=15)
      method:'GET',
      sCallback:function (res) {  //回调函数的意思：当success 得到异步返回结果时，不能直接return res，而是调用callback 函数
        callback && callback(res); //callBack && ... 是指先判断callback是否为空，如果不是则执行...
      },
    }
    this.request(params); // 调用base基类的request函数；
  }

}

export {Home};