<template>
  <view class="storeinfo-wrapper">
    <view class="store-item boder-24 bg-f" v-for="(item, index) in list" :key="index">
      <!-- 店铺信息 -->
      <view class="store-title acea-row row-middle">
        <text class="iconfont icon-ic_mall"></text>
        <view class="txt font-500" @click="goStore(item.mer_id)">{{ item.mer_name }}</view>
        <text class="iconfont icon-ic_rightarrow"></text>
      </view>

      <!-- 商品列表 -->
      <GoodList :list="item.list" :cartInfo="cartInfo" :isBookingOrder="isBookingOrder" />

      <!-- 配送方式 -->
      <DeliveryType v-if="showDeliveryType" ref="deliveryType" :cartInfo="cartInfo" :storeCart="item"
        @change="handleChangeDeliveryType" :deliverySettings="deliverySettingList[index]"
        :yearCardSelectedType="yearCardSelectedType" :serviceType="serviceType" />

      <!-- 店铺优惠券 -->
      <view class='field-item acea-row row-between-wrapper' v-if="orderAllowCoupon && item.order.enabledCoupon">
        <view>店铺优惠</view>
        <CouponSelector title="优惠券" v-if="item.coupon.length" :cartInfo="item" @select="handleSelectCoupon" />
        <view class='placeholder' v-else>暂无优惠券</view>
      </view>

      <!-- 预售协议 -->
      <view class="field-item acea-row row-between-wrapper" v-if="isPresaleOrder(item)">
        <checkbox-group class="checkgroup" @change='handleChangeIsAgree'>
          <text class="iconfont icon-icon_question" style="margin-left: 0;margin-right:8px;"></text>
          <text @click="handleOpenPresaleAgreement">我已同意定金不退等预售协议</text>
          <checkbox class="checkbox" :checked="isAgreePresaleProtocol ? true : false" />
        </checkbox-group>
      </view>

      <!-- 预售协议弹窗 -->
      <ProtocolPreview :showProtocol.sync="presaleProtocol.show" :agrementTtile="presaleProtocol.title"
        :protocol="presaleProtocol.protocol" v-if="presaleProtocol.show" />

      <!-- 备注信息 -->
      <view class='field-item acea-row row-between-wrapper'>
        <view style="width: 100px;">备注信息</view>
        <input placeholder-class='placeholder' name="mark" placeholder='选填备注信息' :value="remarkMap[item.mer_id]"
          @input="handleInputRemark($event, item.mer_id)"></input>
      </view>

      <!-- 商户总价小计 -->
      <view class="total">
        <view>
          <view class="shipping-amount" v-if="checkIsDisplayDiffAmount(item, index)">
            还差
            <text class="fs-10px">￥</text>
            {{ deliverySettingList[index].free_shipping_amount - item.order.total_price }}
            包邮
          </view>
        </view>
        <view class="flex-y-center">
          共{{ item.order.total_num }}件 小计
          <view class="price" v-if="!item.order.isTake">
            <priceFormat :price="item.order.pay_price" weight intSize="40" floatSize="28" labelSize="28"></priceFormat>
          </view>
          <view class="price" v-if="item.order.isTake">
            <priceFormat :price="item.order.org_price" weight intSize="40" floatSize="28" labelSize="28"></priceFormat>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import GoodList from "./GoodList.vue";
import DeliveryType from "./DeliveryType.vue";
import CouponSelector from "./CouponSelector.vue";
import { configMap } from "@/utils";
import { GOODS_ACTIVITY_TYPE, GOODS_TYPE } from '@/constants/goods';
import { presellAgreement } from '@/api/activity.js';
import ProtocolPreview from "./ProtocolPreview.vue";

export default {
  name: "CartList",
  options: {
    styleIsolation: 'shared',
  },
  components: {
    GoodList,
    DeliveryType,
    CouponSelector,
    ProtocolPreview
  },
  props: {
    list: Array,
    cartInfo: Object,
    isAgreePresaleProtocol: Boolean,
    remarkMap: Object,
    deliverySettingList: Array, // 商户的配送设置列表
    yearCardSelectedType: Number, // 年/次卡商品选中的服务类型
    serviceType: [String, Number], // 预约商品服务类型
  },
  data() {
    return {
      presaleProtocol: {
        show: false,
        title: '预售协议',
        protocol: ""
      }
    };
  },
  computed: {
    ...configMap(['hide_mer_status']),
    orderAllowCoupon() {
      const orderType = this.cartInfo.order_type;
      return ![GOODS_ACTIVITY_TYPE.ASSIST, GOODS_ACTIVITY_TYPE.COMBINATION].includes(orderType);
    },
    // 是否是预约订单
    isBookingOrder() {
      return this.cartInfo.order_model === GOODS_TYPE.BOOKING;
    },
    // 是否显示配送方式组件（年/次卡到店 或 预约商品到店 也显示）
    showDeliveryType() {
      if (!this.isBookingOrder) return true;
      // 预约商品到店时显示
      return this.serviceType == 1;
    },
  },
  methods: {
    // 检查是否要显示包邮差额
    checkIsDisplayDiffAmount(item, index) {
      const deliverySetting = this.deliverySettingList[index];
      const condition = item.order.isCityTake && deliverySetting && item.order.delivery_status;
      if (condition) {
        const diffAmount = deliverySetting.free_shipping_amount - item.order.total_price;
        return diffAmount > 0;
      }

      return false;
    },
    // 输入备注信息
    handleInputRemark(event, merId) {
      this.$emit("update:remarkMap", {
        ...this.remarkMap,
        [merId]: event.detail.value
      });
    },
    // 打开预售协议弹窗
    async handleOpenPresaleAgreement() {
      uni.showLoading({ mask: true });
      try {
        const res = await presellAgreement();
        this.presaleProtocol.protocol = res.data.sys_product_presell_agree;
        this.presaleProtocol.show = true;
        uni.hideLoading();
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: 'none'
        });
      }
    },
    // 同意预售协议
    handleChangeIsAgree() {
      this.$emit("update:isAgreePresaleProtocol", !this.isAgreePresaleProtocol);
    },
    // 检查是否是预售订单
    isPresaleOrder(item) {
      const orderType = this.cartInfo.order_type;
      return orderType === GOODS_ACTIVITY_TYPE.PRE_SALE && item.list[0].productPresell.presell_type == 2;
    },
    // 选择优惠券
    handleSelectCoupon(payload) {
      this.$emit("select-coupon", payload);
    },
    // 进店
    goStore(id) {
      if (this.hide_mer_status != 1) {
        uni.navigateTo({
          url: `/pages/store/home/index?id=${id}`
        })
      }
    },
    // 更新配送方式数据
    handleChangeDeliveryType(args) {
      this.$emit("change-delivery", args);
    }
  }
}
</script>

<style scoped lang="scss">
.store-item {
  margin-top: 12rpx;

  .store-title {
    display: flex;
    align-items: center;
    padding: 28rpx 30rpx;

    .icon-ic_mall {
      font-size: 32rpx;
    }

    .icon-ic_rightarrow {
      font-size: 26rpx;
    }

    .txt {
      margin: 0 8rpx;
    }
  }

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
        margin-top: 16rpx;
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
}

.total {
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx 30rpx 30rpx;
  font-size: 26rpx;
  align-items: center;

  .shipping-amount {
    color: var(--view-priceColor);
    font-size: 13px;
  }

  .price {
    margin-left: 10rpx;
    color: var(--view-priceColor);
    font-size: 28rpx;
    font-weight: bold;

    text {
      font-size: 20rpx;
    }
  }
}
.placeholder {
	font-size: 30rpx;
}
</style>
