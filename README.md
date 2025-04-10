### 功能介绍

* 利用canvas在微信小程序中生成定制化海报；
* 内置海报常用样式，如：带边框的图片、多行文本适配、字间距调整、图片自动裁剪适配、图片居中；
* 提供保存海报到相册和获取海报文件路径功能；

### 外部使用

#### 安装依赖
```bash
npm i poster-creator-mp --save
```

#### 微信小程序中引入组件
```json
{
  "usingComponents": {
    "poster-creator-mp": "poster-creator-mp",
  }
}
```

```html
<button bind:tap="generate">生成海报</button>
<button bind:tap="save">保存海报</button>
<poster-creator-mp
  width="{{390}}"
  height="{{840}}"
  options="{{options}}"
  action="{{action}}"
  bind:finish="finish"
  bind:filepath="generateImagePath"
/>
```

```js
data: {
  options: [],
  action: "save",
},
generate(){
   this.generateImageByCanvas("generate"); // 仅绘制海报
},
save(){
  this.generateImageByCanvas("save"); // 绘制并保存到相册
},
finish() {
  wx.showToast({
    title: "保存成功",
    icon: "success",
    duration: 1500,
  });
},
generateImagePath(e) {
   console.log('e.detail',e.detail)
},
async generateImageByCanvas(action) {
  let updateList = [
    {
      type: "image",
      url: 'https://limengtupian.oss-cn-beijing.aliyuncs.com/a-image/share_bc.png',
      dx: 0,
      dy: 0,
      dWidth: 390,
      dHeight: 840,
      mode: "aspectFill",
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
  ];
  this.setData({
    options: updateList,
    action: action,
  });
},
```

#### 绘制海报是如何被触发的？

> 我们没有单独暴露一个render方法来触发canvas绘制，而是直接通过监听options数组字段的数据变化来触发canvas绘制。

```js
this.setData({
  options: updateList,
});
```

### 配置项

#### 组件属性

| 属性 | 类型 | 默认值 | 说明 | 可选值 |
|:---:|:---:|:---:|:---:| ---| 
| width | Number | wx.getSystemInfoSync().windowWidth | canvas的宽度| - |
| height | Number | wx.getSystemInfoSync().windowHeight | canvas的高度 | - |
| action | String | 'save' | 绘制行为 | save：绘制并保存到相册；generate：绘制海报并返回海报临时路径
| options | Array | [] | 绘制海报的内容 | - |
| defaultFontFamily | String | 'Arial' | 文字字体 | - |

> options数组配置有如下属性可选

```js
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
```
配置对象形如：

```js
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
```
#### 组件事件

| 名称 | 触发时机 | 返回值 | 说明  |
|:---:|:---:|:---:|---| 
| finish | 保存到相册成功 |- | - | 
| filepath | canvas绘制完成 | 海报图片临时路径 | 通过e.detail获取路径 | 

### 本地测试

略~

### 更新发包

```bash
npm publish
```

### 更新日志

略~