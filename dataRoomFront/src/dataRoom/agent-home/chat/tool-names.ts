/**
 * 工具名中文显示映射。未收录的工具名原样展示。
 */
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  // DataRoom MCP 工具
  newPage: '创建页面',
  updatePageConfig: '保存页面配置',
  listPages: '查询页面列表',
  getPageDesignConfig: '读取页面配置',
  listComponents: '查询可用组件',
  getComponentConfig: '获取组件配置',
  getPageConfig: '获取页面配置模板',
  getVisualScreenPageConfig: '获取大屏配置模板',
  getDatasetDetail: '查询数据集详情',
  insertDataset: '创建数据集',
  updateDataset: '更新数据集',
  runDataset: '执行数据集',
  // 平台内置工具
  load_skill_through_path: '加载技能',
}

/**
 * 工具名转中文显示名
 */
export const toolDisplayName = (toolName?: string): string => {
  if (!toolName) {
    return ''
  }
  return TOOL_DISPLAY_NAMES[toolName] || toolName
}
