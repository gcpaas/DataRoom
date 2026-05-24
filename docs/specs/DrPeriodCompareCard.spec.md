# 周期对比卡 (DrPeriodCompareCard)

## 概述

- **组件名称**: DrPeriodCompareCard
- **中文标题**: 周期对比卡
- **分类标签**: metric
- **描述**: 面向大屏周期对比分析的指标组件，用当前值、对比值、变化值和变化率展示指标在两个周期之间的差异。支持数据集直接返回对比结果，也支持从时间序列按指定滞后期自动计算。适用于同比、环比、昨日对比、上周对比、目标完成差异等场景。
- **默认尺寸**: 360 x 160

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
        "description": "组件背景色",
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
      }
    }
  },
  "dataMode": {
    "description": "对比数据来源配置",
    "properties": {
      "mode": {
        "type": "string",
        "description": "对比数据来源方式：优先字段直传，缺省时从序列自动计算",
        "default": "autoFallback",
        "enum": ["fields", "series", "autoFallback"]
      },
      "lag": {
        "type": "number",
        "description": "自动计算时使用的滞后期数，例如1表示与上一条数据对比",
        "default": 1,
        "min": 1,
        "max": 365
      },
      "sortByTime": {
        "type": "string",
        "description": "序列自动计算时的时间排序方式",
        "default": "asc",
        "enum": ["asc", "desc", "none"]
      },
      "zeroPolicy": {
        "type": "string",
        "description": "对比值为0时变化率处理方式",
        "default": "empty",
        "enum": ["empty", "zero", "infinite"]
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
        "default": "周期对比"
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
  "current": {
    "description": "当前值配置",
    "properties": {
      "label": {
        "type": "string",
        "description": "当前值标签",
        "default": "当前"
      },
      "defaultValue": {
        "type": "number",
        "description": "未绑定数据集时显示的当前值",
        "default": 1280
      },
      "format": {
        "type": "string",
        "description": "当前值格式化方式",
        "default": "thousand",
        "enum": ["value", "integer", "float1", "float2", "percent", "thousand", "currency"]
      },
      "prefix": {
        "type": "string",
        "description": "当前值前缀",
        "default": ""
      },
      "suffix": {
        "type": "string",
        "description": "当前值后缀",
        "default": ""
      },
      "fontSize": {
        "type": "number",
        "description": "当前值字号(px)",
        "default": 34,
        "min": 12,
        "max": 120
      },
      "color": {
        "type": "string",
        "description": "当前值颜色",
        "default": "var(--el-text-color-primary)"
      },
      "fontWeight": {
        "type": "string",
        "description": "当前值字重",
        "default": "bold",
        "enum": ["normal", "bold", "bolder"]
      }
    }
  },
  "comparison": {
    "description": "对比信息配置",
    "properties": {
      "label": {
        "type": "string",
        "description": "对比值标签",
        "default": "对比"
      },
      "showPreviousValue": {
        "type": "boolean",
        "description": "是否显示对比值",
        "default": true
      },
      "showChangeValue": {
        "type": "boolean",
        "description": "是否显示变化值",
        "default": true
      },
      "showChangeRate": {
        "type": "boolean",
        "description": "是否显示变化率",
        "default": true
      },
      "rateFormat": {
        "type": "string",
        "description": "变化率格式",
        "default": "percent2",
        "enum": ["percent0", "percent1", "percent2"]
      },
      "changeValuePrefix": {
        "type": "string",
        "description": "变化值前缀",
        "default": ""
      },
      "changeValueSuffix": {
        "type": "string",
        "description": "变化值后缀",
        "default": ""
      }
    }
  },
  "indicator": {
    "description": "涨跌指示配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示涨跌指示",
        "default": true
      },
      "type": {
        "type": "string",
        "description": "涨跌指示样式",
        "default": "arrow",
        "enum": ["arrow", "triangle", "text", "none"]
      },
      "positiveDirection": {
        "type": "string",
        "description": "业务正向含义",
        "default": "increaseGood",
        "enum": ["increaseGood", "decreaseGood", "neutral"]
      },
      "positiveColor": {
        "type": "string",
        "description": "正向颜色",
        "default": "var(--el-color-success)"
      },
      "negativeColor": {
        "type": "string",
        "description": "负向颜色",
        "default": "var(--el-color-danger)"
      },
      "neutralColor": {
        "type": "string",
        "description": "持平颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "iconSize": {
        "type": "number",
        "description": "指示图标大小(px)",
        "default": 14,
        "min": 8,
        "max": 40
      }
    }
  },
  "layout": {
    "description": "布局配置",
    "properties": {
      "mode": {
        "type": "string",
        "description": "展示布局",
        "default": "compact",
        "enum": ["compact", "horizontal", "vertical"]
      },
      "horizontalAlign": {
        "type": "string",
        "description": "水平对齐方式",
        "default": "left",
        "enum": ["left", "center", "right"]
      },
      "gap": {
        "type": "number",
        "description": "信息区块间距(px)",
        "default": 10,
        "min": 0,
        "max": 48
      },
      "labelWidth": {
        "type": "number",
        "description": "对比信息标签宽度(px)，0表示自适应",
        "default": 0,
        "min": 0,
        "max": 160
      }
    }
  },
  "textStyle": {
    "description": "对比文本样式配置",
    "properties": {
      "labelFontSize": {
        "type": "number",
        "description": "标签字号(px)",
        "default": 12,
        "min": 10,
        "max": 36
      },
      "labelColor": {
        "type": "string",
        "description": "标签颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "compareFontSize": {
        "type": "number",
        "description": "对比值、变化值、变化率字号(px)",
        "default": 14,
        "min": 10,
        "max": 48
      },
      "compareFontWeight": {
        "type": "string",
        "description": "对比文本字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
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
  "type": "DrPeriodCompareCard",
  "title": "周期对比卡",
  "w": 360,
  "h": 160,
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
      "borderRadius": 8
    },
    "dataMode": {
      "mode": "autoFallback",
      "lag": 1,
      "sortByTime": "asc",
      "zeroPolicy": "empty"
    },
    "title": {
      "show": true,
      "text": "周期对比",
      "fontSize": 14,
      "color": "var(--el-text-color-secondary)",
      "fontWeight": "normal"
    },
    "current": {
      "label": "当前",
      "defaultValue": 1280,
      "format": "thousand",
      "prefix": "",
      "suffix": "",
      "fontSize": 34,
      "color": "var(--el-text-color-primary)",
      "fontWeight": "bold"
    },
    "comparison": {
      "label": "对比",
      "showPreviousValue": true,
      "showChangeValue": true,
      "showChangeRate": true,
      "rateFormat": "percent2",
      "changeValuePrefix": "",
      "changeValueSuffix": ""
    },
    "indicator": {
      "show": true,
      "type": "arrow",
      "positiveDirection": "increaseGood",
      "positiveColor": "var(--el-color-success)",
      "negativeColor": "var(--el-color-danger)",
      "neutralColor": "var(--el-text-color-secondary)",
      "iconSize": 14
    },
    "layout": {
      "mode": "compact",
      "horizontalAlign": "left",
      "gap": 10,
      "labelWidth": 0
    },
    "textStyle": {
      "labelFontSize": 12,
      "labelColor": "var(--el-text-color-secondary)",
      "compareFontSize": 14,
      "compareFontWeight": "normal"
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
    "name": "周期对比单击",
    "desc": "鼠标点击周期对比卡时触发",
    "method": "click",
    "paramsList": [
      { "name": "currentValue", "desc": "当前值", "type": "number" },
      { "name": "previousValue", "desc": "对比值", "type": "number" },
      { "name": "changeValue", "desc": "变化值", "type": "number" },
      { "name": "changeRate", "desc": "变化率", "type": "number" },
      { "name": "trend", "desc": "变化方向：up/down/flat", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "currentValueField",
    "desc": "当前值字段，字段直传模式下必填",
    "required": false,
    "multiple": false
  },
  {
    "name": "previousValueField",
    "desc": "对比值字段，字段直传模式下必填",
    "required": false,
    "multiple": false
  },
  {
    "name": "changeValueField",
    "desc": "变化值字段，可由数据集直接返回",
    "required": false,
    "multiple": false
  },
  {
    "name": "changeRateField",
    "desc": "变化率字段，可由数据集直接返回",
    "required": false,
    "multiple": false
  },
  {
    "name": "timeField",
    "desc": "时间字段，序列自动计算模式下使用",
    "required": false,
    "multiple": false
  },
  {
    "name": "valueField",
    "desc": "序列数值字段，序列自动计算模式下使用",
    "required": false,
    "multiple": false
  },
  {
    "name": "titleField",
    "desc": "标题字段",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrPeriodCompareCard",
  "title": "周期对比卡",
  "tag": "metric",
  "icon": "period-compare-card-icon",
  "description": "展示当前值、对比值、变化值和变化率的周期对比组件，支持字段直传和时间序列自动计算",
  "version": "1.0.0"
}
```
