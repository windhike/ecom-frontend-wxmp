// pages/product/product.js
import {Product} from "product-model.js";
import {Cart} from '../cart/cart-model.js';
var product = new Product();
var cart = new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    id:null,
    countsArray:[1,2,3,4,5,6,7,8,9,10],
    productCount:1,
    tabName:['商品详情','产品参数','售后保障'], 
    currentTabIndex:0,
    cartTotalCount:0,
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id;
    this._loadData();

  },

  _loadData(){
    product.getProductData(this.data.id,(res)=>{
      this.data.name = res[0].name;
      wx.setNavigationBarTitle({
        title: this.data.name,
      })
      this.setData({
        'productDataArray':res[0],
         cartTotalCount :cart.getCartTotalCounts(),
      });
    })
  },

  onReady : function () { // setTitle放在这里，有时候this.data.name的值会变化
    // wx.setNavigationBarTitle({
    //   title: this.data.name,
    // })
  },

  bindPickerChange:function (event) {
    var arreyIndex = event.detail.value;
    var selectedCount = this.data.countsArray[arreyIndex];
    // console.log (event);
    this.setData({
      'productCount':selectedCount
    })
  },

  toTabsItemTap:function(event) {
    var id = product.getDataSet(event,'id');
    this.setData({
      currentTabIndex:id
    });
  },
  
  toAddToCartTap:function(event) {
    var itemInfo={
      'id':this.data.productDataArray.id,
      'name':this.data.productDataArray.name,
      'main_img_url':this.data.productDataArray.main_img_url,
      'price':this.data.productDataArray.price,
    };
    cart.add(itemInfo,this.data.productCount);
    this.setData({
       cartTotalCount :cart.getCartTotalCounts(),
    });
  },

  toCartTap:function(event){
    wx.switchTab({
      url: '../cart/cart'
    });
  }
})