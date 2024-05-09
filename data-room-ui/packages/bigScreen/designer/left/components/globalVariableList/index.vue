<template>
  <div class="dataroom-bigscreen-global-variable-wrap">
    <div class="global-variable-top">
      <div class="global-variable-left">
        全局变量
      </div>
      <div class="coverage-top-right">
        <i
          class="icon el-icon-close"
          @click="closePanel"
        />
      </div>
    </div>
    <div class="global-variable-list">
      <el-collapse>
        <el-collapse-item class="global-variable-item" v-for="variable in canvasInst.pageInfo.globalVariable" :key="variable.filterId">
          <template slot="title">
            <div class="variable-item-title">
              <span>{{ variable.name }}</span>
              <span
                class="del-icon"
                @click.stop="nodeDelHandle(variable.id)">
              <i class="icon el-icon-delete node-del" />
            </span>
            </div>
          </template>
          <div>
            <el-form ref="form" :model="variable" label-width="80px" label-position="left">
              <el-form-item label="来源">
                <el-select v-model="variable.source" placeholder="请选择" @change="changeVariableSource(variable)">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="variable.name" @blur="changeVariableInitValue(variable)"></el-input>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="variable.desc"></el-input>
              </el-form-item>
              <el-form-item label="初始值" v-if="variable.source === 'static'">
                <el-input  v-model="variable.initialValue" @blur="changeVariableInitValue(variable)"> </el-input>
                <!--                <smart-input v-model="variable.initialValue" ></smart-input>-->
              </el-form-item>
              <el-form-item label="过滤器">
                <el-input
                  v-model="canvasInst.pageInfo.filters[variable.filterId].script"
                  type="textarea"
                  :rows="5"
                  placeholder="例:return params"
                  @blur="updateDataHandlerScript(variable)"
                />
              </el-form-item>
              <el-form-item label="自动更新">
                <el-switch
                  v-model="variable.autoUpdate"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="triggerTimer(variable)"
                >
                </el-switch>
              </el-form-item>
              <el-form-item label="更新频率" v-show="variable.autoUpdate">
                <el-input-number v-model="variable.updateFrequency" :min="0.1" :step="0.1" @change="triggerTimer(variable)">
                </el-input-number>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="global-variable-bottom">
      <el-button type="primary" @click="addGlobalVariable">新建全局变量</el-button>
    </div>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep"
