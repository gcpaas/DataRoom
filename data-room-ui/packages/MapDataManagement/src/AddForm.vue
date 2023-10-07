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
              content="子级的地图标识解析自上级地图的子区块数据"
              placement="top"
            >
              <i
                class="el-icon-warning-outline"
                style="color: #E3C98C;margin-left: 6px;font-size:14px"
              />
            </el-tooltip>
          </template>
          <el-input
            v-if="mapForm.parentId === '0'"
            v-model="mapForm.mapCode"
            class="bs-el-input"
            placeholder="请输入地图标识"
          />
          <el-select
            v-else
            v-model="mapForm.mapCode"
            class="bs-el-select"
            placeholder="请选择地图标识"
            popper-class="bs-el-select"
          >
            <el-option
              v-for="mapCode in mapCodeList"
              :key="mapCode.name"
              :disabled="mapCode.exist"
              :label="mapCode.name"
              :value="mapCode.name"
            >
              <span style="float: left">{{ mapCode.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ mapCode.exist ? '已存在' : '' }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="地图级别"
          prop="level"
        >
          <el-select
            v-model="mapForm.level"
            :disabled="mapForm.parentId !== '0'"
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
          label="geoJson上传"
        >
          <vue-json-viewer
            v-model="mapForm.geoJson"
            theme="dark"
            :show-btns="false"
            mode="code"
          />
          <el-button
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
import vueJsonViewer from 'vue-json-viewer'
import { getMapChildFromGeoJson, mapAdd, repeatCheck, nameRepeatCheck } from 'data-room-ui/js/utils/mapDataService'

export default {
  name: 'AddForm',
  components: {
    vueJsonViewer
  },
  computed: {
    autoParseNextLevelShow () {
      // geoJson 不为空
      return !this.isEmpty(this.mapForm.geoJson)
    },
    outRangeLabel() {
      return `级别${this.mapForm.level + 1}`;
    }
  },
  data () {
    const validateCode = (rule, value, callback) => {
      if (this.mapForm.parentId !== '0') {
        // 不需要校验
        callback()
        return
      }
      repeatCheck({
        parentId: this.mapForm.parentId,
        mapCode: value
      }).then(res => {
        if (res) {
          callback(new Error('地图标识已存在'))
        } else {
          callback()
        }
      })
    }
    const validateName = (rule, value, callback) => {
      nameRepeatCheck({
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
      title: '新增地图数据',
      parentName: '顶级',
      mapForm: {
        parentId: '0',
        mapCode: '',
        name: '',
        level: 0,
        geoJson: {},
        uploadedGeoJson: 0,
        autoParseNextLevel: 0
      },
      rules: {
        mapCode: [
          { required: true, message: '请选择地图标识', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入地图名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择地图级别', trigger: 'change' }
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
    init (parentMap) {
      this.mapForm = {
        parentId: '0',
        mapCode: `map-${new Date().getTime()}`,
        name: '',
        level: 0,
        geoJson: {},
        uploadedGeoJson: 0,
        autoParseNextLevel: 0
      }
      this.parentName = '顶级'
      if (parentMap) {
        this.mapForm.parentId = parentMap.id
        this.parentName = parentMap.name
        this.mapForm.level = parentMap.level + 1
        this.mapForm.mapCode = ''
        this.getMapCodeList()
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
        // 如果geoJson是空的，包括空字符串，纯空格、空对象，空数组，都不允许提交
        if (this.isEmpty(this.mapForm.geoJson)) {
          geoJson = ''
        } else {
          geoJson = JSON.stringify(this.mapForm.geoJson)
        }
        mapAdd({
          ...this.mapForm,
          geoJson: geoJson
        }).then(res => {
          this.mapFormVisible = false
          this.$emit('refresh', {
            id: res,
            parentId: this.mapForm.parentId
          })
        })
      })
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
    getMapCodeList () {
      this.mapCodeList = []
      if (this.mapForm.parentId === '0') {
        this.mapCodeList = [{
          name: `map-${new Date().getTime()}`,
          exist: false
        }]
      } else {
        getMapChildFromGeoJson(this.mapForm.parentId).then(res => {
          this.mapCodeList = res
        })
      }
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
