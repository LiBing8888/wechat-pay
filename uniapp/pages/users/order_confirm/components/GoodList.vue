<template>
  <view>
    <view v-for="(goods, j) in list" :key="j">
      <view v-if="goods.product_type == 2">
        <view class="product-item">
          <view class="img-box">
            <image :src="goods.productPresellAttr.image || goods.product.image" forceHttps></image>
          </view>
          <view class="content event_content">
            <view class="name line1"><text class="event_name event_bg">预售</text>{{ goods.productPresell.store_name }}
            </view>
            <view class="label" style="width: 70%;">{{ goods.productAttr.sku }}</view>
            <view class="price">
              <priceFormat :price="goods.productPresellAttr.presell_price" weight intSize="32" floatSize="24"
                labelSize="24"></priceFormat>
              <view class="num">X{{ goods.cart_num }}</view>
            </view>
            <view class="event_ship event_color">发货时间：
              <!--全款预售-->
              <text v-if="goods.productPresell.presell_type === 1">{{ goods.productPresell.delivery_type === 1 ? '支付后' :
                '预售结束后' }}{{ goods.productPresell.delivery_day }}天内</text>
              <!--定金预售-->
              <text v-if="goods.productPresell.presell_type === 2">{{ goods.productPresell.delivery_type === 1 ? '付尾款后'
                : '预售结束后' }}{{ goods.productPresell.delivery_day }}天内</text>
            </view>
          </view>
        </view>
        <view v-if="goods.productPresell.presell_type === 2" class="event_payTime">
          <view class="event_progress">
            <view class="progress_step">
              <text class="name color_red">定金</text>
              <text class="price color_red">
                <priceFormat :price="(goods.productPresellAttr.down_price * goods.cart_num).toFixed(2)" weight
                  intSize="28" floatSize="20" labelSize="20"></priceFormat>
              </text>
            </view>
            <view class="progress_step">
              <text class="name">尾款</text>
              <view class="price">
                <priceFormat :price="(goods.productPresellAttr.final_price * goods.cart_num).toFixed(2)" weight
                  intSize="28" floatSize="20" labelSize="20"></priceFormat>
              </view>
            </view>
            <view class="progress_pay">
              {{ goods.productPresell.final_start_time | filterDay }}开始支付尾款</view>
          </view>
        </view>
      </view>
      <view v-else>
        <view class="product-item">
          <view class="img-box">
            <image :src="goods.productAttr.image || goods.product.image" forceHttps></image>
          </view>
          <view class="content">
            <view class="acea-row row-between">
              <view class="name line1">{{ goods.product.store_name }}</view>
              <view class="num">x{{ goods.cart_num }}</view>
            </view>
            <view class="label">{{ goods.productAttr.sku || "默认规格" }}</view>
            <view class="price acea-row row-between">
              <view class="acea-row row-middle">
                <block v-if="isAssist">
                  <priceFormat :price="goods.productAssistAttr.assist_price" weight intSize="32" floatSize="24"
                    labelSize="24"></priceFormat>
                </block>
                <block v-else-if="isCombination">
                  <priceFormat :price="goods.activeSku && goods.activeSku.active_price" weight intSize="32"
                    floatSize="24" labelSize="24"></priceFormat>
                </block>
                <block v-else>
                  <priceFormat :price="goods.productAttr.price" weight intSize="32" floatSize="24" labelSize="24">
                  </priceFormat>
                </block>
                <view v-if="goods.productAttr.show_svip_price" class="vipImg">
                  <image :src="`${domain}/static/images/svip.png`" forceHttps></image>
                </view>
              </view>
              <view v-if="!isCombination && !isBookingOrder && !isYearCard" class="delivery_type">
                <block v-if="!goods.allow_delivery || !goods.allow_take || !goods.allow_city_take">
                  <text class="iconfont icon-icon_tip"></text>
                  <text>{{ getNotSupportDeliveryTypeText(goods) }}</text>
                </block>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { GOODS_ACTIVITY_TYPE } from '@/constants/goods';
import { HTTP_REQUEST_URL } from "@/config/app";

