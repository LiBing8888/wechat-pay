const request = require('../../../utils/request');

Page({
  data: {
    orderNo: '',
    order: null,
    tip: '',
    loading: true,
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo || '' });
    this.load();
  },

  onShow() {
    // 从 pay 页返回时刷新状态
    if (this.data.order) this.load();
  },

  load() {
    this.setData({ loading: true });
    return request
      .get('/api/mp/order/detail', { orderNo: this.data.orderNo })
      .then((order) => this.setData({ order, tip: '' }))
      .catch((e) => this.setData({ tip: e.message || '订单加载失败' }))
      .then(() => this.setData({ loading: false }));
  },

  onTapPay() {
    wx.navigateTo({ url: '/pages/pay/pay?orderNo=' + this.data.orderNo });
  },

  onTapCopy() {
    wx.setClipboardData({ data: this.data.orderNo });
  },
});
