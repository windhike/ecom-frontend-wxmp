import {Base} from '../../utils/base.js';

class Theme extends Base{
  constructor(){
    super();
  }

  getThemeProducts(id,callback){
    var params = {
      url: 'theme/'+id,
      method:'GET',
      sCallback:function (res) {  //回调函数的意思：当success 得到异步返回结果时，不能直接return res，而是调用callback 函数
        callback && callback(res); //callBack && ... 是指先判断callback是否为空，如果不是则执行...
      },
    }
    this.request(params); // 调用base基类的request函数；
  }
}
export {Theme};
