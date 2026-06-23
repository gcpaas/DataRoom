import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { getCookie, getCookieName } from '@/dataRoom/utils/cookie.ts'
import { isStreamingDatasetType } from '@/dataRoom/dataset/streaming-dataset.ts'

interface UseRealtimeDatasetOptions {
  canvasInst: RealtimeDatasetCanvasInst
}

interface RealtimeDatasetMessage {
  type?: string
  datasetCode?: string
  data?: unknown
}

interface DatasetSubscription {
  datasetCode: string
  paramMap: Record<string, unknown>
}

type RealtimeDatasetCanvasInst = Omit<CanvasInst, 'chartList'> & {
  chartList: CanvasInst['chartList'] | ChartConfig<unknown>[]
}

const DEFAULT_REALTIME_DATASET_PATH = '/dataRoom/dataset/ws/subscribe'

const walkCharts = (
  chartList: ChartConfig<unknown>[],
  callback: (chart: ChartConfig<unknown>) => void
) => {
  for (const chart of chartList) {
    callback(chart)
    if (chart.children?.length) {
      walkCharts(chart.children, callback)
    }
  }
}

const normalizeDatasetData = (data: unknown) => {
  if (data == null) {
    return []
  }
  return Array.isArray(data) ? data : [data]
}

const getChartList = (canvasInst: RealtimeDatasetCanvasInst) => {
  return Array.isArray(canvasInst.chartList) ? canvasInst.chartList : canvasInst.chartList.value
}

const toWebSocketProtocol = (url: URL) => {
  if (url.protocol === 'https:') {
    url.protocol = 'wss:'
    return
  }
  if (url.protocol === 'http:') {
    url.protocol = 'ws:'
  }
}

const joinPath = (basePath: string, path: string) => {
  return `${basePath.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

const resolveRealtimeDatasetUrl = () => {
  const httpUrl = new URL(import.meta.env.VITE_API_BASE_URL || '/', window.location.origin)
  toWebSocketProtocol(httpUrl)
  httpUrl.pathname = joinPath(httpUrl.pathname, DEFAULT_REALTIME_DATASET_PATH)

  const cookieName = getCookieName()
  const cookieValue = getCookie(cookieName)
  if (cookieValue) {
    httpUrl.searchParams.set(cookieName, cookieValue)
  }
  return httpUrl.toString()
}

export function useRealtimeDataset(options: UseRealtimeDatasetOptions) {
  const { canvasInst } = options
  const datasetChartMap = new Map<string, string[]>()
  const latestDataMap = new Map<string, unknown>()
  const pendingChartIds = new Set<string>()
  let socket: WebSocket | null = null
  let animationFrameId = 0
  let activeDatasetCodesKey = ''

  const buildDatasetIndex = () => {
    datasetChartMap.clear()
    const subscriptions: DatasetSubscription[] = []

    walkCharts(getChartList(canvasInst), (chart) => {
      const datasetCode = chart.dataset?.code
      if (!datasetCode || !isStreamingDatasetType(chart.dataset?.datasetType)) {
        return
      }

      const chartIds = datasetChartMap.get(datasetCode) || []
      chartIds.push(chart.id)
      datasetChartMap.set(datasetCode, chartIds)

      subscriptions.push({
        datasetCode,
        paramMap: canvasInst.fillDatasetParams(chart),
      })
    })

    return subscriptions
  }

  const flushPendingChartData = () => {
    animationFrameId = 0

    pendingChartIds.forEach((chartId) => {
      const data = latestDataMap.get(chartId)
      pendingChartIds.delete(chartId)

      try {
        const chartInstance = canvasInst.getChartInstanceById(chartId)
        chartInstance.exposed?.changeData?.(data)
      } catch (error) {
        console.error(`实时数据更新组件失败: ${chartId}`, error)
      }
    })
  }

  const scheduleChartUpdate = (chartId: string, data: unknown) => {
    latestDataMap.set(chartId, data)
    pendingChartIds.add(chartId)

    if (!animationFrameId) {
      animationFrameId = window.requestAnimationFrame(flushPendingChartData)
    }
  }

  const dispatchDatasetData = (datasetCode: string, data: unknown) => {
    const chartIds = datasetChartMap.get(datasetCode) || []
    const normalizedData = normalizeDatasetData(data)

    chartIds.forEach((chartId) => {
      scheduleChartUpdate(chartId, normalizedData)
    })
  }

  const sendSubscriptions = (subscriptions: DatasetSubscription[]) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || subscriptions.length === 0) {
      return
    }

    socket.send(JSON.stringify({
      type: 'subscribe',
      datasetCodes: [...datasetChartMap.keys()],
      subscriptions,
    }))
  }

  const close = () => {
    activeDatasetCodesKey = ''

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
    pendingChartIds.clear()
    latestDataMap.clear()

    if (socket) {
      socket.close()
      socket = null
    }
  }

  const reload = () => {
    const subscriptions = buildDatasetIndex()
    const datasetCodes = [...datasetChartMap.keys()]
    const datasetCodesKey = datasetCodes.slice().sort().join(',')

    if (datasetCodes.length === 0) {
      close()
      return
    }

    if (socket && activeDatasetCodesKey === datasetCodesKey) {
      sendSubscriptions(subscriptions)
      return
    }

    close()
    activeDatasetCodesKey = datasetCodesKey
    socket = new WebSocket(resolveRealtimeDatasetUrl())

    socket.onopen = () => {
      sendSubscriptions(subscriptions)
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as RealtimeDatasetMessage
        if (message.type !== 'datasetData' || !message.datasetCode) {
          return
        }
        dispatchDatasetData(message.datasetCode, message.data)
      } catch (error) {
        console.error('实时数据消息解析失败:', error)
      }
    }

    socket.onerror = (event) => {
      console.error('实时数据连接异常:', event)
    }

    socket.onclose = () => {
      socket = null
    }
  }

  return {
    realtimeDatasetManager: {
      reload,
      close,
    },
  }
}
