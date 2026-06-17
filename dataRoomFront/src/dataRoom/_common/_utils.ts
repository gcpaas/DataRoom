import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";

/**
 * 根据图表HTML对象获取对应的图表配置
 * @param e
 * @param chartList
 */
export const getChartByElement = (e: HTMLElement | SVGElement, chartList: ChartConfig<unknown>[]): ChartConfig<unknown> => {
  const dataDrId: string | null = e.getAttribute('data-dr-id')
  if (!dataDrId) {
    console.error(`未找到data-dr-id 配置`, e)
    throw new Error(`未找到data-dr-id配置`)
  }
  const chart = getChartById(dataDrId, chartList)
  if (!chart) {
    console.error(`未找到data-dr-id = ${dataDrId} 组件`, e)
    throw new Error(`未找到data-dr-id = ${dataDrId} 组件`)
  }
  return chart
}
/**
 * 根据id获取对应的图表配置
 * @param id
 * @param chartList
 */
export const getChartById = (id: string, chartList: ChartConfig<unknown>[]): ChartConfig<unknown> => {
  const chart = _getChartById(id, chartList)
  if (!chart) {
    console.error(`未找到id = ${id} 组件`)
    throw new Error(`未找到id = ${id} 组件`)
  }
  return chart
}
/**
 * 内部方法、递归查询、兼容容器组件
 * @param id
 * @param chartList
 */
const _getChartById = (id: string, chartList: ChartConfig<unknown>[] | undefined): ChartConfig<unknown> | undefined => {
  if (!chartList || chartList.length === 0) {
    return undefined
  }
  for (let i = 0; i < chartList.length; i++) {
    const chart = chartList[i]!
    if (chart.id === id) {
      return chart
    }
    const chartChild = _getChartById(id, chart.children)
    if (chartChild) {
      return chartChild
    }
  }
}
/**
 * 根据id删除对应组件
 * @param id
 * @param list
 */
export const deleteChartById = (id: string, list: ChartConfig<unknown>[]): boolean => {
  // 遍历数组，查找匹配id的元素
  for (let i = 0; i < list.length; i++) {
    const item = list[i]!
    //  如果当前元素匹配id，直接删除
    if (item.id === id) {
      list.splice(i, 1)
      return true
    }
    // 如果当前元素有children，递归检查子数组
    if (item.children && item.children.length > 0) {
      const deleted = deleteChartById(id, item.children)
      if (deleted) {
        return true
      }
    }
  }
  // 遍历完未找到匹配id
  return false
}

/**
 * 从transform中提取坐标、旋转信息
 * @param transform 格式：translate(60px, 60px) rotateZ(60deg) rotateX(60deg) rotateY(60deg)
 */
export const extractPositionFromTransform = (
  transformStr: string,
): {
  x: number
  y: number
  rotateX: number
  rotateY: number
  rotateZ: number
} => {
  const result = {
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }
  const translateReg = /translate\s*\(\s*([-+]?\d+(\.\d+)?)(?:px)?\s*,\s*([-+]?\d+(\.\d+)?)(?:px)?\s*\)/i
  const translateMatch = transformStr.match(translateReg)
  if (translateMatch) {
    // @ts-expect-error ignore
    result.x = parseFloat(translateMatch[1])
    // @ts-expect-error ignore
    result.y = parseFloat(translateMatch[3])
  }
  const rotateXReg = /rotateX\s*\(\s*([-+]?\d+(\.\d+)?)(?:deg)?\s*\)/i
  const rotateXMatch = transformStr.match(rotateXReg)
  if (rotateXMatch) {
    // @ts-expect-error ignore
    result.rotateX = parseFloat(rotateXMatch[1])
  }
  const rotateYReg = /rotateY\s*\(\s*([-+]?\d+(\.\d+)?)(?:deg)?\s*\)/i
  const rotateYMatch = transformStr.match(rotateYReg)
  if (rotateYMatch) {
    // @ts-expect-error ignore
    result.rotateY = parseFloat(rotateYMatch[1])
  }
  const rotateReg = /rotate\s*\(\s*([-+]?\d+(\.\d+)?)(?:deg)?\s*\)/i
  const rotateMatch = transformStr.match(rotateReg)
  if (rotateMatch) {
    // @ts-expect-error ignore
    result.rotateZ = parseFloat(rotateMatch[1])
  } else {
    const rotateZReg = /rotateZ\s*\(\s*([-+]?\d+(\.\d+)?)(?:deg)?\s*\)/i
    const rotateZMatch = transformStr.match(rotateZReg)
    if (rotateZMatch) {
      // @ts-expect-error ignore
      result.rotateZ = parseFloat(rotateZMatch[1])
    }
  }
  return result
}

