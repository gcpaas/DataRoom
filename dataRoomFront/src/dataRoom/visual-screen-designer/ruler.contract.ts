import test from 'node:test'
import assert from 'node:assert/strict'

import { getGuideAxisFromRulerAxis, getGuideDragOutRulerAxis } from './ruler.ts'

test('maps top ruler drag to a horizontal guide', () => {
  assert.equal(getGuideAxisFromRulerAxis('x'), 'horizontal')
})

test('maps left ruler drag to a vertical guide', () => {
  assert.equal(getGuideAxisFromRulerAxis('y'), 'vertical')
})

test('requires horizontal guides to be dragged down from the top ruler', () => {
  assert.equal(getGuideDragOutRulerAxis('horizontal'), 'y')
})

test('requires vertical guides to be dragged right from the left ruler', () => {
  assert.equal(getGuideDragOutRulerAxis('vertical'), 'x')
})
