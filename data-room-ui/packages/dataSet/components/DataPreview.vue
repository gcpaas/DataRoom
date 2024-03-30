<template>
  <div>
    <div class="dataroom-dataset-data-preview-title">
      数据预览&输出字段配置
    </div>
    <div class="dataroom-dataset-data-preview-table">
      <el-table
        v-loading="loading"
        align="center"
        border
        :data="data"
        max-height="600"
        class="dataroom-el-table bs-scrollbar"
      >
        <el-table-column
          v-for="(value, key) in headerColumn"
          :key="key"
          :label="value"
          min-width="180"
          align="center"
          show-overflow-tooltip
        >
          <template
            slot="header"
            slot-scope="scope"
          >
            <el-popover
              v-if="headerColumnObj[value]"
              placement="top"
              trigger="click"
            >
              <span
                class="dataroom-dataset-data-preview-title dataroom-dataset-data-preview-popover-title"
              >
                输出字段设置
              </span>
              <el-form :data="headerColumnObj[value]">
                <el-form-item
                  label="字段名称"
                  prop="fieldName"
                >
                  <el-input
                    v-model="headerColumnObj[value].fieldName"
                    disabled
                  />
                </el-form-item>
                <el-form-item
                  label="字段描述"
                  prop="fieldDesc"
                >
                  <el-input
                    v-model="headerColumnObj[value].fieldDesc"
                    size="small"
                    class="labeldsc bs-el-input"
                  />
                </el-form-item>
                <el-form-item
                  label="字段类型"
                  prop="fieldType"
                >
                  <el-select
                    v-model="headerColumnObj[scope.column.label].fieldType"
                  >
                    <el-option
                      v-for="(type, key) in fieldTypeOptions"
                      :key="key"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
              <div
                slot="reference"
                class="table-header-popover"
              >
                <div class="field-type">
                  <span
                    :style="{
                      '--type-color':
                        typeColor[headerColumnObj[value].fieldType] ||
                        getTypeColor(headerColumnObj[value].fieldType),
                      '--type-text': $options.filters.getFieldType(headerColumnObj[value].fieldType)
                    }"
                    class="type"
                  >
                    {{ headerColumnObj[value].fieldType | getFieldType }}
                  </span>
                </div>
                <span class="">{{ headerColumnObj[value].fieldDesc }}</span>
              </div>
            </el-popover>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row[value] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      v-if="size"
      class="dataroom-dataset-data-preview-pagination"
    >
      <el-pagination
        class="bs-el-pagination"
        popper-class="bs-el-pagination"
        :current-page="current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="size"
        :total="totalCount"
        background
        prev-text="上一页"
        next-text="下一页"
        layout="total, prev, pager, next,sizes"
        @size-change="
          (value) => {
            $emit('size-change', value);
          }
        "
        @current-change="
          (value) => {
            $emit('current-change', value);
          }
        "
      />
    </div>
  </div>
</template>

<script>
import resizeTableHeight from '@gcpaas/data-room-ui/packages/assets/js/utils/resizeHeightDirevtive.js'
// 文本类型对应的后端的字段类型集合：varchar, char, text
const textType = ['VARCHAR', 'CHAR', 'text']
// 数字类型对应的后端的字段类型集合：int, bigint, float, double, decimal
const numberType = ['INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 'number']
// 时间类型对应的后端的字段类型集合：date, datetime, timestam
const timeType = ['DATETIME', 'TIMESTAMP', 'date']
// 布尔类型对应的后端的字段类型集合：boolean
const booleanType = ['TINYINT', 'boolean']
export default {
  name: 'DataPreview',
  directives: {
    resizeTableHeight // 注册自定义指令
  },
  props: {
    data: {
      type: Array,
      default: () => [],
      required: true
    },
    // array or object
    headerColumn: {
      type: [Array, Object],
      default: () => {}
    },
    headerFields: {
      type: Array,
      default: () => [],
      required: true
    },
    totalCount: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 1
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  filters: {
    getFieldType (type) {
      let typeText = '文本'
      if (textType.includes(type)) {
        typeText = '文本'
      } else if (numberType.includes(type)) {
        typeText = '数字'
      } else if (timeType.includes(type)) {
        typeText = '时间'
      } else if (booleanType.includes(type)) {
        typeText = '布尔值'
      }
      return typeText
    }
  },
  data () {
    return {
      headerColumnObj: {},
      typeColor: {
        text: '#409EFF',
        number: '#67C23A',
        date: '#E6A23C',
        boolean: '#F56C6C'
      },
      fieldTypeOptions: [
        {
          value: 'text',
          label: '文本'
        },
        {
          value: 'number',
          label: '数字'
        },
        {
          value: 'date',
          label: '时间'
        },
        {
          value: 'boolean',
          label: '布尔值'
        }
      ]
    }
  },
  computed: {},
  watch: {
    headerFields: {
      handler (val) {
        this.headerColumnObj = val.reduce((item, data) => {
          // data里的fieldDesc 如果没有值，就使用fieldName，数据变成响应式
          item[data.fieldName] = {
            fieldName: data.fieldName,
            fieldDesc: data.fieldDesc || data.fieldName,
            fieldType: data.fieldType || 'text'
          }
          return item
        }, {})
      },
      deep: true
    }
  },
  created () {},
  mounted () {},
  methods: {
    getTypeColor (type) {
      let color = '#409EFF'
      if (textType.includes(type)) {
        color = '#409EFF'
      } else if (numberType.includes(type)) {
        color = '#67C23A'
      } else if (timeType.includes(type)) {
        color = '#E6A23C'
      } else if (booleanType.includes(type)) {
        color = '#F56C6C'
      }
      return color
    }
  }
}
</script>

<style lang="scss">
.el-popover {
  .el-form-item__content {
    display: flex;
  }
}
</style>

<style lang="scss" scoped>
.table-header-popover {
  height: 28px;
}
.field-type {
  width: 0;
  .type {
    width: max-content;
    display: block;
    position: relative;
    padding: 0px 2px;
    font-size: 10px;
    right: 35px;
    color: var(--type-color);
    border: 1px solid var(--type-color);
  }
}
.dataroom-dataset-data-preview-title {
  font-size: 14px;
  font-weight: 600;
  position: relative;
  padding: 16px 0;
  padding-left: 12px;
  border-bottom: 1px solid #ebeef5;

  &::before {
    content: "";
    height: 14px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: 4px solid #409eff;
  }
}
.dataroom-dataset-data-preview-popover-title {
  border: none;
  display: block;
}

.dataroom-dataset-data-preview-table {
  margin: 16px;
}
::v-deep .el-table--border {
  border-bottom: 1px solid #ebeef5;
}
.dataroom-dataset-data-preview-pagination {
  margin-bottom: 8px;
  text-align: right;
}
</style>
