export interface ExcelEditorData {
  name: string
  tableName: string
  uploadId: string
  columns: unknown[]
  originalFileName: string
  importMode: string
}

export const buildExcelUpdatePayload = <T extends { name: string; dataSourceType: string; dataSource: unknown }>(
  currentDataSource: T,
  editorData: ExcelEditorData
): T & { dataSourceType: 'excel' } => {
  return {
    ...currentDataSource,
    name: editorData.name,
    dataSourceType: 'excel',
    dataSource: currentDataSource.dataSource
  }
}
