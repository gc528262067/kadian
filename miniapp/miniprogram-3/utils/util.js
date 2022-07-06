const trim = (str) => {
  if (str.length == 0) {
    return "";
  } else {
    return str.replace(/(^\s+)|(\s+$)/g, "");
  }
}

const alert = (title, time, successCallback) => {
  wx.showToast({
    icon: "none",
    title: title || "",
    duration: time || 1000,
    success: successCallback,
  })
}

const loading = (title, time, mask, successCallback) => {
  wx.showToast({
    icon: "loading",
    mask: mask || !0,
    duration: time || 1000,
    title: title || "加载中...",
    success: successCallback
  })
}

const hideloading = (time) => {
  if (wx.hideLoading) {
    wx.hideLoading();
  }
  clearTimeout(e);
  time = time || 1500;
  let e = setTimeout(function () {
    wx.hideToast()
  }, time)
}


const confirm = (title, content, showCancel, successCallback) => {
  wx.showModal({
    title: title || "提示",
    content: content,
    showCancel: showCancel || !1,
    success: successCallback
  })
}

const gopage = (url, successCallback) => {
  wx.navigateTo({
    url: url,
    success: successCallback
  })
}

const gotopage = (url, successCallback) => {
  wx.redirectTo({
    url: url,
    success: successCallback
  })
}

const gotarpage = (url, successCallback) => {
  wx.switchTab({
    url: url,
    success: successCallback
  })
}

const gorepage = (url, successCallback) => {
  wx.reLaunch({
    url: url,
    success: successCallback
  })
}

const backpage = (delta, successCallback) => {
  wx.navigateBack({
    delta: delta || 1,
    success: successCallback
  })
}

const alertBack = (title, time, url) => {
  var time = time || 1000;
  wx.showToast({
    icon: "success",
    title: title || "成功",
    duration: time,
    success: () => {
      setTimeout(() => {
        if (url) {
          wx.redirectTo({ url: url, })
        } else {
          wx.navigateBack({ delta: 1 })
        }
      }, time)
    }
  })
}

const setCache = (key, value) => {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
  }
}

const getCache = (key) => {
  try {
    var value = wx.getStorageSync(key)
    if (value) {
      return value;
    }
  } catch (e) {
    // Do something when catch error
  }
}

const removeCache = (key, successCallback) => {
  wx.removeStorage({
    key: key,
    success: successCallback
  })
}

const showtips = (info, url, time) => {
  var index = getCurrentPages().length - 1;
  var time = time || 1000;
  if (url) {
    getCurrentPages()[index].setData({
      tipsurl: url,
    })
  }
  getCurrentPages()[index].setData({
    tipsflag: true,
    tipsinfo: info,
  })
  setTimeout(function () {
    getCurrentPages()[index].setData({
      tipsflag: false,
      tipsinfo: '提示信息',
    })
  }, time)
}
const showerror = (info, url, time) => {
  var index = getCurrentPages().length - 1;
  var time = time || 1000;
  if (url) {
    getCurrentPages()[index].setData({
      errorurl: url,
    })
  }
  getCurrentPages()[index].setData({
    errorflag: true,
    errorinfo: info,
  })
  setTimeout(function () {
    getCurrentPages()[index].setData({
      errorflag: false,
      errorinfo: '提示信息',
    })
  }, time)


}

const testing = (val, type) => {
  var flag;
  var rule;
  if (val == undefined) {
    showtips("参数缺失")
    return;
  }
  if (type == "mobile") {
    // 手机号码
    rule = /^1[123456789]\d{9}$/
  } else if (type == 'username') {
    rule = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  } else if (type == 'price') {
    // 价格：正浮点数 
    rule = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
  } else if (type == 'password') {
    // 密码4-20字符
    rule = /^.{6,20}$/;
  } else if (type == 'num') {
    // 数量
    rule = /^([1-9][0-9]*)$/;
  } else {
    // 非空验证1-50字符
    rule = /^.{1,50}$/;
  }
  rule.test(val) ? flag = true : flag = false;
  return flag;
}

const getstringwidth = (text) => {
  var jmz = {};
  jmz.GetLength = function (text) {
    return text.replace(/[\u0391-\uFFE5]/g, "aa").length;  //先把中文替换成两个字节的英文，在计算长度
  };
  return (jmz.GetLength(text));
};

/**
 * 生成0-9，A-Z随机文件名
 * @param {num} an 个数
 * chars [array]
 */
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const getrandom = (an) => {
  var res = "";
  var index = an || 1;
  for (var ia = 0; ia < index; ia++) {
    var id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }
  return res;
}


