# 进度条 (DrProgressBar)

## 概述

- **组件名称**: DrProgressBar
- **中文标题**: 进度条
- **分类标签**: gauge
- **描述**: 基于 CSS 实现的进度条组件，以水平条形展示数值进度或完成比例。支持自定义进度条颜色、渐变填充、圆角、标签位置与格式、轨道背景、动画效果等，适用于任务完成率、加载进度、KPI达成度等场景的直观展示。
- **默认尺寸**: 300 x 60

## PropsInterface

```json
{
  "value": {
    "description": "数值配置",
    "properties": {
      "current": {
        "type": "number",
        "description": "当前进度值（无数据集绑定时使用此固定值）",
        "default": 65,
        "min": 0
      },
      "max": {
        "type": "number",
        "description": "最大值（进度条满格对应的值）",
        "default": 100,
        "min": 1
      }
    }
  },
  "bar": {
    "description": "进度条样式配置",
    "properties": {
      "height": {
        "type": "number",
        "description": "进度条高度(px)",
        "default": 20,
        "min": 4,
        "max": 60
      },
      "fillColor": {
        "type": "string",
        "description": "进度填充颜色（非渐变模式时使用）",
        "default": "#5470c6"
      },
      "backgroundColor": {
        "type": "string",
        "description": "进度条轨道背景颜色",
        "default": "rgba(255, 255, 255, 0.1)"
      },
      "borderRadius": {
        "type": "number",
        "description": "进度条圆角(px)，设置较大值可实现胶囊形状",
        "default": 10,
        "min": 0,
        "max": 30
      },
      "gradient": {
        "type": "object",
        "description": "渐变填充配置",
        "default": {
          "enabled": false,
          "startColor": "#5470c6",
          "endColor": "#73c0de",
          "direction": "horizontal"
        }
      }
    }
  },
  "label": {
    "description": "标签配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示标签",
        "default": true
      },
      "position": {
        "type": "string",
        "description": "标签位置",
        "default": "outside",
        "enum": ["inside", "outside", "top"]
      },
      "fontSize": {
        "type": "number",
        "description": "标签字号(px)",
        "default": 14,
        "min": 10,
        "max": 36
      },
      "color": {
        "type": "string",
        "description": "标签颜色",
        "default": "#ffffff"
      },
      "fontWeight": {
        "type": "string",
        "description": "标签字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
      },
      "format": {
        "type": "string",
        "description": "标签内容格式",
        "default": "percent",
        "enum": ["percent", "value", "custom"]
      },
      "customFormat": {
        "type": "string",
        "description": "自定义格式模板，{value}为当前值，{max}为最大值，{percent}为百分比",
        "default": "{percent}%"
      }
    }
  },
  "track": {
    "description": "轨道（底层背景条）配置",
    "properties": {
      "backgroundColor": {
        "type": "string",
        "description": "轨道背景颜色",
        "default": "rgba(255, 255, 255, 0.1)"
      },
      "borderRadius": {
        "type": "number",
        "description": "轨道圆角(px)，通常与bar圆角保持一致",
        "default": 10,
        "min": 0,
        "max": 30
      }
    }
  },
  "border": {
    "description": "边框配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示边框",
        "default": false
      },
      "color": {
        "type": "string",
        "description": "边框颜色",
        "default": "#444444"
      },
      "width": {
        "type": "number",
        "description": "边框宽度(px)",
        "default": 1,
        "min": 0,
        "max": 5
      }
    }
  },
  "title": {
    "description": "进度条标题配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示标题",
        "default": false
      },
      "text": {
        "type": "string",
        "description": "标题文字",
        "default": ""
      },
      "position": {
        "type": "string",
        "description": "标题位置",
        "default": "left",
        "enum": ["left", "top"]
      },
      "fontSize": {
        "type": "number",
        "description": "标题字号(px)",
        "default": 14,
        "min": 10,
        "max": 24
      },
      "color": {
        "type": "string",
        "description": "标题颜色",
        "default": "#cccccc"
      },
      "width": {
        "type": "number",
        "description": "标题区域宽度(px)，仅position为left时有效",
        "default": 80,
        "min": 30,
        "max": 200
      }
    }
  },
  "animation": {
    "description": "动画配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用进度动画",
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
        "default": "ease-out",
        "enum": ["linear", "ease", "ease-in", "ease-out", "ease-in-out"]
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrProgressBar",
  "title": "进度条",
  "w": 300,
  "h": 60,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "value": {
      "current": 65,
      "max": 100
    },
    "bar": {
      "height": 20,
      "fillColor": "#5470c6",
      "backgroundColor": "rgba(255, 255, 255, 0.1)",
      "borderRadius": 10,
      "gradient": {
        "enabled": false,
        "startColor": "#5470c6",
        "endColor": "#73c0de",
        "direction": "horizontal"
      }
    },
    "label": {
      "show": true,
      "position": "outside",
      "fontSize": 14,
      "color": "#ffffff",
      "fontWeight": "normal",
      "format": "percent",
      "customFormat": "{percent}%"
    },
    "track": {
      "backgroundColor": "rgba(255, 255, 255, 0.1)",
      "borderRadius": 10
    },
    "border": {
      "show": false,
      "color": "#444444",
      "width": 1
    },
    "title": {
      "show": false,
      "text": "",
      "position": "left",
      "fontSize": 14,
      "color": "#cccccc",
      "width": 80
    },
    "animation": {
      "enabled": true,
      "duration": 1000,
      "easing": "ease-out"
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
    "name": "进度条单击",
    "desc": "鼠标点击进度条区域时触发",
    "method": "click",
    "paramsList": [
      { "name": "value", "desc": "当前进度值", "type": "number" },
      { "name": "percent", "desc": "当前进度百分比", "type": "number" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "valueField",
    "desc": "当前值字段（指标，用于计算进度百分比）",
    "required": false,
    "multiple": false
  },
  {
    "name": "maxField",
    "desc": "最大值字段（指标，可选，未绑定时使用props中的max配置）",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrProgressBar",
  "title": "进度条",
  "tag": "gauge",
  "icon": "progress-icon",
  "description": "CSS实现的进度条组件，以水平条形展示数值进度，支持渐变、圆角、动画及多种标签格式",
  "version": "1.0.0"
}
```
