<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-loading="saveLoading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? '自助数据集详情' : dataForm.id ? '编辑自助数据集' : '新增自助数据集' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/self_dataset')"
                >
                  帮助
                </el-button>
                <el-button
                  v-if="isEdit"
                  type="primary"
                  @click="save('form')"
                >
                  保存
                </el-button>
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
      </div>
      <el-row style="margin: 16px 16px 0;">
        <el-col :span="isEdit ? 16 : 24">
          <el-form
            ref="form"
            :model="dataForm"
            :rules="rules"
            label-width="120px"
            style="padding: 16px 16px 0;"
            class="bs-el-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="数据集名称"
                  prop="name"
                >
                  <el-input
                    v-model="dataForm.name"
                    class="bs-el-input"
                    clearable
                    :disabled="!isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="分组"
                  prop="typeId"
                >
                  <el-select
                    ref="selectParentName"
                    v-model="dataForm.typeId"
                    popper-class="bs-el-select"
                    class="bs-el-select"
                    placeholder="请选择分组"
                    clearable
                    :disabled="!isEdit"
                    filterable
                    :filter-method="selectorFilter"
                    @clear="clearType"
                    @visible-change="setCurrentNode"
                  >
                    <el-option
                      style="height: auto;padding: 0;"
                      :label="typeName"
                      :value="dataForm.typeId"
                    >
                      <div>
                        <el-tree
                          ref="categorySelectTree"
                          :data="categoryData"
                          node-key="id"
                          :indent="0"
                          :props="{ label: 'name', children: 'children' }"
                          :default-expand-all="true"
                          :highlight-current="true"
                          :expand-on-click-node="false"
                          class="bs-el-tree"
                          :filter-node-method="treeFilter"
                          @node-click="selectParentCategory"
                        >
                          <span
                            slot-scope="{ data }"
                            class="custom-tree-node"
                          >
                            <span>
                              <i
                                :class="data.children && data.children.length ? 'el-icon el-icon-folder' : 'el-icon el-icon-document'"
                              />
                              {{ data.name }}
                            </span>
                          </span>
                        </el-tree>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="备注"
                  prop="remark"
                >
                  <el-input
                    v-model="dataForm.remark"
                    class="bs-el-input"
                    :disabled="!isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="数据源"
                  prop="sourceId"
                >
                  <el-select
                    v-model="dataForm.sourceId"
                    clearable
                    filterable
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    placeholder="请选择数据源"
                    :disabled="!isEdit"
                  >
                    <el-option
                      v-for="source in sourceList"
                      :key="source.id"
                      :label="source.sourceName"
                      :value="source.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="缓存"
                  prop="cache"
                >
                  <el-radio-group
                    v-model="dataForm.cache"
                    class="bs-el-radio-group"
                  >
                    <el-radio :label="1">
                      开启
                    </el-radio>
                    <el-radio :label="0">
                      关闭
                    </el-radio>
                  </el-radio-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="开启缓存:会在首次调用该数据集时，将结果缓存，在接下来的十分钟内，若再次被调用则直接返回缓存中的数据，注意：在当前数据集编辑页面缓存不生效"
                    placement="top"
                  >
                    <i
                      class="el-icon-warning-outline"
                      style="color: #E3C98C;margin-left: 16px;font-size:14px"
                    />
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="语法类型"
                  prop="syntaxType"
                >
                  <el-radio-group
                    v-model="dataForm.syntaxType"
                    class="bs-el-radio-group"
                  >
                    <el-radio label="normal">
                      普通
                    </el-radio>
                    <el-radio label="mybatis">
                      Mybatis
                    </el-radio>
                  </el-radio-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="Mybatis类型可使用动态标签来处理sql，如if、choose、where，具体用法可参考示例"
                    placement="top"
                  >
                    <i
                      class="el-icon-warning-outline"
                      style="color: #E3C98C;margin-left: 16px;font-size:14px"
                    />
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="标签"
                  prop="labelIds"
                >
                  <LabelSelect
                    :dataset-id="datasetId"
                    :id-list="dataForm.labelIds"
                    @commit="(ids) => { dataForm.labelIds = ids }"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div
            v-if="isEdit"
            class="sql-config"
          >
            <div>
              <codemirror
                ref="targetInSql"
                v-model="dataForm.sqlProcess"
                :options="cOptions"
                style="margin-top: 2px"
              />
              <div
                v-if="dataForm.syntaxType === 'mybatis'"
                class="bs-codemirror-bottom-text"
              >
                示例：
                <strong><br>
                  1、常规使用
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="${参数名称}会将参数值直接填充到sql中，#{参数名称}会将参数值进行转义（比如字符串类型会添加''）后填充到sql中"
                    placement="top-start"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where table_field = <span style="color: #CC7832;">${参数名称}</span> ( 或 <span style="color: #CC7832;">#{参数名称}</span> )<br>
                  2、条件判断
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="支持Mybatis的所有动态标签，如if、choose、where等，具体用法请参考Mybatis官方文档"
                    placement="top-start"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where 1=1 <span style="color: #2F67A7;">&lt;if test="参数名称 != null and 参数名称 !=''"&gt;</span> and table_field = <span
                    style="color: #CC7832;"
                  >${参数名称}</span> <span style="color: #2F67A7;">&lt;/if&gt;</span>
                </strong>
              </div>
              <div
                v-else
                class="bs-codemirror-bottom-text"
              >
                示例：
                <strong><br>
                  1、常规使用 select * from table where table_field = <span style="color: #CC7832;">${参数名称}</span><br>
                  2、标签使用
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="<参数名称></参数名称>为非空标签, 当该参数值为空时, 标签部分不进行处理"
                    placement="top-start"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where 1=1 <span style="color: #2F67A7;">&lt;参数名称&gt;</span> and table_field = <span
                    style="color: #CC7832;"
                  >${参数名称}</span> <span style="color: #2F67A7;">&lt;/参数名称&gt;</span>
                </strong>
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0;">
              <el-button
                type="primary"
                @click="buildParamsAndRun"
              >
                解析并运行
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col
          v-if="isEdit"
          :span="8"
        >
          <div class="right-setting">
            <div class="paramConfig">
              <div class="title-style bs-title-style">
                SQL参数
                <el-button
                  type="text"
                  style="float: right;border: none;margin-top: -4px;"
                  @click="openParamsConfig"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="param in dataForm.paramsList"
                  :key="param.name"
                  class="field-item"
                  @click="openParamsConfig"
                >
                  <span>{{ param.name }}</span>&nbsp;<span
                    v-show="param.remark"
                    style="color: #909399;"
                  >({{ param.remark
                  }})</span>
                  <el-button
                    class="edit_field"
                    type="text"
                    style="float: right;border: none;margin-top: 2px;"
                    @click="openParamsConfig"
                  >
                    配置
                  </el-button>
                </div>
              </div>
            </div>
            <div class="structure">
              <div class="title-style bs-title-style">
                输出字段
                <el-button
                  type="text"
                  style="float: right;border: none;margin-top: -4px;"
                  @click="fieldsetVisible = true"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="field in sortedStructurePreviewList"
                  :key="field.fieldName"
                  class="field-item"
                  @click="fieldsetVisible = true"
                >
                  <span>{{ field.fieldName }}</span>&nbsp;<span
                    v-show="field.fieldDesc"
                    style="color: #909399;"
                  >({{
                    field.fieldDesc }})</span>
                  <el-button
                    class="edit_field"
                    type="text"
                    style="float: right;border: none;margin-top: 2px;"
                    @click="fieldsetVisible = true"
                  >
                    配置
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div
        v-if="isEdit"
        class="dataPreView"
        style="margin-top: 12px;"
      >
        <div class="result-view">
          数据预览
        </div>
        <div class="bs-table-box is-Edit">
          <el-table
            align="center"
            :data="dataPreviewList"
            max-height="400"
            class="bs-el-table bs-scrollbar"
          >
            <el-table-column
              v-for="(value, key) in sortedTablePreviewList"
              :key="key"
              :label="value"
              align="center"
              show-overflow-tooltip
              :render-header="renderHeader"
            >
              <template slot-scope="scope">
                <span>{{ scope.row[value] }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="bs-pagination">
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
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </div>
      </div>
      <div
        v-if="!isEdit"
        class="dataPreView"
      >
        <el-tabs v-model="activeName">
          <el-tab-pane
            v-loading="tableLoading"
            label="数据预览"
            name="data"
          >
            <div class="bs-table-box">
              <el-table
                align="center"
                :data="dataPreviewList"
                max-height="400"
                :border="true"
              >
                <el-table-column
                  v-for="(value, key) in dataPreviewList[0]"
                  :key="key"
                  :label="key"
                  align="center"
                  show-overflow-tooltip
                  :render-header="renderHeader"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row[key] }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="bs-pagination">
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
                @size-change="sizeChangeHandle"
                @current-change="currentChangeHandle"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-loading="tableLoading"
            label="数据集结构"
            name="structure"
          >
            <div class="bs-table-box">
              <el-table
                max-height="400"
                :data="structurePreviewList"
                :border="true"
                align="center"
              >
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="fieldName"
                  label="字段值"
                />
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="fieldType"
                  label="字段类型"
                />
                <el-table-column
                  align="center"
                  prop="fieldDesc"
                  label="字段描述"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="isEdit"
                      v-model="scope.row.fieldDesc"
                      size="small"
                      class="labeldsc bs-el-input"
                    />
                    <span v-else>{{ scope.row.fieldDesc }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="orderNum"
                  label="字段排序"
                  sortable
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="isEdit"
                      v-model="scope.row.orderNum"
                      size="small"
                      class="labeldsc bs-el-input"
                    />
                    <span v-else>{{ scope.row.orderNum }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="sourceTable"
                  label="字段来源"
                >
                  <template slot-scope="scope">
                    <el-select
                      v-if="isEdit"
                      v-model="scope.row.sourceTable"
                      popper-class="bs-el-select"
                      class="bs-el-select"
                      clearable
                      filterable
                    >
                      <el-option
                        v-for="table in tableNameList"
                        :key="table"
                        :label="table"
                        :value="table"
                      />
                    </el-select>
                    <span v-else>{{ scope.row.sourceTable }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 字段填充方式 -->
      <el-dialog
        title="提示"
        :visible.sync="fieldDescVisible"
        width="420px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="fieldDescCheck"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <p style="color:var(--bs-el-text);line-height: 24px;padding-left: 10px;display: flex;">
          <i
            class="el-icon-warning"
            style="color: #E6A23C;font-size: 24px;margin-right: 5px;"
          />
          存在字段描述信息为空，请确认
        </p>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="fieldDescFill"
          >使用字段名填充</el-button>
          <el-button
            class="bs-el-button-default"
            @click="fieldDescEdit"
          >进入编辑</el-button>
          <el-button
            type="primary"
            @click="toSave"
          >继续保存</el-button>
        </span>
      </el-dialog>
      <!-- 字段填充 -->
      <el-dialog
        title="输出字段配置"
        :visible.sync="fieldsetVisible"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
        :before-close="cancelField"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <div class="bs-table-box">
          <el-table
            class="bs-el-table"
            :data="structurePreviewListCopy"
            :border="true"
            align="center"
          >
            <el-empty slot="empty" />
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="fieldName"
              label="字段值"
            />
            <el-table-column
              align="center"
              show-overflow-tooltip
              prop="fieldType"
              label="字段类型"
            />
            <el-table-column
              align="center"
              prop="fieldDesc"
              label="字段描述"
            >
              <template slot-scope="scope">
                <el-input
                  v-if="isEdit"
                  v-model="scope.row.fieldDesc"
                  size="small"
                  class="labeldsc bs-el-input"
                />
                <span v-else>{{ scope.row.fieldDesc }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="orderNum"
              label="字段排序"
              sortable
            >
              <template slot-scope="scope">
                <el-input
                  v-if="isEdit"
                  v-model="scope.row.orderNum"
                  size="small"
                  class="labeldsc bs-el-input"
                />
                <span v-else>{{ scope.row.orderNum }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="sourceTable"
              label="字段来源"
            >
              <template slot-scope="scope">
                <el-select
                  v-if="isEdit"
                  v-model="scope.row.sourceTable"
                  popper-class="bs-el-select"
                  class="bs-el-select"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="table in tableNameList"
                    :key="table"
                    :label="table"
                    :value="table"
                  />
                </el-select>
                <span v-else>{{ scope.row.sourceTable }}</span>
              </template>
            </el-table-column>
            <!-- 添加一个插槽，供其他人可扩展表格列，并把表格列的数据返回出去 -->
            <slot name="output-field-table-column" />
          </el-table>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="cancelField"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="setField"
          >
            确定
          </el-button>
        </span>
      </el-dialog>
      <!-- 参数配置 -->
      <el-dialog
        title="SQL参数配置"
        :visible.sync="paramsVisible"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
        :before-close="cancelParam"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <div class="bs-table-box">
          <el-table
            ref="singleTable"
            class="bs-el-table"
            :data="paramsListCopy"
            :border="true"
            align="center"
          >
            <el-empty slot="empty" />
            <el-table-column
              prop="name"
              label="参数名称"
              align="center"
            />
            <el-table-column
              prop="type"
              label="参数类型"
              align="center"
              width="200"
              filterable
            >
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.type"
                  popper-class="bs-el-select"
                  class="bs-el-select"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in typeSelect"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="require"
              label="是否必填"
              align="center"
              width="200"
              filterable
            >
              <template slot-scope="scope">
                <el-radio-group
                  v-model="scope.row.require"
                  class="bs-el-radio-group"
                >
                  <el-radio :label="1">
                    是
                  </el-radio>
                  <el-radio :label="0">
                    否
                  </el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column
              prop="value"
              label="参数值"
              align="center"
            >
              <template slot-scope="scope">
                <el-form
                  ref="form"
                  :model="scope.row"
                >
                  <el-form-item
                    :show-message="scope.row.require === 1"
                    class="form-item-value"
                    prop="value"
                    :rules="getRules(scope.row)"
                  >
                    <el-date-picker
                      v-if="scope.row.type === 'Date'"
                      v-model="scope.row.value"
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      placeholder="选择日期时间"
                    />
                    <el-input
                      v-else
                      v-model="scope.row.value"
                      class="bs-el-input"
                      clearable
                      placeholder="请输入值"
                    />
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="备注"
              align="center"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remark"
                  clearable
                  class="bs-el-input"
                  placeholder="请输入备注"
                  rows="2"
                  maxlength="200"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="105"
              align="center"
            >
              <template slot="header">
                <el-button
                  icon="el-icon-plus"
                  type="text"
                  class="no-border"
                  @click="addParam"
                >
                  添加
                </el-button>
              </template>
              <template slot-scope="scope">
                <el-button
                  type="text"
                  style="color: #e47470;"
                  class="no-border"
                  @click="delRow(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="cancelParam"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="setParam"
          >
            确定
          </el-button>
        </span>
      </el-dialog>
    </el-scrollbar>
  </div>
</template>

<script>
import LabelSelect from 'data-room-ui/DataSetLabelManagement/src/LabelSelect.vue'
import {
  nameCheckRepeat,
  datasetAdd,
  datasetUpdate,
  datasetExecuteTest,
  getCategoryTree,
  getDataset
} from 'data-room-ui/js/utils/datasetConfigService'
import { datasourceList } from 'data-room-ui/js/utils/dataSourceService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/nord.css'
import 'codemirror/lib/codemirror.css'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixins } from 'data-room-ui/js/mixins/datasetMixin'
export default {
  name: 'CustomEditForm',
  components: {
    codemirror,
    LabelSelect
  },
  mixins: [datasetMixins],
  data () {
    const validateName = (rule, value, callback) => {
      nameCheckRepeat({
        id: this.datasetId,
        name: value,
        moduleCode: this.appCode
      }).then((r) => {
        if (r) {
          callback(new Error('数据集名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        datasetType: 'custom',
        remark: '',
        labelIds: [],
        // 以下为config配置
        sourceId: '',
        cache: 0,
        sqlProcess: 'select * from 表名称',
        paramsList: [],
        fieldDesc: {},
        fieldList: [],
        script: '',
        cacheCoherence: null,
        syntaxType: 'normal'
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        sourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: '请选择分组', trigger: 'blur' }
        ]
      },
      cOptions: {
        mode: 'text/x-mysql',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      sourceList: [],
      activeName: 'data',
      msg: '',
      exception: '',
      passTest: false, // 通过测试
      paramsVisible: false,
      tableNameList: [],
      paramsListCopy: [],
      isTest: false // 是否执行测试
    }
  },
  computed: {
    checkPass () {
      return {
        sqlProcess: this.dataForm.sqlProcess,
        script: this.dataForm.script,
        paramsList: this.dataForm.paramsList
      }
    },
    noDataTableDisplayFields () {
      // 表格列对象
      const tableColumnObject = {}
      this.structurePreviewList.forEach(item => {
        tableColumnObject[item.fieldName] = ''
      })
      return tableColumnObject
    },
    // 输出字段根据orderNum排序
    sortedStructurePreviewList () {
      const list = this.structurePreviewList
      list.sort((a, b) => {
        return a.orderNum - b.orderNum
      })
      return list
    },
    sortedTablePreviewList () {
      const tableList = this.dataPreviewList[0] ? this.dataPreviewList[0] : this.noDataTableDisplayFields
      const list = Object.keys(tableList)
      list.sort((a, b) => {
        return this.structurePreviewListCopy.findIndex(item => item.fieldName === a) - this.structurePreviewListCopy.findIndex(item => item.fieldName === b)
      })
      return list
    }
  },
  watch: {
    // 一旦sql、脚本、参数发生变化，将通过测试置为false
    checkPass: {
      handler (value) {
        this.passTest = false
      },
      deep: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     * 1.获取分类树
     * 2.获取数据源列表
     * 3.如果是编辑，获取数据集详情
     */
    async init () {
      // 获取分类树
      this.categoryData = await getCategoryTree({ type: 'dataset', moduleCode: this.appCode })
      // 如果传入了分类id，需要设置分类id和名称
      if (this.typeId) {
        this.dataForm.typeId = this.typeId
        this.$nextTick(() => {
          try {
            this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
          } catch (error) {
            console.error(error)
          }
        })
      }
      // 获取数据源列表
      this.getDataSource()
      if (!this.datasetId) {
        return
      }
      // 获取详情
      getDataset(this.datasetId).then(res => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.datasetType = res.datasetType
        this.dataForm.moduleCode = res.moduleCode
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        this.dataForm.cache = res.cache
        // config 配置
        this.dataForm.sqlProcess = res.config.sqlProcess
        this.dataForm.paramsList = res.config.paramsList ? res.config.paramsList : []
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.fieldList = res.config.fieldList
        this.dataForm.cacheCoherence = res.config.cacheCoherence
        this.dataForm.syntaxType = res.config.syntaxType ? res.config.syntaxType : 'normal'
        // 使用传入的数据集名称 ？
        this.dataForm.name = this.datasetName
        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
        if (this.dataForm.typeId) {
          this.$nextTick(() => {
            try {
              this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
            } catch (error) {
              console.error(error)
            }
          })
        }
        this.datasetTest(false)
      })
    },
    getRules (row) {
      return [{
        required: row.require === 1,
        message: '参数值不能为空',
        trigger: ['blur', 'change']
      }]
    },
    /**
     * 获取数据源列表
     */
    getDataSource () {
      const params = {
        sourceName: '',
        sourceType: '',
        moduleCode: this.appCode
      }
      datasourceList(params).then(data => {
        this.sourceList = data
      })
    },
    /**
     * 打开参数配置弹窗
     */
    openParamsConfig () {
      this.isTest = false
      this.paramsVisible = true
    },
    /**
     * 删除参数配置
     * @param {*} index
     */
    delRow (index) {
      this.paramsListCopy.splice(index, 1)
    },
    /**
     * 新增参数配置
     */
    addParam () {
      this.paramsListCopy.push({
        name: '',
        type: '',
        value: '',
        status: 1,
        require: 0,
        remark: ''
      })
    },
    /**
     * 取消编辑参数
     */
    cancelParam () {
      this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      this.paramsVisible = false
    },
    /**
     * 保存参数设置
     */
    setParam () {
      for (let i = 0; i < this.paramsListCopy.length; i++) {
        const row = this.paramsListCopy[i]
        if (row.require === 1 && (row.value === '' || row.value === null)) {
          this.$message.error(`第${i + 1}行参数值不能为空`)
          return
        }
      }
      this.dataForm.paramsList = cloneDeep(this.paramsListCopy)
      if (this.isTest) {
        this.datasetTest()
      }
      this.paramsVisible = false
    },
    /**
     * 保存
     * @param formName 表单名称
     * @param noCheckToSave 是否不检查直接保存
     */
    save (formName, noCheckToSave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保数据集SQL加工脚本不为空且运行通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该自助数据集未生成输出字段，请重新检查')
        return
      }
      if (!noCheckToSave) {
        const temp = this.structurePreviewList.some(item => {
          return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
        }) // true-存在为空
        if (temp) {
          this.fieldDescVisible = true
          return
        }
      }
      const chineseRegex = /[\u4e00-\u9fa5]/
      let hasChinese = false // 判断有无中文
      let ChineseCode = ''
      for (let i = 0; i < this.structurePreviewList.length; i++) {
        if (chineseRegex.test(this.structurePreviewList[i].fieldName)) {
          hasChinese = true
          ChineseCode = this.structurePreviewList[i].fieldName
          break
        }
      }
      if (hasChinese) {
        this.$confirm(`[${ChineseCode}]字段中包含汉字, 是否保继续保存？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }).then(() => {
          this.saveFun(formName)
        }).catch(() => {

        })
      } else {
        this.saveFun(formName)
      }
    },
    /**
     * 保存数据集
     * @param formName
     */
    saveFun (formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        // 校验参数名称是否重复
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map(value => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        // 设置字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach(r => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        this.dataForm.fieldList = this.structurePreviewList
        this.saveLoading = true
        this.saveText = '正在保存...'
        const datasetSave = this.dataForm.id === '' ? datasetAdd : datasetUpdate
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'custom',
          remark: this.dataForm.remark,
          sourceId: this.dataForm.sourceId,
          cache: this.dataForm.cache,
          moduleCode: this.appCode,
          editable: this.appCode ? 1 : 0,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.CustomDataSetConfig',
            sourceId: this.dataForm.sourceId,
            sqlProcess: this.dataForm.sqlProcess,
            paramsList: this.dataForm.paramsList,
            fieldList: this.dataForm.fieldList,
            fieldDesc: this.dataForm.fieldDesc,
            syntaxType: this.dataForm.syntaxType
          }
        }
        datasetSave(datasetParams).then(res => {
          this.$message.success('保存成功')
          this.$parent.init(false)
          this.$parent.setType = null
          this.saveLoading = false
          this.saveText = ''
          this.goBack()
        }).catch(() => {
          this.saveLoading = false
          this.saveText = ''
        })
        this.saveLoading = false
        this.saveText = ''
      })
    },
    /**
     * 解析并运行数据集
     */
    buildParamsAndRun () {
      this.isTest = true
      // 匹配 ${}
      const reg = /\${(.*?)}/g
      const paramNames = [...new Set([...this.dataForm.sqlProcess.matchAll(reg)].map(item => item[1]))]
      // 匹配 #{}
      const reg2 = /#{(.*?)}/g
      const paramNames2 = [...new Set([...this.dataForm.sqlProcess.matchAll(reg2)].map(item => item[1]))]
      paramNames.push(...paramNames2)
      const names = this.dataForm.paramsList.map(item => item.name)
      const params = []
      paramNames.forEach(name => {
        if (names.includes(name)) {
          const param = this.dataForm.paramsList.find(item => item.name === name)
          params.push(param)
        } else {
          params.push({
            name: name,
            type: 'String',
            value: '',
            status: 1,
            require: 0,
            remark: ''
          })
        }
      })
      this.dataForm.paramsList = cloneDeep(params)
      this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      if (this.dataForm.paramsList.length) {
        this.paramsVisible = true
      } else {
        this.datasetTest()
      }
    },
    /**
     * 数据集测试
     * @param val
     */
    datasetTest (val = true) {
      if (this.dataForm.sourceId === '') {
        this.$message.error('请选择数据源')
        return
      }
      if (this.dataForm.sqlProcess === '') {
        this.$message.error('请输入数据集SQL加工脚本')
        return
      }
      if (this.dataForm.paramsList.length > 0) {
        const names = this.dataForm.paramsList.map(value => value.name)
        const namesSet = new Set(names)
        if (namesSet.size !== names.length) {
          this.$message.error('参数名称不能重复，请重新输入')
          return
        }
      }
      // 点击测试初始化分页当前页为1
      if (val === true) {
        this.current = 1
      }
      this.saveLoading = true

      const executeParams = {
        dataSourceId: this.dataForm.sourceId,
        script: this.dataForm.sqlProcess,
        params: this.dataForm.paramsList,
        dataSetType: 'custom',
        syntaxType: this.dataForm.syntaxType,
        size: this.size,
        current: this.current
      }
      datasetExecuteTest(executeParams).then(res => {
        this.dataPreviewList = res.data.list
        this.structurePreviewList = res.structure
        // 输出字段描述合并
        this.structurePreviewList.forEach(field => {
          const fieldInfo = this.dataForm.fieldList.find(item => item.fieldName === field.fieldName)
          if (fieldInfo) {
            const { fieldDesc, orderNum, sourceTable, ...rest } = fieldInfo
            field.fieldDesc = fieldDesc
            field.orderNum = orderNum
            field.sourceTable = sourceTable
            Object.keys(rest).forEach(key => {
              if (!field.hasOwnProperty(key)) {
                this.$set(field, key, rest[key])
              }
            })
          }
        })
        this.structurePreviewList.forEach(item => {
          if (!item.hasOwnProperty('orderNum')) {
            this.$set(item, 'orderNum', 0)
          }
          if (!item.hasOwnProperty('sourceTable')) {
            this.$set(item, 'sourceTable', '')
          }
          if (!item.hasOwnProperty('fieldDesc')) {
            this.$set(item, 'fieldDesc', '')
          }
        })
        this.totalCount = res.data.totalCount
        this.tableNameList = res.tableNameList
        // 如果只有一个表，自动填充字段表名
        if (this.tableNameList && this.tableNameList.length === 1) {
          this.structurePreviewList.forEach(item => {
            item.sourceTable = this.tableNameList[0]
          })
        }
        this.structurePreviewListCopy = cloneDeep(this.structurePreviewList).sort((a, b) => {
          return a.orderNum - b.orderNum
        })
        let paramsNameCheck = false
        this.dataForm.paramsList.forEach(param => {
          const checkList = this.structurePreviewList.filter(item => item.fieldName === param.name)
          if (checkList.length) {
            paramsNameCheck = true
            // param.name = ''
          }
        })
        if (paramsNameCheck) {
          this.$message.warning('参数名称不可以与字段名相同！')
          this.passTest = false
        } else {
          if (val) this.$message.success('脚本执行通过')
          this.exception = ''
          this.msg = ''
          this.passTest = true
        }
        this.saveLoading = false
      }).catch((e) => {
        this.passTest = false
        this.saveLoading = false
      })
    },
    selectorFilter (value) {
      this.$refs.categorySelectTree.filter(value)
    },
    treeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';

.data-set-scrollbar {
  height: 100%;
  overflow-y: auto;
  overflow-x: none;
}

// .tree-box {
//   padding: 0;
//   max-height: 270px;
// }

::v-deep .el-input__inner {
  width: 100% !important;
}

.page-header {
  display: flex;
  position: relative;

  .page-header-right {
    position: absolute;
    right: 16px;
  }
}

.sql-config {
  padding: 0 16px;
}

.operation {
  ::v-deep .el-select {
    width: 200px !important;
    margin-right: 16px;
  }

  display: flex;
}

::v-deep .CodeMirror {
  height: 180px !important;
  font-family: Helvetica, Tahoma;
  // .CodeMirror-scroll {
  //   background: #fff;
  //   .CodeMirror-gutters {
  //     background-color: #f6f7fb;
  //   }
  // }
}

.no-border {
  border: 0;
}

::v-deep .fieldDescCheck {
  .el-dialog__body {
    height: fit-content !important;
    min-height: unset !important;
  }
}

.title-style {
  padding: 8px 12px;
  background-color: #f6f7fb;
  border-left: 5px solid var(--bs-el-color-primary);
  margin: 16px 16px 0 0;
}

.field-wrap {
  overflow: auto;
  margin-right: 16px;

  .field-item {
    line-height: 32px;
    padding: 0 12px 0 16px;
    cursor: pointer;

    .edit_field {
      display: none;
    }

    &:hover {
      background-color: #f2f7fe;

      .edit_field {
        display: block;
      }
    }
  }
}

.right-setting {
  height: 454px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .paramConfig {
    max-height: 227px;

    .field-wrap {
      max-height: 175px;
    }
  }

  .structure {
    flex: 1;
    overflow: hidden;

    .field-wrap {
      height: calc(100% - 40px);
    }
  }
}

.result-view {
  font-size: 14px;
  font-weight: 600;
  color: var(--bs-el-text);
  position: relative;
  padding: 16px 0;
  padding-left: 12px;
  border-bottom: 1px solid var(--bs-background-1);

  &::before {
    content: "";
    height: 14px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: 4px solid var(--bs-el-color-primary);
  }
}

.bs-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

::v-deep .bs-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.bs-pagination {
  padding: 16px !important;
  position: unset !important;

  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

.bs-el-select {
  width: 100% !important;
}

::v-deep .el-input__inner {
  width: 100% !important;
}

::v-deep .el-table__row {
  height: 58px;

  .cell {
    width: 100%;
    margin: 0 auto;
    position: absolute;
    top: 8px;
  }
}
</style>
