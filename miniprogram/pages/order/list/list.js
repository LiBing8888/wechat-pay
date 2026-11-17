const request = require('../../utils/request');

const TAG = {
  SUCCESS: { text: '已支付', cls: 'success' },
  PAYING: { text: '待支付', cls: 'paying' },
  CLOSED: { text: '已关闭', cls: 'closed' },
  FAILED: { text: '支付失败', cls: 'closed' },
};

Page({
  data: {
    list: [],
    tip: '',
    loading: true,
  },

  onLoad() {
    this.load();
  },

  onPullDownRefresh() {
    const done = () => wx.stopPullDownRefresh();
    this.load().then(done, done);
  },

  load() {
    this.setData({ loading: true });
    return request
      .get('/api/mp/order/list')
      .then((r) => {
        const list = (r.list || []).map((o) => ({
          ...o,
          tag: TAG[o.status] || { text: o.status, cls: '' },
        }));
        this.setData({ list, tip: '' });
      })
      .catch((e) => this.setData({ tip: e.message || '加载失败' }))
      .then(() => this.setData({ loading: false }));
  },

  onTapOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
    if (orderNo) wx.navigateTo({ url: '/pages/order/detail/detail?orderNo=' + orderNo });
  },
});
