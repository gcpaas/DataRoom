# 词云 (DrWordCloud)

## 概述

- **组件名称**: DrWordCloud
- **中文标题**: 词云
- **分类标签**: text
- **描述**: 基于 echarts-wordcloud 扩展的词云可视化组件，通过词语大小和颜色展示文本数据中词语的权重或频次。支持自定义词云形状（圆形、心形、星形、菱形等）、字体样式、旋转角度范围、颜色方案等配置，适用于关键词分析、热词展示、标签云等场景。
- **默认尺寸**: 400 x 300

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
  "wordStyle": {
    "description": "文字样式配置",
    "properties": {
      "fontFamily": {
        "type": "string",
        "description": "字体",
        "default": "Microsoft YaHei",
        "enum": ["Microsoft YaHei", "SimSun", "SimHei", "KaiTi", "Arial", "sans-serif"]
      },
      "fontSizeRange": {
        "type": "array",
        "description": "字号范围 [最小值, 最大值] (px)",
        "default": [14, 60]
      },
      "rotationRange": {
        "type": "array",
        "description": "旋转角度范围 [最小角度, 最大角度] (度)",
        "default": [-45, 45]
      },
      "rotationStep": {
        "type": "number",
        "description": "旋转角度步长（度），0表示任意角度",
        "default": 45,
        "min": 0,
        "max": 90
      },
      "colors": {
        "type": "array",
        "description": "文字颜色列表，随机分配给词语",
        "default": ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4"]
      },
      "fontWeight": {
        "type": "string",
        "description": "字体粗细",
        "default": "bold",
        "enum": ["normal", "bold", "bolder", "lighter"]
      }
    }
  },
  "shape": {
    "description": "词云形状配置",
    "properties": {
      "type": {
        "type": "string",
        "description": "词云整体形状",
        "default": "circle",
        "enum": ["circle", "cardioid", "diamond", "triangle-forward", "triangle", "pentagon", "star"]
      }
    }
  },
  "layout": {
    "description": "布局配置",
    "properties": {
      "gridSize": {
        "type": "number",
        "description": "词语间距网格大小(px)，值越大间距越大",
        "default": 8,
        "min": 1,
        "max": 50
      },
      "drawOutOfBound": {
        "type": "boolean",
        "description": "是否允许词语超出画布边界绘制",
        "default": false
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
      "backgroundColor": {
        "type": "string",
        "description": "提示框背景颜色",
        "default": "rgba(50, 50, 50, 0.7)"
      },
      "borderColor": {
        "type": "string",
        "description": "提示框边框颜色",
        "default": "transparent"
      },
      "textStyle": {
        "type": "object",
        "description": "提示框文字样式",
        "default": {
          "fontSize": 12,
          "color": "#ffffff"
        }
      }
    }
  },
  "emphasis": {
    "description": "高亮交互配置",
    "properties": {
      "focus": {
        "type": "string",
        "description": "高亮聚焦模式",
        "default": "self",
        "enum": ["none", "self"]
      },
      "textStyle": {
        "type": "object",
        "description": "高亮时文字样式",
        "default": {
          "shadowBlur": 10,
          "shadowColor": "rgba(0, 0, 0, 0.3)"
        }
      }
    }
  },
  "animation": {
    "description": "动画配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用布局动画",
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
  "type": "DrWordCloud",
  "title": "词云",
  "w": 400,
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
    "wordStyle": {
      "fontFamily": "Microsoft YaHei",
      "fontSizeRange": [14, 60],
      "rotationRange": [-45, 45],
      "rotationStep": 45,
      "colors": ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4"],
      "fontWeight": "bold"
    },
    "shape": {
      "type": "circle"
    },
    "layout": {
      "gridSize": 8,
      "drawOutOfBound": false
    },
    "tooltip": {
      "show": true,
      "backgroundColor": "rgba(50, 50, 50, 0.7)",
      "borderColor": "transparent",
      "textStyle": {
        "fontSize": 12,
        "color": "#ffffff"
      }
    },
    "emphasis": {
      "focus": "self",
      "textStyle": {
        "shadowBlur": 10,
        "shadowColor": "rgba(0, 0, 0, 0.3)"
      }
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
    "name": "词语单击",
    "desc": "鼠标点击词云中的词语时触发",
    "method": "click",
    "paramsList": [
      { "name": "word", "desc": "点击的词语文本", "type": "string" },
      { "name": "value", "desc": "该词语的权重/频次值", "type": "number" }
    ]
  },
  {
    "name": "词语悬停",
    "desc": "鼠标悬停在词语上时触发",
    "method": "hover",
    "paramsList": [
      { "name": "word", "desc": "悬停的词语文本", "type": "string" },
      { "name": "value", "desc": "该词语的权重/频次值", "type": "number" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "wordField",
    "desc": "词语文本字段（维度）",
    "required": true,
    "multiple": false
  },
  {
    "name": "valueField",
    "desc": "权重/频次字段（指标）",
    "required": true,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrWordCloud",
  "title": "词云",
  "tag": "text",
  "icon": "wordcloud-icon",
  "description": "基于echarts-wordcloud的词云组件，通过词语大小展示文本权重分布，支持多种形状和样式配置",
  "version": "1.0.0"
}
```
