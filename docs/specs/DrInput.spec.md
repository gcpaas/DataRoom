# 输入框 (DrInput)

## 概述

- **组件名称**: DrInput
- **中文标题**: 输入框
- **分类标签**: form
- **描述**: 表单输入控件，由文本输入区域组成，用户可输入文本内容并将值输出到全局变量，实现与其他组件的数据联动。支持多种输入类型（文本、数字、密码）、占位提示、清空按钮、最大长度限制等功能，适用于搜索筛选、参数输入、表单提交等交互场景。
- **默认尺寸**: 200 x 40

## PropsInterface

```json
{
  "basic": {
    "description": "基础配置",
    "properties": {
      "placeholder": {
        "type": "string",
        "description": "输入框占位提示文本，当无输入内容时显示",
        "default": "请输入内容"
      },
      "inputType": {
        "type": "string",
        "description": "输入框类型",
        "default": "text",
        "enum": ["text", "number", "password"]
      },
      "defaultValue": {
        "type": "string",
        "description": "输入框默认值，初始化时自动填充并同步到全局变量",
        "default": ""
      },
      "clearable": {
        "type": "boolean",
        "description": "是否显示清空按钮，输入内容后出现一键清除图标",
        "default": true
      },
      "disabled": {
        "type": "boolean",
        "description": "是否禁用输入框",
        "default": false
      },
      "maxLength": {
        "type": "number",
        "description": "最大输入字符数，0表示不限制",
        "default": 0,
        "min": 0,
        "max": 9999
      },
      "readonly": {
        "type": "boolean",
        "description": "是否只读模式，可选中但不可编辑",
        "default": false
      }
    }
  },
  "style": {
    "description": "输入框样式",
    "properties": {
      "fontSize": {
        "type": "number",
        "description": "文本字号（px）",
        "default": 14,
        "min": 12,
        "max": 60
      },
      "color": {
        "type": "string",
        "description": "输入文本颜色",
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
        "description": "输入框高度（px），一般与组件高度一致",
        "default": 40,
        "min": 24,
        "max": 100
      },
      "padding": {
        "type": "array",
        "description": "内边距 [上, 右, 下, 左]（px）",
        "default": [0, 12, 0, 12]
      }
    }
  },
  "focus": {
    "description": "聚焦状态样式",
    "properties": {
      "borderColor": {
        "type": "string",
        "description": "聚焦时边框颜色",
        "default": "#409EFF"
      },
      "shadowColor": {
        "type": "string",
        "description": "聚焦时阴影颜色",
        "default": "rgba(64, 158, 255, 0.3)"
      },
      "shadowSize": {
        "type": "number",
        "description": "聚焦时阴影扩散大小（px）",
        "default": 3,
        "min": 0,
        "max": 20
      }
    }
  },
  "globalVar": {
    "description": "全局变量配置，用于将输入值输出到全局变量供其他组件引用",
    "properties": {
      "globalVarName": {
        "type": "string",
        "description": "绑定的全局变量名称，值变化时通过 canvasInst.setGlobalVariable 更新",
        "default": ""
      },
      "triggerOnInput": {
        "type": "boolean",
        "description": "是否在输入时即时触发全局变量更新（true=每次按键触发，false=仅回车或失焦时触发）",
        "default": false
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrInput",
  "title": "输入框",
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
      "placeholder": "请输入内容",
      "inputType": "text",
      "defaultValue": "",
      "clearable": true,
      "disabled": false,
      "maxLength": 0,
      "readonly": false
    },
    "style": {
      "fontSize": 14,
      "color": "#FFFFFF",
      "placeholderColor": "#999999",
      "backgroundColor": "rgba(255, 255, 255, 0.1)",
      "borderColor": "#444444",
      "borderWidth": 1,
      "borderRadius": 4,
      "height": 40,
      "padding": [0, 12, 0, 12]
    },
    "focus": {
      "borderColor": "#409EFF",
      "shadowColor": "rgba(64, 158, 255, 0.3)",
      "shadowSize": 3
    },
    "globalVar": {
      "globalVarName": "",
      "triggerOnInput": false
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
    "name": "值变化",
    "desc": "输入框值发生变化时触发",
    "method": "valueChange",
    "paramsList": [
      { "name": "value", "desc": "当前输入框的值", "type": "string" }
    ]
  },
  {
    "name": "回车确认",
    "desc": "按下回车键时触发",
    "method": "enterPress",
    "paramsList": [
      { "name": "value", "desc": "按下回车时输入框的值", "type": "string" }
    ]
  },
  {
    "name": "获取焦点",
    "desc": "输入框获取焦点时触发",
    "method": "focus",
    "paramsList": []
  },
  {
    "name": "失去焦点",
    "desc": "输入框失去焦点时触发",
    "method": "blur",
    "paramsList": [
      { "name": "value", "desc": "失焦时输入框的值", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[]
```

## plugin 元数据

```json
{
  "name": "DrInput",
  "title": "输入框",
  "tag": "form",
  "icon": "input-icon",
  "description": "表单输入控件，支持文本/数字/密码输入，将值输出到全局变量实现组件联动",
  "version": "1.0.0"
}
```
