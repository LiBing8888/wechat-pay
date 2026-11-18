<template>
  <view :style="cssVars">
    <!-- #ifdef MP -->
    <view @click="handleOpenPopup">
      <slot></slot>
    </view>
    <!-- #endif -->

    <!-- #ifndef MP -->
    <view class="relative" @click="handleOpenPopup">
      <slot></slot>
    </view>
    <!-- #endif -->

    <uni-popup ref="popup" type="bottom">
      <view class="popup-container bg-f">
        <view class="selector-popup-header flex-between-center">
          <button class="cancel-btn header-btn flex-center" @click="handleClosePopup">取消</button>
          <button class="confirm-btn header-btn flex-center" @click="handleConfirm">确定</button>
        </view>
        <scroll-view class="selector-popup-wrapper" scroll-y @scroll="handleScroll" :scroll-top="scrollTop"
          v-if="popupBodyIsVisible">
          <CircleSelector :hotCircle="false" :selectedCircleId="selectedCircleId" @select="handleSelectCircle" isPopup
            :circleList="circleList" />
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import deviceEnvMixin from "@/mixins/device-env";
import CircleSelector from './index.vue';
import { SYNC_SCROLL_TOP_EVENT, SELECT_SCROLL_EVENT } from './constants';

export default {
  name: "CircleSelectorPopup",
  mixins: [deviceEnvMixin],
  components: {
    CircleSelector,
  },
  props: {
    circleId: {
      type: Number,
      default: 0,
    },
    circleList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      scrollTop: 0,
      selectedCircleId: this.circleId,
      popupBodyIsVisible: false,
    };
  },
  watch: {
    circleId(circleId) {
      this.selectedCircleId = circleId;
    }
  },
  created() {
    uni.$on(SYNC_SCROLL_TOP_EVENT, this.handleSyncScrollTop);
  },
  beforeDestroy() {
    uni.$off(SYNC_SCROLL_TOP_EVENT, this.handleSyncScrollTop);
  },
  methods: {
    handleOpenPopup() {
      this.$nextTick(() => {
        this.$refs.popup.open();
        this.popupBodyIsVisible = true;
      });
    },
    handleClosePopup() {
      this.$refs.popup.close();
      setTimeout(() => {
        this.popupBodyIsVisible = false;
      }, 300);
    },
    handleSelectCircle(circleId) {
      if (circleId === this.selectedCircleId) {
        this.selectedCircleId = null;
      } else {
        this.selectedCircleId = circleId;
      }
    },
    handleConfirm() {
      this.$emit("update:circleId", this.selectedCircleId);
      this.handleClosePopup();
    },
    handleScroll(e) {
      uni.$emit(SELECT_SCROLL_EVENT, {
        scrollTop: e.detail.scrollTop,
      });
    },
    handleSyncScrollTop(realTop) {
      this.scrollTop = realTop;
    }
  }
}
</script>

<style scoped lang="scss">
.selector-popup-header {
  // border-bottom: 1rpx solid #E5E5E5;
}

.header-btn {
  width: 120rpx;
  height: 80rpx;
  background: transparent;
  font-size: 34rpx;
  color: #333333;

  &.confirm-btn {
    color: #007aff;
  }
}

.popup-container {
  border-radius: 30rpx 30rpx 0 0;
}

.selector-popup-wrapper {
  --selector-container-height: 70vh;
  height: var(--selector-container-height);
}
</style>
