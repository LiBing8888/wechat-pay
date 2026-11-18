<template>
  <view class="reservation-date-wrapper boder-24">
    预约时间：{{ reservationDate }}
  </view>
</template>

<script>
export default {
  name: 'ReserverationDate',
  props: {
    reservationDate: String,
  },
};
</script>

<style scoped lang="scss">
.reservation-date-wrapper {
  background-color: #fff;
  padding: 28rpx 30rpx;
}
</style>
