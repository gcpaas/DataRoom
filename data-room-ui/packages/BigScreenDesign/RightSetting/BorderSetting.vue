
<template>
  <div>
    <el-form-item
      :label-width="labelWidth"
      label="边框"
    >
    <el-input
      v-model="config.type"
      v-support
      clearable
      read-only
      placeholder="请选择边框"
      @focus="init"
    >
      <template slot="append">
        <el-button
          size="small"
          type="primary"
          @click="init"
        >
          选择
        </el-button>
      </template>
    </el-input>
      <BorderSelect
        v-model="config.type"
        ref="BorderSelect"
        />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="标题高度"
    >
      <el-input-number
        v-model="config.titleHeight"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="标题字体大小"
    >
      <el-input-number
        v-model="config.fontSize"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="颜色"
    >
     <!-- <color-select
      v-model="config.color"
    /> -->
    <div
        style="
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      "
        class="color-picker-box"
      >
        <el-color-picker
          v-for="(colorItem, colorItemIndex) in config.color"
          :key="colorItemIndex"
          v-model="config.color[colorItemIndex]"
          popper-class="bs-el-color-picker"
          show-alpha
          class="start-color"
        />
      </div>
    </el-form-item>
  </div>
</template>
<script>
import ColorSelect from 'data-room-ui/ColorMultipleSelect/index.vue'
import BorderSelect from 'data-room-ui/BorderSelect/index.vue'
export default {
  name: '',
  components: {
    BorderSelect,
    ColorSelect
  },
  props: {
    config: {
      type: Object,
      default: () => ({
        type: '',
        titleHeight: 0,
        fontSize: 0,
        h: 0,
        color:['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9']
      })
    },
    labelWidth: {
      type: String,
      default: '100px'
    }
  },
  data () {
    return {

    }
  },
  mounted () {},
  methods: {
    init(){
      this.$refs.BorderSelect.init()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-color-picker__trigger {
  border-color: var(--bs-el-border);
}
.color-picker-box{
  ::v-deep .el-color-picker__trigger {
    width: 27px!important;
  }
}
</style>
