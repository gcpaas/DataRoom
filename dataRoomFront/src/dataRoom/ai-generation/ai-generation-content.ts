export interface AiGenerationAction {
  title: string
  desc: string
  content: string
}

export interface McpTokenEntity {
  id: string
  name: string
  tokenPrefix: string
  expireTime: string
  createDate: string
}

export interface McpTokenCreateRequest {
  name: string
  expireTime: string
}

export interface McpTokenCreateResponse extends McpTokenEntity {
  token: string
}

export type McpTokenValidity = 7 | 30 | 90 | 180 | 365 | 'custom'

export const resolveMcpTokenExpiry = (validity: McpTokenValidity, customDate: Date | null, now = Date.now()) => {
  const expiresAt = validity === 'custom' ? customDate?.getTime() : now + validity * 24 * 60 * 60 * 1000
  if (expiresAt === undefined || !Number.isFinite(expiresAt) || expiresAt <= now) {
    throw new Error('请选择未来的有效期')
  }
  return new Date(expiresAt).toISOString()
}

// 显式挑选列表字段，避免创建响应中的明文被带入列表状态。
export const toMcpTokenRecord = ({ id, name, tokenPrefix, expireTime, createDate }: McpTokenEntity): McpTokenEntity => ({
  id,
  name,
  tokenPrefix,
  expireTime,
  createDate,
})

export const skillInstallCommand = 'npx skills add https://gitee.com/gcpaas/DataRoom.git --skill dataroom-page'

export const resolveMcpServerUrl = (apiBaseUrl: string, pageOrigin: string) => {
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '')
  if (/^https?:\/\//i.test(normalizedApiBaseUrl)) {
    return `${normalizedApiBaseUrl}/mcp`
  }
  return new URL(`${normalizedApiBaseUrl}/mcp`, `${pageOrigin.replace(/\/$/, '')}/`).toString()
}

export const createMcpConfig = (mcpServerUrl: string, token: string) => ({
  mcpServers: {
    'dataroom-mcp-server': {
      url: mcpServerUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  },
})

export const formatMcpConfig = (mcpServerUrl: string, token: string) => JSON.stringify(createMcpConfig(mcpServerUrl, token), null, 2)

export const aiGenerationActions: AiGenerationAction[] = [
  {
    title: '安装 Skill',
    desc: '在终端中执行如下命令',
    content: skillInstallCommand,
  },
  {
    title: '配置 MCP Server',
    desc: '创建MCP令牌后，将生成的 JSON 添加到 AI 工具的 MCP 配置中',
    content: '',
  },
  {
    title: '案例',
    desc: '在AI工具中打开新会话，输入下面的内容',
    content: '/dataroom-page 帮我生成一个618监控大屏',
  },
]
