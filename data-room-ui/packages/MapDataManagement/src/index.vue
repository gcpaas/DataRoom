<template>
  <div class="bs-container">
    <div class="inner-container">
      <el-form
        :inline="true"
        class="filter-container"
      >
        <el-form-item class="filter-input filter-item">
          <el-input
            v-model="searchForm.searchKey"
            class="bs-el-input"
            clearable
            maxlength="200"
            @clear="getDataList"
            placeholder="请输入地图名称或标识"
          />
        </el-form-item>
        <el-form-item class="filter-item">
          <el-select
            v-model="searchForm.level"
            class="bs-el-select"
            clearable
            placeholder="请选择地图级别"
            popper-class="bs-el-select"
            @change="getDataList"
          >
            <el-option
              v-for="level in levelList"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-item">
          <el-button
            :loading="searchLoading"
            icon="el-icon-search"
            type="primary"
            @click="getDataList"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item class="filter-item">
          <el-button
            class="bs-el-button-default"
            @click="addMap"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
      <div class="bs-table-box">
        <el-table
          v-loading="searchLoading"
          ref="table"
          v-table
          :data="mapList"
          :element-loading-text="loadingText"
          :load="load"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          class="bs-el-table bs-scrollbar"
          height="0"
          lazy
          row-key="id"
        >
          <el-empty slot="empty"/>
          <el-table-column
            align="left"
            label="地图名称"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column
            align="center"
            label="地图标识"
            prop="mapCode"
            show-overflow-tooltip
          />
          <el-table-column
            align="center"
            label="地图级别"
            prop="level"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="scope.row.level === 0">世界</span>
              <span v-else-if="scope.row.level === 1">国家</span>
              <span v-else-if="scope.row.level === 2">省份</span>
              <span v-else-if="scope.row.level === 3">城市</span>
              <span v-else-if="scope.row.level === 4">区县</span>
              <span v-else>{{ getMoreLevel(scope.row.level) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="已上传配置JSON"
            prop="uploadedGeoJson"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="scope.row.uploadedGeoJson === 1">是</span>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="操作"
            width="200"
          >
            <template slot-scope="scope">
              <el-button
                class="bs-el-button-default"
                @click="editMap(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                class="bs-el-button-default"
                @click="deleteMap(scope.row)"
              >
                删除
              </el-button>
              <el-button
                v-if="scope.row.uploadedGeoJson === 1"
                class="bs-el-button-default"
                @click="addChild(scope.row)"
              >
                添加下级
              </el-button>
              <el-button
                v-if="scope.row.uploadedGeoJson === 0"
                class="bs-el-button-default"
                @click="uploadGeoJson(scope.row)"
              >
                上传配置
              </el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>
    </div>
    <add-form
      ref="addForm"
      @refresh="refreshData"
    />
    <edit-form
      ref="editForm"
      @refresh="refreshData"
    />
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="geoJsonVisible"
      append-to-body
      class="bs-dialog-wrap bs-el-dialog"
      height="1000px"
      title="geoJson数据"
      width="1000px"
    >
      <vue-json-viewer
        v-model="currentMapGeoJSon"
        theme="dark"
        :show-btns="false"
        mode="code"
      />
      <el-button
        class="bs-el-button-default"
        @click="upload()"
      >
        <i class="el-icon-upload2"></i>
        上传
      </el-button>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="submitUpload"
        >提交</el-button>
        </span>
    </el-dialog>
    <input
      ref="geoJsonFileUpload"
      accept=".json"
      name="file"
      style="display: none"
      type="file"
      @change="handleBatchUpload"
    >
  </div>
</template>

<script>
import table from 'data-room-ui/js/utils/table.js'
import {mapList, mapDelete, uploadGeoJson, mapCascadeDelete, mapInfo} from 'data-room-ui/js/utils/mapDataService'
import AddForm from "./AddForm"
import EditForm from "./EditForm"
import vueJsonViewer from 'vue-json-viewer'

export default {
  name: "MapManagement",
  directives: {
    table // 注册自定义指令
  },
  components: {
    AddForm,
    EditForm,
    vueJsonViewer
  },
  data() {
    return {
      currentMap: {}, // 当前操作的地图
      currentMapGeoJSon: {}, // 当前操作的地图geoJson
      loadingText: '',
      searchLoading: false,
      geoJsonVisible: false,
      lazyResolveIds: [],
      lazyResolveMap: new Map(),
      searchForm: {
        searchKey: '',
        level: null,
        uploadedGeoJson: null,
        parentId: '0'
      },
      levelList: [
        {
          label: '世界',
          value: 0
        },
        {
          label: '国家',
          value: 1
        },
        {
          label: '省份',
          value: 2
        },
        {
          label: '城市',
          value: 3
        },
        {
          label: '区县',
          value: 4
        }
      ],
      mapList: [],
      // 提示过了
      tipped: false

    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.searchLoading = true
      this.loadingText = '正在加载地图数据...'
      mapList(this.searchForm).then(res => {
        this.mapList = res
        this.searchLoading = false
        if (!this.tipped && this.mapList.length === 0) {
          this.tip()
        }
      }).catch(err => {
        this.searchLoading = false
      })
    },
    getDataList() {
      this.lazyResolveMap.clear()
      this.$nextTick(() => {
        this.mapList = []
      })
      this.$nextTick(() => {
        this.searchLoading = true
        this.loadingText = '正在加载地图数据...'
        mapList(this.searchForm).then(res => {
          this.mapList = res
          this.searchLoading = false
        }).catch(err => {
          this.searchLoading = false
        })
        // 清除展开状态
        for (let i = 0; i < this.lazyResolveIds.length; i++) {
          this.$refs.table.store.states.treeData[this.lazyResolveIds[i]].loaded = false;
          this.$refs.table.store.states.treeData[this.lazyResolveIds[i]].expanded = false
        }
      })
    },
    /**
     * 新增、删除、修改等操作成功后刷新数据,不改变展开状态
     * @param cbObj
     */
    refreshData(cbObj) {
      let parentId = cbObj.parentId
      if (this.lazyResolveMap.get(parentId)) {
        // 刷新父节点
        const { data, treeNode, resolve } = this.lazyResolveMap.get(parentId)
        this.$set(this.$refs.table.store.states.lazyTreeNodeMap, parentId, [])
        this.load(data, treeNode, resolve)
        return
      }
      if (parentId === '0' || parentId === 0) {
        // 刷新根节点
        this.getDataList()
        return
      }
      mapInfo(parentId).then((res) => {
        parentId = res.parentId
        if (this.lazyResolveMap.get(parentId)) {
          // 刷新父节点的父节点
          const { data, treeNode, resolve } = this.lazyResolveMap.get(parentId)
          this.$set(this.$refs.table.store.states.lazyTreeNodeMap, parentId, [])
          this.load(data, treeNode, resolve)
          // 展开该父节点
          this.$refs.table.toggleRowExpansion(parentId, true);
        } else {
          // 刷新根节点
          this.getDataList()
        }
      })
    },
    getMoreLevel(level) {
      return '级别' + (level + 1)
    },
    addMap() {
      this.$refs.addForm.mapFormVisible = true
      this.$refs.addForm.init()
    },
    load(data, treeNode, resolve) {
      this.lazyResolveMap.set(data.id, { data, treeNode, resolve })
      this.lazyResolveIds.push(data.id)
      mapList({
        parentId: data.id
      }).then(childList => {
        // 解决同一页中同一条数据同时出现，如果懒加载中存在，那么将之前查询出来的数据删除
        let deleteIdList = []
        childList.forEach((child) => {
          this.mapList.forEach((mapInfo) => {
            if (mapInfo.id === child.id) {
              deleteIdList.push(mapInfo.id)
            }
          })
        })
        this.mapList = this.mapList.filter((map) => {
          return deleteIdList.indexOf(map.id) === -1
        })
        resolve(childList)
      }).catch(err => {
        resolve([])
      })
    },
    deleteMap(map) {
      this.$confirm('确定删除该地图？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        mapDelete(map.id).then((deleteSuccess) => {
          if (deleteSuccess) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.refreshData({
              id: map.id,
              parentId: map.parentId
            })
          } else {
            this.deleteMapCascade(map)
          }
        }).catch(() => {
         this.$message({
            type: 'error',
            message: '删除失败'
          })
        })
      }).catch(() => {
      })
    },
    tip() {
      // 超链接跳转至
      const htmlStr = `<span>大屏设计器提供了全国省市区县的地图数据，<a href="https://www.yuque.com/chuinixiongkou/bigscreen/kdrm8g3c8zfgaaq6#xjE8w" style="color: #00a0e9"  target="_blank">点击查看</a></span>`
      this.$notify({
        title: '推荐',
        dangerouslyUseHTMLString: true,
        message: htmlStr,
        customClass: 'ds-el-notify',
        type: 'warning',
        duration: 5000
      })
    },
    deleteMapCascade(map) {
      this.$confirm('该地图存在子级，是否直接删除该地图以及其所有子级？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        mapCascadeDelete(map.id).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.refreshData({
            id: map.id,
            parentId: map.parentId
          })
        }).catch(() => {
        })
      }).catch(() => {
      })
    },
    addChild(map) {
      this.$refs.addForm.mapFormVisible = true
      this.$refs.addForm.init(map)
    },
    editMap(map) {
      this.$refs.editForm.mapFormVisible = true
      this.$refs.editForm.init(map)
    },
    uploadGeoJson(map) {
      this.currentMap = map
      this.currentMapGeoJSon = {}
      this.geoJsonVisible = true
    },
    upload() {
      this.$refs.geoJsonFileUpload.click()
    },
    handleBatchUpload(source) {
      this.uploadLoading = true
      const file = source.target.files
      const reader = new FileReader() // 新建一个FileReader
      reader.readAsText(file[0], 'UTF-8') // 读取文件

      reader.onload = (event) => {
        let jsonStr = event.target.result
        // 读取文件内容
        try {
          this.currentMapGeoJSon = JSON.parse(jsonStr)
        } catch (e) {
          this.uploadLoading = false
          this.$message.error('JSON文件格式错误')
          return false
        }
        this.uploadLoading = false
        // input通过onchange事件来触发js代码的，由于两次文件是重复的，所以这个时候onchange事件是没有触发到的，所以需要手动清空input的值
        source.target.value = ''
      }
    },
    submitUpload() {
      // 先检查JSON是否合法
      if (typeof this.currentMapGeoJSon === 'string') {
        this.$message.error('JSON文件格式错误')
        return false
      }
      if (this.currentMapGeoJSon === {}) {
        this.$message.error('JSON数据不能为空')
        return false
      }
      // 调接口保存
      uploadGeoJson({
        id: this.currentMap.id,
        geoJson: JSON.stringify(this.currentMapGeoJSon)
      }).then(res => {
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.geoJsonVisible = false
        // 刷新
        this.refreshData({
          id: this.currentMap.id,
          parentId: this.currentMap.parentId
        })
      }).catch(err => {
        this.$message({
          type: 'error',
          message: '上传失败'
        })
      })
      this.geoJsonVisible = false
    },
    isWhitespace(str) {
      // 如果是null、undefined，返回true
      if (str == null) {
        return true
      }
      return /^\s*$/.test(str);
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
.jv-container.dark {
  color: aliceblue;
  background: #161A26;
  height: 150px;
}
</style>
<style lang="scss">
//修改notify的样式
.ds-el-notify {
  background-color: var(--bs-el-background-1)!important;
  border: var(--bs-el-border)!important;
  .el-notification__title{
    color: #fff!important;
  }
  .el-notification__content{
    color: #fff!important;
  }
  .el-notification__closeBtn{
    color: #fff!important;
  }
}
</style>
