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
    pid:0,
    type1List:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let pid = options.pid;
    this.setData({
      pid:pid
    })
    console.log(pid)
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
    this.getType2();
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
  getType2(){
    let that = this;
    let formData = {
      pid:that.data.pid
    };
    $.ajaxpost(api.getType2, formData, data => {
      if(data.code == 1){
        that.setData({
          type1List:data.data
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
  addType(){
    wx.navigateTo({
      url: '/pages/addtype/addtype?type=2&pid='+this.data.pid,
    })
  },
  type3(e){
    const pid= e.currentTarget.dataset.pid
    console.log(pid)
    wx.navigateTo({
      url: '/pages/type3/type3?pid='+pid,
    })
  },
  
  refresh(){
    this.setData({
      type1List:[]
    })
    this.getType2();
  },
  del(e){
    let that = this;
    let id = e.currentTarget.dataset.pid
    wx.showModal({
      title: '提示',
      content: '请选择功能',
      cancelText:'编辑',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let formData = {
            id:id,
          };
          $.ajaxpost(api.delType, formData, data => {
        if(data.code == 1){
          $.alert(data.msg)
          that.refresh();
        }else{
          $.alert('网络错误');
          setTimeout(() => {
            $.backpage();          
          }, 800);
        }
      }, err => {
          console.log(err)
      })
        } else if (res.cancel) {
          wx.navigateTo({
            url: '/pages/editType/editType?id='+id,
          })
          console.log('用户点击取消')
        }
      }
    })
  }
})