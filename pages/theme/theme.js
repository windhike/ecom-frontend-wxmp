// pages/theme/theme.js
import {Theme} from 'theme-model.js';
var theme = new Theme();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var name = options.name;
    this.data.id = id;
    this.data.name = name;
    // console.log(id,name);
    this._loadData();
  },

  _loadData(){
    theme.getThemeProducts (this.data.id,res=>{ 
      // console.log(res);
      // console.log(res[0].head_img.url);
      this.setData({
        'themeProductsArray':res[0],
      });
    }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.name,
    })
  },

  toProductsItemTap: function (event) {
    var id = theme.getDataSet(event,'id');
    // console.log(id);
    wx.navigateTo({
      url: '../product/product?id='+id
    });   
  }

})