export const normalizeChartTransformPosition = (position: {
  x: number
  y: number
  rotateX: number
  rotateY: number
  rotateZ: number
}) => {
  return {
    ...position,
    x: Math.round(position.x),
    y: Math.round(position.y),
  }
}

type ChartTransformStateTarget = Pick<ChartConfig<unknown>, 'x' | 'y' | 'w' | 'h' | 'rotateX' | 'rotateY' | 'rotateZ'>

type ChartTransformStateInput = {
  transform: string
  width?: number
  height?: number
}

const resolveChartTransformSize = (value: number | undefined, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export const applyChartTransformState = (
  chart: ChartTransformStateTarget,
  { transform, width, height }: ChartTransformStateInput,
) => {
  const { x, y, rotateX, rotateY, rotateZ } = normalizeChartTransformPosition(extractPositionFromTransform(transform))
  chart.x = x
  chart.y = y
  chart.w = resolveChartTransformSize(width, chart.w)
  chart.h = resolveChartTransformSize(height, chart.h)
  chart.rotateX = rotateX
  chart.rotateY = rotateY
  chart.rotateZ = rotateZ
}

/**
 * 根据文件夹路径获取父文件夹名称
 * @param filePath
 */
export const getParentFolderName = (filePath: string): string => {
  const pathParts = new URL(filePath).pathname.split('/')
  // @ts-expect-error ignore
  return pathParts[pathParts.length - 2]
}

/**
 * 解析字符串中的参数
 * 匹配 #{paramName} 格式的参数，并返回去重后的参数名数组
 * @param text 需要解析的字符串
 * @returns 参数名数组，如果没有识别出参数则返回空数组
 */
export const parseParams = (text: string): string[] => {
  if (!text) {
    return []
  }

  // 使用正则匹配 #{paramName} 格式的参数
  const regex = /#\{([^}]+)\}/g
  const matches = [...text.matchAll(regex)]

  if (matches.length === 0) {
    return []
  }

  // @ts-expect-error 提取参数名、去除空格并去重
  const paramNames = [...new Set(matches.map(match => match[1].trim()))]

  return paramNames
}

/**
 * 解析多个字符串中的参数
 * 匹配 #{paramName} 格式的参数，并返回去重后的参数名数组
 * @param texts 需要解析的字符串数组
 * @returns 参数名数组，如果没有识别出参数则返回空数组
 */
export const parseParamsFromMultiple = (texts: string[]): string[] => {
  if (!texts || texts.length === 0) {
    return []
  }

  const allParams = new Set<string>()

  texts.forEach(text => {
    const params = parseParams(text)
    params.forEach(param => allParams.add(param))
  })

  return Array.from(allParams)
}


/**
 *  拼接素材地址
 */
const joinBaseUrl = (baseUrl: string, url: string): string => {
  if (!baseUrl) {
    return url
  }
  return baseUrl + (baseUrl.endsWith('/') ? '' : '/') + (url.startsWith('/') ? url.substring(1) : url)
}

export const getResourceUrl = (url?: string): string => {
  if (!url) {
    return ''
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/dataRoom/resource/file/')) {
    return joinBaseUrl(import.meta.env.VITE_API_BASE_URL || '', url)
  }
  const resourceBaseUrl = import.meta.env.VITE_RESOURCE_BASE_URL || ''
  return joinBaseUrl(resourceBaseUrl, url)
}

/**
 * 获取指定字段在数据集中对应的值，适用于获取单个值场景
 * @param chart
 * @param fieldName
 */
const isRecordValue = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

export const getSingleDatasetValueByField = <T = string>(chart: ChartConfig<unknown>, fieldName: string, datasetValue: unknown): T | undefined => {
  const fieldValueList: string[] | undefined = chart.dataset?.fields?.[fieldName]
  if (!fieldValueList) {
    return undefined
  }
  if (!Array.isArray(fieldValueList)) {
    console.error(`组件 ${chart.id} 数据集字段 ${fieldName} 配置错误,要求是数组`)
    return undefined
  }
  if (fieldValueList.length === 0) {
    console.error(`组件 ${chart.id} 数据集字段 ${fieldName} 配置错误,要求至少有一个值`)
    return undefined
  }
  const finalFieldName: string = fieldValueList[0]!
  if (Array.isArray(datasetValue)) {
    if (datasetValue.length === 0) {
      console.error(`组件 ${chart.id} 对应的数据集数据为空`)
      return undefined
    }
    const firstValue = datasetValue[0]
    return isRecordValue(firstValue) ? firstValue[finalFieldName] as T : undefined
  }
  return isRecordValue(datasetValue) ? datasetValue[finalFieldName] as T : undefined
}
