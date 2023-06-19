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
  mounted () {
    this.setSort()
  },
  methods: {
    setSort () {
      const el = this.$refs.dragSelect.$el.querySelectorAll(
        '.el-select__tags > span'
      )[0]
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
