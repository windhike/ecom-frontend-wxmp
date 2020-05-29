import {Base} from '../../utils/base.js';
import {Cart} from '../cart/cart-model.js';
var cart=new Cart();

class Order extends Base{
  constructor(){
    super();
    this._storageKeyName = 'newOrder'; //新建订单
  };

  getOrderDataFromLocal() {
    var orderData = cart.getCartDataFromLocal(true); //selected only
    return orderData;
  };

  /*下订单*/
  placeOrder(param,callback){
    var that=this;
    var allParams = {
        url: 'order'+'?XDEBUG_SESSION_START=19701',
        method:'post',
        data:{products:param},
        sCallback: function (data) {
            that.execSetStorageSync(true); //在把order发给服务器的同时，缓存到storage；并将_storageKeyName ‘newOrder’ 设为true
            callback && callback(data);
        },
        eCallback:function(){
            }
        };
    this.request(allParams);
  }

    /*
    * 拉起微信支付
    * params:
    * order_id - {int} 订单id
    * return：
    * callback - {obj} 回调方法 ，返回参数 可能值 0:商品缺货等原因导致订单不能支付(后端或者wx服务器端preOrder处理就不让支付);  1: 支付失败或者支付取消(wx服务器端真正支付处理出错，此时会在DB生成记录，但状态为未支付的订单--orderStauts/DB order表中的status标志位=1--未支付)； 2:支付成功；
    * */
//     服务器返回的wxPayData结构,参考‘微信支付 统一下单’和wxPayApi//     
    preOrderAndPay(order_id,callback){
        var allParams = {
            url: 'pay/pre_order',
            method:'post',
            data:{id:order_id},
            sCallback: function (wxPayData) {
                var timeStamp= wxPayData.timeStamp;
                if(timeStamp) { //可以支付
                    wx.requestPayment({
                        'timeStamp': timeStamp.toString(),
                        'nonceStr': wxPayData.nonceStr,
                        'package': wxPayData.package,
                        'signType': wxPayData.signType,
                        'paySign': wxPayData.paySign,
                        success: function () {
                            callback && callback(2);
                        },
                        fail: function () {
                            callback && callback(1);
                        }
                    });
                }else{
                    callback && callback(0);
                }
            }
        };
        this.request(allParams);
    }

    /*获得所有订单,pageIndex 从1开始*/
    getOrders(pageIndex,statusList,callback){
        var allParams = {
            url: 'order/by_user'+'?XDEBUG_SESSION_START=13864',
            data:{
                page:pageIndex,
                statusList:statusList //1,未支付  2，已支付  3，已发货，4已支付，但库存不足;5已完成
            },
            method:'get',
            sCallback: function (data) {
                callback && callback(data);  
             }
        };
        this.request(allParams);
    }

    /*获得订单的具体内容*/
    getOrderInfoById(id,callback){
        var that=this;
        var allParams = {
            url: 'order/'+id,
            sCallback: function (data) {
                callback &&callback(data);
            },
            eCallback:function(){

            }
        };
        this.request(allParams);
    }

    /*本地缓存 保存／更新*/
    execSetStorageSync(data){
        wx.setStorageSync(this._storageKeyName,data);
    };

    /*是否有新的订单*/
    hasNewOrder(){
       var flag = wx.getStorageSync(this._storageKeyName);
       return flag==true;
    }


}
export {Order};