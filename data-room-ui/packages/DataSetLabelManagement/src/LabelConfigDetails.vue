<template>
  <div
    v-if="dialogFormVisible"
    class="inner-container"
  >
    <el-scrollbar class="data-set-scrollbar">
      <!-- <el-page-header
        class="bs-el-page-header"
        @back="goBack"
      /> -->
      <el-page-header class="bs-el-page-header">
        <template slot="content">
          <div class="page-header">
            <div class="page-header-left">
              标签详情
            </div>
            <div class="page-header-right">
              <el-button
                class="back bs-el-button-default"
                @click="goBack"
              >
                返回
              </el-button>
            </div>
          </div>
        </template>
      </el-page-header>
      <el-divider
        class="bs-el-divider"
        content-position="left"
      >
        属性信息
      </el-divider>

      <el-row
        style="width: 100%;"
        :gutter="5"
      >
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.labelName.length > 20"
            :content="dataForm.labelName"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">标签名称： {{ ellipsis(dataForm.labelName, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            标签名称： {{ ellipsis(dataForm.labelName, 20) }}
          </span>
        </el-col>
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.labelType.length > 20"
            :content="dataForm.labelType"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">标签类型： {{ ellipsis(dataForm.labelType, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            标签类型： {{ ellipsis(dataForm.labelType, 20) }}
          </span>
        </el-col>
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.labelDesc.length > 20"
            :content="dataForm.labelDesc"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">标签说明： {{ ellipsis(dataForm.labelDesc, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            标签说明： {{ ellipsis(dataForm.labelDesc, 20) }}
          </span>
        </el-col>
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.createBy && dataForm.createBy.length > 20"
            :content="dataForm.createBy"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">创建人： {{ ellipsis(dataForm.createBy, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            创建人： {{ ellipsis(dataForm.createBy, 20) }}
          </span>
        </el-col>
        <el-col
          :span="16"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.createDate.length > 20"
            :content="dataForm.createDate"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">创建时间： {{ ellipsis(dataForm.createDate, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            创建时间： {{ ellipsis(dataForm.createDate, 20) }}
          </span>
        </el-col>
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.updateBy && dataForm.updateBy.length > 20"
            :content="dataForm.updateBy"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">
              修改人： {{ ellipsis(dataForm.updateBy, 20) }}
            </span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            修改人： {{ ellipsis(dataForm.updateBy, 20) }}
          </span>
        </el-col>
        <el-col
          :span="8"
          class="attrInfo"
        >
          <el-tooltip
            v-if="dataForm.updateDate.length > 20"
            :content="dataForm.updateDate"
            class="item"
            effect="dark"
            placement="bottom-start"
          >
            <span class="text-style">修改时间： {{ ellipsis(dataForm.updateDate, 20) }}</span>
          </el-tooltip>
          <span
            v-else
            class="text-style"
          >
            修改时间： {{ ellipsis(dataForm.updateDate, 20) }}
          </span>
        </el-col>
      </el-row>

      <el-divider
        class="bs-el-divider"
        content-position="left"
      >
        关联数据集信息
      </el-divider>

      <div id="container" />
    </el-scrollbar>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import { getLabelDetail } from 'packages/js/utils/LabelConfigService'

export default {
  name: 'LabelConfigDetails',
  data () {
    return {
      dialogFormVisible: false,
      dataForm: {
        createBy: '',
        createDate: '',
        updateBy: '',
        updateDate: '',
        labelDesc: '',
        labelName: '',
        labelType: ''
      },
      jsonData: {},
      chartHeight: 0,
      chartWidth: 0
    }
  },
  methods: {
    ellipsis (value, len) {
      if (!value) return ''
      if (value.length > len) {
        return value.slice(0, len) + '...'
      }
      return value
    },
    init (row) {
      this.dialogFormVisible = true
      getLabelDetail(row.id).then((r) => {
        this.jsonData = r.jsonData
        if (r.jsonData.nodes.length > 1) {
          this.chartHeight = r.jsonData.nodes.length * 100
        } else {
          this.chartHeight = 200
        }
        this.dataForm = r

        this.chartWidth = r.labelName.length * 20

        this.$nextTick(() => {
          this.initG6(r.jsonData)
        })
      })
    },
    goBack () {
      this.dialogFormVisible = false
      this.$nextTick(() => {
        this.$parent.labelVisible = true
        this.$parent.getDataList()
      })
    },
    nodeEach (nodes) {
      nodes.forEach(node => {
        if (!node.style) {
          node.style = {}
        }
        switch (node.class) {
          case 'c1': {
            node.shape = 'circle'
            node.size = 40
            break
          }
          case 'c3': {
            node.shape = 'rect'
            // node.size = [80, 50];
            node.style = {
              stroke: '#FFFFFF',
              fill: '#DFE1E3'
            }
            break
          }
          case 'c0': {
            node.shape = 'ellipse'
            node.size = [80, 40]
            break
          }
          case 'c2': {
            node.shape = 'diamond'
            node.size = [60, 60]
            break
          }
        }
      })
    },
    // 初始化G6
    initG6 (json) {
      const data = json
      const width = document.getElementById('container').scrollWidth

      this.nodeEach(data.nodes)
      const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 0,
        fixToNode: [1, 0],
        itemTypes: ['node', 'edge'],
        getContent: (e) => {
          const outDiv = document.createElement('div')
          outDiv.style.width = 'fit-content'
          outDiv.innerHTML = `<div style='width: 200px;'>${e.item.getModel()._label}</div>`
          return outDiv
        },
        shouldBegin: (e) => {
          let res = true
          if (e.item.getModel()._label && e.item.getModel()._label.length > 12) {
            res = true
          } else {
            res = false
          }
          return res
        }
      })

      const graph = new G6.Graph({
        container: 'container',
        // width: '800',
        height: this.chartHeight,
        plugins: [tooltip],
        // modes: {
        //   default: ['drag-canvas', 'zoom-canvas', 'click-select']
        // },
        defaultNode: {
          type: 'rect',
          size: [150, 50],
          style: {
            fill: '#9ACAFF',
            stroke: '#FFFFFF'
          }
        },
        // 连线类型及样式
        defaultEdge: {
          type: 'line',
          style: {
            offset: 25,
            endArrow: true,
            lineWidth: 2,
            stroke: '#333'
          }
        }
      })
      data.nodes.forEach(node => {
        node._label = node.label
        if (node.label.length > 12) {
          node.label = node.label.substr(0, 9) + '...'
        }
      })
      graph.data(data)
      graph.render()
    }
  }
}
</script>

<style scoped>

@import '../../assets/style/bsTheme.scss';
.data-set-scrollbar {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: none;
}
.inner-container{
  overflow-x: hidden;
}
.el-col {
  height: 35px;
}

.attrInfo {
  padding-left: 20px !important;
}

.text-style{
  color: var(--bs-el-title);
}

.page-header {
  display: flex;
  position: relative;

  .page-header-right {
    position: absolute;
    right: 16px;
  }
}
</style>
