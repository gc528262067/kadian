const siteinfo = require('./siteinfo.js')
let a = 1;
module.exports = {
  wxlogin:siteinfo.webroot+"user/wxlogin",// 微信登录
  getType1:siteinfo.webroot+"user/getType1",// 微信登录
  getType2:siteinfo.webroot+"user/getType2",// 微信登录
  addType:siteinfo.webroot+"user/addType",// 微信登录
  addNote:siteinfo.webroot+"user/addNote",// 微信登录
  upload:siteinfo.webroot+"common/upload",// 微信登录
  getNote:siteinfo.webroot+"user/getNote",// 微信登录
  getDetail:siteinfo.webroot+"user/getDetail",// 微信登录
  index1:siteinfo.webroot+"user/index1",// 微信登录
  delNote:siteinfo.webroot+"user/delNote",
  delType:siteinfo.webroot+"user/delType",
  getType:siteinfo.webroot+"user/getType",
  editType:siteinfo.webroot+"user/editType",
  editNote:siteinfo.webroot+"user/editNote",
};