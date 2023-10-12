<template>
  <div>
    <el-dialog
      :append-to-body="true"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="mapFormVisible"
      class="bs-dialog-wrap bs-el-dialog"
      width="700px"
    >
      <el-form
        ref="mapForm"
        :model="mapForm"
        :rules="rules"
        class="bs-el-form"
        label-width="120px"
      >
        <el-form-item
          label="上级地图"
          prop="parentId"
        >
          <el-input
            v-model="parentName"
            class="bs-el-input"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="地图名称"
          prop="name"
        >
          <el-input
            v-model="mapForm.name"
            class="bs-el-input"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item
          label="地图标识"
          prop="mapCode"
        >
          <template slot="label">
            <span>地图标识</span>
            <el-tooltip
              v-if="mapForm.parentId !== '0'"
              class="item"
              effect="light"
              content="地图标识取自上级地图JSON数据中的properties.name值，用于在地图中显示地区名称"
              placement="top"
            >
              <i
                class="el-icon-warning-outline"
                style="color: #E3C98C;margin-left: 6px;font-size:14px"
              />
            </el-tooltip>
          </template>
          <el-input
            v-model="mapForm.mapCode"
            class="bs-el-input"
            placeholder="请输入地图标识"
          />
        </el-form-item>
        <el-form-item
          label="地图级别"
          prop="level"
        >
          <template slot="label">
            <span>地图级别</span>
            <el-tooltip
              v-if="mapForm.parentId !== '0'"
              class="item"
              effect="light"
              content="子级地图的级别根据上级地图自动递增，不可修改"
              placement="top"
            >
              <i
                class="el-icon-warning-outline"
                style="color: #E3C98C;margin-left: 6px;font-size:14px"
              />
            </el-tooltip>
          </template>
          <el-select
            v-model="mapForm.level"
            disabled
            class="bs-el-select"
            placeholder="请选择地图级别"
            popper-class="bs-el-select"
          >
            <el-option
              v-for="level in levelList"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
            <el-option
              v-if="![0,1,2,3,4].includes(mapForm.level)"
              :value="mapForm.level"
              :label="outRangeLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="geoJson"
        >
          <vue-json-viewer
            v-model="mapForm.geoJson"
            theme="dark"
            :show-btns="false"
            mode="code"
          />
          <el-button
            v-if="mapForm.uploadedGeoJson !== 1"
            class="bs-el-button-default"
            @click="upload"
          >
            <i class="el-icon-upload2" />
            上传
          </el-button>
        </el-form-item>
        <el-form-item
          v-if="autoParseNextLevelShow"
          label="自动解析下一级"
          prop="autoParseNextLevel"
        >
          <el-switch
            v-model="mapForm.autoParseNextLevel"
            :active-value="1"
            :inactive-value="0"
            class="bs-el-switch"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="handleClose"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="submitForm"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
    <input
      ref="geoJsonFile"
      accept=".json"
      name="file"
      style="display: none"
      type="file"
      @change="handleBatchUpload"
    >
  </div>
</template>

<script>
import _ from 'lodash'
import vueJsonViewer from 'vue-json-viewer'
import { mapUpdate, getMapChildFromGeoJson, nameRepeatCheck } from 'data-room-ui/js/utils/mapDataService'

