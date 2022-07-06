// index.js
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
    login:false,
    type1List:[],
    c:0,
    lasttime:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('onLoad')

    let that = this;
// 登录
wx.login({
  success: res => {
    console.error(res)
    let formData = {
      code:res.code,
    };
    $.ajaxpost(webroot+'User/miniLogin' , formData, data => {
      if(data.code == 1){
        let userInfo = data.data.userinfo;
        console.error(userInfo)
        $.setCache('userinfo', userInfo);
        $.setCache('token', userInfo.token);
        $.setCache('openid', userInfo.openid);
        that.setData({
          login:true
        })
        that.onShow();
        console.log(that.data.login)
      }else{
        $.alert('网络错误');
        setTimeout(() => {
          $.backpage();          
        }, 800);
      }
    }, err => {
        console.log(err)
    })
  }
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
    console.log('onshow')
    let that = this;
    console.log(that.data.login )
    if(that.data.login === true){
      that.getType1();
      that.index1();
    }
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
  index1(){
    let that = this;
    let formData = {};
    $.ajaxpost(api.index1, formData, data => {
      if(data.code == 1){
        that.setData({
          c:data.data.c,
          lasttime:data.data.lasttime
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
  getType1(){
    let that = this;
    let formData = {
    };
    $.ajaxpost(api.getType1, formData, data => {
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
  addType(e){
    const pid= e.currentTarget.dataset.pid
    wx.navigateTo({
      url: '/pages/addtype/addtype?type=1&pid='+pid,
    })
  },
  type2(e){
    const pid= e.currentTarget.dataset.pid
    wx.navigateTo({
      url: '/pages/type2/type2?type=2&pid='+pid,
    })
  },
  refresh(){
    this.setData({
      type1List:[]
    })
    this.getType1();
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