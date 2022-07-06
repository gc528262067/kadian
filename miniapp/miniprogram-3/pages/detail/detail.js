// 获取应用实例
const app = getApp()
const $ = require('../../utils/util.js')
const webroot = app.globalData.siteinfo.webroot;
const api = app.globalData.api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0,
    content:'',
    show:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let id = options.id;
    this.setData({
      id:id
    })
    this.getDetail();
  },
  getDetail(){
    let that = this;
    let formData = {
      id: that.data.id
    };
    $.ajaxpost(api.getDetail, formData, data => {
      if(data.code == 1){
        that.setData({
          content:data.data.content,
          show:1,
          id:data.data.id
        });
        wx.setNavigationBarTitle({
          title: data.data.name,
        })
      }else{
        $.alert('网络错误');
        setTimeout(() => {
          $.backpage();          
        }, 800);
      }
    }, err => {
        console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  edit(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/editNote/editNote?id='+id,
    })
  }
})