<template>
  <view class="circle-selector-header sticky" :class="{ 'is-popup': isPopup }">
    <scroll-view class="scroll-view" scroll-x scroll-with-animation :scroll-into-view="scrollIntoViewId">
      <view class="circle-list flex flex-no-wrap">
        <view class="circle-item flex-center" v-for="(circle, index) of list" :id="getCircleId(index)"
          :class="{ 'active': activeIndex === index }" :key="circle.circleId" @click="handleCircleClick(index)">{{ circle.name }}
        </view>
        <view class="more-btn-placeholder" v-if="moreBtn"></view>
      </view>
    </scroll-view>
    <view class="more-btn-box absolute flex-center" v-if="moreBtn">
      <button class="more-btn flex-center" @click="handleMoreBtnClick">
        <text class="iconfont icon-ic_downarrow"></text>
      </button>
    </view>
    <slot />
  </view>
</template>

<script>
export default {
  name: "CircleSelectorHeader",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    moreBtn: {
      type: Boolean,
      default: true
    },
    isPopup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollIntoViewId: "",
    };
  },
  watch: {
    activeIndex(index) {
      this.scrollIntoViewId = this.getCircleId(index);
    },
  },
  methods: {
    getCircleId(index) {
      return `header-circle-${index}`;
    },
    handleCircleClick(index) {
      this.$emit("update:activeIndex", index);
    },
    handleMoreBtnClick() {
      this.$emit("more");
    },
  },
}
</script>

<style scoped lang="scss">
.circle-selector-header {
  top: var(--nav-bar-height);
  background-color: #fff;
  --more-btn-width: 80rpx;
  border-bottom: 1px solid #eee;
  z-index: 1;

  &.is-popup {
    top: 0;
  }
}

.circle-list {
  height: var(--header-selector-height);
}

.more-btn-placeholder {
  width: var(--more-btn-width);
  flex-shrink: 0;
}

.circle-item {
  flex-shrink: 0;
  height: 100%;
  padding-inline: 18rpx;

  &.active {
    position: relative;
    font-weight: 500;

    &::before {
      content: "";
      width: 28rpx;
      height: 4rpx;
      background-color: var(--view-theme);
      position: absolute;
      bottom: 16rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

.more-btn-box {
  top: 0;
  width: var(--more-btn-width);
  right: 0;
  bottom: 0;
  background-color: #fff;

  &::before {
    content: '';
    position: absolute;
    width: 12rpx;
    height: 100%;
    top: 0;
    left: -6rpx;
    background: radial-gradient(59% 59% at 81% 49%, rgba(0, 0, 0, 0.082) 0%, rgba(0, 0, 0, 0) 100%);
  }

  .more-btn {
    width: 52rpx;
    height: 52rpx;
    background: #F5F5F5;
    border-radius: 50%;
  }
}
</style>
