# 仪表盘 (DrGauge)

## 概述

- **组件名称**: DrGauge
- **中文标题**: 仪表盘
- **分类标签**: gauge
- **描述**: 基于 ECharts gauge 系列的仪表盘组件，以刻度盘形式展示单个数值在范围中的位置和占比。支持自定义表盘角度、刻度线、分割线、指针样式、进度条、数值显示格式等，适用于KPI达成率、设备状态监控、速度/温度等指标的直观展示。
- **默认尺寸**: 300 x 300

## PropsInterface

```json
{
  "global": {
    "description": "全局配置",
    "properties": {
      "padding": {
        "type": "array",
        "description": "图表内边距 [上, 右, 下, 左] (px)",
        "default": [10, 10, 10, 10]
      }
    }
  },
  "gauge": {
    "description": "仪表盘基础配置",
    "properties": {
      "startAngle": {
        "type": "number",
        "description": "起始角度（正上方为90，顺时针减小）",
        "default": 225,
        "min": 0,
        "max": 360
      },
      "endAngle": {
        "type": "number",
        "description": "结束角度",
        "default": -45,
        "min": -360,
        "max": 360
      },
      "min": {
        "type": "number",
        "description": "最小刻度值",
        "default": 0
      },
      "max": {
        "type": "number",
        "description": "最大刻度值",
        "default": 100
      },
      "splitNumber": {
        "type": "number",
        "description": "仪表盘刻度分割段数",
        "default": 10,
        "min": 1,
        "max": 50
      },
      "clockwise": {
        "type": "boolean",
        "description": "是否顺时针增长",
        "default": true
      },
      "radius": {
        "type": "string",
        "description": "仪表盘半径（百分比或像素值）",
        "default": "75%"
      },
      "center": {
        "type": "array",
        "description": "中心位置 [x, y]",
        "default": ["50%", "55%"]
      }
    }
  },
  "axisLine": {
    "description": "轴线（表盘弧线）配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示轴线",
        "default": true
      },
      "width": {
        "type": "number",
        "description": "轴线宽度(px)",
        "default": 20,
        "min": 1,
        "max": 60
      },
      "roundCap": {
        "type": "boolean",
        "description": "轴线两端是否显示为圆形",
        "default": false
      },
      "colors": {
        "type": "array",
        "description": "轴线渐变色段 [[位置, 颜色], ...]，位置为0~1之间的值",
        "default": [[0.3, "#91cc75"], [0.7, "#fac858"], [1, "#ee6666"]]
      }
    }
  },
  "axisTick": {
    "description": "刻度线配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示刻度线",
        "default": true
      },
      "splitNumber": {
        "type": "number",
        "description": "每个分割段内的刻度数",
        "default": 5,
        "min": 1,
        "max": 20
      },
      "length": {
        "type": "number",
        "description": "刻度线长度(px)",
        "default": 6,
        "min": 1,
        "max": 30
      },
      "color": {
        "type": "string",
        "description": "刻度线颜色，空值表示自动取轴线颜色",
        "default": "auto"
      },
      "width": {
        "type": "number",
        "description": "刻度线宽度(px)",
        "default": 1,
        "min": 1,
        "max": 5
      }
    }
  },
  "splitLine": {
    "description": "分割线配置（大刻度线）",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示分割线",
        "default": true
      },
      "length": {
        "type": "number",
        "description": "分割线长度(px)",
        "default": 12,
        "min": 1,
        "max": 40
      },
      "color": {
        "type": "string",
        "description": "分割线颜色，空值表示自动取轴线颜色",
        "default": "auto"
      },
      "width": {
        "type": "number",
        "description": "分割线宽度(px)",
        "default": 2,
        "min": 1,
        "max": 10
      }
    }
  },
  "axisLabel": {
    "description": "刻度标签配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示刻度标签",
        "default": true
      },
      "fontSize": {
        "type": "number",
        "description": "字号(px)",
        "default": 12,
        "min": 10,
        "max": 30
      },
      "color": {
        "type": "string",
        "description": "标签颜色",
        "default": "#999999"
      },
      "distance": {
        "type": "number",
        "description": "标签到轴线的距离(px)",
        "default": 15,
        "min": 0,
        "max": 60
      },
      "formatter": {
        "type": "string",
        "description": "标签格式化模板，{value}为数值占位符",
        "default": "{value}"
      }
    }
  },
  "pointer": {
    "description": "指针配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示指针",
        "default": true
      },
      "length": {
        "type": "string",
        "description": "指针长度（百分比相对于半径）",
        "default": "60%"
      },
      "width": {
        "type": "number",
        "description": "指针宽度(px)",
        "default": 6,
        "min": 1,
        "max": 20
      },
      "color": {
        "type": "string",
        "description": "指针颜色，auto表示跟随轴线颜色",
        "default": "auto"
      },
      "type": {
        "type": "string",
        "description": "指针形状类型",
        "default": "default",
        "enum": ["default", "arrow", "triangle", "rect"]
      }
    }
  },
  "anchor": {
    "description": "指针锚点（圆心装饰）配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示锚点",
        "default": true
      },
      "size": {
        "type": "number",
        "description": "锚点大小(px)",
        "default": 10,
        "min": 0,
        "max": 30
      },
      "color": {
        "type": "string",
        "description": "锚点颜色",
        "default": "#5470c6"
      },
      "borderWidth": {
        "type": "number",
        "description": "锚点边框宽度(px)",
        "default": 2,
        "min": 0,
        "max": 10
      },
      "borderColor": {
        "type": "string",
        "description": "锚点边框颜色",
        "default": "#5470c6"
      }
    }
  },
  "progress": {
    "description": "进度条配置（ECharts 5+）",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示进度条",
        "default": false
      },
      "width": {
        "type": "number",
        "description": "进度条宽度(px)，默认与轴线同宽",
        "default": 20,
        "min": 1,
        "max": 60
      },
      "roundCap": {
        "type": "boolean",
        "description": "进度条两端是否圆形",
        "default": false
      },
      "color": {
        "type": "string",
        "description": "进度条颜色",
        "default": "#5470c6"
      }
    }
  },
  "detail": {
    "description": "数值显示配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示数值",
        "default": true
      },
      "fontSize": {
        "type": "number",
        "description": "数值字号(px)",
        "default": 28,
        "min": 12,
        "max": 72
      },
      "color": {
        "type": "string",
        "description": "数值颜色，auto表示跟随轴线颜色",
        "default": "auto"
      },
      "fontWeight": {
        "type": "string",
        "description": "数值字重",
        "default": "bold",
        "enum": ["normal", "bold", "bolder"]
      },
      "format": {
        "type": "string",
        "description": "数值格式化方式",
        "default": "value",
        "enum": ["value", "percent", "integer", "float1", "float2"]
      },
      "offsetY": {
        "type": "number",
        "description": "数值纵向偏移(%)，正值向下",
        "default": 60,
        "min": -100,
        "max": 100
      },
      "prefix": {
        "type": "string",
        "description": "数值前缀文本",
        "default": ""
      },
      "suffix": {
        "type": "string",
        "description": "数值后缀文本",
        "default": ""
      }
    }
  },
  "title": {
    "description": "标题文字配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示标题文字",
        "default": true
      },
      "text": {
        "type": "string",
        "description": "固定标题文字（优先使用数据集中的标题字段）",
        "default": ""
      },
      "fontSize": {
        "type": "number",
        "description": "标题字号(px)",
        "default": 14,
        "min": 10,
        "max": 36
      },
      "color": {
        "type": "string",
        "description": "标题颜色",
        "default": "#999999"
      },
      "fontWeight": {
        "type": "string",
        "description": "标题字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
      },
      "offsetY": {
        "type": "number",
        "description": "标题纵向偏移(%)，正值向下",
        "default": 75,
        "min": -100,
        "max": 100
      }
    }
  },
  "animation": {
    "description": "动画配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用动画",
        "default": true
      },
      "duration": {
        "type": "number",
        "description": "动画时长(ms)",
        "default": 1000,
        "min": 0,
        "max": 5000
      },
      "easing": {
        "type": "string",
        "description": "动画缓动函数",
        "default": "cubicOut",
        "enum": ["linear", "cubicOut", "elasticOut", "bounceOut"]
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrGauge",
  "title": "仪表盘",
  "w": 300,
  "h": 300,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "global": {
      "padding": [10, 10, 10, 10]
    },
    "gauge": {
      "startAngle": 225,
      "endAngle": -45,
      "min": 0,
      "max": 100,
      "splitNumber": 10,
      "clockwise": true,
      "radius": "75%",
      "center": ["50%", "55%"]
    },
    "axisLine": {
      "show": true,
      "width": 20,
      "roundCap": false,
      "colors": [[0.3, "#91cc75"], [0.7, "#fac858"], [1, "#ee6666"]]
    },
    "axisTick": {
      "show": true,
      "splitNumber": 5,
      "length": 6,
      "color": "auto",
      "width": 1
    },
    "splitLine": {
      "show": true,
      "length": 12,
      "color": "auto",
      "width": 2
    },
    "axisLabel": {
      "show": true,
      "fontSize": 12,
      "color": "#999999",
      "distance": 15,
      "formatter": "{value}"
    },
    "pointer": {
      "show": true,
      "length": "60%",
      "width": 6,
      "color": "auto",
      "type": "default"
    },
    "anchor": {
      "show": true,
      "size": 10,
      "color": "#5470c6",
      "borderWidth": 2,
      "borderColor": "#5470c6"
    },
    "progress": {
      "show": false,
      "width": 20,
      "roundCap": false,
      "color": "#5470c6"
    },
    "detail": {
      "show": true,
      "fontSize": 28,
      "color": "auto",
      "fontWeight": "bold",
      "format": "value",
      "offsetY": 60,
      "prefix": "",
      "suffix": ""
    },
    "title": {
      "show": true,
      "text": "",
      "fontSize": 14,
      "color": "#999999",
      "fontWeight": "normal",
      "offsetY": 75
    },
    "animation": {
      "enabled": true,
      "duration": 1000,
      "easing": "cubicOut"
    }
  },
  "behaviors": [],
  "dataset": null
}
```

## behaviors 交互事件

```json
[
  {
    "name": "仪表盘单击",
    "desc": "鼠标点击仪表盘区域时触发",
    "method": "click",
    "paramsList": [
      { "name": "value", "desc": "当前仪表盘数值", "type": "number" },
      { "name": "percent", "desc": "当前数值占最大值的百分比", "type": "number" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "valueField",
    "desc": "数值字段（指标）",
    "required": true,
    "multiple": false
  },
  {
    "name": "titleField",
    "desc": "标题文字字段（维度，可选，用于显示仪表盘标题）",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrGauge",
  "title": "仪表盘",
  "tag": "gauge",
  "icon": "gauge-icon",
  "description": "基于ECharts gauge系列的仪表盘组件，以刻度盘形式展示数值在范围中的位置，支持指针、进度条、渐变色段等配置",
  "version": "1.0.0"
}
```
