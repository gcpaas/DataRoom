<template>
  <el-dialog
    width="700px"
    :title="title"
    :visible.sync="setDatasourceVisible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="bs-dialog-wrap bs-el-dialog"
  >
    <div
      v-loading="linkLoading"
      element-loading-text="正在测试连接..."
      style="padding-right: 80px;"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="dataForm.id ? updateRules : rules"
        size="small"
        label-position="right"
        :label-width="dataForm.advanceSettingFlag ? '200px' : '150px'"
      >
        <el-form-item
          label="类型"
          prop="sourceType"
        >
          <el-select
            v-model="dataForm.sourceType"
            placeholder="请选择类型"
            class="bs-el-select"
            popper-class="bs-el-select"
            clearable
            filterable
            @change="sourceEdit"
          >
            <el-option
              v-for="sourceType in sourceTypeList"
              :key="sourceType.id"
              :label="sourceType.name"
              :value="sourceType.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="数据源名称"
          prop="sourceName"
        >
          <el-input
            v-model="dataForm.sourceName"
            placeholder="请输入数据源名称"
            class="bs-el-input"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item
          label="JDBC URL"
          prop="url"
        >
          <el-input
            v-model="dataForm.url"
            placeholder="请输入JDBC URL"
            class="bs-el-input"
            type="textarea"
            rows="4"
            @keydown.enter.native="textareaKeydown"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="dataForm.username"
            placeholder="请输入用户名"
            class="bs-el-input"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            v-model="dataForm.password"
            :placeholder="dataForm.id ? '请输入密码，不输入代表不更新' : '请输入密码'"
            class="bs-el-input"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="dataForm.remark"
            placeholder="请输入备注"
            class="bs-el-input"
            type="textarea"
            rows="4"
            @keydown.enter.native="textareaKeydown"
          />
        </el-form-item>
        <template v-if="dataForm.advanceSettingFlag">
          <el-form-item label="初始化连接数">
            <el-input v-model="dataForm.initConnNum" />
          </el-form-item>
          <el-form-item label="最大活动连接数">
            <el-input v-model="dataForm.maxActiveConnNum" />
          </el-form-item>
          <el-form-item label="最大空闲连接数">
            <el-input v-model="dataForm.maxIdleConnNum" />
          </el-form-item>
          <el-form-item label="最小空闲连接数">
            <el-input v-model="dataForm.minIdleConnNum" />
          </el-form-item>
          <el-form-item label="最大等待时间 (ms)">
            <el-input v-model="dataForm.maxWaitConnNum" />
          </el-form-item>
          <el-form-item label="SQL验证查询">
            <el-input
              v-model="dataForm.sqlCheck"
              type="text"
            />
          </el-form-item>
          <el-form-item label="获取连接前校验">
            <el-select
              v-model="dataForm.getconnCheckFlag"
              clearable
            >
              <el-option
                label="是"
                :value="1"
              />
              <el-option
                label="否"
                :value="0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="归还连接前校验">
            <el-select
              v-model="dataForm.returnCheckFlag"
              clearable
            >
              <el-option
                label="是"
                :value="1"
              />
              <el-option
                label="否"
                :value="0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开启空闲回收器校验">
            <el-select
              v-model="dataForm.startIdleCheckFlag"
              clearable
            >
              <el-option
                label="是"
                :value="1"
              />
              <el-option
                label="否"
                :value="0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="空闲连接回收器休眠时间 (ms)">
            <el-input v-model="dataForm.idleConnDormantTime" />
          </el-form-item>
          <el-form-item label="空闲连接回收检查数">
            <el-input v-model="dataForm.idleConnCheckNum" />
          </el-form-item>
          <el-form-item label="保持空闲最小时间值 (s)">
            <el-input v-model="dataForm.keepIdleMinTime" />
          </el-form-item>
        </template>
      </el-form>
    </div>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="sourceLinkCheck"
      >
        测试
      </el-button>
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
</template>

