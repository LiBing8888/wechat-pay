<template>
  <view class="linear-background sticky">
    <!-- #ifndef WEB -->
    <view class="navbar-placeholder">
      <BaseNavBar />
    </view>
    <!-- #endif -->
    <view class="order-header-bg relative" />
  </view>
</template>

<script>
import BaseNavBar from "@/components/common/base_nav_bar.vue";

export default {
  name: 'LinearBackground',
  components: {
    BaseNavBar
  }
}
</script>

<style scoped lang="scss">
.linear-background {
  top: 0;
}

.navbar-placeholder {
  visibility: hidden;
}

.order-header-bg {
  height: 100rpx;
  background-image: linear-gradient(90deg, var(--view-bntColor22) 0%, var(--view-bntColor21) 100%);

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 86rpx;
    background: linear-gradient(0deg, #F5F5F5 0%, rgba(245, 245, 245, 0) 100%);
  }
}
</style>