export default {
  name: 'GoodList',
  props: {
    list: Array,
    cartInfo: Object,
    isBookingOrder: Boolean
  },
  data() {
    return {
      domain: HTTP_REQUEST_URL,
    }
  },
  computed: {
    isAssist() {
      // 助力商品
      return this.cartInfo.order_type === GOODS_ACTIVITY_TYPE.ASSIST;
    },
    isCombination() {
      // 拼团商品
      return this.cartInfo.order_type === GOODS_ACTIVITY_TYPE.COMBINATION;
    },
    isYearCard() {
      // 年/次卡商品
      return this.cartInfo.order_model === 5;
    },
  },
  methods: {
    getNotSupportDeliveryTypeText(goods) {
      let text = '不支持'
      if (!goods.allow_delivery) {
        text = text + '快递配送'
      }
      if (!goods.allow_take) {
        if (!goods.allow_delivery) {
          text = text + '、'
        }
        text = text + '到店核销'
      }
      if (!goods.allow_city_take) {
        if (!goods.allow_delivery || !goods.allow_take) {
          text = text + '、'
        }
        text = text + '闪送'
      }
      return text
    }
  }
};
</script>

<style scoped lang="scss">
.product-item {
  display: flex;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
  .img-box {
    width: 130rpx;
    height: 130rpx;
    image {
      width: 130rpx;
      height: 130rpx;
      border-radius: 16rpx;
    }
  }
  .content {
    position: relative;
    width: 550rpx;
    margin-left: 30rpx;
    font-size: 28rpx;
    color: #282828;
    overflow: hidden;
    .name {
      max-width: 400rpx;
    }
    &.event_content {
      .line1 {
        width: 360rpx;
      }
      .price {
        position: absolute;
        top: 0;
        right: 0;
        margin-top: 0;
        color: var(--view-theme);
        text-align: right;
        .num {
          color: #999;
          font-size: 22rpx;
          margin-top: 10rpx;
        }
      }
    }
    .event_name {
      display: inline-block;
      margin-right: 9rpx;
      color: #fff;
      font-size: 20rpx;
      padding: 0 8rpx;
      line-height: 30rpx;
      text-align: center;
      border-radius: 6rpx;
    }
    .event_ship {
      font-size: 20rpx;
      margin-top: 10rpx;
    }
    .label {
      margin-top: 10rpx;
      color: #999999;
      font-size: 24rpx;
    }
    .price {
      margin-top: 20rpx;
      position: relative;
      .delivery_type {
        float: right;
        text {
          color: var(--view-priceColor);
          font-size: 13px;
        }
      }
    }
    .num {
      margin-left: 10rpx;
      color: #999;
      font-size: 26rpx;
    }
    .err-txt {
      display: flex;
      // align-items: center;
      align-items: baseline;
      margin-top: 18rpx;
      color: $theme-color;
      font-size: 22rpx;
      font-weight: 400;
      .iconfont {
        margin-right: 10rpx;
        font-size: 22rpx;
      }
    }
  }
}
.event_payTime {
		padding: 0 30rpx 24rpx;
		.event_progress {
			margin-top: 50rpx;
			position: relative;
		}
		.progress_step {
			height: 80rpx;
			position: relative;
			padding-left: 60rpx;
			&::before {
				content: '';
				display: block;
				width: 2rpx;
				height: 40rpx;
				background: var(--view-theme);
				position: absolute;
				left: 35rpx;
				top: 18rpx;
			}
			&:nth-child(2) {
				&::before {
					bottom: 64rpx;
					top: auto;
					background: #EFEFEF;
				}
				&::after {
					background: #EFEFEF;
				}
			}
			&::after {
				content: '';
				display: block;
				width: 14rpx;
				height: 14rpx;
				background: var(--view-theme);
				border-radius: 50%;
				position: absolute;
				top: 10rpx;
				left: 29rpx;
			}
			.name {
				float: left;
				color: #282828;
				&.color_red {
					color: var(--view-theme);
				}
			}
			.price {
				float: right;
				color: #282828;
				&.color_red {
					color: var(--view-priceColor);
				}
			}
		}
		.progress_pay {
			padding-left: 60rpx;
			font-size: 24rpx;
			color: #999999;
			margin-top: -34rpx;
		}
	}
.vipImg {
  width: 65rpx;
  height: 28rpx;
  margin-left: 4rpx;

  image {
    width: 100%;
    height: 100%;
    display: block;
  }
}
.event_bg{
	background: #FF7F00;
}
</style>
