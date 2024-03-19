/*
 * @description: 打包的配置
 * @Author: xing.heng
 */
const path = require('path')
const { ProvidePlugin } = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')
function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: false,
  css: {
    extract: true
  },
  configureWebpack: {
    externals: {
      vuex: 'vuex',
      vue: 'vue',
      vueRouter: 'vue-router',
      '@antv/g2plot': '@antv/g2plot',
      '@jiaminghi/data-view': '@jiaminghi/data-view',
      axios: 'axios',
      echarts: 'echarts',
      'element-ui': 'element-ui',
      'insert-css': 'insert-css',
      jquery: 'jquery',
      lodash: 'lodash',
      moment: 'moment',
      qs: 'qs',
      sortablejs: 'sortablejs',
      'tiny-sass-compiler': 'tiny-sass-compiler',
      'vue-codemirror': 'vue-codemirror',
      'vue-contextmenujs': 'vue-contextmenujs',
      'vue-draggable-resizable-gorkys': 'vue-draggable-resizable-gorkys',
      'vue-json-editor-fix-cn': 'vue-json-editor-fix-cn',
      'vue-json-viewer': 'vue-json-viewer',
      'vue-quill-editor': 'vue-quill-editor',
      'vue-sketch-ruler': 'vue-sketch-ruler',
      vuedraggable: 'vuedraggable',
      ztree: 'ztree',
      // codemirror 导入但未声明的变量
      'codemirror/lib/codemirror.css': 'codemirror',
      'codemirror/theme/material-darker.css': 'codemirror',
      'codemirror/addon/selection/active-line.js': 'codemirror',
      'codemirror/mode/vue/vue.js': 'codemirror'
    },
    resolve: {
      alias: {
        '@': resolve('example'),
        'data-room-ui': resolve('packages')
      },
      fallback: {
        path: false,
        fs: false
      }
    },
    plugins: [
      new CompressionPlugin({
        test: /\.js$|\.html$|\.css$|\.jpg$|\.jpeg$|\.png/, // 需要压缩的文件类型
        threshold: 10240, // 归档需要进行压缩的文件大小最小值，10K以上的进行压缩
        deleteOriginalAssets: false // 是否删除原文件
      }),
      new ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        'window.jQuery': 'jquery'
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ]
  },
  chainWebpack: config => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('packages/assets/images/bigScreenIcon/svg'))
      .add(resolve('packages/Svgs/svg'))
      .add(resolve('packages/assets/images/dataSourceIcon/svg'))
      .add(resolve('packages/assets/images/pageIcon/svg'))
      .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('packages/assets/images/bigScreenIcon/svg'))
      .add(resolve('packages/Svgs/svg'))
      .add(resolve('packages/assets/images/dataSourceIcon/svg'))
      .add(resolve('packages/assets/images/pageIcon/svg'))
      .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    const imagesRule = config.module.rule('images')
    imagesRule.uses.clear()

    config.module
      .rule('images')
      .set('parser', {
        dataUrlCondition: {
          maxSize: 1024 * 1024
        }
      })
      .end()

    // 处理font
    config.module
      .rule('font')
      .test(/\.(ttf|woff|woff2)$/)
      .set('parser', {
        dataUrlCondition: {
          maxSize: 1024 * 1024
        }
      })
      .end()
  }
}
