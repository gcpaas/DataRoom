# Tab列表 (DrTabList)

## 概述

- **组件名称**: DrTabList
- **中文标题**: Tab列表
- **分类标签**: form
- **描述**: 标签页切换控件，由多个可切换的标签选项组成，用户通过点击标签切换当前活跃项，并将选中值输出到全局变量实现与其他组件的数据联动。支持水平/垂直排列、多种对齐方式、底部指示器、静态/动态标签配置等功能，适用于多维数据视图切换、内容分类导航、条件筛选等交互场景。
- **默认尺寸**: 400 x 44

## PropsInterface

```json
{
  "basic": {
    "description": "基础配置",
    "properties": {
      "defaultIndex": {
        "type": "number",
        "description": "默认选中的标签索引（从0开始），初始化时自动同步对应value到全局变量",
        "default": 0,
        "min": 0
      },
      "disabled": {
        "type": "boolean",
        "description": "是否禁用整个Tab组",
        "default": false
      }
    }
  },
  "layout": {
    "description": "布局配置",
    "properties": {
      "direction": {
        "type": "string",
        "description": "排列方向",
        "default": "horizontal",
        "enum": ["horizontal", "vertical"]
      },
      "align": {
        "type": "string",
        "description": "标签对齐方式",
        "default": "start",
        "enum": ["start", "center", "end", "stretch"]
      }
    }
  },
  "tabStyle": {
    "description": "标签样式",
    "properties": {
      "fontSize": {
        "type": "number",
        "description": "标签文本字号（px）",
        "default": 14,
        "min": 12,
        "max": 40
      },
      "color": {
        "type": "string",
        "description": "未选中标签文本颜色",
        "default": "#999999"
      },
      "activeColor": {
        "type": "string",
        "description": "选中标签文本颜色",
        "default": "#FFFFFF"
      },
      "backgroundColor": {
        "type": "string",
        "description": "未选中标签背景颜色",
        "default": "transparent"
      },
      "activeBgColor": {
        "type": "string",
        "description": "选中标签背景颜色",
        "default": "transparent"
      },
      "borderRadius": {
        "type": "number",
        "description": "标签圆角（px）",
        "default": 0,
        "min": 0,
        "max": 100
      },
      "gap": {
        "type": "number",
        "description": "标签之间的间距（px）",
        "default": 24,
        "min": 0,
        "max": 100
      },
      "padding": {
        "type": "array",
        "description": "标签内边距 [上, 右, 下, 左]（px）",
        "default": [8, 16, 8, 16]
      },
      "height": {
        "type": "number",
        "description": "标签高度（px），0表示自适应",
        "default": 44,
        "min": 0,
        "max": 100
      },
      "borderBottom": {
        "type": "object",
        "description": "标签底部边框线配置（常用于分隔标签区和内容区）",
        "default": {
          "show": false,
          "color": "#333333",
          "width": 1
        }
      }
    }
  },
  "indicator": {
    "description": "指示器配置（选中标签底部的高亮线条）",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示选中指示器",
        "default": true
      },
      "color": {
        "type": "string",
        "description": "指示器颜色",
        "default": "#409EFF"
      },
      "height": {
        "type": "number",
        "description": "指示器高度/粗细（px）",
        "default": 3,
        "min": 1,
        "max": 10
      },
      "borderRadius": {
        "type": "number",
        "description": "指示器圆角（px）",
        "default": 2,
        "min": 0,
        "max": 10
      }
    }
  },
  "options": {
    "description": "标签配置（未绑定数据集时使用静态标签）",
    "properties": {
      "staticTabs": {
        "type": "array",
        "description": "静态标签列表，每项包含label和value",
        "default": [
          { "label": "标签一", "value": "tab1" },
          { "label": "标签二", "value": "tab2" },
          { "label": "标签三", "value": "tab3" }
        ]
      }
    }
  },
  "globalVar": {
    "description": "全局变量配置，用于将选中标签的值输出到全局变量供其他组件引用",
    "properties": {
      "globalVarName": {
        "type": "string",
        "description": "绑定的全局变量名称，切换标签时通过 canvasInst.setGlobalVariable 更新",
        "default": ""
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrTabList",
  "title": "Tab列表",
  "w": 400,
  "h": 44,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "basic": {
      "defaultIndex": 0,
      "disabled": false
    },
    "layout": {
      "direction": "horizontal",
      "align": "start"
    },
    "tabStyle": {
      "fontSize": 14,
      "color": "#999999",
      "activeColor": "#FFFFFF",
      "backgroundColor": "transparent",
      "activeBgColor": "transparent",
      "borderRadius": 0,
      "gap": 24,
      "padding": [8, 16, 8, 16],
      "height": 44,
      "borderBottom": {
        "show": false,
        "color": "#333333",
        "width": 1
      }
    },
    "indicator": {
      "show": true,
      "color": "#409EFF",
      "height": 3,
      "borderRadius": 2
    },
    "options": {
      "staticTabs": [
        { "label": "标签一", "value": "tab1" },
        { "label": "标签二", "value": "tab2" },
        { "label": "标签三", "value": "tab3" }
      ]
    },
    "globalVar": {
      "globalVarName": ""
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
    "name": "切换Tab",
    "desc": "切换标签页时触发",
    "method": "tabChange",
    "paramsList": [
      { "name": "index", "desc": "选中标签的索引（从0开始）", "type": "number" },
      { "name": "label", "desc": "选中标签的文本", "type": "string" },
      { "name": "value", "desc": "选中标签的值", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "labelField",
    "desc": "标签名",
    "required": false,
    "multiple": false
  },
  {
    "name": "valueField",
    "desc": "标签值",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrTabList",
  "title": "Tab列表",
  "tag": "form",
  "icon": "tab-list-icon",
  "description": "标签页切换控件，支持水平/垂直排列和底部指示器，将选中值输出到全局变量实现组件联动",
  "version": "1.0.0"
}
```
