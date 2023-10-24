
<template>
  <div>
    <el-form-item
      :label-width="labelWidth"
      label="边框"
    >
    <el-input
      v-model="title"
      clearable
      read-only
      placeholder="请选择边框"
      @focus="init"
    >
      <template slot="append">
        <el-button
          size="small"
          type="primary"
          @click="init"
        >
          选择
        </el-button>
      </template>
    </el-input>
      <BorderSelect
        v-model="config.type"
        ref="BorderSelect"
        />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="上边距"
    >
      <el-input-number
        v-model="config.padding[0]"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="右边距"
    >
      <el-input-number
        v-model="config.padding[1]"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="下边距"
    >
      <el-input-number
        v-model="config.padding[2]"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="左边距"
    >
      <el-input-number
        v-model="config.padding[3]"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <div v-if="config.type">
         <el-form-item
          :label-width="labelWidth"
          label="是否显示标题"
          v-if="config.type!='GcBorder16'"
        >
          <el-switch
              v-model="config.isTitle"
              class="bs-el-switch"
              :active-value="true"
              :inactive-value="false"
            />
        </el-form-item>
        <el-form-item
          v-if="config.isTitle&&config.type!='GcBorder11'"
          :label-width="labelWidth"
          label="标题高度"
        >
          <el-input-number
            v-model="config.titleHeight"
            class="bs-el-input-number"
            :min="0"
            :step="1"
          />
        </el-form-item>
        <el-form-item
          v-if="config.isTitle&&config.type!='GcBorder11'"
          :label-width="labelWidth"
          label="标题字体大小"
        >
          <el-input-number
            v-model="config.fontSize"
            class="bs-el-input-number"
            :min="0"
            :step="1"
          />
        </el-form-item>
        <el-form-item
          v-if="config.isTitle&&config.type!='GcBorder11'"
          :label-width="labelWidth"
          label="标题颜色"
        >
          <el-color-picker
              v-model="config.fontColor"
              popper-class="bs-el-color-picker"
              class="bs-el-color-picker"
              show-alpha
            />
        </el-form-item>
        <!-- <el-form-item
          v-if="config.type=='GcBorder15'"
          :label-width="labelWidth"
          label="外侧边框线宽度"
        >
         <el-input-number
          v-model="borderWidth"
          class="bs-el-input-number"
          :step="1"
          :min="0"
          :max="100000"
        />
        </el-form-item> -->
    <div
      v-for="(setting, settingIndex) in list.setting"
      :key="settingIndex+1"
    >
      <el-form-item
        :label="setting.type=== 'padding' ? '' : setting.label"
        :label-width="labelWidth"
      >
        <el-input
          v-if="setting.type === 'input'"
          v-model="config[setting.field]"
          :placeholder="`请输入${setting.label}`"
          clearable
        />
        <el-input
          v-model="config[setting.field]"
          v-else-if="setting.type === 'background'"
          clearable
          placeholder="选择或输入链接"
        >
          <template slot="append">
            <el-button
              size="small"
              type="primary"
              @click="initCard"
            >
              选择
            </el-button>
          </template>
        </el-input>
        <el-button
          v-else-if="setting.type === 'move'"
          type="primary"
          @click="initMove(config.imgUrl)"
        >
          图形切割
        </el-button>
        <el-select
          v-else-if="setting.type === 'select'"
          v-model="config[setting.field]"
          popper-class="bs-el-select"
          class="bs-el-select"
          :placeholder="`请选择${setting.label}`"
          :multiple="setting.multiple"
          clearable
        >
          <el-option
            v-for="(opt, optIndex) in setting.options"
            :key="optIndex"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <template v-else-if="setting.type === 'colorSelect'">
          <color-select
            v-model="colorScheme"
            @update="updateColorScheme"
          />
          <div
            style="
            display: flex;
            align-items: center;
            flex-wrap: wrap;
          "
            class="color-picker-box"
          >
            <el-color-picker
              v-for="(colorItem, colorItemIndex) in colors"
              :key="colorItemIndex"
              v-model="setting.value[colorItemIndex]"
              popper-class="bs-el-color-picker"
              show-alpha
              class="start-color"
            />
            <span
              class="el-icon-circle-plus-outline"
              style="color: #007aff; font-size: 20px"
              @click="addColor"
            />
            <span
              v-if="colors.length"
              class="el-icon-remove-outline"
              style="color: #ea0b30; font-size: 20px"
              @click="delColor()"
            />
          </div>
        </template>
        <el-color-picker
          v-else-if="setting.type === 'colorPicker'"
          v-model="config[setting.field]"
          popper-class="bs-el-color-picker"
          class="bs-el-color-picker"
          show-alpha
        />
        <BorderColorSetting
          v-else-if="setting.type === 'gradual'"
          v-model="config[setting.field]"
        />
        <el-input-number
          v-else-if="setting.type === 'inputNumber'"
          v-model="config[setting.field]"
          class="bs-el-input-number"
          :step="setting.step || 1"
          :min="setting.min || 0"
          :max="setting.max || 100000"
        />
        <el-radio-group
          v-else-if="setting.type === 'radio'"
          v-model="config[setting.field]"
          class="bs-el-radio-group"
        >
          <template v-for="(opt, optIndex) in setting.options">
            <el-radio-button
              :key="optIndex"
              :label="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </template>
        </el-radio-group>
        <el-switch
          v-else-if="setting.type === 'switch'"
          v-model="config[setting.field]"
          class="bs-el-switch"
          :active-value="setting.active"
          :inactive-value="setting.inactive"
        />
        <el-slider
          v-else-if="setting.type === 'slider'"
          v-model="config[setting.field]"
          :min="0"
          :max="1"
          :step="0.01"
        />
        <PaddingSetting
          v-else-if="setting.type === 'padding'"
          v-model="config[setting.field]"
        />
      </el-form-item>
      </div>
      <SourceDialog ref="SourceDialog" @getImg='changeImg'  />
      <MoveDialog @getArray='changeBorder' ref="MoveDialog"/>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import plotList from 'data-room-ui/BorderComponents/settingList.js'
import BorderColorSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderColorSetting/index.vue'
import ColorSelect from 'data-room-ui/ColorMultipleSelect/index.vue'
import BorderSelect from 'data-room-ui/BorderSelect/index.vue'
import SourceDialog from '../SourceDialog/index.vue'
import MoveDialog from './MoveDialog/index.vue'
export default {
  name: '',
  components: {
    BorderSelect,
    ColorSelect,
    BorderColorSetting,
    SourceDialog,
    MoveDialog
  },
  props: {
    bigTitle:{
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({
        type: '',
        titleHeight: 0,
        fontSize: 0,
        h: 0,
      })
    },
    labelWidth: {
      type: String,
      default: '100px'
    }
  },
  watch:{
    // borderWidth:{
    //   handler (val) {
    //     this.config.borderWidth=val
    //   }
    // },
    'config.type':{
      handler (val) {
         this.config.isTitle=this.list.isTitle
        plotList[Symbol.iterator]=function*(){
        let keys=Object.keys(plotList)
        for(let k of keys){
          yield [k,plotList[k]]
        }
      }
      for(let [key,value] of plotList){
        if(value.padding&&val==value.type){
          this.config.padding=[...value.padding]
        }
        if(value.type==this.config.type){
          value.setting.forEach((item)=>{
            this.$set(this.config,item.field,item.value)
          })
        }
      }
      }
    },
  },
  computed:{
    title:{
      set(){
       this.config.type=''
       this.config.padding=[16,16,16,16]
      },
      get(){
       plotList[Symbol.iterator]=function*(){
        let keys=Object.keys(plotList)
        for(let k of keys){
          yield [k,plotList[k]]
        }
      }
      let name
      for(let [key,value] of plotList){
        if(value.type==this.config.type){
          name=value.name
        }
      }
      return name
      }
    },
    list(){
      plotList[Symbol.iterator]=function*(){
        let keys=Object.keys(plotList)
        for(let k of keys){
          yield [k,plotList[k]]
        }
      }
      let obj={}
      for(let [key,value] of plotList){
        if(value.type==this.config.type){
          obj={setting:value.setting,isTitle:value.isTitle}
        }
      }
      return obj
    }
  },
  data () {
    return {
      // borderWidth:0
    }
  },
  mounted () {
    // if(this.config.borderWidth){
    //   this.borderWidth=this.config.borderWidth
    // }
  },
  methods: {
    changeBorder(val){
      this.$set(this.config,'borderArray',val)
    },
    changeImg(val){
      this.$set(this.config,'imgUrl',val.url)
    },
    init(){
      this.$refs.BorderSelect.init()
    },
    initCard(){
      this.$refs.SourceDialog.init()
    },
    initMove(val){
      this.$refs.MoveDialog.init(val,this.config.borderArray)
    }

  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-color-picker__trigger {
  border-color: var(--bs-el-border);
}
::v-deep .el-input--suffix .el-input__inner{
  padding-right: 10px !important;
}
.color-picker-box{
  ::v-deep .el-color-picker__trigger {
    width: 27px!important;
  }
}
</style>
