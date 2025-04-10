/**
 * @description
 * 组件使用：
 * 组件会在保存相册成功后，抛出finish事件。
 * -----------
 * options的配置项：
 *   type: "multilineText/text/image", // 绘制类型，支持字符和图片
 *   url:'', // 图片地址
 *   content: '', // 文字内容
 *   dx: 44, // 距离左边距
 *   dy: 300, // 距离上边距
 *   dWidth: 200, // 绘制的图片宽度
 *   dHeight: 200, // 绘制的图片高度
 *   font: "12px", // 字体大小
 *   fillStyle: "#C2A272", //字体颜色
 *   textAlign:'', // 字体位置
 *   textBaseline:"", // 字体基线
 *   line: 4, // 多行文字行数
 *   lineHeight:20, // 多行文字行高
 *   maxWidth: 245, // 文字绘制的最大宽度
 *   letterSpacing: 0.5, // 文字间距
 *   mode: "screenCenter", // screenCenter：文字屏幕居中
 *   objectFit:'aspectFill', // aspectFill：图片适配裁剪模式；
 *   borderRadius: 10, // 圆角
 *   borderColor: "#E0C069", // 边框颜色
 */

Component({
  properties: {
    options: {
      type: Array,
      value: () => {},
    },
    // show: {
    //   type: Boolean,
    //   value: false,
    // },
    width: {
      type: Number,
      value: wx.getSystemInfoSync().windowWidth,
    },
    height: {
      type: Number,
      value: wx.getSystemInfoSync().windowHeight,
    },
    action: {
      type: String,
      value: "save",
    },
    defaultFontFamily:{
      type:String,
      value:'Arial'
    }
  },

  data: {
    show: true,
    ctx: null,
    canvas: null,

    // 手机屏幕本身的宽和高
    screenWidth: wx.getSystemInfoSync().windowWidth,
    screenHeight: wx.getSystemInfoSync().windowHeight,

    // 用户通过properties.width和height定义的width和height
    canvasPixelWidth: wx.getSystemInfoSync().windowWidth,
    canvasPixelHeight: wx.getSystemInfoSync().windowHeight,

    pixelRatio: wx.getSystemInfoSync().pixelRatio,
  },

  observers: {
    options: function (n) {
      console.log("n: ", n);
      if (n.length > 0) {
        this.setData({
          show: true,
        });
        wx.showLoading({
          title: this.properties.action === "save" ? "保存中" : "生成中",
          mask: true,
        });
        wx.nextTick(() => {
          this.saveImageByCanvas();
        });
      }
    },
    "width,height": function (w, h) {
      // Canvas 2D（新接口）需要显式设置画布宽高，默认：300*150，最大：1365*1365
      // https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html
      if (w > 1350 || h > 1350) {
        // 此处按照1350来判断，没必要卡到1365
        console.error(
          "----海报的宽高不允许超过1360*1360！,需要外部做缩放适配----"
        );
      }
    },
  },

  methods: {
    async saveImageByCanvas() {
      if (!this.properties.width || !this.properties.height) {
        console.log("%c----需要设定海报的宽高----", "color: yellow;");
        return;
      }
      this.setCanvasSize();

      const nodeList = await this.getNode("#saveDomOffsetCanvas");

      this.makeCanvasDisplayBetter(nodeList[0]);

      // 绘制前，先清空一次
      this.clearCanvas();

      for (let index = 0; index < this.properties.options.length; index++) {
        let element = this.properties.options[index];
        // 绘制图片
        if (element.type === "image") {
          await this.drawImageByCreateImage(element);
        }
        // 绘制单行字
        if (element.type === "text") {
          await this.fillSingleTextByCanvas(element);
        }
        // 绘制多行字
        if (element.type === "multilineText") {
          await this.fillMultilineTextByCanvas(element);
        }
      }

      if (this.properties.action === "save") {
        this.saveFileToAlbum();
      }
      if (this.properties.action === "generate") {
        this.justGenerateImageAndReturnPath();
      }
    },

    // ----------------------渲染函数------------------------

    fillMultilineTextByCanvas(item) {
      // eslint-disable-next-line no-unused-vars
      return new Promise((res, rej) => {
        this.data.ctx.font = item.font ? item.font : `22px ${this.properties.defaultFontFamily}`;
        this.data.ctx.fillStyle = item.fillStyle || "#C2A272";
        if (item.line) {
          this.drawMultilineText(item);
        } else {
          console.log("%c----需要设定多行文字行数----", "color: yellow;");
        }
        res(true);
      });
    },

    fillSingleTextByCanvas(item) {
      // eslint-disable-next-line no-unused-vars
      return new Promise((res, rej) => {
        this.setFontStyle(item);
        this.drawText(item);
        res(true);
      });
    },

    drawImageByCreateImage(item) {
      // eslint-disable-next-line no-unused-vars
      return new Promise((res, rej) => {
        let imgObj = this.data.canvas.createImage();
        imgObj.onload = () => {
          if (imgObj.complete) {
            this.drawImage(imgObj, item);
            res(imgObj);
          }
        };
        imgObj.src = item.url;
      });
    },

    drawImage(imgObj, item) {
      // 如果绘制的图片是屏幕居中，则需要手动赋值dx
      if (item.mode === "screenCenter") {
        let dx = (this.data.canvasPixelWidth - item.dWidth) / 2;
        Object.assign(item, {
          dx: dx,
        });
      }
      if (item.mode === undefined && item.dx === undefined) {
        console.log(
          "%c----不是屏幕居中（screenCenter）情况下，需要设置dx属性----",
          "color: yellow;"
        );
        console.log(`%c---${item.url}`, "color: yellow;");
      }
      if (item.borderRadius) {
        // 如果有边框，需要先绘制圆角图片，再绘制圆角矩形
        this.drawRadiusRectImage(imgObj, item);
        this.drawBorder(item);
      } else {
        this.calcThenDrawImage(imgObj, item);
      }
    },

    // ------------------工具函数-----------------
    setFontStyle(item) {
      this.data.ctx.font = item.font ? item.font : `22px ${this.properties.defaultFontFamily}`;
      this.data.ctx.fillStyle = item.fillStyle || "#C2A272";
      this.data.ctx.textAlign = item.textAlign || "start";
      this.data.ctx.textBaseline = item.textBaseline || "middle";
    },

    drawMultilineText(item) {
      this.getWrapText(item).forEach((e) => {
        // 多行文字绘制，需要固定为 start和top
        Object.assign(item, {
          textAlign: "start",
          textBaseline: "top",
        });
        this.setFontStyle(item);
        this.drawText(e);
      });
    },

    drawText(item) {
      if (item.letterSpacing > 0) {
        // 如果有letterSpacing字间距，则通过逐字形式来渲染
        let totalWidth = item.dx; // 渲染字符的起始dx位置
        if (!item.dx) {
          console.log(
            "%c----如果没有传入dx字段，则会默认屏幕居中----",
            "color: yellow;"
          );
          console.log(`%c${item.content}-未设置dx的值`, "color: yellow;");
          let strWidth = this.data.ctx.measureText(item.content).width;
          totalWidth =
            (this.data.canvasPixelWidth -
              strWidth -
              item.letterSpacing * (item.content.length - 1)) /
            2;
        }
        // 根据letterSpacing逐字渲染出来
        for (let i = 0; i < item.content.length; i++) {
          this.data.ctx.fillText(item.content[i], totalWidth, item.dy);
          totalWidth +=
            this.data.ctx.measureText(item.content[i]).width +
            item.letterSpacing;
        }
      } else {
        // 如果没有letterSpacing，则直接fillText形式渲染，节省性能
        if (item.mode === "screenCenter") {
          // 文字相对于屏幕居中
          this.data.ctx.textAlign = "center";
          this.data.ctx.fillText(
            item.content,
            this.data.canvasPixelWidth / 2,
            item.dy
          );
        } else {
          this.data.ctx.fillText(item.content, item.dx, item.dy);
        }
      }
    },

    getWrapText(item) {
      let lineHeight = item.lineHeight || 20;
      let letterSpacing = item.letterSpacing || 0;
      let txtList = [];
      let str = "";
      for (let i = 0, len = item.content.length; i < len; i++) {
        str += item.content.charAt(i);
        if (
          this.data.ctx.measureText(str).width +
            letterSpacing * (str.length - 1) >
          item.maxWidth
        ) {
          let textInfo = {
            type: "text",
            font: item.font,
            fillStyle: item.fillStyle,
            content: str.substring(0, str.length - 1),
            dx: item.dx,
            dy: item.dy + lineHeight * txtList.length,
            mode: item.mode || "",
            maxWidth: item.maxWidth,
            letterSpacing: item.letterSpacing,
          };
          txtList.push(textInfo);
          str = "";
          i--;
        }
      }
      txtList.push({
        type: "text",
        font: item.font,
        fillStyle: item.fillStyle,
        content: str,
        dx: item.dx,
        dy: item.dy + lineHeight * txtList.length,
        mode: item.mode || "",
      });
      if (txtList.length >= item.line) {
        let index = item.line - 1;
        let lastTextItem = txtList[index]["content"];
        let penultimateStr = lastTextItem[lastTextItem.length - 2];
        let curEndIndex = -1;
        // 如果倒数第二个字刚好也是标点符号，则直接将其去掉
        if (
          this.patchZhMark(penultimateStr) ||
          this.patchEnMark(penultimateStr)
        ) {
          curEndIndex = -2;
        }
        Object.assign(txtList[index], {
          content: lastTextItem.slice(0, curEndIndex) + "...",
        });
      }
      let finalTxtList = txtList.splice(0, item.line);
      return finalTxtList;
    },

    drawRadiusRectImage(imgObj, item) {
      // 绘制圆角图片原理：
      // 1.先保存当前画面，
      // 2.裁剪出圆角矩形画布，
      // 3.绘制图片，
      // 4.恢复裁剪之前的画面
      this.data.ctx.save(); // 保存
      this.drawRadiusRect(
        item.dx,
        item.dy,
        item.dWidth,
        item.dHeight,
        item.borderRadius
      ); // 画出圆角画布
      this.data.ctx.clip(); // 裁剪
      this.calcThenDrawImage(imgObj, item); // 绘图
      this.data.ctx.restore(); // 恢复裁剪前的画面
    },

    drawBorder(item) {
      this.data.ctx.strokeStyle = item.borderColor || "#E0C069";
      this.drawRadiusRect(
        item.dx,
        item.dy,
        item.dWidth,
        item.dHeight,
        item.borderRadius
      );
      this.data.ctx.stroke();
    },

    calcThenDrawImage(imgObj, item) {
      const { sx, sy, sWidth, sHeight } = this.calcDrawDistance(imgObj, item);
      this.data.ctx.drawImage(
        imgObj,
        sx,
        sy,
        sWidth,
        sHeight,
        item.dx,
        item.dy,
        item.dWidth,
        item.dHeight
      );
    },

    calcDrawDistance(imgObj, item) {
      let sx = 0;
      let sy = 0;
      //  通常情况下，我们传入的图片宽高就是需要绘制到canvas上的宽高
      let sWidth = item.dWidth;
      let sHeight = item.dHeight;

      if (item.objectFit === "aspectFill") {
        // 裁剪模式一般是图片本身大小和需要显示出来的大小不匹配，需要裁剪一部分，
        let imageRatio = imgObj.width / imgObj.height;
        let screenRatio = item.dWidth / item.dHeight;
        if (imageRatio >= screenRatio) {
          sWidth = (item.dWidth * imgObj.height) / item.dHeight;
          sHeight = imgObj.height;
          sx = (imgObj.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = imgObj.width;
          sHeight = (item.dHeight * imgObj.width) / item.dWidth;
          sx = 0;
          sy = (imgObj.height - sHeight) / 2;
        }
        return {
          sx,
          sy,
          sWidth,
          sHeight,
        };
      } else {
        sWidth = imgObj.width;
        sHeight = imgObj.height;
        return {
          sx,
          sy,
          sWidth,
          sHeight,
        };
      }
    },

    setCanvasSize() {
      this.setData({
        canvasPixelWidth: this.properties.width,
        canvasPixelHeight: this.properties.height,
      });
    },

    calcCanvasSize(w, h) {
      // 如果canvas上的style内联width/height非常大，那么，真机上绘制图片时，可能会白屏
      // https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html
      // 渲染高度限制：IOS实际像素 < 4096，实际高度需 < 4096/3 = 1356
      // 即：如果canvas的内联样式宽/高度在1350以内，真机可以正常渲染
      // 此处为了兼容性，函数会直接将canvas的内联宽高缩放至屏幕大小
      if (w > this.data.screenWidth || h > this.data.screenHeight) {
        let screenRatio = this.data.screenWidth / this.data.screenHeight;
        let selfRatio = w / h;
        if (screenRatio > selfRatio) {
          w = (w * this.data.screenHeight) / h;
          h = this.data.screenHeight;
        } else {
          h = (h * this.data.screenWidth) / w;
          w = this.data.screenWidth;
        }
      }
      return { w, h };
    },

    getNode(id) {
      return new Promise((res, rej) => {
        const query = wx.createSelectorQuery().in(this);
        query
          .select(id)
          .fields({ node: true, size: true })
          .exec((e) => {
            if (e[0]) {
              res(e);
            } else {
              rej(e);
            }
          });
      });
    },

    makeCanvasDisplayBetter(nodeInfo) {
      const { node: canvas } = nodeInfo;
      const ctx = canvas.getContext("2d");
      // 此处将canvas的尺寸扩大（3倍）,缩放扩大（3倍），
      // 并且在style内联样式中又指定canvas的宽（1倍）和高（1倍），来实现更清晰的canvas显示效果。
      // 原理：生成3倍大小canvas，通过css缩放到1倍宽高的dom中显示。
      // 相当于将900*900的图片，展示到一个300*300大小的dom框中，清晰度会提高。
      // 微信小程序会显示canvas的最大尺寸为：4096*4096，超出会报错
      const dpr = this.calcDPR(this.data.pixelRatio);
      canvas.width = this.data.canvasPixelWidth * dpr;
      canvas.height = this.data.canvasPixelHeight * dpr;
      ctx.scale(dpr, dpr);
      this.setData({
        canvas,
        ctx,
      });
    },

    calcDPR(pixelRatio) {
      let dpr = pixelRatio;
      if (
        this.data.canvasPixelWidth * pixelRatio > 4096 ||
        this.data.canvasPixelHeight * pixelRatio > 4096
      ) {
        const shortDPR = this.calcDPR(pixelRatio - 1);
        return shortDPR;
      } else {
        return dpr;
      }
    },

    saveFileToAlbum() {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        canvas: this.data.canvas,
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              this.triggerEvent("finish");
              this.setData({
                show: false,
              });
            },
            complete: () => {
              wx.hideLoading();
            },
          });
        },
      });
    },

    justGenerateImageAndReturnPath() {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        canvas: this.data.canvas,
        success: (res) => {
          if (res.tempFilePath) {
            this.triggerEvent("filepath", res.tempFilePath);
            this.setData({
              show: false,
            });
          } else {
            console.log("生图失败");
          }
        },
        complete: () => {
          wx.hideLoading();
        },
      });
    },

    drawRadiusRect(x, y, w, h, r) {
      const br = r;
      let ctx = this.data.ctx;
      ctx.beginPath();
      ctx.moveTo(x + br, y); // 移动到左上角的点
      ctx.lineTo(x + w - br, y); // 画上边的线
      ctx.arcTo(x + w, y, x + w, y + br, br); // 画右上角的弧
      ctx.lineTo(x + w, y + h - br); // 画右边的线
      ctx.arcTo(x + w, y + h, x + w - br, y + h, br); // 画右下角的弧
      ctx.lineTo(x + br, y + h); // 画下边的线
      ctx.arcTo(x, y + h, x, y + h - br, br); // 画左下角的弧
      ctx.lineTo(x, y + br); // 画左边的线
      ctx.arcTo(x, y, x + br, y, br); // 画左上角的弧
      ctx.closePath();
    },

    //判断字符是否是 中文符号
    patchZhMark(temp) {
      var reg =
        /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
      if (reg.test(temp)) {
        return true;
      } else {
        return false;
      }
    },

    //判断字符是否是 英文半角符号
    patchEnMark(temp) {
      var reg = /[\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/;
      if (reg.test(temp)) {
        return true;
      } else {
        return false;
      }
    },

    clearCanvas() {
      this.data.ctx.clearRect(
        0,
        0,
        this.data.canvasPixelWidth,
        this.data.canvasPixelHeight
      );
    },

    // ------------------功能函数-----------------
  },
});
