/*
 * @description: 案例的打包配置
 * @Author: xing.heng
 */
'use strict'
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack')
function resolve (dir) {
  return path.join(__dirname, dir)
}
const publicPath = process.env.VUE_APP_HISTORY === 'y' ? process.env.VUE_APP_BASE + '/' : ''
const JS_CDN = [
  publicPath + 'static/libs/vue-router/vue-router.min.js'
]
const CSS_CDN = []

const cdn = {
  css: CSS_CDN,
  js: JS_CDN
}
const port = process.env.port || process.env.npm_config_port || 7521 // dev port

const plugins = [
  new webpack.ProvidePlugin({ })
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
  outputDir: 'dataroom',
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
  css: {
    loaderOptions: {
      sass: {
        implementation: require('sass'),
        sassOptions: {
          // 其他 Dart Sass 选项
        }
      }
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
        '@gcpaas/data-room-ui/packages': resolve('packages')
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
          // new webpack.CaseSensitivePathsPlugin({ ignore: /dataset/ }),
          // new BundleAnalyzerPlugin(),
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
    config.optimization.splitChunks({
      cacheGroups: {
        vue: {
          name: 'vue',
          test: /[\\/]vue[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        vueRouter: {
          name: 'vue-router',
          test: /[\\/]vue-router[\\/]/,
          chunks: 'all',
          priority: 10
        },
        es6Promise: {
          name: 'es6-promise',
          test: /[\\/]es6-promise[\\/]/,
          chunks: 'all',
          priority: 10
        },
        vueContextMenuJs: {
          name: 'vue-contextmenujs',
          test: /[\\/]vue-contextmenujs[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        element: {
          name: 'element-ui',
          test: /[\\/]element-ui[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        babel: {
          name: '@babel',
          test: /[\\/]@babel[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        vueJsonEditor: {
          name: 'vue-json-editor-fix-cn',
          test: /[\\/]vue-json-editor-fix-cn[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        antv: {
          name: '@antv',
          test: /[\\/]@antv[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        html2canvas: {
          name: 'html2canvas',
          test: /[\\/]html2canvas[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        lodash: {
          name: 'lodash',
          test: /[\\/]lodash[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        htmlToImage: {
          name: 'html-to-image',
          test: /[\\/]html-to-image[\\/]/,
          chunks: 'all',
          priority: 10 // 优化将优先考虑具有更高 priority（优先级）的缓存组
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 2,
          reuseExistingChunk: true
        }
      }
    })
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
      // packages/assets/images/dataSourceIcon/svg
      .exclude.add(resolve('packages'))
      // .add(resolve('packages/assets/images/pageIcon/svg'))
      // .add(resolve('packages/assets/images/bigScreenIcon/svg'))
      // .add(resolve('packages/Svgs/svg'))
      // .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('packages'))
      // .add(resolve('packages/assets/images/pageIcon/svg'))
      // .add(resolve('packages/assets/images/bigScreenIcon/svg'))
      // .add(resolve('packages/Svgs/svg'))
      // .add(resolve('packages/assets/images/alignIcon/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  // 在这里配置需要对node_modules中需要进行语法转义的依赖
  transpileDependencies: ['@antv/*']
}
