var app = getApp()
Page({  
    data: {
      userInfo:{},
      canIgetUserProfile:false,
      hasUserInfo: false,
      
      },  
      //修改自微信官方文档
getUserProfile:function(){
  wx.getUserProfile({
    desc: '用于干饭',
    success:(res) => {
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true

      })
      console.log(res)
    },
  })
  console.log(111)
  
},
getUserInfo(e) {
  this.setData({
    userInfo: e.detail.userInfo,
    hasUserInfo: true,
    
  })
  
},

  
  onLoad: function () {
    if(wx.getUserProfile) {
      this.setData({
        canIgetUserProfile: true
      })
    }
      },
    

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
 onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})