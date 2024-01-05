<template>
  <div
    v-loading="loading"
    element-loading-text="地图加载中..."
    class="map-box"
    :class="{ 'no-pointer': isDesign }"
  >
    <div
      :id="`map-${config.code}`"
      style="width: 100%; height: 100%;"
    />
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
export default {
  name: 'RemoteMap',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      map: null,
      loading: false
    }
  },
  computed: {
    option () {
      return this.config.option
    },
    optionData () {
      return this.option.data
    },
    customize () {
      return this.option.customize
    },
    isDesign () {
      return (window?.BS_CONFIG?.routers?.designUrl || '/big-screen/design') === this.$route.path
    }
  },

  mounted () {
    this.initMap(this.customize)
  },
  methods: {
    initMap (customize) {
      this.loading = true
      this.updateKey = 0
      AMapLoader.load({
        key: customize.mapKey || '1b0a1423b70bbcbc20c9c87327e5e94e', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '1.4.15', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.ToolBar',
          'AMap.Scale',
          'AMap.HawkEye',
          'AMap.MapType',
          'AMap.Geolocation'
        ]
      }).then(() => {
        // 创建地图
        // eslint-disable-next-line no-undef
        this.map = new AMap.Map(`map-${this.config.code}`, {
          resizeEnable: true, // 是否监控地图容器尺寸变化
          lang: customize.lang,
          mapStyle: `amap://styles/${customize.mapStyle}`,
          center: [customize.lng, customize.lat],
          features: customize.features,
          zoom: customize.zoom,
          viewMode: customize.viewMode,
          plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType', 'AMap.Geolocation']
        })
        this.loading = false
        // eslint-disable-next-line no-undef
        this.map.addControl(new AMap.ToolBar())
        // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
        // eslint-disable-next-line no-undef
        this.map.addControl(new AMap.Scale())
        // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
        // eslint-disable-next-line no-undef
        this.map.addControl(new AMap.MapType())
        // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
        // eslint-disable-next-line no-undef
        this.map.addControl(new AMap.Geolocation())
        let marker = null // 用于存储标记对象的变量
        if (customize.markerSpan) {
          // 创建自定义标记内容
          const markerContent = document.createElement('div')
          markerContent.style.position = 'absolute'
          markerContent.style.width = '25px'
          markerContent.style.height = '34px'

          // 创建标记图标
          const markerImg = document.createElement('img')
          markerImg.src = '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
          markerImg.style.width = '25px'
          markerImg.style.height = '34px'
          markerContent.appendChild(markerImg)

          // 创建标记文本
          const markerSpan = document.createElement('span')
          markerSpan.className = 'marker'
          markerSpan.innerHTML = customize.markerSpan
          markerContent.appendChild(markerSpan)
          // 删除之前的标记（如果存在）
          if (marker) {
            this.map.remove(marker)
          }
          // 创建自定义标记
          // eslint-disable-next-line no-undef
          marker = new AMap.Marker({
            position: [customize.markerLng, customize.markerLat],
            content: markerContent,
            // eslint-disable-next-line no-undef
            offset: new AMap.Pixel(0, 0) // 设置标记偏移，使其指向标记位置
          })

          // 将标记添加到地图中
          this.map.add(marker)
          // 动态修改标记的 right 位置
          const markerElement = marker.getContent()
          const markerTextElement = markerElement.querySelector('.marker')
          markerTextElement.style.right = 0 // 设置初始的 right 值
          if (markerTextElement) {
            setTimeout(() => {
              markerTextElement.style.right = `-${markerTextElement.clientWidth}px` // 设置新的 right 值
            }, 100)
          }
        }
      })
    },
    customStyle (config) {
      if (config && config.option && config.option.customize) {
        this.initMap(config.option.customize)
      }
    }
  }
}
</script>

<style scoped></style>

<style lang="scss" scoped>
.no-pointer {
  pointer-events: none;
}

.map-box {
  width: 100%;
  height: 100%;
  z-index: 999;

  ::v-deep .amap-marker-content img {
    width: 25px;
    height: 34px;
  }

  ::v-deep .marker {
    position: absolute;
    top: -20px;
    right: -118px;
    color: #fff;
    padding: 4px 10px;
    box-shadow: 1px 1px 1px rgba(10, 10, 10, .2);
    white-space: nowrap;
    font-size: 12px;
    font-family: "";
    background-color: #25A5F7;
    border-radius: 3px;
  }
}
</style>
