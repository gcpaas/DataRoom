# 指标卡 (DrMetricCard)

## 概述

- **组件名称**: DrMetricCard
- **中文标题**: 指标卡
- **分类标签**: metric
- **描述**: 面向大屏核心 KPI 展示的单值指标组件，用主数值、单位、标题、副标题和辅助说明突出一个关键指标。支持数值格式化、前后缀、千分位、条件色、背景、边框、圆角、阴影、对齐、内边距等可视化配置，适用于销售额、订单数、设备在线数、告警数量等单指标展示场景。
- **默认尺寸**: 280 x 140

## PropsInterface

```json
{
  "global": {
    "description": "全局配置",
    "properties": {
      "padding": {
        "type": "array",
        "description": "组件内边距 [上, 右, 下, 左] (px)",
        "default": [16, 18, 16, 18]
      },
      "backgroundColor": {
        "type": "string",
        "description": "组件背景色，支持 CSS 变量、透明色和色值",
        "default": "transparent"
      },
      "borderColor": {
        "type": "string",
        "description": "边框颜色",
        "default": "transparent"
      },
      "borderWidth": {
        "type": "number",
        "description": "边框宽度(px)",
        "default": 0,
        "min": 0,
        "max": 20
      },
      "borderRadius": {
        "type": "number",
        "description": "圆角(px)",
        "default": 8,
        "min": 0,
        "max": 80
      },
      "shadow": {
        "type": "object",
        "description": "阴影配置",
        "default": {
          "enabled": false,
          "color": "rgba(0, 0, 0, 0.18)",
          "blur": 12,
          "offsetX": 0,
          "offsetY": 4
        }
      }
    }
  },
  "layout": {
    "description": "布局配置",
    "properties": {
      "direction": {
        "type": "string",
        "description": "内容排列方向",
        "default": "vertical",
        "enum": ["vertical", "horizontal"]
      },
      "horizontalAlign": {
        "type": "string",
        "description": "水平对齐方式",
        "default": "left",
        "enum": ["left", "center", "right"]
      },
      "verticalAlign": {
        "type": "string",
        "description": "垂直对齐方式",
        "default": "center",
        "enum": ["top", "center", "bottom"]
      },
      "gap": {
        "type": "number",
        "description": "标题、数值、辅助信息之间的间距(px)",
        "default": 8,
        "min": 0,
        "max": 48
      }
    }
  },
  "title": {
    "description": "标题配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示标题",
        "default": true
      },
      "text": {
        "type": "string",
        "description": "固定标题，数据集标题字段为空时使用",
        "default": "指标名称"
      },
      "fontSize": {
        "type": "number",
        "description": "标题字号(px)",
        "default": 14,
        "min": 10,
        "max": 48
      },
      "color": {
        "type": "string",
        "description": "标题颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "fontWeight": {
        "type": "string",
        "description": "标题字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
      }
    }
  },
  "value": {
    "description": "主数值配置",
    "properties": {
      "defaultValue": {
        "type": "number",
        "description": "未绑定数据集时显示的默认数值",
        "default": 1280
      },
      "format": {
        "type": "string",
        "description": "数值格式化方式",
        "default": "thousand",
        "enum": ["value", "integer", "float1", "float2", "percent", "thousand", "currency"]
      },
      "decimalPlaces": {
        "type": "number",
        "description": "自定义小数位数，仅 format 为 value 或 currency 时生效",
        "default": 0,
        "min": 0,
        "max": 8
      },
      "thousandSeparator": {
        "type": "boolean",
        "description": "是否启用千分位",
        "default": true
      },
      "prefix": {
        "type": "string",
        "description": "数值前缀",
        "default": ""
      },
      "suffix": {
        "type": "string",
        "description": "数值后缀",
        "default": ""
      },
      "emptyText": {
        "type": "string",
        "description": "数值为空时显示的文本",
        "default": "--"
      },
      "fontSize": {
        "type": "number",
        "description": "主数值字号(px)",
        "default": 36,
        "min": 12,
        "max": 120
      },
      "color": {
        "type": "string",
        "description": "主数值颜色",
        "default": "var(--el-text-color-primary)"
      },
      "fontWeight": {
        "type": "string",
        "description": "主数值字重",
        "default": "bold",
        "enum": ["normal", "bold", "bolder"]
      },
      "lineHeight": {
        "type": "number",
        "description": "主数值行高",
        "default": 1,
        "min": 0.8,
        "max": 2
      }
    }
  },
  "subtitle": {
    "description": "副标题/辅助信息配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示副标题",
        "default": true
      },
      "text": {
        "type": "string",
        "description": "固定副标题，数据集副标题字段为空时使用",
        "default": "实时统计"
      },
      "fontSize": {
        "type": "number",
        "description": "副标题字号(px)",
        "default": 12,
        "min": 10,
        "max": 36
      },
      "color": {
        "type": "string",
        "description": "副标题颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "fontWeight": {
        "type": "string",
        "description": "副标题字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
      }
    }
  },
  "unit": {
    "description": "单位配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示单位",
        "default": true
      },
      "text": {
        "type": "string",
        "description": "固定单位，数据集单位字段为空时使用",
        "default": ""
      },
      "position": {
        "type": "string",
        "description": "单位显示位置",
        "default": "suffix",
        "enum": ["prefix", "suffix", "top", "bottom"]
      },
      "fontSize": {
        "type": "number",
        "description": "单位字号(px)",
        "default": 14,
        "min": 10,
        "max": 48
      },
      "color": {
        "type": "string",
        "description": "单位颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "gap": {
        "type": "number",
        "description": "单位与主数值间距(px)",
        "default": 4,
        "min": 0,
        "max": 32
      }
    }
  },
  "conditional": {
    "description": "条件样式配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用条件样式",
        "default": false
      },
      "rules": {
        "type": "array",
        "description": "条件样式规则，按顺序命中第一条后应用",
        "default": [
          {
            "operator": ">=",
            "value": 1000,
            "valueColor": "var(--el-color-success)",
            "backgroundColor": "transparent",
            "borderColor": "transparent"
          }
        ]
      }
    }
  },
  "animation": {
    "description": "动画配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用数值过渡动画",
        "default": true
      },
      "duration": {
        "type": "number",
        "description": "动画时长(ms)",
        "default": 800,
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
  "type": "DrMetricCard",
  "title": "指标卡",
  "w": 280,
  "h": 140,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "global": {
      "padding": [16, 18, 16, 18],
      "backgroundColor": "transparent",
      "borderColor": "transparent",
      "borderWidth": 0,
      "borderRadius": 8,
      "shadow": {
        "enabled": false,
        "color": "rgba(0, 0, 0, 0.18)",
        "blur": 12,
        "offsetX": 0,
        "offsetY": 4
      }
    },
    "layout": {
      "direction": "vertical",
      "horizontalAlign": "left",
      "verticalAlign": "center",
      "gap": 8
    },
    "title": {
      "show": true,
      "text": "指标名称",
      "fontSize": 14,
      "color": "var(--el-text-color-secondary)",
      "fontWeight": "normal"
    },
    "value": {
      "defaultValue": 1280,
      "format": "thousand",
      "decimalPlaces": 0,
      "thousandSeparator": true,
      "prefix": "",
      "suffix": "",
      "emptyText": "--",
      "fontSize": 36,
      "color": "var(--el-text-color-primary)",
      "fontWeight": "bold",
      "lineHeight": 1
    },
    "subtitle": {
      "show": true,
      "text": "实时统计",
      "fontSize": 12,
      "color": "var(--el-text-color-secondary)",
      "fontWeight": "normal"
    },
    "unit": {
      "show": true,
      "text": "",
      "position": "suffix",
      "fontSize": 14,
      "color": "var(--el-text-color-secondary)",
      "gap": 4
    },
    "conditional": {
      "enabled": false,
      "rules": [
        {
          "operator": ">=",
          "value": 1000,
          "valueColor": "var(--el-color-success)",
          "backgroundColor": "transparent",
          "borderColor": "transparent"
        }
      ]
    },
    "animation": {
      "enabled": true,
      "duration": 800,
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
    "name": "指标卡单击",
    "desc": "鼠标点击指标卡时触发",
    "method": "click",
    "paramsList": [
      { "name": "value", "desc": "当前指标值", "type": "number" },
      { "name": "title", "desc": "当前指标标题", "type": "string" },
      { "name": "unit", "desc": "当前指标单位", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "valueField",
    "desc": "指标数值字段",
    "required": true,
    "multiple": false
  },
  {
    "name": "titleField",
    "desc": "标题字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "subtitleField",
    "desc": "副标题字段",
    "required": false,
    "multiple": false
  },
  {
    "name": "unitField",
    "desc": "单位字段",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrMetricCard",
  "title": "指标卡",
  "tag": "metric",
  "icon": "metric-card-icon",
  "description": "大屏单值指标展示组件，用于突出核心KPI，支持数值格式化、单位、条件色和丰富卡片样式配置",
  "version": "1.0.0"
}
```
