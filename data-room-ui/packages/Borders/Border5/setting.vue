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
import BorderSetting from 'data-room-ui/BigScreenDesign/BorderSetting.vue'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'Border5Setting',
  components: {
    BorderSetting
  },
  data () {
    return {
      // 预设主题色
      predefineThemeColors: predefineColors
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
