// pages/index2/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    a : - 1,
    b : - 1,
    c : - 1,
    value: 0,
    valu: 0,
    slidermax: 100,
  
      items1: [
      { name: 'max', value: '窗全打开' },
      { name: 'medium', value: '窗全半开' },
      { name: 'min', value: '窗全关掉' },

    ],
      items2: [
      { name: 'win1', value: '卧室前窗' },
      { name: 'win2', value: '卧室后窗' },
      
    ],
    frontAll: true,
    middleAll: true,
    backAll: true,
    orders: [{
      date: {
        day: 1,
        window: '前窗'
      },
      front: {
        checked: true,
        value: 1
      },
      middle: {
        checked: true,
        value: 1
      },
      back: {
        checked: true,
        value: 1
      }
    }, {
      date: {
        day: 2,
        window: '中窗'
      },
      front: {
        checked: true,
        value: 1
      },
      middle: {
        checked: true,
        value: 1
      },
      back: {
        checked: true,
        value: 1
      }
    }, {
      date: {
        day: 3,
        window: '后窗'
      },
      front: {
        checked: true,
        value: 1
      },
      middle: {
        checked: true,
        value: 1
      },
      back: {
        checked: true,
        value: 1
      }
    }]
  },
  tapliv: function(){
    this.setData({a: this.data.a * -1
      })
  },
  tapkit: function(){
    this.setData({b: this.data.b * -1
      })
  },
  tapbed: function(){
    this.setData({c: this.data.c * -1
      })
  },

sliderChange_1(e){    console.log('窗户1开启程度为', e.detail.value,'%')
this.setData({
  liv1: e.detail.value
})
},
sliderChange_2(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  liv2: e.detail.value
})
},
sliderChange_3(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  liv3: e.detail.value
})
},
sliderChange_4(e){    console.log('窗户1开启程度为', e.detail.value,'%')
this.setData({
  kit1: e.detail.value
})
},
sliderChange_5(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  kit2: e.detail.value
})
},
sliderChange_6(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  kit3: e.detail.value
})
},
sliderChange_7(e){    console.log('窗户1开启程度为', e.detail.value,'%')
this.setData({
  bed1: e.detail.value
})
},
sliderChange_8(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  bed2: e.detail.value
})
},
sliderChange_9(e){console.log('窗户2开启程度为', e.detail.value,'%')
this.setData({
  bed3: e.detail.value
})
},
setmax_1(e){//设置开窗的最大值，但这个函数还没用到
this.setData({
  slidermax_1: e,
})
},

 /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  // 全选前
  selectfrontAll: function (e) {
    let type = e.currentTarget.dataset.type;
    let status = !this.data.frontAll;
    this.selectAll(type, status);
    this.setData({
      frontAll: status
    });
  },
  // 全选中
  selectmiddleAll: function (e) {
    let type = e.currentTarget.dataset.type;
    let status = !this.data.middleAll;
    this.selectAll(type, status);
    this.setData({
      middleAll: status
    });
  },
  // 全选后
  selectbackAll: function (e) {
    let type = e.currentTarget.dataset.type;
    let status = !this.data.backAll;
    this.selectAll(type, status);
    this.setData({
      backAll: status
    });
  },
  // 全选函数
  selectAll: function (type, status) {
    let orders = this.data.orders;
    orders.map((item, index) => {
      item[type].checked = status;
    });
    // console.log(orders)
    this.setData({
      orders
    });
  },
  // 点击单选
  select: function (e) {
    let type = e.currentTarget.dataset.type;
    let currentIndex = e.currentTarget.dataset.index;
    let orders = this.data.orders;
    let total = 0;
    orders.map((item, index) => {
      if (index === currentIndex) {
        item[type].checked = !item[type].checked;
      }
    });
    orders.map((item, index) => {
      if (item[type].checked) {
        total = total + 1;
      }
    });
    let status = orders.length == total ? true : false;
    switch (type) {
      case 'front':
        this.setData({
          frontAll: status
        });
        break;
      case 'middle':
        this.setData({
          middleAll: status
        });
        break;
      case 'back':
        this.setData({
          backAll: status
        });
        break;
    }
    this.setData({
      orders
    });
    // console.log(orders)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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