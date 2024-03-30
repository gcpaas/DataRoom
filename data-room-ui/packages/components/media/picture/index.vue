<template>
  <div
    class="bs-design-wrap"
  >
    <div
      class="content-box"
    >
      <el-image
        class="img-box"
        :src="getCoverPicture(config.url)"
      />
    </div>
  </div>
</template>
<script>
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'

export default {
  name: 'Texts',
  components: {},
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      customClass: {}
    }
  },

  computed: {
  },
  mounted () {
  },
  methods: {
    getCoverPicture (url) {
      if (url.startsWith('data:image/')) {
        // 如果是Base64格式，则直接返回URL
        return url
      } else {
        // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
        return getFileUrl(url)
      }
    },
    initConfig () {

    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  //justify-content: center;
}
.content-box{
  width: 100%;
  height: 100%;
  text-align: center;
  .img-box{
    width: 100%;
    height: 100%;
  }
}
</style>
