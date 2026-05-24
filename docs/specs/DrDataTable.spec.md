# 数据表格 (DrDataTable)

## 概述

- **组件名称**: DrDataTable
- **中文标题**: 数据表格
- **分类标签**: table
- **描述**: 面向大屏明细数据展示的基础表格组件，基于 Element Plus 表格能力设计，不引入额外表格库。支持自动列、手动列、列标题、列宽、对齐、排序、分页、搜索、空状态、单元格格式化、表头/行/单元格样式等配置，适用于列表明细、设备清单、告警记录、排行数据等场景。
- **默认尺寸**: 640 x 360

## PropsInterface

```json
{
  "global": {
    "description": "全局配置",
    "properties": {
      "padding": {
        "type": "array",
        "description": "组件内边距 [上, 右, 下, 左] (px)",
        "default": [0, 0, 0, 0]
      },
      "backgroundColor": {
        "type": "string",
        "description": "组件背景色",
        "default": "transparent"
      },
      "borderColor": {
        "type": "string",
        "description": "外层边框颜色",
        "default": "transparent"
      },
      "borderWidth": {
        "type": "number",
        "description": "外层边框宽度(px)",
        "default": 0,
        "min": 0,
        "max": 20
      },
      "borderRadius": {
        "type": "number",
        "description": "外层圆角(px)",
        "default": 6,
        "min": 0,
        "max": 40
      }
    }
  },
  "table": {
    "description": "表格基础配置",
    "properties": {
      "autoColumns": {
        "type": "boolean",
        "description": "是否根据数据集第一行自动生成列",
        "default": true
      },
      "columns": {
        "type": "array",
        "description": "手动列配置，autoColumns 为 false 时使用",
        "default": [
          { "field": "name", "label": "名称", "width": 160, "align": "left", "format": "text", "visible": true },
          { "field": "value", "label": "数值", "width": 120, "align": "right", "format": "thousand", "visible": true },
          { "field": "status", "label": "状态", "width": 120, "align": "center", "format": "text", "visible": true }
        ]
      },
      "rowKey": {
        "type": "string",
        "description": "行唯一键字段，空值时使用行索引",
        "default": ""
      },
      "size": {
        "type": "string",
        "description": "表格密度",
        "default": "default",
        "enum": ["large", "default", "small"]
      },
      "border": {
        "type": "boolean",
        "description": "是否显示表格纵向边框",
        "default": false
      },
      "stripe": {
        "type": "boolean",
        "description": "是否显示斑马纹",
        "default": true
      },
      "fit": {
        "type": "boolean",
        "description": "列宽是否自动撑满",
        "default": true
      },
      "showIndex": {
        "type": "boolean",
        "description": "是否显示序号列",
        "default": false
      },
      "emptyText": {
        "type": "string",
        "description": "空数据提示文本",
        "default": "暂无数据"
      }
    }
  },
  "headerStyle": {
    "description": "表头样式配置",
    "properties": {
      "height": {
        "type": "number",
        "description": "表头高度(px)，0表示使用默认高度",
        "default": 42,
        "min": 0,
        "max": 120
      },
      "backgroundColor": {
        "type": "string",
        "description": "表头背景色",
        "default": "var(--el-fill-color-light)"
      },
      "color": {
        "type": "string",
        "description": "表头文字颜色",
        "default": "var(--el-text-color-primary)"
      },
      "fontSize": {
        "type": "number",
        "description": "表头字号(px)",
        "default": 14,
        "min": 10,
        "max": 36
      },
      "fontWeight": {
        "type": "string",
        "description": "表头字重",
        "default": "bold",
        "enum": ["normal", "bold", "bolder"]
      },
      "textAlign": {
        "type": "string",
        "description": "表头默认对齐方式",
        "default": "left",
        "enum": ["left", "center", "right"]
      }
    }
  },
  "rowStyle": {
    "description": "行样式配置",
    "properties": {
      "height": {
        "type": "number",
        "description": "数据行高度(px)，0表示使用默认高度",
        "default": 40,
        "min": 0,
        "max": 120
      },
      "backgroundColor": {
        "type": "string",
        "description": "普通行背景色",
        "default": "transparent"
      },
      "stripeBackgroundColor": {
        "type": "string",
        "description": "斑马纹行背景色",
        "default": "var(--el-fill-color-lighter)"
      },
      "hoverBackgroundColor": {
        "type": "string",
        "description": "鼠标悬停行背景色",
        "default": "var(--el-color-primary-light-9)"
      },
      "borderColor": {
        "type": "string",
        "description": "行分割线颜色",
        "default": "var(--el-border-color-lighter)"
      }
    }
  },
  "cellStyle": {
    "description": "单元格样式配置",
    "properties": {
      "color": {
        "type": "string",
        "description": "单元格文字颜色",
        "default": "var(--el-text-color-regular)"
      },
      "fontSize": {
        "type": "number",
        "description": "单元格字号(px)",
        "default": 14,
        "min": 10,
        "max": 36
      },
      "fontWeight": {
        "type": "string",
        "description": "单元格字重",
        "default": "normal",
        "enum": ["normal", "bold", "bolder"]
      },
      "padding": {
        "type": "array",
        "description": "单元格内边距 [上, 右, 下, 左] (px)",
        "default": [8, 12, 8, 12]
      },
      "overflow": {
        "type": "string",
        "description": "内容溢出方式",
        "default": "ellipsis",
        "enum": ["ellipsis", "wrap", "clip"]
      },
      "showTooltip": {
        "type": "boolean",
        "description": "内容省略时是否显示 tooltip",
        "default": true
      }
    }
  },
  "search": {
    "description": "搜索配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示搜索框",
        "default": false
      },
      "placeholder": {
        "type": "string",
        "description": "搜索框占位文本",
        "default": "搜索"
      },
      "fields": {
        "type": "array",
        "description": "参与搜索的字段列表，空数组表示全部字段",
        "default": []
      },
      "debounce": {
        "type": "number",
        "description": "搜索防抖时间(ms)",
        "default": 200,
        "min": 0,
        "max": 2000
      }
    }
  },
  "sort": {
    "description": "排序配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用列排序",
        "default": true
      },
      "defaultField": {
        "type": "string",
        "description": "默认排序字段",
        "default": ""
      },
      "defaultOrder": {
        "type": "string",
        "description": "默认排序方向",
        "default": "none",
        "enum": ["ascending", "descending", "none"]
      }
    }
  },
  "pagination": {
    "description": "分页配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示分页",
        "default": true
      },
      "pageSize": {
        "type": "number",
        "description": "每页行数",
        "default": 10,
        "min": 1,
        "max": 500
      },
      "pageSizes": {
        "type": "array",
        "description": "可选每页行数",
        "default": [10, 20, 50, 100]
      },
      "layout": {
        "type": "string",
        "description": "分页布局",
        "default": "prev, pager, next",
        "enum": ["prev, pager, next", "total, prev, pager, next", "sizes, prev, pager, next"]
      },
      "position": {
        "type": "string",
        "description": "分页位置",
        "default": "bottomRight",
        "enum": ["bottomLeft", "bottomCenter", "bottomRight", "topRight"]
      }
    }
  },
  "formatting": {
    "description": "格式化配置",
    "properties": {
      "defaultNumberFormat": {
        "type": "string",
        "description": "默认数字格式",
        "default": "value",
        "enum": ["value", "integer", "float1", "float2", "percent", "thousand", "currency"]
      },
      "dateFormat": {
        "type": "string",
        "description": "日期时间格式化模板",
        "default": "YYYY-MM-DD HH:mm:ss"
      },
      "nullText": {
        "type": "string",
        "description": "空值显示文本",
        "default": "--"
      }
    }
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrDataTable",
  "title": "数据表格",
  "w": 640,
  "h": 360,
  "x": 0,
  "y": 0,
  "z": 0,
  "rotateX": 0,
  "rotateY": 0,
  "rotateZ": 0,
  "props": {
    "global": {
      "padding": [0, 0, 0, 0],
      "backgroundColor": "transparent",
      "borderColor": "transparent",
      "borderWidth": 0,
      "borderRadius": 6
    },
    "table": {
      "autoColumns": true,
      "columns": [
        { "field": "name", "label": "名称", "width": 160, "align": "left", "format": "text", "visible": true },
        { "field": "value", "label": "数值", "width": 120, "align": "right", "format": "thousand", "visible": true },
        { "field": "status", "label": "状态", "width": 120, "align": "center", "format": "text", "visible": true }
      ],
      "rowKey": "",
      "size": "default",
      "border": false,
      "stripe": true,
      "fit": true,
      "showIndex": false,
      "emptyText": "暂无数据"
    },
    "headerStyle": {
      "height": 42,
      "backgroundColor": "var(--el-fill-color-light)",
      "color": "var(--el-text-color-primary)",
      "fontSize": 14,
      "fontWeight": "bold",
      "textAlign": "left"
    },
    "rowStyle": {
      "height": 40,
      "backgroundColor": "transparent",
      "stripeBackgroundColor": "var(--el-fill-color-lighter)",
      "hoverBackgroundColor": "var(--el-color-primary-light-9)",
      "borderColor": "var(--el-border-color-lighter)"
    },
    "cellStyle": {
      "color": "var(--el-text-color-regular)",
      "fontSize": 14,
      "fontWeight": "normal",
      "padding": [8, 12, 8, 12],
      "overflow": "ellipsis",
      "showTooltip": true
    },
    "search": {
      "show": false,
      "placeholder": "搜索",
      "fields": [],
      "debounce": 200
    },
    "sort": {
      "enabled": true,
      "defaultField": "",
      "defaultOrder": "none"
    },
    "pagination": {
      "show": true,
      "pageSize": 10,
      "pageSizes": [10, 20, 50, 100],
      "layout": "prev, pager, next",
      "position": "bottomRight"
    },
    "formatting": {
      "defaultNumberFormat": "value",
      "dateFormat": "YYYY-MM-DD HH:mm:ss",
      "nullText": "--"
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
    "name": "行单击",
    "desc": "鼠标点击表格行时触发",
    "method": "rowClick",
    "paramsList": [
      { "name": "row", "desc": "当前行完整数据", "type": "object" },
      { "name": "rowIndex", "desc": "当前行索引", "type": "number" }
    ]
  },
  {
    "name": "单元格单击",
    "desc": "鼠标点击单元格时触发",
    "method": "cellClick",
    "paramsList": [
      { "name": "row", "desc": "当前行完整数据", "type": "object" },
      { "name": "field", "desc": "当前列字段名", "type": "string" },
      { "name": "value", "desc": "当前单元格值", "type": "string | number | boolean | null" }
    ]
  },
  {
    "name": "分页变化",
    "desc": "页码或每页行数变化时触发",
    "method": "pageChange",
    "paramsList": [
      { "name": "page", "desc": "当前页码", "type": "number" },
      { "name": "pageSize", "desc": "每页行数", "type": "number" }
    ]
  },
  {
    "name": "排序变化",
    "desc": "列排序变化时触发",
    "method": "sortChange",
    "paramsList": [
      { "name": "field", "desc": "排序字段", "type": "string" },
      { "name": "order", "desc": "排序方向", "type": "string" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "displayFields",
    "desc": "显示字段列表，未配置时使用数据集返回的全部字段",
    "required": false,
    "multiple": true
  },
  {
    "name": "rowKeyField",
    "desc": "行唯一键字段",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrDataTable",
  "title": "数据表格",
  "tag": "table",
  "icon": "data-table-icon",
  "description": "基础明细数据表格组件，基于Element Plus表格能力，支持列配置、分页、排序、搜索和大屏样式调整",
  "version": "1.0.0"
}
```
