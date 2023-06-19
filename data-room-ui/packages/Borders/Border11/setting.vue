<template>
  <div>
    <BorderSetting
      ref="form"
      :config="config"
      :predefine-theme-colors="predefineThemeColors"
    >
      <template slot="top">
        <el-form-item label="边框标题">
          <el-input
            v-model="config.customize.title"
            maxlength="100"
            clearable
          />
        </el-form-item>
        <el-form-item label="标题宽度">
          <el-input-number
            class="bs-el-input-number"
            v-model="config.customize.titleWidth"
            :max="8000"
            :min="50"
            :step="10"
          />
        </el-form-item>
      </template>
    </BorderSetting>
  </div>
</template>
<script>
import BorderSetting from 'packages/BigScreenDesign/BorderSetting.vue'
export default {
  name: 'Border11Setting',
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
