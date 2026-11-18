<template>
  <view class="circle-hot-popup fixed" @touchmove.stop.prevent>

    <!-- 遮罩层 -->
    <view class="popup-mask absolute inset-0" @click.self="handleClose"></view>

    <!-- 弹窗内容 -->
    <view class="popup-body relative">
      <view class="popup-body-header flex-between-center">
        <view class="title">热门商圈</view>
        <button class="close-btn flex-center" @click="handleClose">
          <text class="iconfont icon-ic_uparrow"></text>
        </button>
      </view>
      <view class="circle-hot-list">
        <view class="circle-hot-item flex-center" v-for="circle of recommendCircles" :key="circle.circleId"
          :class="{ 'active': selectedCircleId === circle.circleId }" @click="handleCircleClick(circle.circleId)">
          <view class="line1">
            {{ circle.name }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CircleHotPopup",
  props: {
    selectedCircleId: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState({
      recommendCircles: state => state.circle.recommendCircles,
    }),
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleCircleClick(circleId) {
      this.$emit("select", circleId);
      this.handleClose();
    },
  },
}
</script>

<style scoped lang="scss">
.circle-hot-popup {
  inset: 0;
  z-index: 1;

  // 避开导航栏
  top: var(--nav-bar-height);
}

.popup-mask {
  background: rgba(0, 0, 0, 0.6);
}

.popup-body {
  background-color: #fff;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
}

.popup-body-header {
  padding: 24rpx 26rpx 36rpx 18rpx;

  .title {
    font-weight: 500;
    font-size: 28rpx;
    color: #333;
  }
}

.close-btn {
  width: 30rpx;
  height: 30rpx;
}

.circle-hot-list {
  gap: 24rpx;
  padding: 0 30rpx 38rpx;

  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.circle-hot-item {
  width: 154rpx;
  height: 56rpx;
  padding-inline: 10rpx;
  background: #F5F5F5;
  border-radius: 200rpx;
  font-size: 24rpx;
  color: #333333;

  &.active {
    background: #FCEAE9;
    color: #E93323;
    border: 1px solid currentColor;
  }
}
</style>
