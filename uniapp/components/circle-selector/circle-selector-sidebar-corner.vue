<template>
  <view class="circle-selector-sidebar-corner absolute" :class="position">
    <view class="corner"></view>
  </view>
</template>

<script>
export default {
  name: "CircleSelectorSidebarCorner",
  props: {
    position: {
      type: String,
      default: "top",
    },
  },
}
</script>

<style scoped lang="scss">
.circle-selector-sidebar-corner {
  --size: 28rpx;

  right: 0;
  background-color: #fff;

  .corner {
    width: var(--size);
    height: var(--size);
    background-color: #f5f5f5;
  }

  &.top {
    top: calc(var(--size) * -1);

    .corner {
      border-bottom-right-radius: var(--size);
    }
  }

  &.bottom {
    bottom: calc(var(--size) * -1);

    .corner {
      border-top-right-radius: var(--size);
    }
  }
}
</style>
