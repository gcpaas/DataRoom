/*
 * @description: 案例的打包配置
 * @Author: xing.heng
 */
'use strict'
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')
function resolve (dir) {
  return path.join(__dirname, dir)
}
const publicPath =
  process.env.VUE_APP_HISTORY === 'y' ? process.env.VUE_APP_BASE + '/' : ''
const JS_CDN = [
  publicPath + 'static/libs/vuex/vuex.min.js',
  publicPath + 'static/libs/vue-router/vue-router.min.js'
]
const CSS_CDN = []

const cdn = {
  css: CSS_CDN,
  js: JS_CDN
}
const port = process.env.port || process.env.npm_config_port || 7521 // dev port

const plugins = [
  new webpack.ProvidePlugin({
    jQuery: 'jquery',
    $: 'jquery',
    'window.jQuery': 'jquery'
  })
]
module.exports = {
  parallel: require('os').cpus().length > 1,
  pages: {
    index: {
      entry: ['example/main.js'],
      template: 'public/index.html',
      filename: 'index.html',
      chunks: 'all'
    }
  },
  publicPath:
    process.env.VUE_APP_HISTORY === 'y' ? process.env.VUE_APP_BASE : './',
  outputDir: 'bigScreen',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    hot: true,
    port: port,
    client: {
      overlay: false
    }
  },
  configureWebpack: config => {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // name: name,
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.cache')
    }
    Object.assign(config.resolve, {
      alias: {
        '@': resolve('example'),
        vue$: 'vue/dist/vue.common',
        // 大屏工程路径别名
        packages: resolve('packages'),
        '@gcpaas/data-room-ui': resolve('packages/index.js')
      },
      fallback: {
        path: false,
        fs: false
      }
    })
    // 如果是开发模式，忽略一些组件打包，采用cdn
    config.externals =
      process.env.NODE_ENV === 'production'
        ? {
            'vue-router': 'VueRouter',
            vuex: 'Vuex'
          }
        : {}
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new CompressionPlugin({
            cache: true, // 开启缓存
            test: /\.js$|\.html$|\.css$|\.jpg$|\.jpeg$|\.png/, // 需要压缩的文件类型
            threshold: 10240, // 归档需要进行压缩的文件大小最小值，10K以上的进行压缩
            deleteOriginalAssets: false // 是否删除原文件
          }),
          ...plugins
        ]
      }
    } else {
      return {
        plugins: [
          ...plugins
        ]
      }
    }
  },

  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('html-index').tap(args => {
        // html中添加cdn
        args[0].cdn = cdn
        // 修复 Lazy loading routes Error
        args[0].chunksSortMode = 'none'
        return args
      })
    }

    config.plugins.delete('prefetch-index') //  关闭prefetch
    config.module
      .rule('svg')
      .exclude.add(resolve('packages/assets/images/dataSourceIcon/svg'))
      .add(resolve('packages/assets/images/pageIcon/svg'))
      .add(resolve('packages/assets/images/bigScreenIcon/svg'))
      .add(resolve('packages/Svgs/svg'))
      .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('packages/assets/images/dataSourceIcon/svg'))
      .add(resolve('packages/assets/images/pageIcon/svg'))
      .add(resolve('packages/assets/images/bigScreenIcon/svg'))
      .add(resolve('packages/Svgs/svg'))
      .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  // 在这里配置需要对node_modules中需要进行语法转义的依赖
  transpileDependencies: []
}
