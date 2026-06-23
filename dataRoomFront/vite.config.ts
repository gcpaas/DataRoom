import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'auto-imports.d.ts', // 必须加，固定类型文件
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      eslintrc: { enabled: false }, // 关闭 eslint 自动生成，避免反复刷新
    }),
    Components({
      dts: 'components.d.ts',
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/dataRoom/assets/element.scss" as *;`,
      },
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
    include: ['vue', 'vue-router', 'pinia', 'element-plus/es/**', 'sql-formatter', '@/dataRoom'],
  },
  build: {
    // 自定义打包输出目录名称，默认为 front
    outDir: 'front',
    rolldownOptions: {
      onwarn(warning, warn) {
        // Rolldown 对部分第三方包里位置不规范的 PURE 注释会输出 INVALID_ANNOTATION。
        // 这些注释只影响 tree-shaking 提示，不影响运行逻辑；构建已成功时定向过滤日志噪音。
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          (
            warning.id?.includes('@daybrush/utils') ||
            warning.id?.includes('@vueuse/core')
          )
        ) {
          return
        }
        warn(warning)
      },
    },
  },
})
