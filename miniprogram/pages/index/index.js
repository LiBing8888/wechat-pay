const request = require('../../utils/request');

Page({
  data: {
    tip: '',
    orders: [],
    loading: true,
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    this.setData({ loading: true });
    try {
      const r = await request.get('/api/mp/order/list');
      this.setData({ orders: r.list || [], tip: '' });
    } catch (e) {
      this.setData({ orders: [], tip: e.message || '订单加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapOrder(e) {
    const { orderNo, status } = e.currentTarget.dataset;
    if (!orderNo) return;
    if (status === 'PAYING') {
      wx.navigateTo({ url: '/pages/pay/pay?orderNo=' + orderNo });
    } else {
      wx.navigateTo({ url: '/pages/order/detail/detail?orderNo=' + orderNo });
    }
  },

  onTapAll() {
    wx.switchTab({ url: '/pages/order/list/list' });
  },
});
