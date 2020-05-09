// pages/home/home.js
import {Home} from 'home-model.js';
var home = new Home();
// const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    // shoeimages: ['http://z.cn/images/banner-2a.png', 'http://z.cn/images/banner-4a.png']
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this._loadData(); //建议不要直接在onLoad写太多代码，
    
  },

  /*   loadData 私有函数
  前面加_表示私有函数，不是强制的，是编码规范 */
  _loadData:function () {  
    var id=1;  //后续传入
    // home.getBannerData(id,this.callBack);  
    //如果callback函数里面执行的方法很少，可以用这种箭头函数，这样不用单独写callback函数了，结果是一样的。但显示写callback可能更容易理解。 */
    home.getBannerData(id,res=>{ 
      // console.log(res);
      this.setData({
        'bannerArray':res
      });
    });  

    var ids='?ids=1,2,3';
    home.getThemeList (ids,res=>{ 
      // console.log(res);
      this.setData({
        'themeArray':res
      });
    }); 

    var recentProductCount = 15;
    home.getRecentProducts (recentProductCount,res=>{ 
      // console.log(res);
      this.setData({
        'recentProductsArray':res
      });
    });

  /* 对于success的异步返回结果要用callback方法才能得到结果 */
  /*   callBack : function (res) {
      console.log(res);  
      this.setData({
        'bannerArray':res
      });
    }, */
  },



  toProductsItemTap : function(event) {
    var id = home.getDataSet(event,'id');
    // console.log(id);
    wx.navigateTo({
      url: '../product/product?id='+id
    });    
  },

  toThemesItemTap : function(event) {
    var id = home.getDataSet(event,'id');
    var name = home.getDataSet(event,'name');
    // console.log(id);
    wx.navigateTo({
      url: '../theme/theme?id='+id+'&name='+name,
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