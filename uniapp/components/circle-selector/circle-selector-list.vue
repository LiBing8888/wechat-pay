<template>
  <view class="circle-selector-list" @click="handleListClick">
    <view v-for="(secondCircle, index) of list" :key="secondCircle.circleId" class="second-circle-item">
      <view class="second-circle-item-title line1 sticky">
        {{ secondCircle.name }}
      </view>
      <view class="third-circle-list" v-if="secondCircle.children">
        <view class="third-circle-item flex-center overflow-hidden" v-for="thirdCircle of secondCircle.children"
          :key="thirdCircle.circleId" :data-circle-id="thirdCircle.circleId"
          :class="{ active: selectedCircleId === thirdCircle.circleId }">
          <view class="line1 none-event">
            {{ thirdCircle.name }}
          </view>
        </view>
      </view>
    </view>
    <view :style="[lastItemPlaceholderStyle]" id="last-item-placeholder"></view>
  </view>
</template>

<script>
import { SYNC_SCROLL_TOP_EVENT, SELECT_SCROLL_EVENT } from './constants';
import { getSearchNavBarHeight } from '@/components/common/search_nav_bar.util';
import { getSystemInfo } from "@/utils/device";
import { SELECTOR_HEADER_HEIGHT } from "./config";

export default {
  name: "CircleSelectorList",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    slotHeight: Number,
    selectedCircleId: Number,
    isPopup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      lastEmitIndex: 0,
      scrollViewportHeight: 0, // 滚动视口高度
      scrollHeight: 0, // 滚动元素总高度
      contentPositions: [], // 滚动容器各元素位置信息
      lastSetIntoViewIdTime: 0
    }
  },
  watch: {
    activeIndex(index) {
      if (index !== this.lastEmitIndex) {
        this.lastEmitIndex = index;
        if (this.contentPositions[index]) {
          const realTop = this.contentPositions[index].top;
          if (this.isPopup) {
            uni.$emit(SYNC_SCROLL_TOP_EVENT, realTop);
          } else {
            uni.pageScrollTo({
              scrollTop: realTop
            });
          }
          this.lastSetIntoViewIdTime = Date.now();
        }
      }
    },
    list: {
      immediate: true,
      handler() {
        // 列表内容发生变化时，重新计算各元素位置信息
        setTimeout(() => {
          this.initItemRect();
        }, 100);
      }
    },
    lastItemPlaceholderStyle() {
      this.$nextTick(() => {
        this.initScrollContainerHeight();
      });
    }
  },
  computed: {
    // 滚动容器底部占位区域样式
    // 撑开最后一个元素高度，使其刚好和滚动容器高度一致
    // 确保能和左侧列表同步滚动
    lastItemPlaceholderStyle() {
      if (this.contentPositions.length && this.scrollViewportHeight) {
        const lastItemHeight = this.contentPositions[this.contentPositions.length - 1].height;

        if (lastItemHeight < this.scrollViewportHeight) {
          return {
            height: `calc(var(--sidebar-container-height) - ${lastItemHeight}px)`
          }
        }
      }
      return {
        height: uni.upx2px(20) + "px"
      };
    }
  },
  created() {
    // 监听页面滚动事件
    uni.$on(SELECT_SCROLL_EVENT, this.handleScroll);
  },
  mounted() {
    this.handleCalcScrollContainerHeight();
  },
  beforeDestroy() {
    // 移除页面滚动事件监听
    uni.$off(SELECT_SCROLL_EVENT, this.handleScroll);
  },
  methods: {
    // 计算不计入滚动的距离
    // 包含顶部导航、以及导航
    getScrollOffset() {
      // 选择器横向滚动选择器高度 + 1px 边框
      const selectorHeaderHeight = SELECTOR_HEADER_HEIGHT + 1;

      // 非弹窗模式下，不计入顶部导航栏高度
      if (!this.isPopup) return selectorHeaderHeight;
      return selectorHeaderHeight + getSearchNavBarHeight();
    },
    // 计算滚动容器视窗高度
    handleCalcScrollContainerHeight() {
      const systemInfo = getSystemInfo();
      const {
        screenHeight,
      } = systemInfo;
      this.scrollViewportHeight = screenHeight - this.getScrollOffset();
    },
    handleListClick(e) {
      const circleId = e.target.dataset.circleId;
      if (circleId) {
        this.$emit("select", circleId);
      }
    },
    handleScroll(e) {
      // 接收到新索引后会设置滚动位置，并设置滚动位置
      // 滚动动画约 400ms 左右，动画结束后会触发滚动事件
      // 为了防止滚动事件被 props 更新索引时重复触发，需要设置一个时间间隔
      // 只有滚动动画结束后，才允许触发滚动事件
      const allowScroll = Date.now() - this.lastSetIntoViewIdTime > 500;
      if (!allowScroll) return;

      let { scrollTop } = e;
      const contentPositions = this.contentPositions;
      const length = contentPositions.length;
      let index = -1;

      // 可滚动范围 = 滚动容器高度 - 滚动视口高度
      const scrollRange = Math.floor(this.scrollHeight - this.scrollViewportHeight);
      if (scrollTop >= scrollRange) {
        // 如果滚动位置大于可滚动范围，则已经进入最后一个元素的范围
        index = length - 1;
      } else if (scrollTop <= contentPositions[0].bottom) {
        // 如果滚动位置小于第一个元素的底部坐标，则滚动位置在第一个元素的范围内
        index = 0;
      } else {
        // 否则则按照元素绝对位置进行查询
        // 要求滚动位置小于当前元素的底部坐标
        index = contentPositions.findIndex((item, index) => {
          return (index + 1 < length && scrollTop < this.contentPositions[index].bottom) || index === length - 1;
        });
      }

      // 如果索引有效且索引不等于当前索引，则触发更新索引事件
      if (index >= 0 && index !== this.activeIndex) {
        this.lastEmitIndex = index;
        this.$emit("update:activeIndex", index);
      }
    },
    // 初始化滚动容器高度
    initScrollContainerHeight() {
      uni.createSelectorQuery()
        .in(this)
        .select('.circle-selector-list')
        .boundingClientRect(rect => {
          // 滚动容器高度 = 列表高度 + 头部高度 + 插槽占位区域高度
          this.scrollHeight = rect.height + this.getScrollOffset() + this.slotHeight;
        })
        .exec();
    },
    // 初始化各元素位置信息
    initItemRect() {
      uni.createSelectorQuery()
        .in(this)
        .selectAll(`.second-circle-item`)
        .boundingClientRect(rectList => {
          const contentPositions = [];
          let prevBottom = 0;
          rectList.forEach((rect, index) => {
            // 计算各元素相对于插槽内容的实际位置
            // 第一个元素需要减去不计入滚动的距离
            let rectHeight = rect.height;
            if (index === 0) {
              rectHeight = this.slotHeight + rect.height;
            }
            const bottom = prevBottom + rectHeight;
            contentPositions[index] = {
              index,
              top: prevBottom,
              bottom,
              height: rectHeight
            }
            prevBottom = bottom;
          });
          this.contentPositions = contentPositions;
        })
        .exec();
    }
  }
}
</script>

<style scoped lang="scss">
.circle-selector-list {
  background-color: #fff;
}

.second-circle-item {
  padding-inline: 24rpx;
  padding-bottom: 40rpx;
}

.second-circle-item-title {
  top: 0;
  background: #fff;
  font-size: 26rpx;
  color: #666;

  padding: {
    top: 24rpx;
    bottom: 20rpx;
  }
}

.third-circle-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.third-circle-item {
  height: 64rpx;
  background: #F5F5F5;
  border-radius: 200rpx;
  padding-inline: 10rpx;
  font-size: 24rpx;
  color: #333333;

  &.active {
    background-color: var(--view-theme);
    color: #fff;
  }
}
</style>
