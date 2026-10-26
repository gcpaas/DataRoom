import assert from 'node:assert/strict'
import test from 'node:test'

import { consumeDataRoomToken, readCasConfig, resolveCasError, resolveLogoutTarget } from './cas.ts'
import { createMcpConfig, resolveMcpServerUrl } from './ai-generation/ai-generation-content.ts'

test('readCasConfig only enables exact true and trims configured urls', () => {
  assert.deepEqual(
    readCasConfig({
      VITE_CAS_ENABLE: 'true',
      VITE_CAS_LOGIN_URL: ' https://cas.example.com/login ',
      VITE_CAS_LOGOUT_URL: ' https://cas.example.com/logout ',
    }),
    {
      enabled: true,
      loginUrl: 'https://cas.example.com/login',
      logoutUrl: 'https://cas.example.com/logout',
    },
  )
  assert.equal(readCasConfig({ VITE_CAS_ENABLE: 'TRUE' }).enabled, false)
})

test('resolveCasError maps known codes and hides unknown query text', () => {
  assert.deepEqual(resolveCasError('userNotFound'), {
    title: '本地用户不存在',
    description: 'CAS 认证已通过，但 DataRoom 中没有对应账号。',
  })
  assert.deepEqual(resolveCasError('<script>alert(1)</script>'), {
    title: '单点登录失败',
    description: '无法完成单点登录，请返回登录页后重试。',
  })
})

test('consumeDataRoomToken uses the configured token key and preserves unrelated query values', () => {
  assert.deepEqual(
    consumeDataRoomToken({
      customToken: ['jwt-token', 'ignored'],
      source: 'cas',
      empty: null,
    }, 'customToken'),
    {
      token: 'jwt-token',
      query: {
        source: 'cas',
        empty: null,
      },
    },
  )
})

test('resolveLogoutTarget uses cas logout only when cas is enabled and configured', () => {
  assert.equal(resolveLogoutTarget({ enabled: true, loginUrl: '', logoutUrl: 'https://cas.example.com/logout' }), 'https://cas.example.com/logout')
  assert.equal(resolveLogoutTarget({ enabled: true, loginUrl: '', logoutUrl: '' }), '/login')
  assert.equal(resolveLogoutTarget({ enabled: false, loginUrl: '', logoutUrl: 'https://cas.example.com/logout' }), '/login')
})

test('createMcpConfig uses a dedicated MCP bearer token', () => {
  assert.deepEqual(createMcpConfig('https://app.example.com/mcp', 'mcp-token'), {
    mcpServers: {
      'dataroom-mcp-server': {
        url: 'https://app.example.com/mcp',
        headers: {
          Authorization: 'Bearer mcp-token',
        },
      },
    },
  })
})

test('resolveMcpServerUrl uses the configured backend base url and streamable endpoint', () => {
  assert.equal(resolveMcpServerUrl('http://localhost:8081/dataRoom', 'https://app.example.com'), 'http://localhost:8081/dataRoom/mcp')
  assert.equal(resolveMcpServerUrl('https://api.example.com/dataRoom/', 'https://app.example.com'), 'https://api.example.com/dataRoom/mcp')
  assert.equal(resolveMcpServerUrl('/dataRoom/', 'https://app.example.com'), 'https://app.example.com/dataRoom/mcp')
  assert.equal(resolveMcpServerUrl('', 'https://app.example.com'), 'https://app.example.com/mcp')
})
