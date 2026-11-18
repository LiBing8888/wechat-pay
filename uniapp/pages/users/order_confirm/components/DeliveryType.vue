<template>
  <view>
    <view class='field-item acea-row row-between-wrapper' v-if="!isStorePickupMode">
      <view class="delivery-type flex-y-center">
        配送方式
        <view v-if="!isYearCard && storeCart.order.isCityTake && !storeCart.order.delivery_status" class="delivery-type-err ml-20">
          <text class="iconfont icon-icon_tip"></text>
          <text class="txt">不在配送范围内</text>
        </view>
      </view>
      <template v-if="deliveryTypeList.length">

        <!-- 配送方式选择器 -->
        <DeliveryTypeRadio :config="deliveryTypeList" @change="handleDeliveryTypeChange"
          v-if="deliveryTypeList.length > 1" />

        <!-- 配送方式列表只有一条时，直接显示配送方式名称 -->
        <!-- 配送方式名称 -->
        <view class='discount' v-else>
          {{ deliveryTypeName }}
        </view>
      </template>
    </view>
    <!-- 自提点选择（年/次卡到店 或 预约商品到店） -->
    <StationSelector v-if="isStorePickupMode && selfPickupStationList" :config="selfPickupStationList" :stationId="currentStation && currentStation.station_id"
      @change="handleStationChange" />

    <!-- 配送点选择 -->
    <StationSelector v-if="stationList && !isYearCard && !isStorePickupMode" :config="stationList" :stationId="currentStation && currentStation.station_id"
      @change="handleStationChange" />

    <!-- 配送时间 -->
    <view class="field-item acea-row row-between-wrapper" v-if="isLocalDelivery && deliverySettings && !isYearCard">
      <view style="width: 100px;">配送时间</view>
      <view class="discount">
        <view @tap="handleOpenTimePopup" v-if="deliverySettings.delivery_time_type == 1">
          {{ localDeliveryTime || '' }}
          <text class='iconfont icon-ic_rightarrow'>
          </text>
        </view>
        <view v-else>
          {{ deliverySettings.delivery_prompt || '' }}
        </view>
      </view>
    </view>

    <!-- 快递费用 -->
    <view class='field-item acea-row row-between-wrapper' v-if="isNormalDelivery && !isYearCard">
      <view>
        快递费用
        <text v-if="isFinalPaymentStage">（尾款阶段）</text>
      </view>
      <view class='discount regular' v-if='storeCart.order.postage_price > 0'>
        ¥{{ storeCart.order.postage_price }}
      </view>
      <view class='discount' v-else>免运费</view>
    </view>


    <!-- 同城配送费用 -->
    <view class='field-item acea-row row-between-wrapper' v-if="isLocalDelivery && !isYearCard">
      <view>配送费用</view>
      <view class='discount regular' v-if='storeCart.order.city_take_postage > 0'>
        ¥{{ storeCart.order.city_take_postage }}
      </view>
      <view class='discount' v-else-if="!storeCart.order.delivery_status">不在配送范围内</view>
      <view class='discount' v-else>免配送费</view>
    </view>

    <!-- 配送时间弹窗 -->
    <DeliveryTimePopup ref="timePopup" v-if="timePopupVisible" :setting="deliverySettings" :station="currentStation"
      @confirm="handleConfirmTime" />
  </view>
</template>

<script>
import StationSelector from "./StationSelector.vue";
import DeliveryTimePopup from "./DeliveryTimePopup.vue";
import DeliveryTypeRadio from "./DeliveryTypeRadio.vue";
import { getDeliveryStationListApi } from '@/api/order.js';
import { DELIVERY_TYPE } from '@/constants/delivery';
import { GOODS_ACTIVITY_TYPE, GOODS_TYPE } from '@/constants/goods';
import { mapGetters } from "vuex";

