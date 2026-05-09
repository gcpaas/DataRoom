# 全屏切换 (DrFullScreen)

## 概述

- **组件名称**: DrFullScreen
- **中文标题**: 全屏切换
- **分类标签**: form
- **描述**: 纯交互组件，用于控制页面在全屏与常规视图之间灵活切换。支持自定义进入/退出全屏的图标、图标颜色、提示文字、背景样式等。鼠标悬停时可显示按钮，适用于大屏展示中的全屏控制需求。
- **默认尺寸**: 40 x 40

## PropsInterface

```json
{
  "icon": {
    "description": "图标配置",
    "properties": {
      "enterIcon": {
        "type": "string",
        "description": "进入全屏时显示的图标（图标名称或URL）",
        "default": "FullScreen"
      },
      "exitIcon": {
        "type": "string",
        "description": "退出全屏时显示的图标（图标名称或URL）",
        "default": "ScaleToOriginal"
      },
      "iconSize": {
        "type": "number",
        "description": "图标大小（px）",
        "default": 24,
        "min": 12,
        "max": 64
      },
      "iconColor": {
        "type": "string",
        "description": "图标颜色",
        "default": "#ffffff"
      },
      "hoverColor": {
        "type": "string",
        "description": "鼠标悬停时的图标颜色",
        "default": "#409EFF"
      }
    }
  },
  "tooltip": {
    "description": "提示文字配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示悬停提示文字",
        "default": true
      },
      "enterText": {
        "type": "string",
        "description": "进入全屏的提示文字",
        "default": "进入全屏"
      },
      "exitText": {
        "type": "string",
        "description": "退出全屏的提示文字",
        "default": "退出全屏"
      }
    }
  },
  "style": {
    "description": "样式配置",
    "properties": {
      "backgroundColor": {
        "type": "string",
        "description": "背景颜色",
        "default": "rgba(0, 0, 0, 0.5)"
      },
      "borderRadius": {
        "type": "number",
        "description": "圆角半径（px），默认50%呈圆形",
        "default": 50,
        "min": 0,
        "max": 100
      },
      "border": {
        "type": "object",
        "description": "边框配置",
        "default": {
          "show": false,
          "color": "#333333",
          "width": 1
        }
      },
      "padding": {
        "type": "number",
        "description": "内边距（px）",
        "default": 8,
        "min": 0,
        "max": 32
      },
      "cursor": {
        "type": "string",
        "description": "鼠标样式",
        "default": "pointer",
        "enum": ["pointer", "default", "hand"]
      },
      "alwaysShow": {
        "type": "boolean",
        "description": "是否常驻显示（关闭时仅鼠标悬停可见）",
        "default": true
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrFullScreen",
  "title": "全屏切换",
  "w": 40,
  "h": 40,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "icon": {
      "enterIcon": "FullScreen",
      "exitIcon": "ScaleToOriginal",
      "iconSize": 24,
      "iconColor": "#ffffff",
      "hoverColor": "#409EFF"
    },
    "tooltip": {
      "show": true,
      "enterText": "进入全屏",
      "exitText": "退出全屏"
    },
    "style": {
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "borderRadius": 50,
      "border": {
        "show": false,
        "color": "#333333",
        "width": 1
      },
      "padding": 8,
      "cursor": "pointer",
      "alwaysShow": true
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
    "name": "进入全屏",
    "desc": "页面进入全屏模式时触发",
    "method": "enterFullscreen",
    "paramsList": [
      { "name": "isFullscreen", "desc": "当前是否处于全屏状态", "type": "boolean" }
    ]
  },
  {
    "name": "退出全屏",
    "desc": "页面退出全屏模式时触发",
    "method": "exitFullscreen",
    "paramsList": [
      { "name": "isFullscreen", "desc": "当前是否处于全屏状态", "type": "boolean" }
    ]
  },
  {
    "name": "单击",
    "desc": "鼠标点击全屏切换按钮时触发",
    "method": "click",
    "paramsList": [
      { "name": "isFullscreen", "desc": "单击后的全屏状态", "type": "boolean" }
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
  "name": "DrFullScreen",
  "title": "全屏切换",
  "tag": "form",
  "icon": "fullscreen-icon",
  "description": "纯交互组件，控制页面全屏与常规视图之间的切换，支持自定义图标和背景样式",
  "version": "1.0.0"
}
```
