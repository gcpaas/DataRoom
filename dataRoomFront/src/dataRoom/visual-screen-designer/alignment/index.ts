export type VisualScreenAlignmentCommand =
  | 'left'
  | 'horizontal-center'
  | 'right'
  | 'top'
  | 'vertical-center'
  | 'bottom'
  | 'horizontal-distribute'
  | 'vertical-distribute'

export type VisualScreenAlignmentItemKind = 'alignment' | 'distribution'

export interface VisualScreenAlignmentChart {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface VisualScreenAlignmentResult {
  changed: boolean
  changedIds: string[]
}

export interface VisualScreenAlignmentMenuItem {
  command: VisualScreenAlignmentCommand
  label: string
  kind: VisualScreenAlignmentItemKind
}

interface VisualScreenSelectionBounds {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

const alignmentItems: VisualScreenAlignmentMenuItem[] = [
  { command: 'left', label: '左对齐', kind: 'alignment' },
  { command: 'horizontal-center', label: '水平居中', kind: 'alignment' },
  { command: 'right', label: '右对齐', kind: 'alignment' },
  { command: 'top', label: '顶端对齐', kind: 'alignment' },
  { command: 'vertical-center', label: '垂直居中', kind: 'alignment' },
  { command: 'bottom', label: '底端对齐', kind: 'alignment' },
  { command: 'horizontal-distribute', label: '横向分布', kind: 'distribution' },
  { command: 'vertical-distribute', label: '纵向分布', kind: 'distribution' },
]

const getSelectionBounds = (charts: VisualScreenAlignmentChart[]): VisualScreenSelectionBounds | null => {
  if (charts.length === 0) {
    return null
  }

  const left = Math.min(...charts.map((item) => item.x))
  const right = Math.max(...charts.map((item) => item.x + item.w))
  const top = Math.min(...charts.map((item) => item.y))
  const bottom = Math.max(...charts.map((item) => item.y + item.h))
  const width = right - left
  const height = bottom - top

  return {
    left,
    right,
    top,
    bottom,
    centerX: left + width / 2,
    centerY: top + height / 2,
    width,
    height,
  }
}

const rememberPosition = (charts: VisualScreenAlignmentChart[]) => {
  return new Map(charts.map((item) => [item.id, { x: item.x, y: item.y }]))
}

const collectChangedIds = (charts: VisualScreenAlignmentChart[], before: Map<string, { x: number; y: number }>) => {
  return charts.filter((item) => {
    const previous = before.get(item.id)
    return previous ? previous.x !== item.x || previous.y !== item.y : false
  }).map((item) => item.id)
}

const distributeHorizontally = (charts: VisualScreenAlignmentChart[], bounds: VisualScreenSelectionBounds) => {
  if (charts.length < 3) {
    return
  }

  const sorted = [...charts].sort((a, b) => {
    if (a.x === b.x) {
      return a.id.localeCompare(b.id)
    }
    return a.x - b.x
  })
  const totalWidth = sorted.reduce((sum, item) => sum + item.w, 0)
  const gap = (bounds.width - totalWidth) / (sorted.length - 1)
  let nextX = sorted[0]!.x

  sorted.forEach((item, index) => {
    if (index === 0 || index === sorted.length - 1) {
      nextX = item.x + item.w + gap
      return
    }
    item.x = nextX
    nextX = item.x + item.w + gap
  })
}

const distributeVertically = (charts: VisualScreenAlignmentChart[], bounds: VisualScreenSelectionBounds) => {
  if (charts.length < 3) {
    return
  }

  const sorted = [...charts].sort((a, b) => {
    if (a.y === b.y) {
      return a.id.localeCompare(b.id)
    }
    return a.y - b.y
  })
  const totalHeight = sorted.reduce((sum, item) => sum + item.h, 0)
  const gap = (bounds.height - totalHeight) / (sorted.length - 1)
  let nextY = sorted[0]!.y

  sorted.forEach((item, index) => {
    if (index === 0 || index === sorted.length - 1) {
      nextY = item.y + item.h + gap
      return
    }
    item.y = nextY
    nextY = item.y + item.h + gap
  })
}

export const applyVisualScreenAlignment = (
  charts: VisualScreenAlignmentChart[],
  command: VisualScreenAlignmentCommand,
): VisualScreenAlignmentResult => {
  const bounds = getSelectionBounds(charts)
  if (!bounds) {
    return {
      changed: false,
      changedIds: [],
    }
  }

  const before = rememberPosition(charts)

  if (command === 'left') {
    charts.forEach((item) => {
      item.x = bounds.left
    })
  } else if (command === 'horizontal-center') {
    charts.forEach((item) => {
      item.x = bounds.centerX - item.w / 2
    })
  } else if (command === 'right') {
    charts.forEach((item) => {
      item.x = bounds.right - item.w
    })
  } else if (command === 'top') {
    charts.forEach((item) => {
      item.y = bounds.top
    })
  } else if (command === 'vertical-center') {
    charts.forEach((item) => {
      item.y = bounds.centerY - item.h / 2
    })
  } else if (command === 'bottom') {
    charts.forEach((item) => {
      item.y = bounds.bottom - item.h
    })
  } else if (command === 'horizontal-distribute') {
    distributeHorizontally(charts, bounds)
  } else if (command === 'vertical-distribute') {
    distributeVertically(charts, bounds)
  }

  const changedIds = collectChangedIds(charts, before)
  return {
    changed: changedIds.length > 0,
    changedIds,
  }
}

export const getVisualScreenAlignmentItems = (selectedCount: number) => {
  return alignmentItems.filter((item) => item.kind === 'alignment' || selectedCount >= 3)
}

export const getVisualScreenAlignmentLabel = (command: VisualScreenAlignmentCommand) => {
  return alignmentItems.find((item) => item.command === command)?.label || '对齐'
}
