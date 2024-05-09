<template>
  <div class="dataroom-help-content">
    <el-form
      ref="form"
      label-width="80px"
    >
      <el-form-item label="组件">
        <el-row>
          <el-col :span="12">
            <el-cascader
              ref="cascader"
              v-model="componentCode"
              style="margin-bottom: 10px"
              placeholder="请选择组件"
              :options="optionList"
              :show-all-levels="false"
              :props="props"
              @change="changeComponentCode"
            >
              <template slot-scope="{ node, data }">
                <span @click="handleComponent(data)">{{ data.name }}</span>
              </template>
            </el-cascader>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item
        label="组件标识"
      >
        <span>{{ currentComCode }}</span>
      </el-form-item>
      <el-form-item label="动作/事件">
        <el-select
          v-model="currentEventCode"
          @change="handleEvent"
        >
          <el-option
            v-for="(item,index) in eventList"
            :key="index"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="说明">
        <span>{{ formData.desc }}</span>
      </el-form-item>
      <el-form-item
        v-if="!isEvent"
        label="动作"
      >
        <span>{{ formData.methodName }}</span>
      </el-form-item>
      <el-form-item label="入参说明">
        <el-table
          :data="formData.paramsList"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="字段"
            width="100"
          />
          <el-table-column
            prop="desc"
            label="描述"
            width="100"
          />
          <el-table-column
            prop="type"
            label="类型"
          />
          <el-table-column
            prop="required"
            label="必填"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.required ?'是':'否' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="defaultValue"
            label="默认值"
            width="100"
          />
          <el-table-column
            prop="explain"
            label="说明"
            width="200"
          />
        </el-table>
      </el-form-item>
      <el-form-item label="入参示例">
        <el-input
          v-model="formData.paramsExample"
          type="textarea"
          :rows="5"
          readonly
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getInteraction } from '@gcpaas/data-room-ui/packages/bigScreen/components/interactionInstall'

export default {
  name: 'HelpDialog',
  components: {},
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      props: {
        label: 'name',
        value: 'code',
        type: 'type',
        expandTrigger: 'hover'
      },
      isEvent: false,
      currentEventCode: '',
      currentComCode: '',
      componentCode: '',
      dialogVisible: false,
      eventList: [],
      formData: {
        name: '',
        code: '',
        desc: '',
        methodName: '',
        event: true,
        paramsList: [
        ],
        paramsExample: ''
      }

    }
  },
  computed: {
    optionList () {
      let list = this.options.filter(item => item.code !== 'global')
      list = [...list, {
        name: '全局',
        code: 'global',
        children: [{
          name: '弹窗下钻',
          code: 'dialog'
        }]
      }]
      return list
    }
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
    init () {
    },
    changeComponentCode () {
    },
    // 选择组件
    handleComponent (data) {
      this.componentCode = data.code
      this.currentComCode = data.code
      // 如果是全局的弹窗下钻
      if (data.code === 'dialog') {
        const obj = {
          content: {
            type: 'component',
            value: 'pHBkNHDT'// 下钻组件code
          },
          isExternalData: false, // 为true时data将会覆盖组件原本的数据
          data: [// isExternalData为false不生效
            {
              city: '石家庄',
              type: '水果',
              value: 14500
            },
            {
              city: '上海',
              type: '茶叶',
              value: 14000
            }
          ],
          params: { cityNum: 1, lowLimit: 1, highLimit: 100, typeList: '' }// 下钻组件数据集对应的参数，isExternalData为false时生效
        }
        this.formData = {
          name: '',
          code: '',
          desc: '设置弹窗下钻的内容',
          methodName: 'canvasInst.openDialog()',
          event: true,
          paramsList: [
            {
              name: 'content',
              desc: '下钻内容',
              type: 'object',
              required: 'false',
              defaultValue: '{}',
              explain: '内容包含类型type和具体值value'
            },
            {
              name: 'content.type',
              desc: '下钻类型',
              type: 'object',
              required: 'false',
              defaultValue: '{}',
              explain: 'component（组件）/image（图片）/iframe（外链）'
            },
            {
              name: 'content.value',
              desc: '下钻具体值',
              type: 'string',
              required: 'false',
              defaultValue: '',
              explain: 'type=component,value=组件的code；type=image,value=图片地址；type=iframe,value=外链地址'
            }
          ],
          paramsExample: JSON.stringify(obj)
        }
      } else {
        // 图层组件列表
        const list1 = this.optionList.find((item) => item.code === 'component')?.children
        // 下钻组件列表
        const list2 = this.optionList.find((item) => item.code === 'dialogCom')?.children
        const chart = list1?.find((item) => item.code === data.code) || list2?.find((item) => item.code === data.code)
        // 获取对应组件的事件列表
        if (chart) {
          // 如果是图层组件
          getInteraction(chart.type).then((res) => {
            this.eventList = res
            this.currentEventCode = this.eventList[0]?.code
            const formData = this.eventList[0]
            this.isEvent = formData?.event
            if (formData) {
              this.formData = {
                ...formData,
                methodName: `canvasInst.getChartInst('${this.currentComCode}').` + formData.code + '()',
                paramsExample: JSON.stringify(formData.paramsExample)
              }
            }
          })
        } else {
          if (data.code) { this.eventList = [] }
        }
      }
    },
    // 选择事件/动作
    handleEvent (val) {
      this.currentEventCode = val
      const formData = this.eventList.find((item) => item.code === val)
      this.isEvent = formData?.event
      if (formData) {
        this.formData = {
          ...formData,
          methodName: `canvasInst.getChartInst('${this.currentComCode}').` + formData.code + '()',
          paramsExample: JSON.stringify(formData.paramsExample)
        }
      } else {
        this.formData = {
          name: '',
          code: '',
          desc: '',
          methodName: '',
          event: true,
          paramsList: [
          ],
          paramsExample: ''
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.dataroom-help-content{
  width: 100%;
  height: 100%;
}
</style>
