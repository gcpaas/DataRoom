<template>
  <el-dialog
    title="边框组件"
    :visible.sync="dialogVisible"
    width="80%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
    @closed="close"
  >
    <div class="content">
      <div class="big-screen-list-wrap">
        <div
          v-if="remoteComponentlist.length !== 0"
          class="list-wrap bs-scrollbar"
          :style="{
            display: remoteComponentsGridComputed ? 'grid' : 'flex',
            justifyContent: remoteComponentsGridComputed ? 'space-around' : 'flex-start',
          }"
        >
          <div
            v-for="component in remoteComponentlist"
            :key="component.title"
            class="big-screen-card-wrap"
            :style="{
              width: remoteComponentsGridComputed ? 'auto' : '290px'
            }"
            @click="chooseComponent(component)"
          >
            <div
              :class="component.title == focus.title ? 'focus' : ''"
              class="big-screen-card-inner"
            >
              <div class="big-screen-card-img">
                <el-image
                  :src="component.img"
                  fit="contain"
                  style="width: 100%; height: 100%"
                >
                  <div
                    slot="placeholder"
                    class="image-slot"
                  >
                    加载中···
                  </div>
                </el-image>
              </div>
              <div class="big-screen-bottom">
                <div
                  class="left-bigscreen-title"
                  :title="component.title"
                >
                  {{ getName(component.title) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="empty"
        >
          暂无数据
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dialogVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="confirm"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import plotList from 'data-room-ui/BorderComponents/settingList.js'
import borderComponents from 'data-room-ui/BorderComponents/bordersList'
export default {
  name: 'ComponentDialog',
  mixins: [pageMixins],
  model: {
    prop: 'type',
    event: 'select'
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      code: '',
      focus: -1,
      searchKey: '',
      remoteComponentlist: []
    }
  },
  computed: {
    remoteComponentsGridComputed () {
      return this.remoteComponentlist.length > 3
    }
  },
  watch: {
  },
  mounted () {
    this.remoteComponentlist = [...borderComponents]
    this.remoteComponentlist.sort((a,b)=>{
      return a.title.slice(8) - b.title.slice(8)
    })
  },
  methods: {
    getName(title){
      plotList[Symbol.iterator]=function*(){
        let keys=Object.keys(plotList)
        for(let k of keys){
          yield [k,plotList[k]]
        }
      }
      let name
      for(let [key,value] of plotList){
        if(value.type==title){
          name=value.name
        }
      }
      return name
    },
    chooseComponent (component) {
      this.focus = cloneDeep(component)
    },
    close () { },
    init () {
      this.dialogVisible = true
      this.current = 1
      this.searchKey = ''
      this.code = ''
      this.focus = -1
    },
    // 点击确定
    confirm () {
      this.dialogVisible = false
      if (isEmpty(this.focus)) return
      this.$emit('select', this.focus.title)
    }

  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';
.content{
  height: calc(100vh - 290px);
}
.big-screen-list-wrap {
  .el-select {
    display: inline-block !important;
    position: relative !important;
    width: auto !important;
  }

  position: relative;
  height: 100%;
  // margin:0 16px;
  // padding: 16px;
  margin-bottom: 56px;
  color: #9ea9b2;
  background-color: var(--bs-background-2) !important;

  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;

    .el-input {
      width: 200px;
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }

    .el-select {
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }
  }

  .list-wrap {
    /* display: grid; */
    overflow: auto;
    // 间隙自适应
    justify-content: space-around;
    // max-height: calc(100vh - 270px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 15px;
    .big-screen-card-wrap {
      position: relative;
      height: 230px;
      cursor: pointer;

      &:hover {
        .screen-card__hover {
          height: 180px;
        }
      }

      .screen-card__hover {
        position: absolute;
        z-index: 999;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        height: 0;
        transition: height 0.4s;
        background: #00000099;
      }

      .focus {
        color: var(--bs-el-text) !important;
        border: 1px solid var(--bs-el-color-primary) !important;
      }

      .big-screen-card-inner {
        overflow: hidden;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background-color: var(--bs-background-2);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        color: var(--bs-el-title);
        border: 1px solid var(--bs-background-1);

        &:hover {
          color: var(--bs-el-text);
          border: 1px solid var(--bs-el-color-primary);
        }

        .add-big-screen-card-text {
          color: var(--bs-el-color-primary);
          font-size: 24px;
        }

        .big-screen-card-img {
          width: 100%;
          height: 180px;

          img {
            width: 100%;
            height: 100%;

            object-fit: cover;
          }

          ::v-deep .image-slot {
            height: 100%;
            background-color: var(--bs-background-2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          ::v-deep .el-image__error {
            background-color: #1d1d1d;
          }
        }

        .big-screen-bottom {
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
          box-sizing: border-box;
          width: 100%;
          /*height: 26px;*/
          padding: 0 10px;
          height: calc(100% - 180px);
          color: var(--bs-el-title);
          background-color: var(--bs-background-2);

          .left-bigscreen-title {
            font-size: 14px;
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .right-bigscreen-time-title {
            font-size: 14px;
            overflow: hidden;
            width: 140px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .big-screen-card-text {
          font-size: 14px;
          padding: 10px;
          text-align: center;
          color: #333;
        }
      }

      .big-screen-card-inner-add {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .el-loading-parent--relative {
    position: unset !important;
  }

  .footer-pagination-wrap {
    margin-top: 16px;
    position: absolute;
    width: 100%;
  }
}

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

.empty {
  width: 100%;
  height: 70%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-tabs__item {
  color: var(--bs-el-text);
}

.error-img-text {
  overflow: hidden;
  padding: 0 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}

::v-deep .el-tabs__nav-wrap {
  &:after {
    display: none;
  }
}
.empty{
  height: calc(100vh - 430px);
}
</style>
