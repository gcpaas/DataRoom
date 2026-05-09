# 单选框 (DrRadio)

## 概述

- **组件名称**: DrRadio
- **中文标题**: 单选框
- **分类标签**: form
- **描述**: 表单单选控件，由一组互斥的选项按钮组成，用户只能从中选择一个选项，并将选中值输出到全局变量实现与其他组件的数据联动。支持水平/垂直排列、自定义选中/未选中样式、静态/动态选项配置等功能，适用于状态切换、条件筛选、分类选择等交互场景。
- **默认尺寸**: 300 x 40

## PropsInterface

```json
{
  "basic": {
    "description": "基础配置",
    "properties": {
      "defaultValue": {
        "type": "string",
        "description": "默认选中值，对应选项的value字段，必须在选项列表中存在，初始化时自动同步到全局变量",
        "default": ""
      },
      "disabled": {
        "type": "boolean",
        "description": "是否禁用整个单选组",
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
      "gap": {
        "type": "number",
        "description": "选项之间的间距（px）",
        "default": 12,
        "min": 0,
        "max": 100
      }
    }
  },
  "style": {
    "description": "选项样式",
    "properties": {
      "fontSize": {
        "type": "number",
        "description": "选项文本字号（px）",
        "default": 14,
        "min": 12,
        "max": 40
      },
      "color": {
        "type": "string",
        "description": "未选中状态文本颜色",
        "default": "#CCCCCC"
      },
      "activeColor": {
        "type": "string",
        "description": "选中状态文本颜色",
        "default": "#FFFFFF"
      },
      "activeBgColor": {
        "type": "string",
        "description": "选中状态背景颜色",
        "default": "#409EFF"
      },
      "inactiveColor": {
        "type": "string",
        "description": "未选中状态文本颜色（同color，用于按钮式单选）",
        "default": "#CCCCCC"
      },
      "inactiveBgColor": {
        "type": "string",
        "description": "未选中状态背景颜色",
        "default": "rgba(255, 255, 255, 0.1)"
      },
      "borderRadius": {
        "type": "number",
        "description": "选项按钮圆角（px）",
        "default": 4,
        "min": 0,
        "max": 100
      },
      "padding": {
        "type": "array",
        "description": "选项内边距 [上, 右, 下, 左]（px）",
        "default": [6, 16, 6, 16]
      }
    }
  },
  "options": {
    "description": "选项配置（未绑定数据集时使用静态选项）",
    "properties": {
      "staticOptions": {
        "type": "array",
        "description": "静态选项列表，每项包含label和value",
        "default": [
          { "label": "选项A", "value": "A" },
          { "label": "选项B", "value": "B" },
          { "label": "选项C", "value": "C" }
        ]
      }
    }
  },
  "globalVar": {
    "description": "全局变量配置，用于将选中值输出到全局变量供其他组件引用",
    "properties": {
      "globalVarName": {
        "type": "string",
        "description": "绑定的全局变量名称，选中变化时通过 canvasInst.setGlobalVariable 更新",
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
  "type": "DrRadio",
  "title": "单选框",
  "w": 300,
  "h": 40,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "basic": {
      "defaultValue": "",
      "disabled": false
    },
    "layout": {
      "direction": "horizontal",
      "gap": 12
    },
    "style": {
      "fontSize": 14,
      "color": "#CCCCCC",
      "activeColor": "#FFFFFF",
      "activeBgColor": "#409EFF",
      "inactiveColor": "#CCCCCC",
      "inactiveBgColor": "rgba(255, 255, 255, 0.1)",
      "borderRadius": 4,
      "padding": [6, 16, 6, 16]
    },
    "options": {
      "staticOptions": [
        { "label": "选项A", "value": "A" },
        { "label": "选项B", "value": "B" },
        { "label": "选项C", "value": "C" }
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
    "name": "选中变化",
    "desc": "单选框选中项发生变化时触发",
    "method": "change",
    "paramsList": [
      { "name": "value", "desc": "选中项的value值", "type": "string" },
      { "name": "label", "desc": "选中项的label文本", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "labelField",
    "desc": "选项文本",
    "required": false,
    "multiple": false
  },
  {
    "name": "valueField",
    "desc": "选项值",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrRadio",
  "title": "单选框",
  "tag": "form",
  "icon": "radio-icon",
  "description": "表单单选控件，支持水平/垂直排列的按钮式单选，将选中值输出到全局变量实现组件联动",
  "version": "1.0.0"
}
```
