<template>
  <div>
    <BorderSetting
      ref="form"
      :config="config"
      :predefine-theme-colors="predefineThemeColors"
    >
      <template slot="bottom">
        <el-form-item label="翻转形态">
          <el-switch
            v-model="config.customize.reverse"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
      </template>
    </BorderSetting>
  </div>
</template>
<script>
import BorderSetting from 'packages/BigScreenDesign/BorderSetting.vue'
export default {
  name: 'Border5Setting',
  components: {
    BorderSetting
  },
  data () {
    return {
      // 预设主题色
      predefineThemeColors: [
        '#007aff',
        '#1aa97b',
        '#ff4d53',
        '#1890FF',
        '#DF0E1B',
        '#0086CC',
        '#2B74CF',
        '#00BC9D',
        '#ED7D32'
      ]
    }
  },
  computed: {
    config: {
      get () {
        return this.$store.state.bigScreen.activeItemConfig
      },
      set (val) {
        this.$store.state.bigScreen.activeItemConfig = val
      }
    }
  },
  watch: {},
  mounted () { },
  methods: {}
}
</script>
