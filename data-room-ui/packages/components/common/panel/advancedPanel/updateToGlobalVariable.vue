<template>
  <el-form ref="form" label-width="80px">
    <el-form-item label="字段名称">
      <span>更新至全局变量</span>
    </el-form-item>
    <el-form-item
      v-for="field in fieldList"
      :key="field.name"
      :label="fieldNameMapping[field.name]"
      class="data-form-item"
    >
      <el-select
        v-model="field.globalVariableId"
        class="bs-el-select"
        popper-class="bs-el-select"
        filterable
        clearable
      >
        <el-option
          v-for="variable in globalVariableList"
          :key="variable.name"
          :label="variable.name"
          :value="variable.id"
        >
          <span style="float: left">  {{ variable.name }} </span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ variable.desc !== "" ? variable.desc : variable.name }}</span>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'updateToGlobalVariable',
  directives: {
  },
  mixins: [],
  inject: ['canvasInst'],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    fieldMap:{
      type: Object,
      default: () => []
    },
    fieldNameMapping:{
      type: Object,
      default: () => {}
    }
  },
  components: {

  },
  data () {
    return {}
  },
  computed: {
    globalVariableList() {
      return this.canvasInst.pageInfo.globalVariable
    },
    fieldList(){
      for (const key in this.fieldNameMapping) {
        if (!this.fieldMap.fieldList.some(item => item.name === key)){
          this.fieldMap.fieldList.push({
            name: key,
            globalVariableId: ''
          })
        }
      }
      this.fieldMap.fieldList = this.fieldMap.fieldList.filter(field => {
        return this.fieldNameMapping.hasOwnProperty(field.name)
      })

      return this.fieldMap.fieldList
    }
  },
  watch: {
  },
  mounted () {
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
