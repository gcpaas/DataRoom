import thumbnail from './images/data-table.svg'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrDataTablePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrDataTable', '数据表格', '数据表格、明细表、列表、分页、搜索、排序、设备清单、告警记录', thumbnail, tags)
  }
}
