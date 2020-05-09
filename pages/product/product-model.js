import {Base} from "../../utils/base.js";

class Product extends Base{
  constructor(){
    super();
  }

  getProductData(id,callback){
    var params={
      url:'product/'+id,
      method:'GET',
      sCallback:function (res) {
        callback && callback(res);        
      }
    }
    this.request(params);

  }
}

export{Product};