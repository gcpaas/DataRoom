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
      resolvers: [ElementPlusResolver()],
      eslintrc: { enabled: false }, // 关闭 eslint 自动生成，避免反复刷新
    }),
    Components({
      dts: 'components.d.ts',
      resolvers: [ElementPlusResolver()],
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
        additionalData: `@use "@/dataroom-packages/assets/element.scss" as *;`,
      },
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
    include: ['vue', 'vue-router', 'pinia', 'element-plus/es/**', 'sql-formatter', '@/dataroom-packages'],
  },
  build: {
    // 自定义打包输出目录名称，默认是 dist，可以改为其他名称如 'build'、'output' 等
    outDir: 'dataRoom',
  },
})
