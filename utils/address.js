import {Base} from 'base.js';
import { Config } from 'config.js';

class Address extends Base{
  constructor(){
    super();
  }

  /*
    *根据省市县信息组装地址信息
    * provinceName , province 前者为 微信选择控件返回结果，后者为查询地址时，自己服务器后台返回结果
    */
   // 组装微信原生函数chooseAddress 返回的地址结果
   assembleWxAddress(wxAddrRes){ 
    var province =wxAddrRes.provinceName || wxAddrRes.province,
        city =wxAddrRes.cityName || addrRes.city,
        country =wxAddrRes.countyName || addrRes.country,
        detail =wxAddrRes.detailInfo || addrRes.detail;
    var totalDetail=city+country+detail;
    //直辖市，取出省部分
    if(!this.isCenterCity(province)) {
        totalDetail=province+totalDetail;
    };
    return totalDetail;
  }

  // 组装从数据库返回的地址结果
  assembleDbAddress(dbAddrRes){ 
    var province =dbAddrRes.province,
        city =dbAddrRes.city,
        country =dbAddrRes.country,
        detail = dbAddrRes.detail;
    var totalDetail=city+country+detail;
    //直辖市，取出省部分
    if(!this.isCenterCity(province)) {
        totalDetail=province+totalDetail;
    };
    return totalDetail;
  }

  /*是否为直辖市*/
  isCenterCity(name) {
    var centerCitys=['北京市','天津市','上海市','重庆市'],
        flag=centerCitys.indexOf(name) >= 0;
    return flag;
  }

  /*转换地址格式 wx to db*/
  _transferWxAddrToDbAddr (wxAddrRes){
    var dbFormData={
            name:wxAddrRes.userName,
            province:wxAddrRes.provinceName,
            city:wxAddrRes.cityName,
            country:wxAddrRes.countyName,
            mobile:wxAddrRes.telNumber,
            detail:wxAddrRes.detailInfo
        };
    return dbFormData;
  }

  // 微信chooseAddress函数返回的地址，保存到数据库
  submitAddress(wxAddrRes,callback){
    var dbAddrRes = this._transferWxAddrToDbAddr(wxAddrRes);
    var params={
      url:'address',
      method:'POST',
      data:dbAddrRes,
      //地址存数据库应该需要在header中携带Token，但在Base.js中已经包括了下面的code：所以这里不用写了；
      // header: {
      //   'content-type':'application/json',
      //   'token':wx.getStorageSync('token'), // token存在缓存里；
      // },
      sCallback:function (res) {  //回调函数的意思：当success 得到异步返回结果时，不能直接return res，而是调用callback 函数
        callback && callback(true,res); //callBack && ... 是指先判断callback是否为空/false，如果不是则执行... 这里如果是success直接返回一个True，加res结果（可选）
        // console.log(res);
      },
      eCallback:function (res) {
        callback && callback(false,res); //这里如果是error直接返回一个false，加res结果（可选）
      }      
    };
    this.request(params);
  }

  getAddress(callback){
    var that=this;
    var params={
      url:'address',
      method:'GET',
      sCallback:function (res) {  
        callback && callback(res); 
        // console.log(res);
        if(res){
          // res.totalDetail = that.assembleDbAddress(res);
          callback && callback(res);
        } 
      },
    };
    this.request(params);
  }

}
export{Address}