<script>
import { checkRepeat, sourceLinkTest, addOrUpdateDataSource } from 'packages/js/utils/dataSourceService'
export default {
  props: {
    appCode: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      setDatasourceVisible: false,
      title: '',
      linkLoading: false,
      sourceTypeList: [
        { name: 'Mysql', code: 'mysql' },
        { name: 'ClickHouse', code: 'clickhouse' },
        { name: 'PostgreSQL', code: 'postgresql' },
        { name: 'Oracle', code: 'oracle' }
      ],
      driverCLassList: [
        { code: 'mysqlDriver', name: 'com.mysql.jdbc.Driver' },
        { code: 'clickhouseDriver', name: 'ru.yandex.clickhouse.ClickHouseDriver' },
        { code: 'oracleDriver', name: 'oracle.jdbc.driver.OracleDriver' },
        { code: 'hsqlDriver', name: 'org.hsqldb.jdbc.JDBCDriver' },
        { code: 'ibmdb2Driver', name: 'com.ibm.db2.jcc.DB2Driver' },
        { code: 'sqlserverDriver', name: 'com.microsoft.sqlserver.jdbc.SQLServerDriver' },
        { code: 'postgresqlDriver', name: 'org.postgresql.Driver' },
        { code: 'hiveDriver', name: 'org.apache.hive.jdbc.HiveDriver' }
      ],
      dataForm: {
        id: '',
        sourceName: '',
        sourceType: 'Mysql',
        driverClassName: 'com.mysql.jdbc.Driver',
        username: '',
        password: '',
        coding: '自动',
        url: 'jdbc:mysql://localhost:3306/db_name?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false&useOldAliasMetadataBehavior=true',
        advanceSettingFlag: 0,
        initConnNum: 0,
        maxActiveConnNum: 0,
        maxIdleConnNum: 0,
        minIdleConnNum: 0,
        maxWaitConnNum: 0,
        sqlCheck: '',
        getconnCheckFlag: 0,
        returnCheckFlag: 0,
        startIdleCheckFlag: 0,
        idleConnDormantTime: 0,
        idleConnCheckNum: 0,
        keepIdleMinTime: 0,
        remark: ''
      },
      rules: {
        sourceType: [
          { required: true, message: '请选择数据源类型', trigger: 'blur' }
        ],
        sourceName: [
          { required: true, message: '请输入数据源名称', trigger: 'blur' },
          { validator: this.validateSourceName, trigger: 'blur' }
        ],
        driverClassName: [
          { required: true, message: '请选择连接驱动', trigger: 'blur' }
        ],
        database: [
          { required: true, message: '请输入数据库名称', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '数据库名称不能包含汉字' }
        ],
        host: [
          { required: true, message: '请输入主机号', trigger: 'blur' },
          {
            pattern: /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/,
            message: '主机号格式有误'
          }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' },
          { pattern: /^[0-9]*$/, message: '端口号只能为数字' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '用户名不能包含汉字' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入连接url', trigger: 'blur' }
        ],
        coding: [
          { required: true, message: '请选择编码', trigger: 'blur' }
        ]
      },
      updateRules: {
        sourceType: [
          { required: true, message: '请选择数据源类型', trigger: 'blur' }
        ],
        sourceName: [
          { required: true, message: '请输入数据源名称', trigger: 'blur' },
          { validator: this.validateSourceName, trigger: 'blur' }
        ],
        driverClassName: [
          { required: true, message: '请选择连接驱动', trigger: 'blur' }
        ],
        database: [
          { required: true, message: '请输入数据库名称', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '数据库名称不能包含汉字' }
        ],
        url: [
          { required: true, message: '请输入连接url', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '用户名不能包含汉字' }
        ]
      }
    }
  },
  methods: {
    // 初始化
    init (row) {
      // 清除表单验证
      if (this.$refs.dataForm) {
        this.$refs.dataForm.clearValidate()
      }
      if (row && row.id) {
        this.dataForm = row
      }
    },
    getUrl (driverClassName) {
      switch (driverClassName) {
        case 'com.mysql.jdbc.Driver':
          return 'jdbc:mysql://localhost:3306/db_name?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false&useOldAliasMetadataBehavior=true'
        case 'ru.yandex.clickhouse.ClickHouseDriver':
          return 'jdbc:clickhouse://localhost:8123/db_name'
        case 'oracle.jdbc.driver.OracleDriver':
          return 'jdbc:oracle:thin:@localhost:1521:orcl'
        case 'org.hsqldb.jdbc.JDBCDriver':
          return 'jdbc:hsqldb:http://localhost:1527/db_name'
        case 'com.ibm.db2.jcc.DB2Driver':
          return 'jdbc:db2://localhost:5000/db_name'
        case 'com.microsoft.sqlserver.jdbc.SQLServerDriver':
          return 'jdbc:microsoft:sqlserver://localhost:1433DatabaseName=db_name'
        case 'org.postgresql.Driver':
          return 'jdbc:postgresql://localhost:13308/db_name'
        case 'org.apache.hive.jdbc.HiveDriver':
          return 'jdbc:hive2://localhost:10000/db_name'
      }
    },
    // 名称校验
    validateSourceName (rule, value, callback) {
      checkRepeat({
        id: this.dataForm.id,
        sourceName: this.dataForm.sourceName,
        moduleCode: this.appCode
      }).then(r => {
        if (r) {
          callback(new Error(r))
        } else {
          callback()
        }
      })
    },
    // 数据源类型选择
    sourceEdit (name) {
      this.dataForm.coding = '自动'
      if (!this.dataForm.id && name) {
        let type = ''
        type = name
        this.sourceTypeList.forEach(r => {
          if (type === r.name) {
            const code = r.code + 'Driver'
            this.driverCLassList.forEach(r => {
              if (code === r.code) {
                this.dataForm.driverClassName = r.name
                this.queryDriverTemp(r.name)
              }
            })
          }
        })
      }
    },
    queryDriverTemp (val) {
      this.$set(this.dataForm, 'url', this.getUrl(val))
    },
    // 阻止文本域回车换行
    textareaKeydown () {
      const e = window.event || arguments[0]
      if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
        e.returnValue = false
        return false
      }
    },
    // 连接测试
    sourceLinkCheck () {
      let flag = 0
      this.$refs.dataForm.validate((valid) => {
        if (!valid) {
          flag = 1
          return false
        } else {
          if (flag === 0) {
            this.sourceLinkTest(this.dataForm)
          }
        }
      })
    },
    sourceLinkTest (row) {
      this.linkLoading = true
      sourceLinkTest(row).then((r) => {
        this.$message.success(r)
        this.linkLoading = false
      }).catch(() => {
        this.linkLoading = false
      })
    },
    // 取消重制
    handleClose () {
      this.$refs.dataForm.resetFields()
      this.dataForm = {
        id: '',
        sourceName: '',
        sourceType: 'Mysql',
        driverClassName: 'com.mysql.jdbc.Driver',
        username: '',
        password: '',
        coding: '自动',
        url: 'jdbc:mysql://localhost:3306/db_name?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false&useOldAliasMetadataBehavior=true',
        advanceSettingFlag: 0,
        initConnNum: 0,
        maxActiveConnNum: 0,
        maxIdleConnNum: 0,
        minIdleConnNum: 0,
        maxWaitConnNum: 0,
        sqlCheck: '',
        getconnCheckFlag: 0,
        returnCheckFlag: 0,
        startIdleCheckFlag: 0,
        idleConnDormantTime: 0,
        idleConnCheckNum: 0,
        keepIdleMinTime: 0,
        remark: ''
      }
      this.setDatasourceVisible = false
    },
    // 保存
    submitForm () {
      // mysql 需要包含useOldAliasMetadataBehavior
      // if (this.dataForm.sourceType == 'Mysql') {
      //   if (this.dataForm.url.indexOf('useOldAliasMetadataBehavior') == -1) {
      //     if (this.dataForm.url.indexOf('?') == -1) {
      //       this.dataForm.url = this.dataForm.url + '?useOldAliasMetadataBehavior=true'
      //     } else {
      //       this.dataForm.url = this.dataForm.url + '&useOldAliasMetadataBehavior=true'
      //     }
      //   }
      // }
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          addOrUpdateDataSource({
            ...this.dataForm,
            moduleCode: this.appCode,
            editable: this.appCode ? 1 : 0
          }).then(() => {
            this.$message.success('保存成功')
            // 刷新表格
            this.$emit('refreshTable')
            this.handleClose()
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/assets/style/bsTheme.scss';
</style>
