// 配置版本号
const version = "2023091901";
// 标题
const title = "堆叠柱状图";
// 用于标识，唯一，和文件夹名称一致
const name = "堆叠柱状图";

// 右侧配置项
const setting = [
  {
    label: "维度",
    type: "select", // 设置组件类型
    field: "xField", // 字段
    optionField: "xField", // 对应options中的字段
    // 是否多选
    multiple: true,
    value: "",
    tabName: "data",
  },
  {
    label: "指标",
    type: "select", // 设置组件类型
    field: "yField", // 字段
    optionField: "yField", // 对应options中的字段
    // 是否多选
    multiple: false,
    value: "",
    tabName: "data",
  },
  {
    label: "分组字段",
    type: "select", // 设置组件类型
    field: "seriesField", // 字段
    optionField: "seriesField", // 对应options中的字段
    // 是否多选
    multiple: false,
    value: "",
    tabName: "data",
  },
  /** 样式配置 **/
  {
    label: "柱子宽度",
    type: "inputNumber", // 设置组件类型
    field: "barWidth", // 字段
    optionField: "barWidth", // 对应options中的字段
    value: 20,
    tabName: "custom",
    groupName: "graph",
  },
  {
    label: "图表主题",
    // 设置组件类型
    type: "colorSelect",
    // 字段
    field: "color",
    // 对应options中的字段
    optionField: "color",
    value: [
      "#006EFF",
      "#00E5E5",
      "#2E55EA",
      "#B8E7FE",
      "#00D689",
      "#B7F9F5",
      "#FBCC71",
      "#F46E50",
    ],
    tabName: "custom",
    groupName: "graph",
  },
  // 图表 graph
  {
    label: "数据标签",
    type: "switch", // 设置组件类型
    field: "label_visible", // 字段
    optionField: "label.visible", // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "graph",
  },
  {
    label: "数据标签位置",
    type: "select", // 设置组件类型
    field: "label_position", // 字段
    optionField: "label.position", // 对应options中的字段
    // 是否多选
    multiple: false,
    value: "top",
    tabName: "custom",
    options: [
      {
        label: "顶部",
        value: "top",
      },
      {
        label: "居中",
        value: "inside",
      },
      {
        label: "底部",
        value: "bottom",
      },
    ],
    groupName: "graph",
  },
  {
    label: "数据标签颜色",
    type: "colorPicker", // 设置组件类型
    field: "label_style_fill", // 字段
    optionField: "label.style.fill", // 对应options中的字段
    value: "#ffffff",
    tabName: "custom",
    groupName: "graph",
  },
  {
    label: "数据标签大小",
    // 设置组件类型
    type: "inputNumber",
    // 字段
    field: "label_style_fontSize",
    // 对应options中的字段
    optionField: "label.style.fontSize",
    value: 10,
    tabName: "custom",
    groupName: "graph",
  },
  // 网格线 grid
  {
    label: "虚线",
    type: "switch",
    field: "yAxis_grid_style_lineDash",
    optionField: "yAxis.grid.style.lineDash",
    value: 0,
    active: 5,
    inactive: 0,
    tabName: "custom",
    groupName: "grid",
  },
  {
    label: "宽度",
    type: "inputNumber",
    field: "yAxis_grid_style_lineWidth",
    optionField: "yAxis.grid.style.lineWidth",
    value: 1,
    tabName: "custom",
    groupName: "grid",
  },
  {
    label: "颜色",
    type: "colorPicker",
    field: "yAxis_grid_style_stroke",
    optionField: "yAxis.grid.style.stroke",
    value: "#E5E6EB10",
    tabName: "custom",
    groupName: "grid",
  },
  // 图例 legend
  {
    label: "显示",
    type: "switch", // 设置组件类型
    field: "legend_visible", // 字段
    optionField: "legend.visible", // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "legend",
  },
  {
    label: "位置",
    type: "select", // 设置组件类型
    field: "legend_orient", // 字段
    optionField: "legend.orient", // 对应options中的字段
    // 是否多选
    multiple: false,
    value: "top",
    tabName: "custom",
    options: [
      { label: "居上", value: "top" },
      { label: "居右", value: "right" },
      { label: "居下", value: "bottom" },
      { label: "居左", value: "left" },
    ],
    groupName: "legend",
  },
  {
    label: "对齐",
    type: "select", // 设置组件类型
    field: "legend_position", // 字段
    optionField: "legend.position", // 对应options中的字段
    // 是否多选
    multiple: false,
    value: "top",
    tabName: "custom",
    options: [
      { label: "起始", value: "start" },
      { label: "居中", value: "middle" },
      { label: "末尾", value: "end" },
    ],
    groupName: "legend",
  },
  {
    label: "字体大小",
    type: "inputNumber",
    field: "legend_item_label_style_fontSize",
    optionField: "legend.item.label.style.fontSize",
    value: 12,
    tabName: "custom",
    groupName: "legend",
  },
  {
    label: "字体权重",
    type: "inputNumber",
    step: 100,
    max: 900,
    field: "legend_item_label_style_fontWeight",
    optionField: "legend.item.label.style.fontWeight",
    value: 400,
    tabName: "custom",
    groupName: "legend",
  },
  {
    label: "字体颜色",
    type: "colorPicker",
    field: "legend_item_label_style_fill",
    optionField: "legend.item.label.style.fill",
    value: "#e9e9e9",
    tabName: "custom",
    groupName: "legend",
  },
  // X轴 xAxis
  {
    label: "标题",
    type: "input",
    field: "xAxis_title_text",
    optionField: "xAxis.title.text",
    value: "",
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标题位置",
    type: "select",
    field: "xAxis_title_position",
    optionField: "xAxis.title.position",
    value: "end",
    tabName: "custom",
    options: [
      {
        label: "左",
        value: "start",
      },
      {
        label: "中",
        value: "middle",
      },
      {
        label: "右",
        value: "end",
      },
    ],
    groupName: "xAxis",
  },
  {
    label: "标题字体大小",
    type: "inputNumber",
    field: "xAxis_title_style_fontSize",
    optionField: "xAxis.title.style.fontSize",
    value: 12,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标题颜色",
    type: "colorPicker",
    field: "xAxis_title_style_fill",
    optionField: "xAxis.title.style.fill",
    // 是否多选
    multiple: false,
    value: "#e9e9e9",
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签大小",
    type: "inputNumber",
    field: "xAxis_label_style_fontSize",
    optionField: "xAxis.label.style.fontSize",
    value: 12,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签颜色",
    type: "colorPicker",
    field: "xAxis_label_style_fill",
    optionField: "xAxis.label.style.fill",
    // 是否多选
    multiple: false,
    value: "#e9e9e9",
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "轴线宽度",
    type: "inputNumber",
    field: "xAxis_domainLine_style_lineWidth",
    optionField: "xAxis.domainLine.style.lineWidth",
    value: 1,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "轴线颜色",
    type: "colorPicker",
    field: "xAxis_domainLine_style_stroke",
    optionField: "xAxis.domainLine.style.stroke",
    // 是否多选
    multiple: false,
    value: "#C9CDD4",
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "刻度线宽度",
    type: "inputNumber",
    field: "xAxis_tick_style_lineWidth",
    optionField: "xAxis.tick.style.lineWidth",
    value: 1,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "刻度线颜色",
    type: "colorPicker",
    field: "xAxis_tick_style_stroke",
    optionField: "xAxis.tick.style.stroke",
    // 是否多选
    multiple: false,
    value: "#C9CDD4",
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签过多时隐藏",
    type: "switch",
    field: "xAxis_label_autoHide",
    optionField: "xAxis.label.autoHide",
    value: true,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签采样间隔",
    type: "inputNumber",
    field: "xAxis_label_mindGap",
    optionField: "xAxis.label.minGap",
    value: 0,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签过多时旋转",
    type: "switch",
    field: "xAxis_label_autoRotate",
    optionField: "xAxis.label.autoRotate",
    value: true,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "xAxis",
  },
  {
    label: "标签过长时省略",
    type: "switch",
    field: "xAxis_label_autoLimit",
    optionField: "xAxis.label.autoLimit",
    value: true,
    tabName: "custom",
    groupName: "xAxis",
  },
  // Y轴 yAxis
  {
    label: "标题",
    type: "input",
    field: "yAxis_title_text",
    optionField: "yAxis.title.text",
    value: "",
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "标题过长时旋转",
    type: "switch",
    field: "yAxis_title_autoRotate",
    optionField: "yAxis.title.autoRotate",
    value: true,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "标题位置",
    type: "select",
    field: "yAxis_title_position",
    optionField: "yAxis.title.position",
    value: "end",
    tabName: "custom",
    options: [
      {
        label: "上",
        value: "end",
      },
      {
        label: "中",
        value: "middle",
      },
      {
        label: "下",
        value: "start",
      },
    ],
    groupName: "yAxis",
  },
  {
    label: "标题字体大小",
    type: "inputNumber",
    field: "yAxis_title_style_fontSize",
    optionField: "yAxis.title.style.fontSize",
    value: 12,
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "标题颜色",
    type: "colorPicker",
    field: "yAxis_title_style_fill",
    optionField: "yAxis.title.style.fill",
    // 是否多选
    multiple: false,
    value: "#e9e9e9",
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "显示标签",
    type: "switch",
    field: "yAxis_label_visible",
    optionField: "yAxis.label.visible",
    value: true,
    active: true,
    inactive: false,
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "标签字体大小",
    type: "inputNumber",
    field: "yAxis_label_style_fontSize",
    optionField: "yAxis.label.style.fontSize",
    value: 12,
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "标签颜色",
    type: "colorPicker",
    field: "yAxis_label_style_fill",
    optionField: "yAxis.label.style.fill",
    // 是否多选
    multiple: false,
    value: "#e9e9e9",
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "轴线宽度",
    type: "inputNumber",
    field: "yAxis_domainLine_lineWidth",
    optionField: "yAxis.domainLine.style.lineWidth",
    value: 0,
    tabName: "custom",
    groupName: "yAxis",
  },
  {
    label: "轴线颜色",
    type: "colorPicker",
    field: "yAxis_domainLine_stroke",
    optionField: "yAxis.domainLine.style.stroke",
    // 是否多选
    multiple: false,
    value: "#C9CDD4",
    tabName: "custom",
    groupName: "yAxis",
  },
  // 内边距 appendPadding
  {
    label: "",
    type: "appendPadding",
    field: "padding",
    optionField: "padding",
    value: [0, 0, 0, 0],
    tabName: "custom",
    groupName: "appendPadding",
  },
];

