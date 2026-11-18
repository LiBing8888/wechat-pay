import { getDeliverySettingsDataApi } from '@/api/order';
import { GOODS_TYPE } from '@/constants/goods';

// 获取商户的配送设置数据
export default {
  data() {
    return {
      deliverySettingList: [], // 商户的配送设置列表
    };
  },
  computed: {
    // 是否是预约订单
    isBookingOrder() {
      return this.cartInfo?.order_model === GOODS_TYPE.BOOKING;
    },
    // 商户的配送设置 Map
    deliverySettingMap() {
      return this.deliverySettingList.reduce((acc, item) => {
        acc[item.mer_id] = item;
        return acc;
      }, {});
    },
  },
  watch: {
    cartInfo() {
      if (this.cartInfo && !this.isBookingOrder && !this.deliverySettingList.length) {
        this.getDeliverySettingsData();
      }
    }
  },
  methods: {
    // 获取所有商户的配送设置数据
    async getDeliverySettingsData() {
      try {
        const tasks = this.cartInfo.order.map(item => getDeliverySettingsDataApi({ mer_id: item.mer_id }));
        const result = await Promise.all(tasks);
        this.deliverySettingList = result.map(item => item.data.deliverySettings).filter(item => item.free_shipping_amount !== undefined);
      } catch (error) {
        this.$util.Tips({
          title: error,
          icon: 'none'
        });
      }
    },
  }
}