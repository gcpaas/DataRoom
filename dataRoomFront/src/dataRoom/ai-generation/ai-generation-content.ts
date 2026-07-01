export interface AiGenerationAction {
  title: string
  desc: string
  content: string
}

export const skillInstallCommand = 'npx skills add https://gitee.com/gcpaas/DataRoom.git --skill dataroom-page'

export const createMcpConfig = (mcpServerUrl: string, token: string) => ({
  mcpServers: {
    'dataroom-mcp-server': {
      url: mcpServerUrl,
      headers: {
        dataRoomToken: token,
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
    desc: '将以下 JSON 添加到AI工具的MCP配置中',
    content: '',
  },
  {
    title: '案例',
    desc: '在AI工具中打开新会话，输入下面的内容',
    content: '/dataroom-page 帮我生成一个618监控大屏',
  },
]