export default {
  name: 'DeliveryType',
  props: {
    cartInfo: Object,
    storeCart: Object,
    deliverySettings: Object, // 配送相关设置
    yearCardSelectedType: Number, // 年/次卡商品选中的服务类型
    serviceType: [String, Number], // 预约商品服务类型
  },
  components: {
    StationSelector,
    DeliveryTimePopup,
    DeliveryTypeRadio
  },
  data() {
    return {
      selfPickupStationList: null, // 自提点列表
      localDeliveryStationList: null, // 同城配送站点列表
      deliveryType: DELIVERY_TYPE.DELIVERY, // 选中的配送方式
      currentStation: null, // 选中的站点
      deliveryTime: null, // 同城配送时间
    };
  },
  computed: {
    ...mapGetters(['location']),
    // 是否是虚拟发货
    isVirtualDelivery() {
      return this.cartInfo.order_model !== GOODS_ACTIVITY_TYPE.NORMAL && !this.isYearCard;
    },
    // 是否是年/次卡商品
    isYearCard() {
      return this.cartInfo.order_model === 5;
    },
    // 是否是预约商品
    isBookingOrder() {
      return this.cartInfo.order_model === GOODS_TYPE.BOOKING;
    },
    // 是否是到店自提模式（年/次卡到店 或 预约商品到店）
    isStorePickupMode() {
      if (this.isYearCard && this.yearCardSelectedType === 1) return true;
      if (this.isBookingOrder && this.serviceType == 1) return true;
      return false;
    },
    // 年/次卡商品核销方式名称
    yearCardDeliveryTypeName() {
      if (this.cartInfo.service_type === 1) return '到店核销';
      if (this.cartInfo.service_type === 2) return '上门核销';
      // service_type === 3 时根据用户选择动态显示
      if (this.yearCardSelectedType === 1) return '到店核销';
      if (this.yearCardSelectedType === 2) return '上门核销';
      return '到店核销/上门核销';
    },
    // 同城配送时间
    localDeliveryTime() {
      if (!this.deliveryTime) return null;
      return `${this.deliveryTime.label} ${this.deliveryTime.time}`;
    },
    timePopupVisible() {
      // 同城配送 & 支持预约时间 & 选中了站点
      return this.isLocalDelivery && this.deliverySettings?.delivery_time_type === 1 && this.deliverySettings?.selectable_days > 0 && this.currentStation;
    },
    // 是否支持同城配送自定义配送时间
    isCustomDeliveryTime() {
      return this.deliverySettings?.delivery_time_type === 1;
    },
    // 尾款阶段
    isFinalPaymentStage() {
      return this.storeCart.list[0].productPresell && this.storeCart.list[0].productPresell.presell_type == 2;
    },
    // 快递配送
    isNormalDelivery() {
      return !this.isVirtualDelivery && !this.isYearCard && this.deliveryType === DELIVERY_TYPE.DELIVERY;
    },
    // 同城配送
    isLocalDelivery() {
      return !this.isYearCard && this.deliveryType === DELIVERY_TYPE.LOCAL_DELIVERY;
    },
    // 站点列表
    stationList() {
      if (this.deliveryType === DELIVERY_TYPE.SELF_PICKUP) {
        return this.selfPickupStationList;
      } else if (this.deliveryType === DELIVERY_TYPE.LOCAL_DELIVERY) {
        return this.localDeliveryStationList;
      }
      return null;
    },
    // 配送方式列表
    deliveryTypeList() {
      // 年/次卡商品直接返回核销方式
      if (this.isYearCard) {
        return [{
          title: this.yearCardDeliveryTypeName,
          type: 'year_card',
          check: true
        }];
      }

      const config = this.storeCart.order;
      const orderModel = this.cartInfo.order_model;

      const localDeliveryMinLimit = Number(this.deliverySettings?.min_delivery_amount) || 0;
      let localDeliveryErrTip;
      if (config.total_price < localDeliveryMinLimit) {
        localDeliveryErrTip = `未达到起送价，起送价：￥${localDeliveryMinLimit}`;
      }

      const list = [
        {
          title: this.isVirtualDelivery ? "虚拟发货" : "快递配送",
          type: DELIVERY_TYPE.DELIVERY,
          check: this.deliveryType === DELIVERY_TYPE.DELIVERY,
          validate: config.allow_delivery
        },
        {
          title: "到店自提",
          type: DELIVERY_TYPE.SELF_PICKUP,
          check: this.deliveryType === DELIVERY_TYPE.SELF_PICKUP,
          validate: config.allow_take
        },
        {
          title: "闪送",
          type: DELIVERY_TYPE.LOCAL_DELIVERY,
          check: this.deliveryType === DELIVERY_TYPE.LOCAL_DELIVERY,
          errTips: localDeliveryErrTip,
          validate: config.allow_city_take
        }
      ];

      if (orderModel != GOODS_ACTIVITY_TYPE.NORMAL) return list.slice(0, 1);

      return list
        .filter(item => item.validate)
        .map(item => ({
          title: item.title,
          type: item.type,
          check: item.check,
          errTips: item.errTips
        }));
    },
    // 当前配送方式名称
    deliveryTypeName() {
      if (this.isYearCard) return this.yearCardDeliveryTypeName;
      const deliveryTypeNameMap = this.deliveryTypeList
        .reduce((acc, item) => {
          acc[item.type] = item.title;
          return acc;
        }, {});
      return deliveryTypeNameMap[this.deliveryType];
    }
  },
  watch: {
    'cartInfo.address'(newAddress, oldAddress) {
      if (newAddress && newAddress.address_id !== oldAddress?.address_id) {
        this.handleInitDeliveryData();
      }
    },
    yearCardSelectedType(val) {
      if (val === 1) {
        if (this.selfPickupStationList) {
          // 自提点已加载，直接通知父组件更新 takes
          this.$emit('change', {
            merId: this.storeCart.mer_id,
            type: DELIVERY_TYPE.SELF_PICKUP,
            data: {
              take_id: this.currentStation?.station_id,
              distance: this.currentStation?.distance,
            }
          });
        } else {
          this.$store.dispatch('initLocation').then(() => {
            this.initStorePickupData();
          });
        }
      }
    }
  },
  created() {
    if (this.isStorePickupMode) {
      // 到店自提模式，直接加载自提点列表
      this.deliveryType = DELIVERY_TYPE.SELF_PICKUP;
      this.$store.dispatch('initLocation').then(() => {
        this.initStorePickupData();
      });
      return;
    }
    if (this.isYearCard) return;
    if (!this.isVirtualDelivery) {
      this.deliveryType = this.storeCart.order.default_delivery;
    }
    if (this.deliveryType !== DELIVERY_TYPE.DELIVERY) {
      this.handleInitDeliveryData();
    }
    this.$store.dispatch('initLocation');
  },
  methods: {
    // 配送方式改变
    async handleDeliveryTypeChange(activeIndex) {
      const deliveryTypeInfo = this.deliveryTypeList[activeIndex];
      // 如果选中的配送方式没有变化，则直接关闭弹窗
      if (deliveryTypeInfo.type === this.deliveryType) {
        return;
      };

      // 如果选中的配送方式有错误提示，则进行提示，且不切换配送方式
      if (deliveryTypeInfo.errTips) {
        this.$util.Tips({
          title: deliveryTypeInfo.errTips
        });
        return;
      };

      await this.handleInitDeliveryData(deliveryTypeInfo);
    },
    // 确认配送时间
    handleConfirmTime(data) {
      this.deliveryTime = data;

      const { date, week, time } = data;

      const payload = {
        merId: this.storeCart.mer_id, // 商户 ID
        type: this.deliveryType, // 配送方式
        data: {
          take_id: this.currentStation.station_id,
          distance: this.currentStation.distance,
          date,
          week,
          time
        }
      };

      this.$emit("change", payload);
    },
    // 配送时间弹窗
    handleOpenTimePopup() {
      this.$refs.timePopup.open();
    },
    // 站点切换
    handleStationChange(station) {
      if (this.currentStation?.station_id === station.station_id) return;
      this.currentStation = station;

      // 切换站点时的相关数据
      const payload = {
        take_id: station.station_id,
        distance: station.distance,
      };

      if (this.deliveryType === DELIVERY_TYPE.SELF_PICKUP) {
        // 自提配送方式
      } else if (this.deliveryType === DELIVERY_TYPE.LOCAL_DELIVERY) {
        // 同城配送方式
      }

      this.$emit("change", {
        merId: this.storeCart.mer_id, // 商户 ID
        type: this.deliveryType, // 配送方式
        data: payload
      });
    },
    // 初始化配送方式相关数据
    async handleInitDeliveryData(deliveryTypeInfo) {
      if (!deliveryTypeInfo) {
        deliveryTypeInfo = this.deliveryTypeList.find(item => item.type === this.deliveryType);
        if (!deliveryTypeInfo) return;
      }

      // 切换配送方式所需的相关数据
      const payload = {
        merId: this.storeCart.mer_id, // 商户 ID
        type: deliveryTypeInfo.type, // 配送方式
        data: {}
      };

      if (deliveryTypeInfo.type === DELIVERY_TYPE.SELF_PICKUP) {
        // 配送方式为自提方式

        // 重新加载自提点列表
        await this.getSelfPickupStation();
        if (!this.selfPickupStationList?.length) {
          this.$util.Tips({
            title: "店铺缺少自提点!"
          });
          return;
        }

        // 设置自提点列表中的第一个站点为默认自提点
        const defaultStation = this.selfPickupStationList[0];
        this.currentStation = defaultStation;
        payload.data.take_id = defaultStation.station_id;
        payload.data.distance = defaultStation.distance;
        this.$emit("change", payload);
      } else if (deliveryTypeInfo.type === DELIVERY_TYPE.LOCAL_DELIVERY) {
        // 如果地址不存在，则不进行初始化，待地址加载完成后会在 watch 中自动触发初始化
        if (!this.cartInfo.address) return;

        // 重新加载同城配送点列表
        await this.getLocalDeliveryStation();


        if (!this.localDeliveryStationList?.length) {
          this.$util.Tips({
            title: "店铺缺少配送点!"
          });
          return;
        }

        // 设置配送点列表中的第一个站点为默认配送点
        const defaultStation = this.localDeliveryStationList[0];
        this.currentStation = defaultStation;
        payload.data.take_id = defaultStation.station_id;
        payload.data.distance = defaultStation.distance;
        if (!this.isCustomDeliveryTime) {
          // 如果不能自定义配送时间，则需要携带配送时间提示，然后手动抛出 payload 更新订单状态
          payload.data.remarks = this.deliverySettings.delivery_prompt;
          this.$emit("change", payload);
        } else {
          // 如果能自定义配送时间，则配送时间弹窗内部会生成配送时间数据，然后通过 handleConfirmTime 方法抛出 payload 更新订单状态
        }
      } else {
        // 普通配送方式
        this.$emit("change", payload);
      }

      this.deliveryType = deliveryTypeInfo.type;

      return;
    },
    // 初始化到店自提数据
    async initStorePickupData() {
      await this.getSelfPickupStation();
      if (!this.selfPickupStationList?.length) {
        this.$util.Tips({ title: '店铺缺少自提点!' });
        return;
      }
      // 默认选中第一个自提点
      const defaultStation = this.selfPickupStationList[0];
      this.currentStation = defaultStation;
      this.$emit('change', {
        merId: this.storeCart.mer_id,
        type: DELIVERY_TYPE.SELF_PICKUP,
        data: {
          take_id: defaultStation.station_id,
          distance: defaultStation.distance,
        }
      });
    },
    // 获取同城配送点列表
    async getLocalDeliveryStation() {
      this.localDeliveryStationList = await this.getStationList(DELIVERY_TYPE.LOCAL_DELIVERY);
    },
    // 获取自提点列表
    async getSelfPickupStation() {
      this.selfPickupStationList = await this.getStationList(DELIVERY_TYPE.SELF_PICKUP);
    },
    // 获取站点列表
    async getStationList(deliveryType) {
      uni.showLoading({ mask: true });
      const payload = {
        mer_id: this.storeCart.mer_id
      };

      // 如果配送方式为同城配送时，需要传递切换城市参数
      if (deliveryType === DELIVERY_TYPE.LOCAL_DELIVERY) {
        payload.switch_city = 1;
      } else if (deliveryType === DELIVERY_TYPE.SELF_PICKUP) {
        payload.switch_take = 1;
        Object.assign(payload, this.location);
      }

      // 如果配送方式非自提时，需要传递地址ID
      if (deliveryType !== DELIVERY_TYPE.SELF_PICKUP) {
        payload.address_id = this.cartInfo.address?.address_id || 0;
      }

      try {
        const res = await getDeliveryStationListApi(payload);
        uni.hideLoading();
        return res.data;
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error
        });
        return null;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.delivery-type-err {
  color: $theme-color;
  font-size: 22rpx;
  font-weight: 400;

  .icon-icon_tip.iconfont {
    color: inherit;
    margin-right: 10rpx;
    font-size: 22rpx;
  }
}
</style>
