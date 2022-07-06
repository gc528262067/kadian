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
    page:1,
    pageSize:10,
    datalist:[],
    hasNextPage:true,
    key:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let pid = options.pid;
    console.log(pid)
    this.setData({
      pid:pid
    })
    this.getNote();
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
  getNote(){
    let that = this;
    let formData = {
      type2:this.data.pid,
      page:that.data.page,
      pageSize: that.data.pageSize,
      key:this.data.key
    };
    $.ajaxpost(api.getNote, formData, data => {
      if(data.code == 1){
        console.log(data.data)
        if(that.data.page == 1){
          that.setData({
            datalist:[],
            hasNextPage:true,
          })
        }
        if(data.data.length < that.data.pageSize){
          that.setData({
            hasNextPage:false
          })
        }
        that.setData({
          datalist:that.data.datalist.concat(data.data)
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
  next(){
    if(!this.data.hasNextPage){
      $.alert('没有更多了');
      return;
    }
    this.setData({
      page:this.data.page + 1
    })
    this.getNote();
  },
  refresh(){
    this.setData({
      page:1,
      datalist:[],
      hasNextPage:true,
    })
    this.getNote();
  },
  detail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id='+id,
    })
  },
  addNote(){
    wx.navigateTo({
      url: '/pages/addnote/addnote?pid='+this.data.pid,
    })
  },
  keychange(event){
    this.setData({
      key:event.detail
    })
  },
  onSearch(){
    this.setData({
      page:1,
      datalist:[],
      hasNextPage:true,
    })
    this.getNote();
  },
  onCancel(){
    this.setData({
      key:'',
    })
  },
  del(e){
    let that = this;
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let formData = {
            id:id,
          };
          $.ajaxpost(api.delNote, formData, data => {
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
          console.log('用户点击取消')
        }
      }
    })
  }
})