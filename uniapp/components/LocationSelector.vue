<template>
  <navigator class="location-toggle" :class="{ scroll: isScroll }" hover-class="none" url="/pages/circle/select">
    <view class="iconfont icon-ic_location51" />
    <text class="address">{{ addressInfo }}</text>
    <view class="iconfont icon-ic_downarrow" />
  </navigator>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: 'LocationSelector',
  props: {
    isScroll: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      address: state => state.location.address,
      location: state => state.location.location,
      circleInfo: state => state.circle.selectedCircleInfo,
    }),
    addressInfo() {
      if (this.circleInfo && this.circleInfo.name) {
        return this.circleInfo.name;
      } else if (this.address) {
        return this.address;
      } else {
        return '定位中...';
      }
    }
  },
  created() {
		this.$store.dispatch("initLocation")
  },
}
</script>

<style lang="scss" scoped>
.location-toggle {
  display: flex;
  align-items: center;
  background-color: transparent;
  color: var(--location-color, #888);
  font-size: 13px;
  line-height: 1;
  margin-right: 19rpx;

  &.scroll {
    color: #333;
  }
	.icon-ic_location51 {
		font-size: 28rpx;
	}
  .address {
    margin-left: 6rpx;
    max-width: 5em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
