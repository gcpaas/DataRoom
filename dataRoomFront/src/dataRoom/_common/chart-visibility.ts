import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

export const isChartHidden = (chart: Pick<ChartConfig<unknown>, 'hide'> | undefined) => {
  return chart?.hide === true
}

export const filterVisibleCharts = (charts: ChartConfig<unknown>[] | undefined) => {
  if (!charts?.length) {
    return []
  }

  return charts.filter((chart) => !isChartHidden(chart))
}