// 模拟数据
const data = [
  { date: "2018年", value: 300, type: "已处理" },
  { date: "2019年", value: 200, type: "已处理" },
  { date: "2020年", value: 100, type: "已处理" },
  { date: "2021年", value: 200, type: "已处理" },
  { date: "2022年", value: 300, type: "已处理" },
  { date: "2023年", value: 400, type: "已处理" },
  { date: "2018年", value: 200, type: "未处理" },
  { date: "2019年", value: 300, type: "未处理" },
  { date: "2020年", value: 200, type: "未处理" },
  { date: "2021年", value: 100, type: "未处理" },
  { date: "2022年", value: 200, type: "未处理" },
  { date: "2023年", value: 300, type: "未处理" },
];

// 配置处理脚本
const optionHandler = `
  option.axes = [
    {
      ...option.yAxis, 
      orient: 'left', 
      grid: { 
        style: { ...option.yAxis.grid.style, lineDash: [option.yAxis.grid.style.lineDash] } 
      },
      title: {
        visible: true,
        ...option.yAxis.title,
      } 
    }, 
    { 
      orient: 'bottom', 
      ...option.xAxis,
      title: {
        visible: true,
        ...option.xAxis.title,
      } 
    }
  ]; 
  delete option.xAxis; 
  delete option.yAxis;
  option.legends = [{type: 'discrete', ...option.legend}];
`;

// 数据处理脚本
const dataHandler = "";

const option = {
  type: "bar",
  background: "rgba(0,0,0,0)",
  data: [
    {
      values: data,
    },
  ],
  animation: false,
  tooltip: {
    visible: true,
  },
  xField: ["date"],
  yField: "value",
  seriesField: "type",
  stack: true,
};
export default {
  version,
  title,
  name,
  option,
  setting,
  optionHandler,
  dataHandler,
};
