# 地图 (DrMap)

## 概述

- **组件名称**: DrMap
- **中文标题**: 地图
- **分类标签**: chart
- **描述**: 地理空间可视化组件，用于展示行政区区域数据、地理标记点和迁徙/流向飞线。默认基于内置 GeoJSON 渲染中国及省级行政区，可按数据值展示分段颜色、区域标签、悬浮提示、高亮状态、点位涟漪和飞线动画。组件也预留在线底图模式，用于接入外部地图服务展示道路、建筑、卫星、路网和交通图层。
- **默认尺寸**: 750 x 800

## PropsInterface

```json
{
  "source": {
    "description": "地图数据源配置",
    "properties": {
      "mode": {
        "type": "string",
        "description": "地图渲染模式，geoJson 使用内置行政区边界，online 使用在线底图服务",
        "default": "geoJson",
        "enum": ["geoJson", "online"]
      },
      "regionCode": {
        "type": "string",
        "description": "默认展示的行政区编码，china 表示全国地图，省级编码表示对应省份地图",
        "default": "china"
      },
      "showSouthChinaSea": {
        "type": "boolean",
        "description": "展示全国地图时是否显示南海诸岛附图",
        "default": true
      },
      "enableDrillDown": {
        "type": "boolean",
        "description": "是否允许点击地图区域进入下一级行政区",
        "default": false
      },
      "onlineProvider": {
        "type": "object",
        "description": "在线底图服务配置，仅 mode=online 时生效",
        "default": {
          "apiKey": "",
          "style": "dark",
          "customStyleId": "",
          "language": "zh_cn"
        }
      }
    }
  },
  "view": {
    "description": "视图配置",
    "properties": {
      "center": {
        "type": "array",
        "description": "地图中心点 [经度, 纬度]，在线底图模式使用",
        "default": [116.397428, 39.90923]
      },
      "zoom": {
        "type": "number",
        "description": "初始缩放级别",
        "default": 1,
        "min": 0,
        "max": 18
      },
      "roam": {
        "type": "boolean",
        "description": "是否允许鼠标缩放和平移",
        "default": false
      },
      "viewMode": {
        "type": "string",
        "description": "在线底图视图模式",
        "default": "2D",
        "enum": ["2D", "3D"]
      },
      "pitch": {
        "type": "number",
        "description": "3D 视图俯仰角",
        "default": 60,
        "min": 0,
        "max": 83
      },
      "skyColor": {
        "type": "string",
        "description": "3D 视图天空颜色",
        "default": "#53A9DE"
      },
      "showOnlineLabel": {
        "type": "boolean",
        "description": "在线底图是否显示文字标注",
        "default": true
      },
      "onlineFeatures": {
        "type": "array",
        "description": "在线底图显示要素",
        "default": ["bg", "point", "road", "building"],
        "enum": ["bg", "point", "road", "building"]
      }
    }
  },
  "regionStyle": {
    "description": "行政区样式",
    "properties": {
      "areaGradient": {
        "type": "array",
        "description": "区域填充渐变颜色 [中心色, 边缘色]",
        "default": ["rgba(147, 235, 248, 0)", "rgba(147, 235, 248, 0.12)"]
      },
      "borderColor": {
        "type": "string",
        "description": "区域边框颜色",
        "default": "#93EBF8"
      },
      "borderWidth": {
        "type": "number",
        "description": "区域边框宽度",
        "default": 1,
        "min": 0,
        "max": 20
      },
      "shadowColor": {
        "type": "string",
        "description": "区域阴影颜色",
        "default": "rgba(128, 217, 248, 0.26)"
      },
      "shadowBlur": {
        "type": "number",
        "description": "区域阴影模糊半径",
        "default": 10,
        "min": 0,
        "max": 100
      },
      "shadowOffset": {
        "type": "array",
        "description": "区域阴影偏移 [X, Y]",
        "default": [-2, 2]
      }
    }
  },
  "regionLabel": {
    "description": "行政区名称配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示行政区名称",
        "default": false
      },
      "fontSize": {
        "type": "number",
        "description": "行政区名称字号",
        "default": 12,
        "min": 8,
        "max": 40
      },
      "color": {
        "type": "string",
        "description": "行政区名称颜色",
        "default": "#FFFFFF"
      }
    }
  },
  "emphasis": {
    "description": "区域高亮配置",
    "properties": {
      "disabled": {
        "type": "boolean",
        "description": "是否禁用鼠标悬停高亮",
        "default": false
      },
      "areaColor": {
        "type": "string",
        "description": "高亮区域填充色",
        "default": "#389BB7"
      },
      "borderWidth": {
        "type": "number",
        "description": "高亮区域边框宽度",
        "default": 1,
        "min": 0,
        "max": 20
      },
      "shadowColor": {
        "type": "string",
        "description": "高亮区域阴影颜色",
        "default": "#389BB7"
      },
      "label": {
        "type": "object",
        "description": "高亮时行政区名称样式",
        "default": {
          "fontSize": 12,
          "color": "#FFFFFF"
        }
      }
    }
  },
  "visualMap": {
    "description": "数值分段映射配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示数值分段图例",
        "default": true
      },
      "orient": {
        "type": "string",
        "description": "分段图例方向",
        "default": "vertical",
        "enum": ["vertical", "horizontal"]
      },
      "pieces": {
        "type": "array",
        "description": "数值分段规则，每项可包含 min、max、gte、lte、label",
        "default": [
          { "gte": 1000, "label": ">1000" },
          { "gte": 600, "lte": 999, "label": "600-999" },
          { "gte": 200, "lte": 599, "label": "200-599" },
          { "gte": 50, "lte": 199, "label": "50-199" },
          { "gte": 10, "lte": 49, "label": "10-49" },
          { "lte": 9, "label": "<9" }
        ]
      },
      "colors": {
        "type": "array",
        "description": "分段颜色，从低值到高值排列",
        "default": ["#c3d7df", "#5cb3cc", "#8abcd1", "#66a9c9", "#2f90b9", "#1781b5"]
      },
      "textStyle": {
        "type": "object",
        "description": "分段图例文字样式",
        "default": {
          "color": "#FFFFFF"
        }
      }
    }
  },
  "marker": {
    "description": "地理标记点配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示标记点",
        "default": true
      },
      "type": {
        "type": "string",
        "description": "标记点类型",
        "default": "effectScatter",
        "enum": ["effectScatter", "circle", "pin", "none"]
      },
      "symbolSize": {
        "type": "number",
        "description": "标记点基础大小",
        "default": 4,
        "min": 0,
        "max": 100
      },
      "color": {
        "type": "string",
        "description": "标记点颜色",
        "default": "#FFFFFF"
      },
      "borderColor": {
        "type": "string",
        "description": "标记点边框颜色",
        "default": "rgba(225, 255, 255, 1)"
      },
      "borderWidth": {
        "type": "number",
        "description": "标记点边框宽度",
        "default": 4,
        "min": 0,
        "max": 20
      },
      "ripple": {
        "type": "object",
        "description": "涟漪动画配置",
        "default": {
          "show": true,
          "scale": 6,
          "color": "#FFFFFF",
          "brushType": "fill"
        }
      },
      "label": {
        "type": "object",
        "description": "标记点名称配置",
        "default": {
          "show": true,
          "position": "bottom",
          "fontSize": 11,
          "color": "#FFFFFF",
          "offset": [0, 2]
        }
      }
    }
  },
  "flowLine": {
    "description": "飞线配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示飞线",
        "default": true
      },
      "color": {
        "type": "string",
        "description": "飞线颜色",
        "default": "#4fb6d2"
      },
      "width": {
        "type": "number",
        "description": "飞线宽度",
        "default": 1,
        "min": 1,
        "max": 20
      },
      "opacity": {
        "type": "number",
        "description": "飞线透明度",
        "default": 0.1,
        "min": 0,
        "max": 1
      },
      "curveness": {
        "type": "number",
        "description": "飞线弯曲程度",
        "default": 0.3,
        "min": 0,
        "max": 1
      },
      "effect": {
        "type": "object",
        "description": "飞线动画效果",
        "default": {
          "show": true,
          "period": 4,
          "trailLength": 0.4,
          "symbol": "arrow",
          "symbolSize": 7
        }
      }
    }
  },
  "tooltip": {
    "description": "提示框配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示提示框",
        "default": true
      },
      "trigger": {
        "type": "string",
        "description": "触发方式",
        "default": "item",
        "enum": ["item"]
      },
      "backgroundColor": {
        "type": "string",
        "description": "提示框背景颜色",
        "default": "rgba(0, 0, 0, 0.6)"
      },
      "borderColor": {
        "type": "string",
        "description": "提示框边框颜色",
        "default": "rgba(147, 235, 248, 0.8)"
      },
      "textStyle": {
        "type": "object",
        "description": "提示框文字样式",
        "default": {
          "fontSize": 12,
          "color": "#FFFFFF"
        }
      }
    }
  },
  "backControl": {
    "description": "下钻返回控件配置",
    "properties": {
      "text": {
        "type": "string",
        "description": "返回按钮文案",
        "default": "返回上级"
      },
      "fontSize": {
        "type": "number",
        "description": "返回按钮字号",
        "default": 20,
        "min": 10,
        "max": 40
      },
      "color": {
        "type": "string",
        "description": "返回按钮颜色",
        "default": "#FFFFFF"
      }
    }
  },
  "onlineLayers": {
    "description": "在线底图叠加图层配置，仅 mode=online 时生效",
    "properties": {
      "satellite": {
        "type": "object",
        "description": "卫星图层",
        "default": {
          "show": false,
          "zIndex": 1,
          "opacity": 1,
          "zoomRange": [3, 18]
        }
      },
      "roadNet": {
        "type": "object",
        "description": "路网图层",
        "default": {
          "show": false,
          "zIndex": 2,
          "opacity": 1,
          "zoomRange": [3, 18]
        }
      },
      "traffic": {
        "type": "object",
        "description": "实时交通图层",
        "default": {
          "show": false,
          "zIndex": 3,
          "opacity": 1,
          "zoomRange": [3, 18]
        }
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrMap",
  "title": "地图",
  "w": 750,
  "h": 800,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "source": {
      "mode": "geoJson",
      "regionCode": "china",
      "showSouthChinaSea": true,
      "enableDrillDown": false,
      "onlineProvider": {
        "apiKey": "",
        "style": "dark",
        "customStyleId": "",
        "language": "zh_cn"
      }
    },
    "view": {
      "center": [116.397428, 39.90923],
      "zoom": 1,
      "roam": false,
      "viewMode": "2D",
      "pitch": 60,
      "skyColor": "#53A9DE",
      "showOnlineLabel": true,
      "onlineFeatures": ["bg", "point", "road", "building"]
    },
    "regionStyle": {
      "areaGradient": ["rgba(147, 235, 248, 0)", "rgba(147, 235, 248, 0.12)"],
      "borderColor": "#93EBF8",
      "borderWidth": 1,
      "shadowColor": "rgba(128, 217, 248, 0.26)",
      "shadowBlur": 10,
      "shadowOffset": [-2, 2]
    },
    "regionLabel": {
      "show": false,
      "fontSize": 12,
      "color": "#FFFFFF"
    },
    "emphasis": {
      "disabled": false,
      "areaColor": "#389BB7",
      "borderWidth": 1,
      "shadowColor": "#389BB7",
      "label": {
        "fontSize": 12,
        "color": "#FFFFFF"
      }
    },
    "visualMap": {
      "show": true,
      "orient": "vertical",
      "pieces": [
        { "gte": 1000, "label": ">1000" },
        { "gte": 600, "lte": 999, "label": "600-999" },
        { "gte": 200, "lte": 599, "label": "200-599" },
        { "gte": 50, "lte": 199, "label": "50-199" },
        { "gte": 10, "lte": 49, "label": "10-49" },
        { "lte": 9, "label": "<9" }
      ],
      "colors": ["#c3d7df", "#5cb3cc", "#8abcd1", "#66a9c9", "#2f90b9", "#1781b5"],
      "textStyle": {
        "color": "#FFFFFF"
      }
    },
    "marker": {
      "show": true,
      "type": "effectScatter",
      "symbolSize": 4,
      "color": "#FFFFFF",
      "borderColor": "rgba(225, 255, 255, 1)",
      "borderWidth": 4,
      "ripple": {
        "show": true,
        "scale": 6,
        "color": "#FFFFFF",
        "brushType": "fill"
      },
      "label": {
        "show": true,
        "position": "bottom",
        "fontSize": 11,
        "color": "#FFFFFF",
        "offset": [0, 2]
      }
    },
    "flowLine": {
      "show": true,
      "color": "#4fb6d2",
      "width": 1,
      "opacity": 0.1,
      "curveness": 0.3,
      "effect": {
        "show": true,
        "period": 4,
        "trailLength": 0.4,
        "symbol": "arrow",
        "symbolSize": 7
      }
    },
    "tooltip": {
      "show": true,
      "trigger": "item",
      "backgroundColor": "rgba(0, 0, 0, 0.6)",
      "borderColor": "rgba(147, 235, 248, 0.8)",
      "textStyle": {
        "fontSize": 12,
        "color": "#FFFFFF"
      }
    },
    "backControl": {
      "text": "返回上级",
      "fontSize": 20,
      "color": "#FFFFFF"
    },
    "onlineLayers": {
      "satellite": {
        "show": false,
        "zIndex": 1,
        "opacity": 1,
        "zoomRange": [3, 18]
      },
      "roadNet": {
        "show": false,
        "zIndex": 2,
        "opacity": 1,
        "zoomRange": [3, 18]
      },
      "traffic": {
        "show": false,
        "zIndex": 3,
        "opacity": 1,
        "zoomRange": [3, 18]
      }
    }
  },
  "behaviors": [],
  "dataset": null
}
```

