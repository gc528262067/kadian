// pages/editType/editType.js
// index.js
// 获取应用实例
const app = getApp()
const $ = require('../../utils/util.js')
const webroot = app.globalData.siteinfo.webroot;
const api = app.globalData.api;
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0,
    typeName:''
  },
  input(e){
    this.setData({
      typeName:e.detail
    })
    console.log(this.data.typeName)
  },
  edit(){
    let that = this;
    if(!that.data.typeName){
      // 警告通知
      Notify({ type: 'warning', message: '请输入分类名', duration: 1000, });
    }
    let formData = {
      id:that.data.id,
      name:that.data.typeName,
    };
    $.ajaxpost(api.editType, formData, data => {
      if(data.code == 1){
        $.alert(data.msg);
        setTimeout(function(){
          wx.navigateBack({
            delta:-1
          })
        },
        600)
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    let id = options.id;
    that.setData({
      id:id
    })
    let formData = {
      id:id
    };
    $.ajaxpost(api.getType, formData, data => {
      if(data.code == 1){
        that.setData({
          typeName:data.data.typeName
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

  }
})