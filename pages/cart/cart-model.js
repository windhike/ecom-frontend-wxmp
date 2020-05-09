import {Base} from '../../utils/base.js';

class Cart extends Base{
  constructor(){
    super();
    this._storageKeyName = 'cart';
  }

/*
    * 加入到购物车
    * 如果之前没有样的商品，则直接添加一条新的记录， 数量为 counts
    * 如果有，则只将相应数量 + counts
    * @params:
    * item - {obj} 商品对象,
    * counts - {int} 商品数目,
    * */
  add(item,counts){
    var cartData=this.getCartDataFromLocal();
    if(!cartData){
        cartData=[];
    }
    var isHadInfo=this._isHasThatOne(item.id,cartData);
    //新商品
    if(isHadInfo.index==-1) {
        item.counts=counts;
        item.selectedStatus=true;  //默认在购物车中为选中状态
        cartData.push(item);
    }
    //已有商品
    else{
        cartData[isHadInfo.index].counts+=counts;
    }
    wx.setStorageSync(this._storageKeyName,cartData);  //更新本地缓存
    return cartData;
  };

  getCartDataFromLocal(countSelectedOnly){ //ture means countSelectedOnly
    var cartData = wx.getStorageSync(this._storageKeyName);
    var newCartData=[];
    if(cartData){
      if(countSelectedOnly){
        for(let i=0; i<cartData.length;i++){
          if(cartData[i].selectedStatus){
            newCartData.push(cartData[i]);
          }
        }
      }
      else{
        newCartData=cartData;
      }
    }
    return newCartData;
};

/*
*获得购物车商品总数目,包括分类和不分类
* param:
* flag/countSelectedOnly - {bool} 是否区分选中和不选中,ture means countSelectedOnly
* return
* counts1 - {int} 不分类
* counts2 -{int} 分类
*/
getCartTotalCounts(countSelectedOnly){
    var data=this.getCartDataFromLocal();
    var  counts1=0;
    
    for(let i=0;i<data.length;i++){
      if(countSelectedOnly){
        if(data[i].selectedStatus){
          counts1 += data[i].counts; 
        }        
      }
      else{
        counts1 += data[i].counts;
      }
        
    }
    return counts1;
};

 /*购物车中是否已经存在该商品*/
 _isHasThatOne(id,arr){
  var item,
      result={index:-1};
  for(let i=0;i<arr.length;i++){
      item=arr[i];
      if(item.id==id) {
          result = {
              index:i,
              data:item
          };
          break;
      }
  }
  return result;
};

updateLocalCartData(cartData){
  wx.setStorageSync(this._storageKeyName,cartData);  //更新本地缓存
  // return cartData;
};

/*
    * 批量删除某些商品
    */
   delete(ids){
    if(!(ids instanceof Array)){
        ids=[ids];
    }
    var cartData=this.getCartDataFromLocal();
    for(let i=0;i<ids.length;i++) {
        var hasInfo = this._isHasThatOne(ids[i], cartData);
        if (hasInfo.index != -1) {
            cartData.splice(hasInfo.index, 1);  //删除数组某一项
        }
    }
    wx.setStorageSync(this._storageKeyName,cartData);
};

 /*
    * 修改商品数目
    * params:
    * id - {int} 商品id
    * counts -{int} 数目
    * */
   _changeCounts(id,counts){
    var cartData=this.getCartDataFromLocal(),
        hasInfo=this._isHasThatOne(id,cartData);
    if(hasInfo.index!=-1){
        if(hasInfo.data.counts>1){
            cartData[hasInfo.index].counts+=counts;
        }
    }
    wx.setStorageSync(this._storageKeyName,cartData);  //更新本地缓存
};

/*
* 增加商品数目
* */
addCounts(id){
    this._changeCounts(id,1);
};

/*
* 购物车减
* */
cutCounts(id){
    this._changeCounts(id,-1);
};

}
export {Cart};