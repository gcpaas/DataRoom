<template>
  <!-- <transition name="slide-fade"> -->
  <div
    v-if="rightVisiable"
    class="bs-right-panel-wrap"
  >
    <div class="bs-set-title">
      <SettingTitle>{{ chartSettingShow ? `${title}设置` : '大屏设置' }}</SettingTitle>
    </div>
    <div :class="!rightVisiable ? 'bs-page-right bs-page-right-fold' : 'bs-page-right'">
      <RightSetting
        v-if="chartSettingShow"
        @closeRightPanel="close"
        @updateSetting="updateSetting"
        @updateDataSetting="updateDataSetting"
      >
        <template #dataSetSelect="{value}">
          <slot
            name="dataSetSelect"
            :value="value"
          />
        </template>
      </RightSetting>
      <OverallSetting
        v-if="!chartSettingShow"
        ref="OverallSetting"
        @close="close"
        @styleHandler="styleHandler"
      />
    </div>
  </div>
  <!-- </transition> -->
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import RightSetting from 'data-room-ui/BigScreenDesign/RightSetting/index.vue'
import OverallSetting from 'data-room-ui/BigScreenDesign/OverallSetting/index.vue'
import { mapState } from 'vuex'
export default {
  name: '',
  components: {
    SettingTitle,
    RightSetting,
    OverallSetting
  },
  props: {
    rightVisiable: {
      type: Boolean,
      default: false
    },
    pageInfoVisiable: {
      type: Boolean,
      default: false
    },
    headerShow: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '100vh'
    }
  },
  data () {
    return {
      count: 0,
      right: 0
    }
  },
  watch: {
    rightVisiable (value) {
      const leftElement = document.querySelector('.bs-left-panel')
      const contentElement = document.querySelector('.grid-wrap-box')
      // const rightElement = document.querySelector('.bs-right-panel-wrap')
      const mapElement = document.querySelector('.minimap')
      if (value) {
        if (parseInt(window.getComputedStyle(mapElement).right) > parseInt(window.getComputedStyle(leftElement).width) + parseInt(window.getComputedStyle(contentElement).width) - 320 - parseInt(window.getComputedStyle(mapElement).width)) {
          // 此时距离超出可视范围
          this.count = 1
          this.right = window.getComputedStyle(mapElement).right
          mapElement.style.right = parseInt(window.getComputedStyle(leftElement).width) + parseInt(window.getComputedStyle(contentElement).width) - 320 - parseInt(window.getComputedStyle(mapElement).width) + 'px'
        }
      } else {
        if (this.count === 1) {
          mapElement.style.right = this.right
          this.count--
        }
      }
    }
  },
  computed: {
    ...mapState('bigScreen', {
      activeItem: state => state.activeItemConfig,
      activeCode: state => state.activeCode
    }),
    chartSettingShow () {
      return this.rightVisiable && this.activeCode
    },
    title () {
      if (this.activeItem.type === 'customComponent') {
        return this.activeItem?.category
      } else if (this.activeItem.type === 'remoteComponent') {
        return this.activeItem?.title
      } else {
        return this.activeItem?.name
      }
      // if(this.activeItem)
    }
  },
  mounted () { },
  methods: {
    styleHandler (config) {
      this.$emit('styleHandler', config)
    },
    toggleShow () {
      this.$emit('update:rightVisiable', !this.rightVisiable)
    },
    close () {
      this.$emit('update:rightVisiable', false)
    },
    updateSetting (config) {
      this.$emit('updateSetting', config)
    },
    updateDataSetting (config) {
      this.$emit('updateDataSetting', config)
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-right-panel-wrap {
  //z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: var(--bs-background-1);

  .bs-set-title {
    background-color: var(--bs-background-2);
    color: var(--bs-el-title);
    height: 40px;
    font-size: 14px;
    border-bottom: 2px solid var(--bs-background-1);
    display: flex;
    align-items: center;
    z-index: 1000;

    .bs-set-title-text {
      position: relative;
      padding-left: 12px;
      display: inline-block;
      &:after{
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        width: 4px;
        height: 14px;
        background-color: var(--bs-el-color-primary);
      }
    }
  }

  .bs-folder-wrap {
    width: 20px;
    position: relative;

    i {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      font-size: 20px;
      color: #fff;
      cursor: pointer;
      z-index: 1;
    }

    &:hover {
      background: rgba(143, 225, 255, .1)
    }
  }

  .bs-page-right {
    height: calc(100vh - 80px);
    width: 320px;
    box-sizing: border-box;
    background-color: var(--bs-background-2);

    .config-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
      color: #fff;
      font-size: 14px;
      /* border-bottom: 1px solid #ebeef5; */

      .config-title-text {
        display: inline-block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    >* {
      color: #fff;
    }

    // 左侧居中伸缩图标
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -10px;
      width: 10px;
      height: 100%;
      background: #fff;
      cursor: pointer;
      z-index: 1;
    }
  }

  .bs-page-right-fold {
    width: 0;
    overflow: hidden;
  }

  .slider-zoom {
    position: absolute;
    bottom: 10px;
    right: -10px;
  }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active for below version 2.1.8 */
  {
  transform: translateX(10px);
  opacity: 0;
}
::v-deep .el-scrollbar__view{
  height: calc(100vh - 80px);
  overflow-x: unset;
}
</style>
