# 趋势指标卡 (DrTrendMetricCard)

## 概述

- **组件名称**: DrTrendMetricCard
- **中文标题**: 趋势指标卡
- **分类标签**: metric
- **描述**: 面向大屏趋势 KPI 展示的指标组件，在主数值旁或下方展示迷你趋势线，用于同时表达当前值和一段时间内的变化趋势。支持折线/面积趋势、平滑线、趋势色、最新时间、同比/环比提示、坐标轴显隐、数值格式化、背景和排版样式，适用于销售趋势、访问量、能耗、在线设备数等时间序列指标展示。
- **默认尺寸**: 360 x 180

## PropsInterface

```json
{
  "global": {
    "description": "全局配置",
    "properties": {
      "padding": {
        "type": "array",
        "description": "组件内边距 [上, 右, 下, 左] (px)",
        "default": [16, 18, 14, 18]
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
  "layout": {
    "description": "布局配置",
    "properties": {
      "trendPosition": {
        "type": "string",
        "description": "趋势图位置",
        "default": "bottom",
        "enum": ["bottom", "right"]
      },
      "horizontalAlign": {
        "type": "string",
        "description": "指标文本水平对齐方式",
        "default": "left",
        "enum": ["left", "center", "right"]
      },
      "gap": {
        "type": "number",
        "description": "指标区与趋势图区间距(px)",
        "default": 10,
        "min": 0,
        "max": 48
      },
      "trendHeight": {
        "type": "number",
        "description": "趋势图高度(px)，trendPosition 为 bottom 时生效",
        "default": 64,
        "min": 30,
        "max": 180
      },
      "trendWidth": {
        "type": "number",
        "description": "趋势图宽度(px)，trendPosition 为 right 时生效",
        "default": 140,
        "min": 80,
        "max": 320
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
        "default": "趋势指标"
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
        "default": 9860
      },
      "format": {
        "type": "string",
        "description": "数值格式化方式",
        "default": "thousand",
        "enum": ["value", "integer", "float1", "float2", "percent", "thousand", "currency"]
      },
      "decimalPlaces": {
        "type": "number",
        "description": "自定义小数位数",
        "default": 0,
        "min": 0,
        "max": 8
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
      "fontSize": {
        "type": "number",
        "description": "主数值字号(px)",
        "default": 34,
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
      }
    }
  },
  "timestamp": {
    "description": "时间标签配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示最新时间",
        "default": false
      },
      "format": {
        "type": "string",
        "description": "时间格式化模板",
        "default": "YYYY-MM-DD HH:mm"
      },
      "prefix": {
        "type": "string",
        "description": "时间标签前缀",
        "default": "更新时间 "
      },
      "fontSize": {
        "type": "number",
        "description": "时间标签字号(px)",
        "default": 12,
        "min": 10,
        "max": 32
      },
      "color": {
        "type": "string",
        "description": "时间标签颜色",
        "default": "var(--el-text-color-secondary)"
      }
    }
  },
  "compare": {
    "description": "变化提示配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示最新值相对上一项的变化提示",
        "default": true
      },
      "mode": {
        "type": "string",
        "description": "变化提示显示方式",
        "default": "rate",
        "enum": ["value", "rate", "both"]
      },
      "positiveColor": {
        "type": "string",
        "description": "正向变化颜色",
        "default": "var(--el-color-success)"
      },
      "negativeColor": {
        "type": "string",
        "description": "负向变化颜色",
        "default": "var(--el-color-danger)"
      },
      "neutralColor": {
        "type": "string",
        "description": "无变化颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "fontSize": {
        "type": "number",
        "description": "变化提示字号(px)",
        "default": 12,
        "min": 10,
        "max": 36
      }
    }
  },
  "trend": {
    "description": "趋势图配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示趋势图",
        "default": true
      },
      "chartType": {
        "type": "string",
        "description": "趋势图类型",
        "default": "line",
        "enum": ["line", "area"]
      },
      "smooth": {
        "type": "boolean",
        "description": "是否平滑曲线",
        "default": true
      },
      "lineWidth": {
        "type": "number",
        "description": "趋势线宽度(px)",
        "default": 2,
        "min": 1,
        "max": 12
      },
      "lineColor": {
        "type": "string",
        "description": "趋势线颜色",
        "default": "var(--el-color-primary)"
      },
      "areaColor": {
        "type": "string",
        "description": "面积填充颜色",
        "default": "var(--el-color-primary-light-9)"
      },
      "areaOpacity": {
        "type": "number",
        "description": "面积填充透明度",
        "default": 0.35,
        "min": 0,
        "max": 1
      },
      "showSymbol": {
        "type": "boolean",
        "description": "是否显示数据点",
        "default": false
      },
      "symbolSize": {
        "type": "number",
        "description": "数据点大小(px)",
        "default": 4,
        "min": 1,
        "max": 20
      },
      "startYAxisAtZero": {
        "type": "boolean",
        "description": "Y轴是否从0开始",
        "default": false
      }
    }
  },
  "axis": {
    "description": "趋势图坐标轴配置",
    "properties": {
      "showXAxis": {
        "type": "boolean",
        "description": "是否显示X轴",
        "default": false
      },
      "showYAxis": {
        "type": "boolean",
        "description": "是否显示Y轴",
        "default": false
      },
      "showMinMaxLabel": {
        "type": "boolean",
        "description": "是否显示最小/最大值标签",
        "default": false
      },
      "labelColor": {
        "type": "string",
        "description": "坐标轴标签颜色",
        "default": "var(--el-text-color-secondary)"
      },
      "labelFontSize": {
        "type": "number",
        "description": "坐标轴标签字号(px)",
        "default": 10,
        "min": 8,
        "max": 24
      }
    }
  },
  "tooltip": {
    "description": "提示框配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示趋势点提示框",
        "default": true
      },
      "formatter": {
        "type": "string",
        "description": "提示框格式化模板，支持 {time}、{value}",
        "default": "{time}<br/>{value}"
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
  "type": "DrTrendMetricCard",
  "title": "趋势指标卡",
  "w": 360,
  "h": 180,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "global": {
      "padding": [16, 18, 14, 18],
      "backgroundColor": "transparent",
      "borderColor": "transparent",
      "borderWidth": 0,
      "borderRadius": 8
    },
    "layout": {
      "trendPosition": "bottom",
      "horizontalAlign": "left",
      "gap": 10,
      "trendHeight": 64,
      "trendWidth": 140
    },
    "title": {
      "show": true,
      "text": "趋势指标",
      "fontSize": 14,
      "color": "var(--el-text-color-secondary)",
      "fontWeight": "normal"
    },
    "value": {
      "defaultValue": 9860,
      "format": "thousand",
      "decimalPlaces": 0,
      "prefix": "",
      "suffix": "",
      "fontSize": 34,
      "color": "var(--el-text-color-primary)",
      "fontWeight": "bold"
    },
    "timestamp": {
      "show": false,
      "format": "YYYY-MM-DD HH:mm",
      "prefix": "更新时间 ",
      "fontSize": 12,
      "color": "var(--el-text-color-secondary)"
    },
    "compare": {
      "show": true,
      "mode": "rate",
      "positiveColor": "var(--el-color-success)",
      "negativeColor": "var(--el-color-danger)",
      "neutralColor": "var(--el-text-color-secondary)",
      "fontSize": 12
    },
    "trend": {
      "show": true,
      "chartType": "line",
      "smooth": true,
      "lineWidth": 2,
      "lineColor": "var(--el-color-primary)",
      "areaColor": "var(--el-color-primary-light-9)",
      "areaOpacity": 0.35,
      "showSymbol": false,
      "symbolSize": 4,
      "startYAxisAtZero": false
    },
    "axis": {
      "showXAxis": false,
      "showYAxis": false,
      "showMinMaxLabel": false,
      "labelColor": "var(--el-text-color-secondary)",
      "labelFontSize": 10
    },
    "tooltip": {
      "show": true,
      "formatter": "{time}<br/>{value}"
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
    "name": "趋势指标单击",
    "desc": "鼠标点击趋势指标卡时触发",
    "method": "click",
    "paramsList": [
      { "name": "value", "desc": "当前最新指标值", "type": "number" },
      { "name": "changeValue", "desc": "最新值相对上一项的变化值", "type": "number" },
      { "name": "changeRate", "desc": "最新值相对上一项的变化率", "type": "number" }
    ]
  },
  {
    "name": "趋势点单击",
    "desc": "鼠标点击趋势线数据点时触发",
    "method": "pointClick",
    "paramsList": [
      { "name": "time", "desc": "点击点的时间或类目", "type": "string" },
      { "name": "value", "desc": "点击点的数值", "type": "number" },
      { "name": "index", "desc": "点击点索引", "type": "number" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "timeField",
    "desc": "时间或类目字段",
    "required": true,
    "multiple": false
  },
  {
    "name": "valueField",
    "desc": "趋势数值字段",
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
  "name": "DrTrendMetricCard",
  "title": "趋势指标卡",
  "tag": "metric",
  "icon": "trend-metric-card-icon",
  "description": "展示核心指标和迷你趋势线的大屏指标组件，支持折线/面积趋势、变化率提示和丰富样式配置",
  "version": "1.0.0"
}
```
