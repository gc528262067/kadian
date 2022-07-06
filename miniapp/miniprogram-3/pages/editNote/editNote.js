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
    value:'',
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 498,
    keyboardHeight: 0,
    isIOS: false,
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  
 /**
     * @name: 富文本编辑器选择图片
     * @author: camellia
     * @date: 20211223
     */
    insertImage() {
      let self = this;
      wx.chooseImage({
        count: 1,
        success: (res) => {
          // 图片临时存放路径（数据流）
          let filePath = res.tempFilePaths[0];
          // 发起上传图片请求
          // filePath:选择图片后生成的数据流url
          // constant.request_sign:请求加密字符串
          // str:加密参数
          wx.uploadFile({
            url: api.upload,
            filePath: filePath,
            name: 'file',
            formData: {
              token: wx.getStorageSync('token')
            },
            success: function (res) {
              let data = JSON.parse(res.data);
              console.error()
              self.editorInsertImg(data.data.fullurl);
            }
           })
        },
      });
    },
    /**
     * @name: 富文本编辑器插入图片
     * @desc: 描述
     * @author: camellia
     * @params :  filePath 图片上传到服务器后后台返回的图片链接地址
     * @date: 20211223
     */
    editorInsertImg(filePath) {
      let self = this;
      // 富文本编辑器插入图片方法
      self.editorCtx.insertImage({
        src: filePath,
        width: "100%",
        data: {
          id: "imgage",
          role: "god",
        },
        // height: '50px',
        // extClass: className
      });
    },

  input(e){
    console.log(e.detail.html)
    this.setData({
      content:e.detail.html
    })
  },
  replaceSpecialChar (str) {
    return str.replace(/[<>&"]/g,function(c){
      return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
    });
  },
 // editor初始化
 onEditorReady() {
   let that = this;
  wx.createSelectorQuery().select('#editor').context((res) => {
    this.editorCtx = res.context
    this.editorCtx.setContents({
      html: that.data.content
    });
  }).exec()
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
          id:data.data.id,
          value:data.data.name
        })
        wx.setNavigationBarTitle({
          title: data.data.name//页面标题为路由参数
        })
        that.onEditorReady();
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
    that.setData({
      id:options.id
    })
    that.getDetail();
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

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
  onChange(event){
    this.setData({
      value:event.detail
    })
  },  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    // let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    // this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  editNote(){
    let that = this;
    console.log(this.replaceSpecialChar(that.data.content));
    if(!that.data.content){
      $.alert('请输入内容');
      return;
    }
    if(!that.data.value){
      $.alert('请输入标题')
      return;
    }
    // if(that.data.value.length > 11){
    //   $.alert('标题最多十二字')
    //   return;
    // }
    let formData = {
      id:that.data.id,
      name:that.data.value,
      content:this.replaceSpecialChar(that.data.content)
    };
    $.ajaxpost(api.editNote, formData, data => {
      if(data.code == 1){
        $.alert(data.msg);
        $.backpage();
        //B页面的JS
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; //获取到A页面
      prevPage.setData({
        page:1,
        datalist:[],
        hasNextPage:true,
      })
      prevPage.getDetail(); //在B调用A的方法
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