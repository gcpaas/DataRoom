export interface PieProjection {
  cx: number
  cy: number
  radius: number
  inner: number
  squash: number
  depth: number
}
export interface PieFace {
  kind: 'top' | 'outer' | 'inner' | 'cut'
  points: number[][]
  order: number
}
export const projectPoint = (angle: number, radius: number, p: PieProjection, down = 0): number[] => [
  p.cx + Math.cos(angle) * radius,
  p.cy + Math.sin(angle) * radius * p.squash + down,
]

function arc(start: number, end: number, radius: number, p: PieProjection, down = 0) {
  const count = Math.max(1, Math.ceil(Math.abs(end - start) / (Math.PI / 90)))
  return Array.from({ length: count + 1 }, (_, i) => projectPoint(start + ((end - start) * i) / count, radius, p, down))
}

/** 正交倾斜投影：外壁只绘制前半圈，内壁只绘制后半圈，顶面统一置于侧壁上层。 */
export function sectorFaces(start: number, end: number, p: PieProjection, exposedCuts = false): PieFace[] {
  if (end - start < 1e-10 || p.radius <= 0) return []
  const faces: PieFace[] = []
  if (p.depth > 0) {
    for (const [kind, radius] of [
      ['outer', p.radius],
      ['inner', p.inner],
    ] as const) {
      if (radius <= 0) continue
      // 每个半圈均单独裁分，可覆盖负角度及跨越 2π 的旋转。
      for (let k = Math.floor(start / Math.PI); k * Math.PI < end; k++) {
        const a = Math.max(start, k * Math.PI)
        const b = Math.min(end, (k + 1) * Math.PI)
        const front = Math.sin((a + b) / 2) > 0
        if (b <= a || (kind === 'outer' ? !front : front)) continue
        faces.push({ kind, points: [...arc(a, b, radius, p), ...arc(b, a, radius, p, p.depth)], order: 100 + Math.sin((a + b) / 2) * 50 })
      }
    }
    if (exposedCuts && end - start < Math.PI * 2 - 1e-8) {
      for (const [angle, visible] of [
        [start, Math.cos(start) < 0],
        [end, Math.cos(end) > 0],
      ] as const) {
        if (visible)
          faces.push({
            kind: 'cut',
            order: 100 + Math.sin(angle) * 50,
            points: [projectPoint(angle, p.inner, p), projectPoint(angle, p.radius, p), projectPoint(angle, p.radius, p, p.depth), projectPoint(angle, p.inner, p, p.depth)],
          })
      }
    }
  }
  faces.push({ kind: 'top', order: 1000, points: [...arc(start, end, p.radius, p), ...(p.inner > 0 ? arc(end, start, p.inner, p) : [[p.cx, p.cy]])] })
  return faces
}
