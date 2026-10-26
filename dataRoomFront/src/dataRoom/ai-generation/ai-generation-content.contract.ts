/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  aiGenerationActions,
  createMcpConfig,
  resolveMcpTokenExpiry,
  toMcpTokenRecord,
} from './ai-generation-content.ts'

test('keeps the 618 monitoring dashboard case as the final AI generation action', () => {
  const finalAction = aiGenerationActions[aiGenerationActions.length - 1]

  assert.equal(finalAction?.title, '案例')
  assert.equal(finalAction?.content, '/dataroom-page 帮我生成一个618监控大屏')
})

test('uses a dedicated bearer token in MCP configuration', () => {
  assert.deepEqual(createMcpConfig('https://example.test/mcp', 'mcp-secret'), {
    mcpServers: {
      'dataroom-mcp-server': {
        url: 'https://example.test/mcp',
        headers: { Authorization: 'Bearer mcp-secret' },
      },
    },
  })
})

test('resolves preset and custom token expiry as future ISO dates', () => {
  const now = Date.parse('2026-01-01T00:00:00.000Z')

  assert.equal(resolveMcpTokenExpiry(7, null, now), '2026-01-08T00:00:00.000Z')
  assert.equal(resolveMcpTokenExpiry(30, null, now), '2026-01-31T00:00:00.000Z')
  assert.equal(resolveMcpTokenExpiry(90, null, now), '2026-04-01T00:00:00.000Z')
  assert.equal(Date.parse(resolveMcpTokenExpiry(180, null, now)) - now, 180 * 24 * 60 * 60 * 1000)
  assert.equal(Date.parse(resolveMcpTokenExpiry(365, null, now)) - now, 365 * 24 * 60 * 60 * 1000)
  assert.throws(() => resolveMcpTokenExpiry('custom', null, now), /未来/)
  assert.throws(() => resolveMcpTokenExpiry('custom', new Date(now), now), /未来/)
  assert.throws(() => resolveMcpTokenExpiry('custom', new Date('invalid'), now), /未来/)
  assert.equal(resolveMcpTokenExpiry('custom', new Date('2026-02-01T00:00:00.000Z'), now), '2026-02-01T00:00:00.000Z')
  assert.throws(() => resolveMcpTokenExpiry('custom', new Date('2025-12-31T00:00:00.000Z'), now), /未来/)
})

test('keeps only masked token fields in list records', () => {
  assert.deepEqual(toMcpTokenRecord({
    id: '1',
    name: 'desktop',
    tokenPrefix: 'dr_abc...',
    expireTime: '2026-02-01T00:00:00.000Z',
    createDate: '2026-01-01T00:00:00.000Z',
    ...{ token: 'should-not-be-kept' },
  }), {
    id: '1',
    name: 'desktop',
    tokenPrefix: 'dr_abc...',
    expireTime: '2026-02-01T00:00:00.000Z',
    createDate: '2026-01-01T00:00:00.000Z',
  })
})
