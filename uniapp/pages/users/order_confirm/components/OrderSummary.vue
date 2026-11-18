<template>
  <view class='moneyList boder-24 bg-f'>

    <!-- 商品总价 -->
    <view class='field-item acea-row row-between-wrapper'>
      <view>商品总价：</view>
      <view class='money'>¥{{ cartInfo.total_price }}</view>
    </view>

    <!-- 运费 -->
    <view class='field-item acea-row row-between-wrapper' v-if="cartInfo.order_total_postage > 0">
      <view>运费：</view>
      <view class='money'>¥{{ cartInfo.order_total_postage }}</view>
    </view>

    <!-- 店铺优惠金额 -->
    <view class='field-item acea-row row-between-wrapper' v-if="cartInfo.order_coupon_price > 0">
      <view>店铺优惠金额：</view>
      <view class='money'>-¥{{ cartInfo.order_coupon_price }}</view>
    </view>

    <!-- 积分抵扣 -->
    <view class='field-item acea-row row-between-wrapper'
      v-if="cartInfo.openIntegral && userInfo && userInfo.integral > 0 && cartInfo.order_type === GOODS_ACTIVITY_TYPE.NORMAL">
      <view>积分抵扣：</view>
      <view class='money'>
        <text v-if="!cartInfo.useIntegral">当前积分<text class="pColor">{{ userInfo.integral }}</text></text>
        <text v-else>使用了{{ cartInfo.order_total_integral }}个积分，抵扣<text class="pColor">{{
          cartInfo.order_total_integral_price }}元</text></text>
        <view class="checkbox integral_checked" @click="handleChangeUseIntegral">
          <view class="iconfont icon-ic_unselect" v-if="!cartInfo.useIntegral"></view>
          <view class='iconfont icon-a-ic_CompleteSelect' v-else></view>
        </view>
      </view>
    </view>

    <!-- 平台优惠券 -->
    <view class='field-item acea-row row-between-wrapper' v-if="allowUsePlatformCoupon">
      <view>平台优惠券
        <text @click="handleShowPlatformCouponProtocol" class="iconfont icon-icon_question"></text>
      </view>
      <CouponSelector title="平台优惠券" :cartInfo="couponConfig" v-if="cartInfo.platformCoupon.length"
        @select="handleSelectPlatformCoupon" theme="gray">
        <template #amount="{ amount }">
          <text>优惠¥{{ amount }}</text>
        </template>
      </CouponSelector>
      <view class='placeholder' v-else>暂无优惠券</view>
    </view>

    <!-- 优惠券说明 -->
    <ProtocolPreview :showProtocol.sync="protocolPreview.show" :agrementTtile="protocolPreview.title"
      :protocol="protocolPreview.protocol" v-if="protocolPreview.show" />
  </view>
</template>

<script>
import { GOODS_ACTIVITY_TYPE } from '@/constants/goods';
import ProtocolPreview from "./ProtocolPreview.vue";
import { getAgreementApi } from '@/api/user';
import CouponSelector from "./CouponSelector.vue";

export default {
  name: 'OrderSummary',
  components: {
    ProtocolPreview,
    CouponSelector
  },
  props: {
    cartInfo: Object,
    userInfo: Object
  },
  data() {
    return {
      GOODS_ACTIVITY_TYPE,
      protocolPreview: {
        show: false,
        title: '优惠券说明',
        protocol: ''
      }
    };
  },
  computed: {
    couponConfig() {
      return {
        ...this.cartInfo,
        coupon: this.cartInfo.platformCoupon,
        mer_id: 0,
        status: true,
      };
    },
    allowUsePlatformCoupon() {
      return this.cartInfo.order_type !== GOODS_ACTIVITY_TYPE.ASSIST && this.cartInfo.order_type !== GOODS_ACTIVITY_TYPE.COMBINATION && this.cartInfo.enabledPlatformCoupon;
    }
  },
  methods: {
    handleSelectPlatformCoupon(payload) {
      this.$emit('select-coupon', payload);
    },
    async handleShowPlatformCouponProtocol() {
      uni.showLoading({ mask: true });
      try {
        const res = await getAgreementApi("sys_coupon_agree");
        this.protocolPreview.protocol = res.data.sys_coupon_agree;
        this.protocolPreview.show = true;
        uni.hideLoading();
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: 'none'
        });
      }
    },
    handleChangeUseIntegral() {
      this.$emit('changeUseIntegral', !this.cartInfo.useIntegral);
    }
  }
}
</script>

<style scoped lang="scss">
.moneyList {
  margin-top: 20rpx;
  background-color: #fff;

  .field-item {
    font-size: 30rpx;
    color: #282828;

    .money {
      color: #999999;
      display: flex;
      align-items: center;
    }
  }

  .pColor {
    color: var(--view-priceColor);
  }

  .integral_checked {
    margin-left: 10rpx;
    display: inline;

    .iconfont {
      font-size: 38rpx;
    }

    .icon-ic_unselect {
      color: #BFBFBF;
    }

    .icon-a-ic_CompleteSelect {
      color: var(--view-theme);
    }
  }
}
</style>