## 数据结构

地图组件接收三类数据：行政区数值、点位数据和飞线数据。未绑定数据集时使用组件默认静态数据。

```json
{
  "regions": [
    { "name": "北京市", "value": 666 },
    { "name": "河北省", "value": 98 },
    { "name": "江苏省", "value": 300 }
  ],
  "markers": [
    { "name": "北京", "lng": 116.405285, "lat": 39.904989, "value": 200 },
    { "name": "郑州", "lng": 113.665412, "lat": 34.757975, "value": 888 }
  ],
  "lines": [
    {
      "fromName": "郑州",
      "toName": "北京",
      "coords": [
        [113.665412, 34.757975],
        [116.405285, 39.904989]
      ],
      "value": 888
    }
  ],
  "visualPieces": [
    { "gte": 1000, "label": ">1000" },
    { "gte": 600, "lte": 999, "label": "600-999" },
    { "lte": 9, "label": "<9" }
  ]
}
```

## behaviors 交互事件

```json
[
  {
    "name": "区域点击",
    "desc": "点击行政区区域时触发",
    "method": "regionClick",
    "paramsList": [
      { "name": "name", "desc": "行政区名称", "type": "string" },
      { "name": "regionCode", "desc": "行政区编码", "type": "string" },
      { "name": "value", "desc": "行政区数据值", "type": "number" }
    ]
  },
  {
    "name": "标记点击",
    "desc": "点击地图标记点时触发",
    "method": "markerClick",
    "paramsList": [
      { "name": "name", "desc": "标记点名称", "type": "string" },
      { "name": "lng", "desc": "经度", "type": "number" },
      { "name": "lat", "desc": "纬度", "type": "number" },
      { "name": "value", "desc": "标记点数值", "type": "number" }
    ]
  },
  {
    "name": "地图下钻",
    "desc": "进入下一级行政区时触发",
    "method": "drillDown",
    "paramsList": [
      { "name": "name", "desc": "目标行政区名称", "type": "string" },
      { "name": "regionCode", "desc": "目标行政区编码", "type": "string" }
    ]
  },
  {
    "name": "返回上级",
    "desc": "从下级行政区返回上级地图时触发",
    "method": "drillUp",
    "paramsList": [
      { "name": "regionCode", "desc": "返回后的行政区编码", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "regionNameField",
    "desc": "行政区名称字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "regionValueField",
    "desc": "行政区数值字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "markerNameField",
    "desc": "标记点名称字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "longitudeField",
    "desc": "经度字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "latitudeField",
    "desc": "纬度字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "markerValueField",
    "desc": "标记点数值字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "lineFromLngField",
    "desc": "飞线起点经度字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "lineFromLatField",
    "desc": "飞线起点纬度字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "lineToLngField",
    "desc": "飞线终点经度字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "lineToLatField",
    "desc": "飞线终点纬度字段",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrMap",
  "title": "地图",
  "tag": "chart",
  "icon": "map-icon",
  "description": "地理空间可视化组件，支持行政区填色、区域下钻、标记点、飞线动画和在线底图图层",
  "version": "1.0.0"
}
```
