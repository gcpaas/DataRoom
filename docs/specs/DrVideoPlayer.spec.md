# 视频播放器 (DrVideoPlayer)

## 概述

- **组件名称**: DrVideoPlayer
- **中文标题**: 视频播放器
- **分类标签**: media
- **描述**: 基于HTML5 Video的视频播放器组件，支持MP4、FLV、M3U8、RTMP等多种格式的视频和直播流播放。提供自动播放、循环播放、音量控制、播放速率调节、封面图等功能，适用于大屏中的视频监控、宣传视频展示等场景。
- **默认尺寸**: 480 x 270

## PropsInterface

```json
{
  "basic": {
    "description": "基础播放配置",
    "properties": {
      "url": {
        "type": "string",
        "description": "视频链接地址，支持MP4、FLV、M3U8、RTMP格式",
        "default": ""
      },
      "poster": {
        "type": "string",
        "description": "视频封面图URL，视频加载前显示的预览图片",
        "default": ""
      },
      "autoplay": {
        "type": "boolean",
        "description": "是否自动播放（浏览器策略可能要求同时开启静音）",
        "default": false
      },
      "loop": {
        "type": "boolean",
        "description": "是否循环播放",
        "default": false
      },
      "muted": {
        "type": "boolean",
        "description": "是否静音（自动播放时建议开启）",
        "default": false
      },
      "controls": {
        "type": "boolean",
        "description": "是否显示播放控制栏",
        "default": true
      },
      "preload": {
        "type": "string",
        "description": "视频预加载策略",
        "default": "auto",
        "enum": ["auto", "metadata", "none"]
      }
    }
  },
  "style": {
    "description": "样式配置",
    "properties": {
      "objectFit": {
        "type": "string",
        "description": "视频填充模式，控制视频在容器内的缩放方式",
        "default": "contain",
        "enum": ["contain", "cover", "fill", "none"]
      },
      "borderRadius": {
        "type": "number",
        "description": "圆角半径（px）",
        "default": 0,
        "min": 0,
        "max": 200
      },
      "backgroundColor": {
        "type": "string",
        "description": "背景颜色（视频未加载或未填满时显示）",
        "default": "#000000"
      }
    }
  },
  "volume": {
    "description": "音量配置",
    "properties": {
      "defaultVolume": {
        "type": "number",
        "description": "默认音量大小",
        "default": 0.7,
        "min": 0,
        "max": 1
      }
    }
  },
  "playbackRate": {
    "description": "播放速率配置",
    "properties": {
      "defaultRate": {
        "type": "number",
        "description": "默认播放速率",
        "default": 1,
        "min": 0.25,
        "max": 4
      },
      "rates": {
        "type": "number[]",
        "description": "可选的播放速率列表",
        "default": [0.5, 0.75, 1, 1.25, 1.5, 2]
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrVideoPlayer",
  "title": "视频播放器",
  "w": 480,
  "h": 270,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "basic": {
      "url": "",
      "poster": "",
      "autoplay": false,
      "loop": false,
      "muted": false,
      "controls": true,
      "preload": "auto"
    },
    "style": {
      "objectFit": "contain",
      "borderRadius": 0,
      "backgroundColor": "#000000"
    },
    "volume": {
      "defaultVolume": 0.7
    },
    "playbackRate": {
      "defaultRate": 1,
      "rates": [0.5, 0.75, 1, 1.25, 1.5, 2]
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
    "name": "播放",
    "desc": "视频开始播放时触发",
    "method": "play",
    "paramsList": [
      { "name": "currentTime", "desc": "当前播放时间（秒）", "type": "number" }
    ]
  },
  {
    "name": "暂停",
    "desc": "视频暂停时触发",
    "method": "pause",
    "paramsList": [
      { "name": "currentTime", "desc": "暂停时的播放时间（秒）", "type": "number" }
    ]
  },
  {
    "name": "播放结束",
    "desc": "视频播放到结尾时触发",
    "method": "ended",
    "paramsList": [
      { "name": "duration", "desc": "视频总时长（秒）", "type": "number" }
    ]
  },
  {
    "name": "时间更新",
    "desc": "视频播放过程中定期触发",
    "method": "timeupdate",
    "paramsList": [
      { "name": "currentTime", "desc": "当前播放时间（秒）", "type": "number" },
      { "name": "duration", "desc": "视频总时长（秒）", "type": "number" }
    ]
  },
  {
    "name": "单击",
    "desc": "鼠标点击视频区域时触发",
    "method": "click",
    "paramsList": [
      { "name": "currentTime", "desc": "单击时的播放时间（秒）", "type": "number" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "urlField",
    "desc": "视频地址",
    "required": false,
    "multiple": false
  },
  {
    "name": "posterField",
    "desc": "封面图地址",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrVideoPlayer",
  "title": "视频播放器",
  "tag": "media",
  "icon": "video-player-icon",
  "description": "HTML5视频播放器组件，支持MP4/FLV/M3U8/RTMP格式，提供自动播放、循环、音量控制、播放速率等功能",
  "version": "1.0.0"
}
```