const choosemaplocation = (successCallback) => {
  wx.chooseLocation({
    success: (res) => {
      typeof successCallback == 'function' && successCallback(res)
    },
    fail: (res) => {
      console.log(res)
      confirm("请允许小程序访问您的位置", function () {
        if (wx.openSetting) {
          wx.openSetting({
            success: (res) => {
              // choosemaplocation(succfun);
            }
          })
        } else {
          confirm('当前微信版本过低，请升级微信或手动允许微信获取您的个人信息', false)
        }

      })
    }
  })
}

const choosewxaddress = (successCallback) => {
  wx.chooseAddress({
    success: res => {
      typeof successCallback == 'function' && successCallback(res)
    },
    fail: res => {
      hideloading();
      confirm("请允许小程序访问您的位置", function () {
        if (wx.openSetting) {
          wx.openSetting({
            success: res => {
              // choosewxaddress(succfun);
            }
          })
        } else {
          confirm('当前微信版本过低，请升级微信或手动允许微信获取您的个人信息', false)
        }

      })
    }
  })
}


const ajaxget = (url, successCallback, failCallback) => {
  wx.request({
    url: url,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      var data = res.data
      successCallback(data)
    },
    fail: err => {
      failCallback(err)
    }
  })
}

const ajaxpost = (url, data, successCallback, failCallback) => {
  let token = wx.getStorageSync('token');
  console.log(token)
  data.token = token;
  wx.request({
    url: url,
    method: 'POST',
    data: data,
    header: {
      'token':token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    success: res => {
      console.error('res------------------');
      console.error(res)
      // token失效  用refreshToken刷新token
      if(res.statusCode == 401){
        console.error('token失效  用refreshToken刷新token')
      }else if(res.statusCode == 4001){
        //refreshToken失效 去重新登录
        console.error('refreshToken失效 去重新登录')
      }
      var data = res.data;
      successCallback(data)
    },
    fail: err => {
      failCallback(err)
    }
  })
}

const formatSeconds = (value) => {
  var seconds = parseInt(value);// 秒
  var minute = 0;// 分
  var hour = 0;// 小时
  var day = 0;//天
  if (seconds > 60) {
    minute = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    if (minute > 60) {
      hour = parseInt(minute / 60);
      minute = parseInt(minute % 60);
      if (hour > 24) {
        day = parseInt(hour / 24);
        hour = parseInt(hour % 24);
      }
    }
  }
  var result = "" + parseInt(seconds) + "秒";
  if (minute > 0) {
    result = "" + parseInt(minute) + "分" + result;
  }
  if (hour > 0) {
    result = "" + parseInt(hour) + "小时" + result;
  }
  if (day > 0) {
    result = "" + parseInt(day) + "天" + result;
  }
  return result;
}

var imgArr = [];
const uploadimg = (num, sizeType, successCallback) => {
  var that = this;
  wx.chooseImage({
    count: num, // 默认9
    sizeType: sizeType,
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
    success: (res) => {
      successCallback(res)
    },
    fail: err => {
      failCallback(err)
    }
  })
}
const getQueryVariable =  (query, variable) =>{
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}


/**
 * 图像处理
 * @author 深圳前海万联科技有限公司 <www.wanlshop.com>
 * @param {Object} url 图像地址
 * @param {Object} h  高度
 * @param {Object} w  宽度  
 * @param {Object} modenum 1.自适应 2.固定宽高短边缩放 3.固定宽高居中裁剪 4.强制宽高
 * @param {Object} type  使用类型  
 * @param {Object} format  图形格式  
 * @param {Object} resize  resize  
 * @param {Object} multiple  放大倍数  
 * 
 * $wanlshop.oss(url, 120, 0, 2, 'transparent', 'png')
 */
const oss = (url, w = 120, h = 120, modenum = 2, type = '', format = 'jpg', resize = 'resize', multiple = 3) => {
	let image = '';
	let mode = ["m_lfit","m_mfit","m_fill","m_fixed"];
	// 图像，自适应方向：1，渐进显示：1，转换格式：jpg，图片质量：q_90，图片锐化：50，浓缩图
	let rule = ["?x-oss-process=image", "auto-orient,1", "interlace,1", "format,jpg", "quality,q_90", "sharpen,50", "resize,m_fixed,w_120,h_120"];
	// 转换格式
	if (format == 'png') {
		rule[3] = ["format", "png"].join(",");
	}
	// 判断是否有高度
	if (w == 0) {
		rule[6] = [resize, mode[modenum], `h_${h * multiple}`].join(",");
	}else if(h == 0){
		rule[6] = [resize, mode[modenum], `w_${w * multiple}`].join(",");
	}else{
		rule[6] = [resize, mode[modenum], `w_${w * multiple}`, `h_${h * multiple}`].join(",");
	}
	//当地址不存在
	if (url) {
		if ((/^data:image\//.test(url))) {
			image = url;
		}else if((/^(http|https):\/\/.+/.test(url))){
			rule.pop();
			image = url + rule.join("/");
		}else{
			image = wanlshop_config.cdnurl + url + rule.join("/");
		}
	}else{
		if (type == 'transparent') {
			
		}else if(type == 'avatar'){
			image = appstc('/common/mine_def_touxiang_3x.png');
		}else{
			image = appstc('/common/img_default3x.png');
		}
	}
	return image;
}

const getlocaltime = (nS) => {
  return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
}
function wxlogin(fun) {
  let that = this;
  wx.login({
    success: function (res) {
      var code = res.code;
      console.log(code, "code----")
      wx.getUserInfo({
        fail: function (res) {
          confirm("请允许小程序获取您的用户信息", function () {
            if (wx.openSetting) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting["scope.userInfo"]) {
                    wx.getUserInfo({
                      success: function (res) {
                        var wxinfo = res;
                        console.log(wxinfo, "wxinfo---")
                        wxinfo.code = code;
                        that.setData({
                          userInfo: res.wxinfo
                        })
                        // ajaxpost(getApp().globalData.wxlogin,wxinfo, function (data) {
                        //     typeof fun == 'function' && fun(data)
                        // })

                      },
                    });
                  }
                }
              })
            } else {
              confirm('当前微信版本过低，请升级微信或手动允许微信获取您的个人信息', false)
            }

          }, false)
        },
        success: function (res) {
          console.log("getUserInfosuccess")
          var wxinfo = res;
          wxinfo.code = code;
          console.log(wxinfo, "wxinfo---")
          // ajaxpost(getApp().globalData.wxlogin, wxinfo, function (data) {
          //     typeof fun == 'function' && fun(data)
          // })

        },
      })
    }
  })
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var second = date.getSeconds()

  var hour = date.getHours()
  var minute = date.getMinutes()

  date.setMinutes(minute + 15);
  var nhour = date.getHours()
  var nminute = date.getMinutes()
  
  let sz = [];
  let arr = [];
  let arr2 = [];
  arr.push(hour + ':' + minute + '-' + nhour +':'+ nminute)
  
  date.setMinutes(nminute + 30);
  var nnhour = date.getHours()
  var nnminute = date.getMinutes()
  arr2.push(nnhour + ':' + nnminute);
  
  for (let i = 1; i < 24 - nhour;i++){
    arr.push((hour + i) + ':00'+'-'+ (hour + i)+':15');
    arr2.push((hour + i) + ':45')
  }
  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  sz.push(arr);
  sz.push(arr2)
  return sz

}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//替换URL中特殊字符
function replaceSpecialChar(url) {
  url = url.replace(/&quot;/g, '"');
  url = url.replace(/&amp;/g, '&');
  url = url.replace(/&lt;/g, '<');
  url = url.replace(/&gt;/g, '>');
  url = url.replace(/&nbsp;/g, ' ');
  console.log("转义字符", url);
  return url;
 }
module.exports = {
  replaceSpecialChar:replaceSpecialChar,
  oss:oss,
  trim: trim,
  alert: alert,
  loading: loading,
  hideloading: hideloading,
  confirm: confirm,
  gopage: gopage,
  gotopage: gotopage,
  gotarpage: gotarpage,
  backpage: backpage,
  alertBack: alertBack,
  gorepage: gorepage,
  setCache: setCache,
  getCache: getCache,
  removeCache: removeCache,
  showtips: showtips,
  showerror: showerror,
  testing: testing,
  getstringwidth: getstringwidth,
  getrandom: getrandom,
  choosemaplocation: choosemaplocation,
  choosewxaddress: choosewxaddress,
  ajaxget: ajaxget,
  ajaxpost: ajaxpost,
  formatSeconds: formatSeconds,
  uploadimg: uploadimg,
  getlocaltime: getlocaltime,
  wxlogin: wxlogin,
  formatTime: formatTime,
  getQueryVariable:getQueryVariable
}