// pages/index1/index.js
const app = getApp()
const recorderManager = wx.getRecorderManager()
const readManager = wx.getFileSystemManager()
const db = wx.cloud.database({env:"cloud1-9gpbbzxg1997bfa8"})
const md_col = db.collection("movement_decision")
const mex_col = db.collection("movement_extent")
const win_info =db.collection("window_info")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIgetUserProfile:false,
    hasUserprofile: false,
    userProfile: {},
    voiceTowords:"",
    touched: false,
    weatherInfo: "",
    latitude:0,
    longitude: 0,
    windowInfo:{
      'user':'',
      'degree': 90
    },
    OPENID:'',
    index: 0,
    degree:0,
    items:{}
  },
  signIn(){
    var that = this
    
    if(!that.data.hasUserprofile){
      
      wx.getUserProfile({
        desc: '登录',
        success:(res)=>{
          //console.log(res)
          wx.login({
            timeout: 10000,
            success:(res)=>{
              console.log('login')
              //console.log(res)
              let code=res.code
              // 通过code换取openId
              wx.request({
                url: `https://api.weixin.qq.com/sns/jscode2session?appid=wxd9514b457cdb17fa&secret=f4b0501a0c5240b0db36befa210c6f0f&js_code=${code}&grant_type=authorization_code`,
                success:(res)=>{
                  console.log(res);
                  that.setData({
                    userProfile:res.data.openid,
                    hasUserprofile: true,
                    OPENID:res.data.openid
                  })
                  that.getLocation()
                  that.getAdvice()
                  console.log(that.data.userProfile)
                },
                fail:(err)=>{
                  console.log(err)
                }
              })
            }
          })
        }
      })
    }
  },

recordStart() {//按按钮开始录音
  if(!this.data.hasUserprofile){
    wx.showModal({
      title: '尚未登陆',
      content: '请先授权登录'
    })
    return
  }
  const options = {//音频的参数
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: 'wav'
  }
  this.setData({
    touched: true
  })
  recorderManager.start(options)//开始录制音频
  //recorderManager.onStart()
  console.log('start record')
},

recordEnd(){//停止录音并调用语音识别api
  var that = this
  if(!this.data.touched){//以防万一
    return;
  }
  this.setData({
    touched: false
  })
  recorderManager.stop()
  console.log('end record')
  recorderManager.onStop((res) => {
    var tempFilePath = res.tempFilePath;//音频文件地址
    var filelength = 0;
    console.log(tempFilePath)
    readManager.readFile({//获取音频文件二进制长度（api要这东西，烦死了）
      filePath: tempFilePath,
      encoding: 'binary',
      success:(res=>{
        filelength = res.data.length
        console.log(filelength)
      })
    })
    readManager.readFile({//读取本地暂存的音频文件并调用api
      filePath: tempFilePath,
      encoding: 'base64',
      success:(res)=>{
        console.log('文件转为base64成功')
        //console.log(res.data)
        wx.request({
          url: 'https://vop.baidu.com/pro_api',
          header:{'Content-Type':'application/json'},
          data:{
            'format': 'wav',
            'rate': 16000,
            'channel': 1,
            'cuid': 'this_is_a_miniprogram',
            'token': '24.de63041f41d1f0876238970100e7f198.2592000.1656678550.282335-26355259',
            'dev_pid': 80001,
            'speech': res.data,
            'len': filelength,
          },
          method:'POST',
          success:(res)=>{
            console.log('post成功')
            console.log(res.data.result)
            try{//有时候有Cannot read property '0' of undefined的报错，用try暴力解决了，报错不用管
              if(res.data.result[0]){
              that.setData({
                voiceTowords: res.data.result[0]
              })
              }else{
                that.setData({
                  voiceTowords: '语音识别失败'
                })
              }
            }
            catch{
              that.setData({
                voiceTowords: '语音识别失败'
              })
            }
          },
          fail:(err)=>{
            console.log('post失败')
            console.log(err)
          }
        })
      }
    })
  })
  
},
testVocal(){//语义识别函数
  var that = this
  let a = this.data.voiceTowords//语音识别内容
  //console.log(a)
  return new Promise((resolve, reject) => {
  wx.request({//调用api
    url: 'https://aip.baidubce.com/rpc/2.0/nlp/v2/depparser?access_token=24.280cf8bff8c92959cf851afa8af9306e.2592000.1658070131.282335-26363033',
    header:{
      'Content-Type':'application/json'
    },
    data:{
      'text': a,
    },
    method:'POST',
    success: (res) => {
      //console.log(res)
      const status = res.statusCode
      const response = res.errMsg
      if (status !== 200) { //返回状态码不为200时将Promise置为reject状态
        reject(res.data)
        return
      }
      if (response !== 'request:ok') { //errno不为零说明可能参数有误, 将Promise置为reject
        reject(response.error)
        return
      }
        that.setData({
          items:res.data.items
        })
        that.getSmartadvice()//调用语义处理函数
        console.log(that.data.items)
    },
    fail: (err) => {
      reject(err)
    }
  })
})
},

