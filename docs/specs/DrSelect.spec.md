# 下拉框 (DrSelect)

## 概述

- **组件名称**: DrSelect
- **中文标题**: 下拉框
- **分类标签**: form
- **描述**: 表单下拉选择控件，用于在预设选项列表中选择一个或多个值，并将选中值输出到全局变量实现与其他组件的数据联动。支持下拉搜索、选中清除、多选模式、静态/动态选项配置等功能，适用于条件筛选、分类切换、参数选择等交互场景。
- **默认尺寸**: 200 x 40

## PropsInterface

```json
{
  "basic": {
    "description": "基础配置",
    "properties": {
      "placeholder": {
        "type": "string",
        "description": "下拉框占位提示文本",
        "default": "请选择"
      },
      "defaultValue": {
        "type": "string",
        "description": "默认选中值，对应选项的value字段，初始化时自动同步到全局变量",
        "default": ""
      },
      "multiple": {
        "type": "boolean",
        "description": "是否开启多选模式",
        "default": false
      },
      "clearable": {
        "type": "boolean",
        "description": "是否可清空选中项",
        "default": true
      },
      "disabled": {
        "type": "boolean",
        "description": "是否禁用下拉框",
        "default": false
      },
      "filterable": {
        "type": "boolean",
        "description": "是否支持输入搜索过滤选项",
        "default": false
      },
      "size": {
        "type": "string",
        "description": "下拉框尺寸",
        "default": "default",
        "enum": ["small", "default", "large"]
      }
    }
  },
  "style": {
    "description": "输入框样式",
    "properties": {
      "fontSize": {
        "type": "number",
        "description": "选中文本字号（px）",
        "default": 14,
        "min": 12,
        "max": 60
      },
      "color": {
        "type": "string",
        "description": "选中文本颜色",
        "default": "#FFFFFF"
      },
      "placeholderColor": {
        "type": "string",
        "description": "占位文本颜色",
        "default": "#999999"
      },
      "backgroundColor": {
        "type": "string",
        "description": "输入框背景颜色",
        "default": "rgba(255, 255, 255, 0.1)"
      },
      "borderColor": {
        "type": "string",
        "description": "边框颜色",
        "default": "#444444"
      },
      "borderWidth": {
        "type": "number",
        "description": "边框宽度（px）",
        "default": 1,
        "min": 0,
        "max": 10
      },
      "borderRadius": {
        "type": "number",
        "description": "边框圆角（px）",
        "default": 4,
        "min": 0,
        "max": 100
      },
      "height": {
        "type": "number",
        "description": "输入框高度（px）",
        "default": 40,
        "min": 24,
        "max": 100
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
          { "label": "选项一", "value": "1" },
          { "label": "选项二", "value": "2" },
          { "label": "选项三", "value": "3" }
        ]
      },
      "optionFontSize": {
        "type": "number",
        "description": "选项文本字号（px）",
        "default": 14,
        "min": 12,
        "max": 40
      },
      "optionColor": {
        "type": "string",
        "description": "选项文本颜色",
        "default": "#FFFFFF"
      }
    }
  },
  "dropdown": {
    "description": "下拉面板样式",
    "properties": {
      "maxHeight": {
        "type": "number",
        "description": "下拉面板最大高度（px），超出后出现滚动条",
        "default": 200,
        "min": 100,
        "max": 600
      },
      "backgroundColor": {
        "type": "string",
        "description": "下拉面板背景颜色",
        "default": "rgba(30, 30, 30, 0.95)"
      },
      "borderColor": {
        "type": "string",
        "description": "下拉面板边框颜色",
        "default": "#444444"
      },
      "hoverBgColor": {
        "type": "string",
        "description": "选项悬浮时背景颜色",
        "default": "rgba(64, 158, 255, 0.2)"
      },
      "activeBgColor": {
        "type": "string",
        "description": "选项选中时背景颜色",
        "default": "rgba(64, 158, 255, 0.3)"
      },
      "activeColor": {
        "type": "string",
        "description": "选项选中时文本颜色",
        "default": "#409EFF"
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
  "type": "DrSelect",
  "title": "下拉框",
  "w": 200,
  "h": 40,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "basic": {
      "placeholder": "请选择",
      "defaultValue": "",
      "multiple": false,
      "clearable": true,
      "disabled": false,
      "filterable": false,
      "size": "default"
    },
    "style": {
      "fontSize": 14,
      "color": "#FFFFFF",
      "placeholderColor": "#999999",
      "backgroundColor": "rgba(255, 255, 255, 0.1)",
      "borderColor": "#444444",
      "borderWidth": 1,
      "borderRadius": 4,
      "height": 40
    },
    "options": {
      "staticOptions": [
        { "label": "选项一", "value": "1" },
        { "label": "选项二", "value": "2" },
        { "label": "选项三", "value": "3" }
      ],
      "optionFontSize": 14,
      "optionColor": "#FFFFFF"
    },
    "dropdown": {
      "maxHeight": 200,
      "backgroundColor": "rgba(30, 30, 30, 0.95)",
      "borderColor": "#444444",
      "hoverBgColor": "rgba(64, 158, 255, 0.2)",
      "activeBgColor": "rgba(64, 158, 255, 0.3)",
      "activeColor": "#409EFF"
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
    "desc": "下拉框选中项发生变化时触发",
    "method": "change",
    "paramsList": [
      { "name": "value", "desc": "选中项的value值（多选时为数组）", "type": "string | string[]" },
      { "name": "label", "desc": "选中项的label文本（多选时为数组）", "type": "string | string[]" }
    ]
  },
  {
    "name": "清空选中",
    "desc": "点击清空按钮清空所有选中项时触发",
    "method": "clear",
    "paramsList": []
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
  "name": "DrSelect",
  "title": "下拉框",
  "tag": "form",
  "icon": "select-icon",
  "description": "表单下拉选择控件，支持搜索/多选/清除，将选中值输出到全局变量实现组件联动",
  "version": "1.0.0"
}
```
