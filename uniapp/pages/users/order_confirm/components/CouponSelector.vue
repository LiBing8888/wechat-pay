<template>
  <view>
    <view class="discount" @click="handleOpenCouponPopup" :class="[theme]">
      <template v-if="useCouponAmount > 0">
        <slot :amount="useCouponAmount" name="amount">
          <text>
            -¥{{ useCouponAmount }}
          </text>
        </slot>
      </template>
      <text v-else>暂未选择优惠券</text>
      <text class='iconfont icon-ic_rightarrow'></text>
    </view>

    <couponListWindow :coupon="couponConfig" v-if="couponWindowVisible" :couponTitle="title" :openType="1"
      :coupon_number="useCouponCount" :coupon_amount="Number(useCouponAmount)" @getCoupon="handleSelectCoupon"
      @ChangCouponsClose="handleCloseCouponPopup" />
  </view>
</template>

<script>
import couponListWindow from "@/pages/users/components/orderCoupon/index.vue";

export default {
  name: 'CouponSelector',
  props: {
    title: String,
    cartInfo: Object,
    theme: {
      type: String,
      default: 'default'
    }
  },
  components: {
    couponListWindow
  },
  data() {
    return {
      couponWindowVisible: false,
    };
  },
  computed: {
    couponConfig() {
      return {
        status: true,
        ...this.cartInfo
      };
    },
    useCouponCount() {
      if (this.cartInfo.mer_id === 0) {
        return this.cartInfo.coupon.filter(item => item.checked).length;
      }
      return this.cartInfo.order.useCouponIds.length;
    },
    useCouponAmount() {
      if (this.cartInfo.mer_id === 0) {
        return this.cartInfo.total_platform_coupon_price;
      }
      return this.cartInfo.order.coupon_price;
    }
  },
  methods: {
    handleSelectCoupon(coupon) {
      this.$emit("select", {
        merId: this.cartInfo.mer_id,
        couponUserId: coupon.coupon_user_id
      });
    },
    handleOpenCouponPopup() {
      this.couponWindowVisible = true;
    },
    handleCloseCouponPopup() {
      this.couponWindowVisible = false;
    }
  }
}
</script>

<style scoped lang="scss">
.discount {
  &.gray {
    color: #999999;
  }
}
</style>
