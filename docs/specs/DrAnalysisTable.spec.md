# 分析表格 (DrAnalysisTable)

## 概述

- **组件名称**: DrAnalysisTable
- **中文标题**: 分析表格
- **分类标签**: table
- **描述**: 面向大屏多维分析的高级表格组件，基于 Element Plus 表格能力设计，不引入额外表格库。相较数据表格，分析表格提供更强的交互和分析能力，包括列显示隐藏、列宽拖拽、列固定、搜索、排序、分页、筛选、合计行、百分比指标、单元格数据条、正负值对齐、基础条件格式和自定义条件格式。适用于区域业绩、设备指标排行、运营明细、KPI 多指标对比等场景。
- **默认尺寸**: 760 x 420

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
        "default": true
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
      "showSelection": {
        "type": "boolean",
        "description": "是否显示多选列",
        "default": false
      },
      "emptyText": {
        "type": "string",
        "description": "空数据提示文本",
        "default": "暂无数据"
      }
    }
  },
  "analysis": {
    "description": "分析字段配置",
    "properties": {
      "mode": {
        "type": "string",
        "description": "数据展示模式，raw为原始明细，aggregate为按维度聚合展示",
        "default": "raw",
        "enum": ["raw", "aggregate"]
      },
      "dimensions": {
        "type": "array",
        "description": "维度字段列表，aggregate模式下作为分组字段",
        "default": []
      },
      "metrics": {
        "type": "array",
        "description": "指标字段列表",
        "default": []
      },
      "metricAggregations": {
        "type": "array",
        "description": "指标聚合配置，每项包含 field 和 method",
        "default": [
          { "field": "value", "method": "sum" }
        ]
      },
      "percentMetrics": {
        "type": "array",
        "description": "百分比指标字段列表，按当前结果集计算占比",
        "default": []
      },
      "percentBase": {
        "type": "string",
        "description": "百分比指标计算基准",
        "default": "columnTotal",
        "enum": ["columnTotal", "visibleRows", "customTotal"]
      }
    }
  },
  "columns": {
    "description": "列交互和列状态配置",
    "properties": {
      "autoColumns": {
        "type": "boolean",
        "description": "是否根据数据集和分析字段自动生成列",
        "default": true
      },
      "columnConfig": {
        "type": "array",
        "description": "列配置列表",
        "default": [
          { "field": "name", "label": "名称", "width": 160, "minWidth": 100, "align": "left", "fixed": "", "visible": true, "format": "text" },
          { "field": "value", "label": "数值", "width": 140, "minWidth": 100, "align": "right", "fixed": "", "visible": true, "format": "thousand" }
        ]
      },
      "allowResize": {
        "type": "boolean",
        "description": "是否允许拖拽调整列宽",
        "default": true
      },
      "allowReorder": {
        "type": "boolean",
        "description": "是否允许调整列顺序",
        "default": true
      },
      "allowHide": {
        "type": "boolean",
        "description": "是否允许隐藏列",
        "default": true
      },
      "showColumnSettings": {
        "type": "boolean",
        "description": "是否显示列设置入口",
        "default": true
      },
      "persistState": {
        "type": "boolean",
        "description": "运行态列宽、列顺序、显隐状态是否写回组件配置",
        "default": false
      }
    }
  },
  "search": {
    "description": "搜索配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示搜索框",
        "default": true
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
      "mode": {
        "type": "string",
        "description": "搜索模式",
        "default": "client",
        "enum": ["client", "datasetParams"]
      },
      "debounce": {
        "type": "number",
        "description": "搜索防抖时间(ms)",
        "default": 300,
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
      "mode": {
        "type": "string",
        "description": "排序模式",
        "default": "client",
        "enum": ["client", "datasetParams"]
      },
      "defaultSorts": {
        "type": "array",
        "description": "默认排序列表",
        "default": []
      },
      "multiSort": {
        "type": "boolean",
        "description": "是否支持多列排序",
        "default": false
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
      "mode": {
        "type": "string",
        "description": "分页模式，datasetParams 表示将 page/pageSize 作为数据集参数刷新数据",
        "default": "client",
        "enum": ["client", "datasetParams"]
      },
      "pageSize": {
        "type": "number",
        "description": "每页行数",
        "default": 20,
        "min": 1,
        "max": 1000
      },
      "pageSizes": {
        "type": "array",
        "description": "可选每页行数",
        "default": [10, 20, 50, 100, 200]
      },
      "layout": {
        "type": "string",
        "description": "分页布局",
        "default": "total, sizes, prev, pager, next",
        "enum": ["prev, pager, next", "total, prev, pager, next", "total, sizes, prev, pager, next"]
      },
      "position": {
        "type": "string",
        "description": "分页位置",
        "default": "bottomRight",
        "enum": ["bottomLeft", "bottomCenter", "bottomRight", "topRight"]
      }
    }
  },
  "summary": {
    "description": "合计行配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示合计行",
        "default": false
      },
      "label": {
        "type": "string",
        "description": "合计行标题",
        "default": "合计"
      },
      "methods": {
        "type": "array",
        "description": "各指标合计方法配置",
        "default": [
          { "field": "value", "method": "sum" }
        ]
      },
      "position": {
        "type": "string",
        "description": "合计行位置",
        "default": "bottom",
        "enum": ["bottom", "top"]
      }
    }
  },
  "cellBars": {
    "description": "单元格数据条配置",
    "properties": {
      "show": {
        "type": "boolean",
        "description": "是否显示单元格数据条",
        "default": false
      },
      "fields": {
        "type": "array",
        "description": "启用数据条的字段列表，空数组表示所有数值字段",
        "default": []
      },
      "alignPositiveNegative": {
        "type": "boolean",
        "description": "正负值是否以0为中心对齐",
        "default": false
      },
      "positiveColor": {
        "type": "string",
        "description": "正值数据条颜色",
        "default": "var(--el-color-success-light-9)"
      },
      "negativeColor": {
        "type": "string",
        "description": "负值数据条颜色",
        "default": "var(--el-color-danger-light-9)"
      },
      "barHeight": {
        "type": "number",
        "description": "数据条高度占单元格高度比例(%)",
        "default": 70,
        "min": 10,
        "max": 100
      }
    }
  },
  "conditionalFormatting": {
    "description": "条件格式配置",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "是否启用条件格式",
        "default": false
      },
      "rules": {
        "type": "array",
        "description": "条件格式规则列表",
        "default": [
          {
            "field": "value",
            "operator": ">=",
            "value": 1000,
            "target": "cell",
            "textColor": "var(--el-color-success)",
            "backgroundColor": "transparent"
          }
        ]
      },
      "basicTrendColor": {
        "type": "string",
        "description": "基础正负值着色方案",
        "default": "increaseGreen",
        "enum": ["none", "increaseGreen", "increaseRed"]
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
      "selectedBackgroundColor": {
        "type": "string",
        "description": "选中行背景色",
        "default": "var(--el-color-primary-light-9)"
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
  }
}
```

## getInstance 默认配置

```json
{
  "id": "",
  "type": "DrAnalysisTable",
  "title": "分析表格",
  "w": 760,
  "h": 420,
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
      "rowKey": "",
      "size": "default",
      "border": true,
      "stripe": true,
      "fit": true,
      "showIndex": false,
      "showSelection": false,
      "emptyText": "暂无数据"
    },
    "analysis": {
      "mode": "raw",
      "dimensions": [],
      "metrics": [],
      "metricAggregations": [
        { "field": "value", "method": "sum" }
      ],
      "percentMetrics": [],
      "percentBase": "columnTotal"
    },
    "columns": {
      "autoColumns": true,
      "columnConfig": [
        { "field": "name", "label": "名称", "width": 160, "minWidth": 100, "align": "left", "fixed": "", "visible": true, "format": "text" },
        { "field": "value", "label": "数值", "width": 140, "minWidth": 100, "align": "right", "fixed": "", "visible": true, "format": "thousand" }
      ],
      "allowResize": true,
      "allowReorder": true,
      "allowHide": true,
      "showColumnSettings": true,
      "persistState": false
    },
    "search": {
      "show": true,
      "placeholder": "搜索",
      "fields": [],
      "mode": "client",
      "debounce": 300
    },
    "sort": {
      "enabled": true,
      "mode": "client",
      "defaultSorts": [],
      "multiSort": false
    },
    "pagination": {
      "show": true,
      "mode": "client",
      "pageSize": 20,
      "pageSizes": [10, 20, 50, 100, 200],
      "layout": "total, sizes, prev, pager, next",
      "position": "bottomRight"
    },
    "summary": {
      "show": false,
      "label": "合计",
      "methods": [
        { "field": "value", "method": "sum" }
      ],
      "position": "bottom"
    },
    "cellBars": {
      "show": false,
      "fields": [],
      "alignPositiveNegative": false,
      "positiveColor": "var(--el-color-success-light-9)",
      "negativeColor": "var(--el-color-danger-light-9)",
      "barHeight": 70
    },
    "conditionalFormatting": {
      "enabled": false,
      "rules": [
        {
          "field": "value",
          "operator": ">=",
          "value": 1000,
          "target": "cell",
          "textColor": "var(--el-color-success)",
          "backgroundColor": "transparent"
        }
      ],
      "basicTrendColor": "increaseGreen"
    },
    "headerStyle": {
      "height": 42,
      "backgroundColor": "var(--el-fill-color-light)",
      "color": "var(--el-text-color-primary)",
      "fontSize": 14,
      "fontWeight": "bold"
    },
    "rowStyle": {
      "height": 40,
      "backgroundColor": "transparent",
      "stripeBackgroundColor": "var(--el-fill-color-lighter)",
      "hoverBackgroundColor": "var(--el-color-primary-light-9)",
      "selectedBackgroundColor": "var(--el-color-primary-light-9)"
    },
    "cellStyle": {
      "color": "var(--el-text-color-regular)",
      "fontSize": 14,
      "fontWeight": "normal",
      "padding": [8, 12, 8, 12],
      "overflow": "ellipsis",
      "showTooltip": true
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
    "name": "选择变化",
    "desc": "多选行变化时触发",
    "method": "selectionChange",
    "paramsList": [
      { "name": "rows", "desc": "当前选中的行数据", "type": "object[]" }
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
      { "name": "sorts", "desc": "排序配置列表", "type": "object[]" }
    ]
  },
  {
    "name": "列状态变化",
    "desc": "列宽、列顺序、列显隐变化时触发",
    "method": "columnStateChange",
    "paramsList": [
      { "name": "columns", "desc": "当前列状态列表", "type": "object[]" }
    ]
  }
]
```

## datasetFields 数据集字段

```json
[
  {
    "name": "dimensionFields",
    "desc": "维度字段列表",
    "required": false,
    "multiple": true
  },
  {
    "name": "metricFields",
    "desc": "指标字段列表",
    "required": false,
    "multiple": true
  },
  {
    "name": "percentMetricFields",
    "desc": "百分比指标字段列表",
    "required": false,
    "multiple": true
  },
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
  },
  {
    "name": "totalField",
    "desc": "服务端分页或自定义总数模式下的总行数字段",
    "required": false,
    "multiple": false
  }
]
```

## plugin 元数据

```json
{
  "name": "DrAnalysisTable",
  "title": "分析表格",
  "tag": "table",
  "icon": "analysis-table-icon",
  "description": "高级多维分析表格组件，基于Element Plus表格能力，支持列交互、合计行、百分比指标、数据条和条件格式",
  "version": "1.0.0"
}
```
