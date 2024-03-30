<template>
  <el-select
    ref="selectParentName"
    v-model="typeIdCopy"
    :filter-method="selectorFilter"
    class="bs-el-select"
    clearable
    filterable
    placeholder="请选择分组"
    popper-class="bs-el-select"
    @clear="clearType"
    @visible-change="setCurrentNode"
  >
    <div
      slot="empty"
      style="padding: 10px 10px 10px 25px;color: #909399;font-size: 14px;cursor: pointer;"
      @click="addType"
    >
      <i class="el-icon-circle-plus" />
      &nbsp;&nbsp;
      <b>暂无分组，点击新增</b>
    </div>
    <el-option
      v-if="categoryData.length"
      :label="typeName"
      :value="typeIdCopy"
      style="height: auto;padding: 0;"
    >
      <div>
        <el-tree
          ref="categorySelectTree"
          :data="categoryData"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :filter-node-method="treeFilter"
          :highlight-current="true"
          :indent="8"
          :props="{ label: 'name', children: 'children' }"
          class="bs-el-tree"
          node-key="id"
          @node-click="selectParentCategory"
        >
          <span
            slot-scope="{ data }"
            class="custom-tree-node"
          >
            <span>
              <!-- <i
                :class="data.children && data.children.length ? 'el-icon el-icon-folder' : 'el-icon el-icon-document'"
              /> -->
              {{ data.name }}
            </span>
          </span>
        </el-tree>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { categoryAdd, getCategoryTree } from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'

export default {
  name: 'TypeSelect',
  props: {
    typeId: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: ''
    },
    childId: {
      type: String,
      default: ''
    }
  },
  watch: {
    typeId (val) {
      this.typeIdCopy = val
      this.$nextTick(() => {
        const name = this.$refs.categorySelectTree?.getNode(val)?.data.name
        if (name) {
          this.typeName = name
        }
      })
    }
  },
  data () {
    return {
      categoryData: [],
      typeName: '',
      typeIdCopy: this.typeId
    }
  },
  computed: {
  },
  created () {
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      getCategoryTree().then((res) => {
        this.categoryData = res
        if (['addSiblingOrg', 'addChildOrg', 'editOrg'].includes(this.type)) {
          this.deleteNodeById(this.categoryData, this.childId)
          this.categoryData.unshift({
            id: '0',
            name: '全部'
          })
        }
        if (this.typeId) {
          const node = this.getById(this.typeId)
          this.typeName = node.name
        }
      })
    },
    /**
     * 从树结构数据中查找id对应的节点
     */
    getById (id) {
      const stack = [...this.categoryData]
      while (stack.length) {
        const node = stack.pop()
        if (node.id === id) {
          return node
        }
        if (node.children && node.children.length) {
          stack.push(...node.children)
        }
      }
      return null
    },
    deleteNodeById (treeData, id) {
      for (let i = 0; i < treeData.length; i++) {
        const node = treeData[i]
        if (node.id === id) {
          treeData.splice(i, 1) // 删除当前节点
          return treeData // 返回修改后的树状数据
        }
        if (node.children) {
          this.deleteNodeById(node.children, id)
        }
      }
      return treeData // 如果没有找到对应的节点，返回原始树状数据
    },
    /**
     * 更新父组件的typeId
     * @param newTypeId
     */
    updateTypeId (newTypeId) {
      this.$emit('update', newTypeId)
    },
    /**
     * 选择器过滤
     * @param value
     */
    selectorFilter (value) {
      this.$refs.categorySelectTree?.filter(value)
    },
    /**
     * 清空分类选择
     */
    clearType () {
      this.typeName = ''
      this.typeIdCopy = ''
      this.updateTypeId('')
    },
    /**
     * 分类展开高亮
     * @param $event
     */
    setCurrentNode ($event) {
      if ($event) {
        this.$nextTick(() => {
          const key = this.typeId || null
          this.$refs.categorySelectTree?.setCurrentKey(key)
        })
      }
    },
    /**
     * 新增分类
     */
    addType () {
      this.$prompt('请输入分组名称', '新增分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'bs-el-message-box'
      }).then(({ value }) => {
        categoryAdd({
          type: 'dataset',
          name: value,
          parentId: 0
        }).then((r) => {
          this.typeName = r.name
          this.typeIdCopy = r.id
          this.updateTypeId(r.id)
          getCategoryTree().then((res) => {
            this.categoryData = res
          })
        })
      }).catch(() => {
      })
      // 手动收起下拉框
      this.$refs.selectParentName.blur()
    },
    /**
     * 树过滤
     * @param value
     * @param data
     * @returns {boolean}
     */
    treeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    /**
     * 分类选择
     * @param value
     */
    selectParentCategory (value) {
      this.typeIdCopy = value.id
      this.updateTypeId(value.id)
      this.typeName = value.name
      this.$refs.selectParentName.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
