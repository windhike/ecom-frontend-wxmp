// pages/category/category.js
import {Category} from 'category-model.js';
var category = new Category();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTabIndex:0,
    loadedData:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
  },

  _loadData:function(){
    category.getCategoryList(res=>{
      // console.log(res);
      // wx.setNavigationBarTitle({
      //   title: res[0].name,
      // });
      this.setData({
        'categoryListArray':res
      });
      category.getProductsByCategory(res[0].id,data=>{
          // console.log(data);
          var dataObj = {
              products:data,
              title:res[0].name,
              topImgUrl:res[0].topic_img.url,
          };        
          this.setData({
            'categoryProducts':dataObj,            
          });
          this.data.loadedData[0]= dataObj;
      });        
    })
  },

  isLoadedDataExist:function(index){
    if(this.data.loadedData[index]){
      return true;
    }
    else{
      return false;
    }
  },

  toProductsByCategoryTap:function(event){
    // console.log(event);
    var menuId = category.getDataSet(event,'menuid');
    var id = category.getDataSet(event,'categoryid');
    this.setData({'currentTabIndex':menuId});
    if(!this.isLoadedDataExist(menuId)){
      category.getProductsByCategory(id,res=>{
        var dataObj = {
          products:res,
          title:this.data.categoryListArray[menuId].name,
          topImgUrl:this.data.categoryListArray[menuId].topic_img.url,
        }; 
        // console.log(res);
        this.setData({
          'categoryProducts':dataObj
        });
        this.data.loadedData[menuId]=dataObj;
      });
    }
    else{
      this.setData({
        'categoryProducts':this.data.loadedData[menuId],
      });
    }
    // wx.setNavigationBarTitle({
    //   title: this.data.categoryListArray[menuId].name,
    // });
  },

  toProductsItemTap : function(event) {
    var id = category.getDataSet(event,'id');
    // console.log(id);
    wx.navigateTo({
      url: '../product/product?id='+id
    });    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})