import type { Point } from '../types'

/* eslint-disable prefer-rest-params */
export function randomExtend(minNum: number, maxNum: number) {
  if (arguments.length === 1)
    return Number.parseInt((Math.random() * minNum + 1).toString(), 10)

  else
    return Number.parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10)
}

export function debounce<T>(delay: number, callback: (...args: T[]) => void, vm: T) {
  let lastTime: NodeJS.Timeout
  return function () {
    clearTimeout(lastTime)
    lastTime = setTimeout(() => {
      callback.call(vm, ...arguments)
    }, delay)
  }
}
export function observerDomResize(dom: HTMLElement, callback: () => void) {
  const MutationObserver = window.MutationObserver

  const observer = new MutationObserver(callback)

  observer.observe(dom, { attributes: true, attributeFilter: ['style'], attributeOldValue: true })

  return observer
}

export function getPointDistance(pointOne: number[], pointTwo: number[]) {
  const minusX = Math.abs(pointOne[0] - pointTwo[0])

  const minusY = Math.abs(pointOne[1] - pointTwo[1])

  return Math.sqrt(minusX * minusX + minusY * minusY)
}

/**
 * @description Get the coordinates of the specified radian on the circle
 * @param {number} x      Circle x coordinate
 * @param {number} y      Circle y coordinate
 * @param {number} radius Circle radius
 * @param {number} radian Specfied radian
 * @return {Array} Postion of point
 */

export function getCircleRadianPoint(x: number, y: number, radius: number, radian: number) {
  return [x + Math.cos(radian) * radius, y + Math.sin(radian) * radius]
}

function filterNonNumber(array: Array<number>) {
  return array.filter((n) => {
    return typeof n === 'number'
  })
}

function mulAdd(nums: Array<number>) {
  nums = filterNonNumber(nums)
  return nums.reduce((all, num) => {
    return all + num
  }, 0)
}

function getTwoPointDistance(pointOne: Point, pointTwo: Point) {
  const minusX = Math.abs(pointOne.x - pointTwo.x)
  const minusY = Math.abs(pointOne.y - pointTwo.y)
  return Math.sqrt(minusX * minusX + minusY * minusY)
}

export function getPolylineLength(points: Array<Point>) {
  const lineSegments = Array.from({ length: points.length - 1 }).fill(0).map((foo, i) => {
    return [points[i], points[i + 1]]
  })
  const lengths = lineSegments.map((item) => {
    return getTwoPointDistance(item[0], item[1])
  })
  return mulAdd(lengths)
}

function PointToString(point: Point) {
  return `${point.x},${point.y}`
}

export function PointsToString(points: Array<Point>) {
  return points.map(PointToString).join(' ')
}

export function uuid(hasHyphen?: boolean) {
  return (hasHyphen ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx').replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function deepMerge(target: any, merged: any) {
  for (const key in merged) {
    if (target[key] && typeof target[key] === 'object') {
      deepMerge(target[key], merged[key])

      continue
    }

    if (typeof merged[key] === 'object') {
      target[key] = deepClone(merged[key], true)

      continue
    }

    target[key] = merged[key]
  }

  return target
}

/**
 * @description Clone an object or array
 * @param {object | Array} object Cloned object
 * @param {boolean} recursion   Whether to use recursive cloning
 * @return {object | Array} Clone object
 */
export function deepClone(object: any, recursion: boolean) {
  if (!object)
    return object
  const { parse, stringify } = JSON
  if (!recursion)
    return parse(stringify(object))
  const clonedObj: Record<string, any> = Array.isArray(object) ? [] : {}

  if (object && typeof object === 'object') {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        if (object[key] && typeof object[key] === 'object')
          clonedObj[key] = deepClone(object[key], true)

        else
          clonedObj[key] = object[key]
      }
    }
  }

  return clonedObj
}
