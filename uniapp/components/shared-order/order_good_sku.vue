<template>
  <view class="order-sku-body">
    <image class="order-good-poster" :src="product.cart_info.product.image" mode="aspectFill" />
    <view class="order-good-info">
      <view class="order-good-name">{{ product.cart_info.product.store_name }}</view>
      <view class="order-good-sku overflow-text">
        {{ product.cart_info.productAttr.sku }}
      </view>
    </view>

    <view class="order-sku-body-right text-right">
      <view class="order-sku-price">
        <text class="price-integer">{{ getPriceInteger(visiblePrice) }}</text>
        <text class="price-decimal">.{{ getPriceDecimal(visiblePrice) }}</text>
      </view>
			<view class="order-delivery-info" >配送费</view>
      <view class="order-sku-count" >x{{ product.product_num }}</view>
      
    </view>
  </view>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      default: () => ({})
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    visiblePrice() {
      if (this.isDeliveryStaff) {
        return this.orderInfo.deliveryOrder.service_fee || "0.00";
      }

      return this.product.cart_info.productAttr.price;
    }
  },
  inject: {
    isDeliveryStaff: {
      default: false
    }
  },
  methods: {
    getPriceInteger(price) {
      return price.toString().split('.')[0];
    },
    getPriceDecimal(price) {
      return price.toString().split('.')[1];
    }
  }
}
</script>

<style scoped lang="scss">
.order-sku-body {
  display: flex;

  .order-good-poster {
    width: 136rpx;
    height: 136rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
  }

  .order-good-info {
    flex: 1;
    overflow: hidden;

    .order-good-name {
      font-size: 28rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 4rpx 0 12rpx;
    }

    .order-good-sku {
      font-size: 24rpx;
      color: #999;
    }
  }

  .order-sku-body-right {
    margin-left: 74rpx;

    .order-sku-price {
      font-size: 20rpx;
      font-family: "dinProSemiBold";
      line-height: 1.6;

      .price-integer {
        font-size: 32rpx;
      }

      &::before {
        font-family: PingFang SC;
        content: "￥";
      }
    }

    .order-sku-count {
      margin-top: 10rpx;
      font-size: 28rpx;
      color: #FF9600;
      text-align: right;
    }

    .order-delivery-info {
      font-weight: 400;
      font-size: 22rpx;
      color: #999999;
      line-height: 30rpx;
      margin-top: 4rpx;
    }
  }
}
</style>