import {randomString} from "@gcpaas/data-room-ui/packages/js/utils"
import smartInput from "@gcpaas/data-room-ui/packages/bigScreen/designer/left/components/globalVariableList/smartInput.vue";
export default {
  name: '',
  components: {
    smartInput
  },
  props: {},
  mixins: [],
  data () {
    return {
      toolShow:true,
      hoverName: '',
      options:[{
        label: '静态值',
        value: 'static'
      },{
        label: '从URL查询条件获取',
        value: 'fromURL'
      }],
      timers: {} // 定时器
    }
  },
  inject: ['canvasInst'],
  computed: {
  },
  watch: {},
  created () {},
  mounted () {
    // this.init()
  },
  methods:{
    init(){
      this.canvasInst.pageInfo.globalVariable.forEach(variable =>{
        this.triggerTimer(variable)
      })
    },
    // 点击关闭按钮关闭tab面板
    closePanel () {
      this.$emit('closePanel')
    },
    toolHandle (isShow, data) {
      if (isShow) {
        this.hoverName = data.name
      }
      this.toolShow = isShow
    },
    // 删除全局变量
    nodeDelHandle(id){
      this.$confirm('确定删除全局变量吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(() => {
          this.canvasInst.pageInfo.globalVariable = this.canvasInst.pageInfo.globalVariable.filter(variable => variable.id !== id)
          delete this.canvasInst.pageInfo.globalNameToValue[id]
        })
        .catch(() => {})
    },
    // 新建全局变量
    addGlobalVariable(){
      const random = randomString(8)
      const variable = {
        "id": random,
        "source": "static", // static：静态值；fromURL:全局变量从URL获取
        "name": '变量' + random,
        "desc": "",
        "initialValue": "initialValue",
        "filterId": random + 'DataHandlerScript',// 过滤器对应在filters里面的id,每次在执行setGlobalValue的时候执行
        "autoUpdate": false,
        "updateFrequency": 1
      }

      this.canvasInst.pageInfo.globalVariable.push(variable)
      this.canvasInst.updateGlobalNameToValue(variable,variable.initialValue)
      this.canvasInst.updateDataScript(variable.filterId, { name: '', script: '' })
    },
    // 全局变量初始值修改
    changeVariableInitValue (variable) {
      this.canvasInst.updateGlobalNameToValue(variable,variable.initialValue)
    },
    changeVariableSource (variable) {
      if (variable.source === 'fromURL') {
        // 获取URL中获取对应的值
        const value = this.$route.query[variable.name]
        this.canvasInst.updateGlobalNameToValue(variable, value)
      } else {
        this.canvasInst.updateGlobalNameToValue(variable, variable.initialValue)
      }
    },
    // 全局变量更新方法修改---定时器开启、修改以及销毁
    triggerTimer (variable) {
      this.canvasInst.triggerGlobalVariableTimer(variable)
      // // 自动更新全局变量的值
      // if (variable.autoUpdate){
      //   // 判断该全局变量是否有已存在的定时器
      //   if (this.timers[variable.id]){
      //     // 先销毁再新建
      //     clearInterval(this.timers[variable.id]) // 调用 clearInterval 来终止定时器的执行
      //   }
      //   this.timers[variable.id] = setInterval(() => {
      //     const newValue = this.canvasInst.dataHandleFilters[variable.filterId](variable.initialValue) || variable.initialValue
      //     this.canvasInst.setGlobalValue(variable.id,newValue)
      //   }, variable.updateFrequency * 1000)
      // }else{
      //   if (this.timers[variable.id]){
      //     clearInterval(this.timers[variable.id]) // 调用 clearInterval 来终止定时器的执行
      //   }
      // }
    },
    updateDataHandlerScript (variable) {
      // 传入
      this.canvasInst.dataHandleFilters[variable.filterId] = new Function('params', 'canvasInst', this.canvasInst.pageInfo.filters[variable.filterId].script)
    },
    beforeDestory () {
      for (const timeId in this.timers) {
        clearInterval(this.timers[timeId])
      }
    }
  }
}
</script>
<style scoped lang="scss">
.dataroom-bigscreen-global-variable-wrap {
  width: 240px;
  height: 100%;
  font-size: 12px;
  color: #1a1a1a;
  border-right: 1px solid #ededed;
  .global-variable-top {
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e6e6e6;
    box-sizing: border-box;

    .global-variable-top-right {
      .icon {
        font-size: 12px;
        margin-left: 8px;
      }
    }
  }
  .global-variable-list{
    width: 100%;
    height: calc(100% - 56px - 56px);
    background-color: #F7F7F7;

    .el-collapse{
      height: 100%;
      overflow-y: scroll;
    }
    .global-variable-item{
      margin:5px;
      .variable-item-title{
        width: 100%;
        padding: 0 10px;
        .del-icon{
          display: none;
          float: right;
        }
        &:hover{
          .del-icon{
            display: block;
            float: right;
          }
        }
      }
      ::v-deep.el-collapse-item__wrap .el-collapse-item__content{
        background-color: #f7f7f7;
        padding-top: 10px;
        padding-bottom: 15px;
        .el-form-item--mini.el-form-item{
          margin-bottom: 8px;
        }
      }
    }
  }
  .global-variable-bottom{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 56px;
    background-color: #fff;
  }
}
/*滚动条样式*/
::v-deep ::-webkit-scrollbar {
  width: 6px;
  border-radius: 4px;
  height: 4px;
}
::v-deep ::-webkit-scrollbar-thumb {
  background: #E6E6E6 !important;
  border-radius: 10px;
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
