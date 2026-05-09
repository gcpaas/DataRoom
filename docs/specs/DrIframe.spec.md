# Iframe (DrIframe)

## 概述

- **组件名称**: DrIframe
- **中文标题**: Iframe
- **分类标签**: media
- **描述**: 嵌入外部网页的容器组件，通过iframe标签加载指定URL的页面内容，支持滚动控制、边框设置、安全沙箱配置及自动刷新等功能。适用于在大屏中嵌入第三方网页、监控面板、报表页面等场景。
- **默认尺寸**: 400 x 300

## PropsInterface

```json
{
  "basic": {
    "description": "基础配置",
    "properties": {
      "url": {
        "type": "string",
        "description": "嵌入页面的URL地址，HTTPS页面下HTTP链接将无法访问",
        "default": "https://www.example.com"
      },
      "scrolling": {
        "type": "string",
        "description": "是否显示滚动条",
        "default": "auto",
        "enum": ["auto", "yes", "no"]
      },
      "frameBorder": {
        "type": "boolean",
        "description": "是否显示iframe边框",
        "default": false
      }
    }
  },
  "autoRefresh": {
    "description": "自动刷新配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否开启自动刷新",
        "default": false
      },
      "interval": {
        "type": "number",
        "description": "自动刷新间隔时间（秒）",
        "default": 60,
        "min": 5,
        "max": 3600
      }
    }
  },
  "style": {
    "description": "样式配置",
    "properties": {
      "borderRadius": {
        "type": "number",
        "description": "圆角半径（px）",
        "default": 0,
        "min": 0,
        "max": 200
      },
      "backgroundColor": {
        "type": "string",
        "description": "背景颜色",
        "default": "transparent"
      },
      "border": {
        "type": "object",
        "description": "边框配置",
        "default": {
          "show": false,
          "color": "#333333",
          "width": 1,
          "style": "solid"
        }
      }
    }
  },
  "sandbox": {
    "description": "安全沙箱配置，控制iframe内页面的权限",
    "properties": {
      "allowScripts": {
        "type": "boolean",
        "description": "允许执行脚本",
        "default": true
      },
      "allowSameOrigin": {
        "type": "boolean",
        "description": "允许同源访问",
        "default": true
      },
      "allowForms": {
        "type": "boolean",
        "description": "允许提交表单",
        "default": true
      },
      "allowPopups": {
        "type": "boolean",
        "description": "允许弹出窗口",
        "default": false
      },
      "allowModals": {
        "type": "boolean",
        "description": "允许打开模态窗口",
        "default": false
      },
      "allowFullscreen": {
        "type": "boolean",
        "description": "允许全屏",
        "default": true
      },
      "allowCamera": {
        "type": "boolean",
        "description": "允许访问摄像头",
        "default": false
      },
      "allowMicrophone": {
        "type": "boolean",
        "description": "允许访问麦克风",
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
  "type": "DrIframe",
  "title": "Iframe",
  "w": 400,
  "h": 300,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "basic": {
      "url": "https://www.example.com",
      "scrolling": "auto",
      "frameBorder": false
    },
    "autoRefresh": {
      "enabled": false,
      "interval": 60
    },
    "style": {
      "borderRadius": 0,
      "backgroundColor": "transparent",
      "border": {
        "show": false,
        "color": "#333333",
        "width": 1,
        "style": "solid"
      }
    },
    "sandbox": {
      "allowScripts": true,
      "allowSameOrigin": true,
      "allowForms": true,
      "allowPopups": false,
      "allowModals": false,
      "allowFullscreen": true,
      "allowCamera": false,
      "allowMicrophone": false
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
    "name": "加载完成",
    "desc": "iframe页面加载完成时触发",
    "method": "loaded",
    "paramsList": [
      { "name": "url", "desc": "当前加载的页面URL", "type": "string" }
    ]
  },
  {
    "name": "单击",
    "desc": "鼠标点击iframe区域时触发",
    "method": "click",
    "paramsList": [
      { "name": "url", "desc": "当前页面URL", "type": "string" }
    ]
  },
  {
    "name": "链接变更",
    "desc": "iframe内页面URL发生变更时触发",
    "method": "urlChange",
    "paramsList": [
      { "name": "url", "desc": "变更后的URL", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "urlField",
    "desc": "页面地址",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrIframe",
  "title": "Iframe",
  "tag": "media",
  "icon": "iframe-icon",
  "description": "嵌入外部网页的容器组件，支持URL加载、滚动控制、安全沙箱及自动刷新",
  "version": "1.0.0"
}
```
