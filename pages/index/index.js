 Page({
  data: {
    saveDomOptions: [],
    canvasWidth: 390,
    canvasHeight: 844,
    action: "save",
    path:''
  },
  generate(){
    this.generateImageByCanvas("generate"); // 仅生成海报
  },
  save(){
    this.generateImageByCanvas("save"); // 直接保存到相册
  },
  finish() {
    wx.showToast({
      title: "保存成功",
      icon: "success",
      duration: 1500,
    });
  },
  generateImagePath(e) {
    this.setData({
      path:e.detail
    })
  },
  async generateImageByCanvas(action) {
    let updateList = [
      {
        type: "image",
        url: 'https://limengtupian.oss-cn-beijing.aliyuncs.com/a-image/share_bc.png',
        dx: 0,
        dy: 0,
        dWidth: this.data.canvasWidth,
        dHeight: this.data.canvasHeight,
        mode: "aspectFill",
      },
      {
        type: "image",
        url: 'https://limengtupian.oss-cn-beijing.aliyuncs.com/a-image/1734074371_5hZI2.png',
        dy: 80,
        dWidth: 450,
        dHeight: 450,
        mode: "screenCenter",
        objectFit: "aspectFill",
      },
      {
        type: "multilineText",
        content: '高昌回鹘·柏孜克里克千佛洞说法相佛首',
        dy: 550,
        font: "22px",
        fillStyle: "#fff",
        mode: "screenCenter",
        line: 3,
        lineHeight: 30,
        maxWidth: 235,
        letterSpacing: 0.5,
      },
      {
        type: "text",
        content: "故宫博物馆",
        dx: 230,
        dy: 800,
        font: "22px",
        fillStyle: "#3D3D3D",
        letterSpacing: 1,
      },
    ];
    this.setData({
      saveDomOptions: updateList,
      action: action,
    });
  },
})
