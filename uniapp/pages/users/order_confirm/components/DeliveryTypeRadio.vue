<template>
  <view class="delivery-type-radio flex">
    <button class="delivery-type-radio-item flex-center" v-for="(item, index) of config" :key="index"
      :class="{ 'active': index === activeIndex }" @click="handleChangeDeliveryType(index)">
      {{ item.title.slice(0, 2) }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'DeliveryTypeRadio',
  props: {
    config: Array
  },
  computed: {
    activeIndex() {
      return this.config.findIndex(item => item.check);
    }
  },
  methods: {
    handleChangeDeliveryType(index) {
      this.$emit("change", index);
    }
  }
}
</script>

<style scoped lang="scss">
.delivery-type-radio {
  padding: 6rpx;
  border-radius: 62rpx;
  background: #F5F5F5;

  &-item {
    width: 96rpx;
    height: 50rpx;
    font-weight: 400;
    color: #666;
    font-size: 24rpx;
    line-height: 34rpx;
    background-color: transparent;

    &.active {
      background-color: var(--view-theme);
      color: #fff;
      border-radius: 25rpx;
    }
  }
}
</style>