export default {
  name: 'EditForm',
  components: {
    vueJsonViewer
  },
  computed: {
    autoParseNextLevelShow () {
      // geoJson 不为空，且未上传过（说明是刚上传的）
      return !this.isWhitespace(this.mapForm.geoJson) && !this.isEmpty(this.mapForm.geoJson) && this.mapForm.uploadedGeoJson === 0
    },
    outRangeLabel() {
      return `级别${this.mapForm.level + 1}`;
    }
  },
  data () {
    const validateCode = (rule, value, callback) => {
      if (this.mapForm.parentId === '0' || this.mapForm.parentId === 0) {
        // 不需要校验
        callback()
        return
      }
      getMapChildFromGeoJson(this.mapForm.parentId).then(children => {
        let repeat = false
        children.forEach(child => {
          if (child.exist && child.name === value && child.existId !== this.mapForm.id) {
            repeat = true
          }
        })
        if (repeat) {
          callback(new Error('地图标识已存在'))
        } else {
          callback()
        }
      })
    }
    const validateName = (rule, value, callback) => {
      if (this.mapForm.parentId !== '0') {
        // 不需要校验
        callback()
        return
      }
      nameRepeatCheck({
        id: this.mapForm.id,
        parentId: this.mapForm.parentId,
        mapName: value
      }).then(res => {
        if (res) {
          callback(new Error('地图名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      mapFormVisible: false,
      geoJsonVisible: false,
      uploadLoading: false,
      title: '编辑地图数据',
      parentName: '顶级',
      mapForm: {
        parentId: '0',
        mapCode: '',
        name: '',
        level: 0,
        geoJson: '',
        uploadedGeoJson: 0,
        autoParseNextLevel: 0
      },
      rules: {
        mapCode: [
          { required: true, message: '请输入地图标识', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入地图名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择地图级别', trigger: 'change' }
        ],
        geoJson: [
          { required: true, message: '请上传地图数据', trigger: 'change' }
        ]
      },
      levelList: [
        { value: 0, label: '世界' },
        { value: 1, label: '国家' },
        { value: 2, label: '省份' },
        { value: 3, label: '城市' },
        { value: 4, label: '区县' }
      ],
      mapCodeList: []
    }
  },
  methods: {
    init (map) {
      this.mapForm = _.cloneDeep(map)
      if (!this.isWhitespace(this.mapForm.geoJson)) {
        this.mapForm.geoJson = JSON.parse(this.mapForm.geoJson)
      } else {
        this.mapForm.geoJson = {}
      }
    },
    handleClose () {
      this.mapFormVisible = false
    },
    submitForm () {
      this.$refs.mapForm.validate(valid => {
        if (!valid) {
          return false
        }
        let geoJson
        // 如果geoJson是空的，包括空字符串，纯空格、空对象，空数组，都置为空字符串
        if (this.isWhitespace(this.mapForm.geoJson) || this.mapForm.geoJson === '{}' || this.mapForm.geoJson === '[]') {
          geoJson = ''
        } else {
          geoJson = JSON.stringify(this.mapForm.geoJson)
        }
        mapUpdate({
          ...this.mapForm,
          geoJson: geoJson
        }).then(res => {
          this.mapFormVisible = false
          this.$emit('refresh', {
            id: this.mapForm.id,
            parentId: this.mapForm.parentId
          })
        })
      })
    },
    isWhitespace (str) {
      // 如果是null、undefined，返回true
      if (str == null) {
        return true
      }
      return /^\s*$/.test(str)
    },
    isEmpty (obj) {
      if (typeof obj === 'object') {
        return Object.keys(obj).length === 0 && obj.constructor === Object
      }
      if (typeof obj === 'string') {
        return /^\s*$/.test(obj)
      }
      return Array.isArray(obj) && obj.length === 0
    },
    upload () {
      this.$refs.geoJsonFile.click()
    },
    handleBatchUpload (source) {
      this.uploadLoading = true
      const file = source.target.files
      const reader = new FileReader() // 新建一个FileReader
      reader.readAsText(file[0], 'UTF-8') // 读取文件

      reader.onload = (event) => {
        const jsonStr = event.target.result
        // 读取文件内容
        try {
          this.mapForm.geoJson = JSON.parse(jsonStr)
        } catch (e) {
          this.uploadLoading = false
          this.$message.error('JSON文件格式错误')
          return false
        }
        this.uploadLoading = false
        // input通过onchange事件来触发js代码的，由于两次文件是重复的，所以这个时候onchange事件是没有触发到的，所以需要手动清空input的值
        source.target.value = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';

.jv-container.dark {
  color: aliceblue;
  background: #161A26;
}
</style>