getSmartadvice(){//语义处理函数
  var that = this
  var decision_set = []//数据库中的内容
  var extent_set = []//数据库中的内容
  var place_index = []//地点在话中的位置
  var advice_index = []//指令在话中的位置
  var window_to_control = []//要控制的窗户
  var movement_decision = []
  console.log(this.data.OPENID)
  win_info.where({
    openid: this.data.OPENID
  }).get({
    success:(res)=>{
      //console.log(res)
      //console.log(this.data.items.length)
      //console.log(res.data.length)
      for(let j=0;j<this.data.items.length;j=j+1){
        for(let i=0;i<res.data.length;i=i+1){
          if(res.data[i].place==this.data.items[j].word){
            place_index.push(j)//窗户所处位置（比如卧室）在这句话中的哪里
            window_to_control.push(res.data[i])
          }
        }
      }
    }
  })
  //console.log(window_to_control)
  md_col.get({
    success:(res)=>{
      for(let i=0;i<res.data.length;i++){
        decision_set.push(res.data[i])
      }
      mex_col.get({
        success:(res)=>{
          console.log(res)
          for(let i=0;i<res.data.length;i++){
            extent_set.push(res.data[i])
          }
          for(let i=0;i<decision_set.length;i++){
            for(let j=0;j<this.data.items.length;j++){
              if(decision_set[i].keyword==this.data.items[j].word){
                console.log("yes")
                advice_index.push(j)
                for(let k=1;k<3&&k+j<this.data.items.length;k++){
                  for(let h=0;h<extent_set.length;h++){
                    if(this.data.items[j+k].word==extent_set[h].keyword){
                      console.log(extent_set[h].keyword)
                      decision_set[i].attitude = decision_set[i].attitude*extent_set[h].comparison_extent
                    }
                  }
                }
                movement_decision.push(decision_set[i])
              }
            }
          }
          //console.log(advice_index)
          //无指令的情况
          console.log("movement",movement_decision)
          if(movement_decision.length==0){
            wx.showToast({
              title: '识别失败',
              duration: 2500,
              icon: 'error'
            })
            //return
          }
          for(let i = 0;i<place_index.length;i++){
            let j = 0
            while(place_index[i]>advice_index[j]){
              ++j;
            }
            //console.log(j)
            //console.log(movement_decision[j].attitude)
            //将范围控制在0~100
            window_to_control[i].attitude = 50+movement_decision[j].attitude*50
            if(window_to_control[i].attitude<0){
              window_to_control[i].attitude=0
            }else if(window_to_control[i].attitude>100){
              window_to_control[i].attitude=100
            }
          }
          console.log(window_to_control)
          for(let i=0;i<window_to_control.length;i++){
            that.setData({
              windowInfo:{
                'user': window_to_control[i].openid+'_'+window_to_control[i].name,
                'degree': window_to_control[i].attitude
              }
            })
            console.log(that.data.windowInfo)
            that.setCommand()
          }
        }
      })
    }
  })
  },
//登录个人账号，以便授权
getUserProfile:function(){
  wx.getUserProfile({
    desc: '登录',
    success:(res) => {
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      })
      console.log(res)
    },
  })
},

getUserInfo(e) {
  this.setData({
    userInfo: e.detail.userInfo,
    hasUserInfo: true,
  })
},

getLocation(){//获取当前城市的天气预报，以便提供开关窗建议
  if(!this.data.hasUserprofile){
    wx.showModal({
      title: '尚未登陆',
      content: '请先授权登录'
    })
    return
  }
  var that = this
  wx.getLocation({//请求地理位置
    success:(res)=>{
      var la = res.latitude.toFixed(2)
      var lo = res.longitude.toFixed(2)
      that.setData({
        latitude: la,
        longitude: lo
      })
      console.log(that.data.longitude)
    }
  })
  this.getAdvice()
},

//获取实时天气信息，并获取开关窗建议
getAdvice(){
  var that = this
  wx.request({
    url: 'https://devapi.qweather.com/v7/weather/now?key=e909244efa2544fe87f75d95e380a235'+'&location=' + that.data.longitude + ',' + that.data.latitude,
    data:{
    },
    method:'GET',
  
success:(res)=>{
      console.log(res)
this.setData({
  weatherInfo:res.data.now.text,
  temp:res.data.now.temp
})
   console.log("今日天气："+this.data.weatherInfo)
    },
    fail:(err)=>{
      console.log(err)  
    }
  })
},

setCommand(){
  if(!this.data.hasUserprofile){
    console.log('尚未登录')
    wx.showToast({
      title: '尚未登录',
      icon:'error'
    })
    return
  }
  var that = this
  let data={
    "datastreams": [{
            "id": that.data.windowInfo.user,
            "datapoints": [{
                    "value": that.data.windowInfo.degree
                }
            ]
        }
    ]
}
  return new Promise((resolve, reject) => {
    wx.request({
      url: `http://api.heclouds.com/cmds?device_id=858517460&timeout=1800`,
      header: {
        'content-type': 'application/json',
        'api-key': '5TDssFFcBUyG680zFEJLOd6eGxU='
      },
      data:data,
      method:'POST',
      success: (res) => {
        console.log(res)
        const status = res.statusCode
        const response = res.data
        if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
          reject(res.data)
          return ;
        }
        if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
          reject(response.error)
          return ;
        }


        //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
        wx.showToast({
          title: '下达成功',
          duration: 2500,
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(wx.getUserProfile) {
      this.setData({
        canIgetUserProfile: true
      })
    }
    
    
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
   this.getLocation()
    this.getAdvice()
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