import { Plugin } from 'vite'

export const ReplaceThisPluginType = (): Plugin => {
  return {
    name: 'replaceThisPluginType',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules')) {
        return code
      }
      if (!id.includes('dataroom-packages/components')) {
        return code
      }
      // 仅处理ts、vue文件的占位符
      if (!(id.endsWith('install.ts') || id.endsWith('plugin.ts') || id.endsWith('index.vue'))) {
        return code
      }
      const pathNames = id.split('/')
      let pluginType = ''
      if (id.endsWith('/panel/index.vue')) {
        // 截取 xxx/panel/index.vue 前面的文件夹名称
        pluginType = pathNames[pathNames.length - 3]
      } else {
        // 截取 xxx/index.vue、xxx/xx.ts 前面的文件夹名称
        pluginType = pathNames[pathNames.length - 2]
      }
      process.env.THIS_PLUGIN_TYPE = pluginType
      // 替换占位符 DrConst.THIS_PLUGIN_TYPE
      return code.replace(/DrConst.THIS_PLUGIN_TYPE/g, "'" + pluginType + "'")
    },
  }
}
