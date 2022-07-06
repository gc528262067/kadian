// app.js
const $ = require('utils/util.js')
const siteinfo = require('siteinfo.js')
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    
  },
  globalData: {
    api:require('./api.js'),
    siteinfo:require('./siteinfo.js'),
    userInfo: null,
  }
})
