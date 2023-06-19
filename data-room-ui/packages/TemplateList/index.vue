<template>
  <div
    v-loading="loading || innerLoading"
    class="template-list-wrap"
  >
    <div
      v-if="hasCreate"
      class="template-item"
      @click="addNew"
    >
      <div
        class="iconfont-div"
      >
        <i class="iconfont el-icon-plus" />
      </div>
      <div
        class="name"
      >
        从空白新建
      </div>
    </div>
    <div
      v-for="template in templateList"
      :key="template.id"
      class="template-item template-choose-item"
    >
      <div
        class="thumbnail"
      >
        <el-image
          :ref="'img' + template.id"
          :src="template.thumbnail"
          :preview-src-list="[template.thumbnail]"
        />

        <span class="template-list-item-actions">
          <i
            class="el-icon-zoom-in"
            @click="preview(template.id)"
          />
          <i
            class="el-icon-edit-outline"
            @click="useIt(template.id)"
          />
        </span>
      </div>
      <div class="name">
        {{ template.name }}
      </div>
    </div>
    <el-empty
      v-if="!templateList.length && !hasCreate"
      description="暂无模板"
    />
  </div>
</template>

<script>
import { get, post } from 'packages/js/utils/http'
export default {
  name: 'TemplateList',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    hasCreate: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    pageInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      innerLoading: false,
      templateList: [],
      type: null, // 类型
      isInDesign: false // 是否在设计页面
    }
  },
  methods: {
    init (type, isInDesign) {
      this.isInDesign = isInDesign
      this.type = type
      this.getTemplateList(type)
    },
    // 得到模板列表
    getTemplateList (type) {
      this.type = type
      get('/bigScreen/template/list', {
        type
      }).then((list) => {
        this.templateList = list
      })
    },
    // 从空白新建
    addNew () {
      this.$emit('addNew')
    },
    // 预览
    preview (id) {
      // 触发el-image的点击事件
      this.$refs['img' + id][0].showViewer = true
    },
    // 使用它作为模版
    useIt (id) {
      if (this.hasCreate) {
        this.$emit('useIt', id)
      } else {
        this.$confirm('使用该模板将会覆盖当前页面的所有内容，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }).then(() => {
          const className = this.type === 'com.gccloud.bigscreen.core.module.manage.dto.BigScreenPageDTO'
          this.innerLoading = true
          post(`/bigScreen/${this.type}/design/get/template`, {
            pageTemplateId: id,
            name: this.pageInfo.name,
            code: this.pageInfo.code,
            id: this.pageInfo.id,
            className
          }).then(res => {
            this.$emit('replaceItByTemplate', res)
          }).finally(() => {
            this.innerLoading = false
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.template-list-wrap {
   display: grid;
  // 不固定列
  grid-template-columns: repeat(auto-fill, 140px);
  grid-gap: 20px;
  justify-content: center;

  .template-item {
    cursor: pointer;
    margin-right: 20px;

    .iconfont-div {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 140px;
      width: 140px;
      border: 1px solid #e5e5e5;
      color: #999999;

      .iconfont {
        font-size: 40px;
      }
    }

    .thumbnail {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 140px;
      width: 140px;
      background: #f2f2f2;
      position: relative;

      .template-list-item-actions {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        cursor: default;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0,0,0,.5);
        transition: opacity .3s;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        i {
          margin: 0 10px;
        }
      }
      &:hover {
        .template-list-item-actions {
          opacity: 1;
        }
      }
    }

    .thumbnail img {
      width: 100%;
    }

    .name {
      margin-top: 10px;
      text-align: center;
    }
  }

  // 移动上去显示遮罩层预览和使用

  .template-choose-item {

  }
}

</style>
