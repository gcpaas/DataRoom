import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { isChartHidden } from '../../designer/utils/chart-visibility.ts'

export const getVisualScreenScopedChartIdByElement = (element: Element | null) => {
  const wrapper = element?.closest<HTMLElement>('.chart-wrapper[data-dr-scope-child="true"]')
  return wrapper?.getAttribute('data-dr-id') || null
}

export const getVisualScreenScopedChartIdsByElements = (elements: Array<Element>) => {
  return Array.from(new Set(elements.map((target) => getVisualScreenScopedChartIdByElement(target)).filter((chartId): chartId is string => Boolean(chartId))))
}

export const normalizeVisualScreenSelectedChartIds = (chartIds: string[], currentScopeCharts: ChartConfig<unknown>[]) => {
  const selectableChartIds = new Set(currentScopeCharts.filter((chart) => !isChartHidden(chart)).map((chart) => chart.id))
  const uniqueIds = Array.from(new Set(chartIds))
  return uniqueIds.filter((chartId) => selectableChartIds.has(chartId))
}

export const getRenderableSelectedChartIds = (selectedChartIds: string[], renderedTargetIds: string[]) => {
  const renderedIdSet = new Set(renderedTargetIds)
  return selectedChartIds.filter((chartId) => renderedIdSet.has(chartId))
}

export const getVisualScreenRenderableSelectedTargets = <T extends Element>(selectedChartIds: string[], renderedTargets: T[]) => {
  const targetById = new Map(renderedTargets.map((target) => [target.getAttribute('data-dr-id'), target]))
  return selectedChartIds.map((chartId) => targetById.get(chartId)).filter((target): target is T => Boolean(target))
}

export const shouldBlockVisualScreenIframeInteraction = (mode: 'designer' | 'preview', chartType: string, iframeInteractionEnabled: boolean) => {
  return mode === 'designer' && ['DrIframe', 'DrHtml'].includes(chartType) && !iframeInteractionEnabled
}

export interface VisualScreenChartTreeClickEventLike {
  ctrlKey: boolean
  metaKey: boolean
}

export const shouldHandleVisualScreenChartTreeClick = (event: VisualScreenChartTreeClickEventLike) => {
  void event
  return true
}

export const shouldToggleVisualScreenChartTreeClickSelection = (event: VisualScreenChartTreeClickEventLike) => {
  return event.ctrlKey || event.metaKey
}

export interface VisualScreenSelectoDragStartEventLike {
  ctrlKey?: boolean
  metaKey?: boolean
}

export const shouldStopVisualScreenSelectoDragStart = (
  chartId: string | null,
  selectedChartIds: string[],
  _event: VisualScreenSelectoDragStartEventLike = {},
) => {
  void _event
  return Boolean(chartId && selectedChartIds.includes(chartId))
}

export const isVisualScreenMoveableEventTarget = (target: EventTarget | null) => {
  const element = target as { closest?: (selector: string) => Element | null } | null
  return Boolean(element?.closest?.('[class*="moveable-"]'))
}

export interface VisualScreenControlPanelSelectionStateOptions {
  selectedChartCount: number
  panelVisible: boolean
  showingPageSettings: boolean
}

export const getVisualScreenControlPanelSelectionState = (options: VisualScreenControlPanelSelectionStateOptions) => {
  const { selectedChartCount, panelVisible } = options

  if (selectedChartCount === 0) {
    return {
      panelVisible,
      showingPageSettings: true,
    }
  }

  if (selectedChartCount === 1) {
    return {
      panelVisible: true,
      showingPageSettings: false,
    }
  }

  return {
    panelVisible,
    showingPageSettings: false,
  }
}
