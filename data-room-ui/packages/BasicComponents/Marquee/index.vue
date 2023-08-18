<template>
  <div class="marquee-box">
    <div class="scroll-area">
      <!-- 设置margin，使内容 有从无到有的出现效果 -->
      <div class="marquee-container">
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: { },
  data () {
    return {
      content: '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十'
    }
  },
  mounted () {
    this.scrollRightToLeft()
  },
  methods: {
    // 从右到左滚动
    scrollRightToLeft () {
      // 在mounted阶段，才可以获取真实DOM节点
      const showArea = document.querySelector('.marquee-box')
      // 从左到右滚动，首先把滚动条置到元素的最右边
      showArea.scrollLeft = 0
      function f () {
        // 如果滚动条到了元素的最左边，那么把它再初始化到最右边
        if (showArea.scrollLeft > showArea.scrollWidth) {
          showArea.scrollLeft = showArea.scrollWidth
        } else {
        // 每次滚动条向左移动2，改变speed可以调整滚动速度
          const speed = 1
          showArea.scrollLeft += speed
        }
        // 使用requestAnimationFrame，优化滚动效果
        // requestAnimationFrame使得滚动和机器帧率同步
        requestAnimationFrame(f)
      }
      requestAnimationFrame(f)
    },
    // 从左到右滚动
    scrollLeftToRight () {
      // 在mounted阶段，才可以获取真实DOM节点
      const showArea = document.querySelector('.marquee-box')
      showArea.scrollLeft = showArea.scrollWidth
      function f () {
      // 如果滚动条到了元素的最左边，那么把它再初始化到最右边
        if (showArea.scrollLeft < 3) {
          showArea.scrollLeft = showArea.scrollWidth
        } else {
        // 每次滚动条向左移动2，改变speed可以调整滚动速度
          const speed = 1
          showArea.scrollLeft -= speed
        }
        requestAnimationFrame(f)
      }
      // 使用requestAnimationFrame，优化滚动效果
      // requestAnimationFrame使得滚动和机器帧率同步
      requestAnimationFrame(f)
    }
  }
}
</script>

<style lang="scss" scoped>
 .marquee-box {
    // height: 50px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    .scroll-area {
      font-size: 100px;
      display: inline-block;
      .marquee-container {
        display: inline-block;
      }
    }
  }
</style>
