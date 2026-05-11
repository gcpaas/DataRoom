import { buildExcelUpdatePayload } from './excelSave'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const columns = [
  {
    name: 'city',
    type: 'VARCHAR',
    primaryKey: false,
    originalHeader: '城市'
  }
]

const current = {
  id: '1',
  code: 'DS_1',
  name: '旧名称',
  dataSourceType: 'excel',
  dataSource: {
    dataSourceType: 'excel',
    tableName: 'excel_city',
    columns,
    originalFileName: 'city.xlsx',
    rowCount: 12,
    importMode: 'overwrite'
  }
}

const result = buildExcelUpdatePayload(current, {
  name: '新名称',
  tableName: 'excel_city',
  uploadId: '',
  columns,
  originalFileName: '',
  importMode: 'overwrite'
})

assert(result.name === '新名称', 'should update the datasource name')
assert(result.code === 'DS_1', 'should keep the datasource code')
assert(result.dataSource === current.dataSource, 'should keep existing Excel config when no file is uploaded')
