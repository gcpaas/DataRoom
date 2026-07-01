/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import { aiGenerationActions } from './ai-generation-content.ts'

test('keeps the 618 monitoring dashboard case as the final AI generation action', () => {
  const finalAction = aiGenerationActions[aiGenerationActions.length - 1]

  assert.equal(finalAction?.title, '案例')
  assert.equal(finalAction?.content, '/dataroom-page 生成一个618监控大屏')
})
