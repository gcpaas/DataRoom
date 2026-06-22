# Component Mock Dataset Design

## Goal

Add a reusable "数据样例" capability to the component data configuration panel. Designers can inspect a component's expected dataset shape before creating or binding a dataset.

The first implementation scope is the bar chart. Other components keep the same generic entry point and may show a "暂未提供数据样例" message until their mock datasets are added later.

## User Experience

In the component configuration panel's data tab, the "数据集选择" collapse item keeps the existing dataset picker input as the first row. A new Element Plus small button named "数据样例" appears on the next row below the dataset input.

Clicking "数据样例" opens a dialog:

- The top section shows the component mock dataset as formatted JSON.
- The bottom section shows a field mapping table.
- If the component has no mock dataset yet, the dialog shows "该组件暂未提供数据样例".

The JSON display uses the component's built-in mock source data directly. It does not rewrite field names based on the current field binding selection.

## Component Contract

Each component may export an optional `mockDataset` from its `install.ts`:

```ts
export const mockDataset = {
  dataset: [
    {
      time: '2024-06-05',
      value: 100,
    },
    {
      time: '2024-06-06',
      value: 90,
    },
  ],
  fields: [
    {
      name: 'xField',
      bindName: 'time',
    },
    {
      name: 'yField',
      bindName: 'value',
    },
  ],
}
```

`dataset` is the component's built-in mock data. It is used both by the "数据样例" dialog and by the component's default rendering when no dataset is configured.

`fields.name` is the component field binding key, such as `xField`, `yField`, or `seriesField`.

`fields.bindName` is the field name in the mock data that is bound to the component field by default.

The generic panel combines `mockDataset.fields` with the existing `datasetFields` metadata to display human-readable field descriptions and required status.

## Registry

`AutoInstall.ts` should register optional `mockDataset` exports alongside the existing component, control panel, behavior, and dataset field metadata.

It should provide a getter such as `getComponentMockDataset(componentType)` for `ControlPanel.vue`.

This follows the existing component-local metadata pattern and keeps each component's data contract near its rendering and configuration definitions.

## Bar Chart

`DrBarChart/install.ts` exports `mockDataset`.

The bar chart's current inline default data in `index.vue` is replaced by `mockDataset.dataset`. This guarantees the default rendered data and the documented data sample come from one source.

The initial bar chart mock dataset uses simple date and value fields:

```json
[
  {
    "time": "2024-06-05",
    "value": 100
  },
  {
    "time": "2024-06-06",
    "value": 90
  }
]
```

The initial field mappings are:

| Component Field | Mock Field | Meaning | Required |
| --- | --- | --- | --- |
| `xField` | `time` | X轴/类目字段（维度） | Yes |
| `yField` | `value` | Y轴/数值字段（指标） | Yes |

`seriesField` remains supported by the bar chart, but is not included in the first mock dataset because the default sample is a simple single-series chart. Later examples may add a grouped chart sample if needed.

## Out Of Scope

- Generating JSON from the current user's field bindings.
- Adding mock datasets for every existing component in the first implementation.
- Changing backend dataset APIs.
- Changing the dataset management page.
- Adding copy/download actions to the dialog.

## Validation

Implementation should verify:

- `npm run type-check` passes.
- The data tab displays the "数据样例" button below the dataset picker.
- Clicking the button for a bar chart opens a dialog with formatted JSON and field mapping rows.
- A component without `mockDataset` opens the generic "暂未提供数据样例" state.
- A bar chart with no configured dataset renders using `mockDataset.dataset`.
