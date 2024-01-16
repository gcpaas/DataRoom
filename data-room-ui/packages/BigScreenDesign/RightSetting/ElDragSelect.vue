<!--
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2023-03-14 10:20:54
 * @LastEditTime: 2023-05-23 15:14:47
-->
<template>
  <el-select
    ref="dragSelect"
    v-model="selectVal"
    v-bind="$attrs"
    class="drag-select"
    v-on="$listeners"
  >
    <slot />
  </el-select>
</template>

<script>
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import Sortable from 'sortablejs'

export default {
  name: 'DragSelect',
  props: {
    value: {
      type: [Array, String],
      required: true
    }
  },
  computed: {
    selectVal: {
      get () {
        if (Array.isArray(this.value)) {
          return [...this.value]
        } else {
          return this.value
        }
      },
      set (val) {
        if (Array.isArray(val)) {
          this.$emit('input', [...val])
        } else {
          this.$emit('input', val)
        }
      }
    }
  },
  watch: {
    // 监听数组变化，根据上次的数据的值，判断这次拖拽后数据是否变化，如果数据位置发生变化则出发emit事件
    selectVal: {
      handler (newVal, oldVal) {
        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
          if ((newVal.length === oldVal.length) && (JSON.stringify(oldVal) !== JSON.stringify(newVal))) {
            // 告诉右侧的数据配置面板，选择器内的选项顺序发生变化，修改config的数据顺序
            this.$emit('valuePositionChange', newVal)
          }
        }
      }
    }
  },
  created () {
  },
  mounted () {
    this.setSort()
  },
  methods: {
    setSort () {
      const el = this.$refs.dragSelect.$el.querySelectorAll('.el-select__tags > span')[0]
      if (el) {
        this.sortable = Sortable.create(el, {
          animation: 350,
          ghostClass: 'sortable-ghost',
          setData: function (dataTransfer) {
            dataTransfer.setData('Text', '')
          },
          onEnd: (evt) => {
            const targetRow = this.value.splice(evt.oldIndex, 1)[0]
            this.value.splice(evt.newIndex, 0, targetRow)
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.drag-select {
  ::v-deep {
    .sortable-ghost {
      opacity: 0.8;
      color: #fff !important;
      background:var(--bs-el-color-primary) !important;
    }

    .el-tag {
      cursor: move;
    }
  }
}
</style>
