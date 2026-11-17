const request = require('../../utils/request');
const { jumpToCashier } = require('../../utils/allinpay');

const STATUS_TEXT = {
  INIT: '准备中',
  READY: '待支付',
  JUMPING: '跳转支付中',
  SUCCESS: '支付成功',
  FAIL: '支付失败',
  CANCEL: '已取消',
  CLOSED: '订单已关闭',
  PAYING: '支付确认中',
};

/** 回流后最多再查 40 次（约 2 分钟），之后提示稍后在订单列表查看 */
const MAX_POLL = 40;

Page({
  data: {
    orderNo: '',
    status: 'INIT',
    statusText: STATUS_TEXT.INIT,
    body: '',
    amountText: '',
    errmsg: '',
    tip: '',
    fromH5: false,
    loading: true,
    extraData: null,
    cashierAppId: '',
    halfScreenEnabled: false,
    expireAt: 0,
  },

  onLoad(options) {
    // Scheme 进入时 options = { orderNo: 'B202611170001', source: 'h5' }
    this.setData({
      orderNo: options.orderNo || '',
      fromH5: options.source === 'h5',
    });
    this.pollCount = 0;
    this.jumped = false;
    this.prepare();
  },

  onShow() {
    this.handleReturn();
  },

  onUnload() {
    if (this.pollTimer) clearTimeout(this.pollTimer);
  },

  async prepare() {
    if (!this.data.orderNo) {
      this.setData({ loading: false, tip: '缺少订单号，请从浏览器重新进入' });
      return;
    }
    this.setData({ loading: true });
    try {
      const p = await request.post('/api/pay/cashier/params', { orderNo: this.data.orderNo });
      // p = { extraData, cashierAppId, halfScreenEnabled, expireAt }
      const amountFen = Number(p.extraData.trxamt || 0);
      this.setData({
        loading: false,
        status: 'READY',
        statusText: STATUS_TEXT.READY,
        tip: '',
        extraData: p.extraData,
        body: p.extraData.body || '',
        amountText: (amountFen / 100).toFixed(2),
        cashierAppId: p.cashierAppId,          // 收银台 appId 由后端下发，前端在运行时取值
        halfScreenEnabled: p.halfScreenEnabled,
        expireAt: p.expireAt,
      });
      if (this.data.fromH5) {
        wx.showToast({ title: '支付完成后请返回浏览器查看结果', icon: 'none', duration: 3000 });
      }
    } catch (e) {
      this.setData({ loading: false });
      if (e.code === 'PAY_ORDER_EXPIRED') {
        this.setStatus('CLOSED', '支付超时，请回到浏览器重新下单');
      } else if (e.code === 'PAY_ORDER_NOT_PAYABLE') {
        // 可能已支付：查一次真实状态再展示
        this.queryResult('NO_CALLBACK');
      } else {
        this.setData({ errmsg: e.message || '支付参数获取失败', statusText: '暂不能支付' });
      }
    }
  },

  onTapPay() {
    this.jump();
  },

  jump() {
    this.setData({ status: 'JUMPING', statusText: STATUS_TEXT.JUMPING });
    this.jumped = true;   // 只有本页面主动跳出去过，回流时的 enterOptions 才代表收银台返回
    jumpToCashier(this.data).catch(() => {
      // 跳转确认弹窗点“取消”，或未申请半屏却调 openEmbeddedMiniProgram
      this.jumped = false;
      wx.showToast({ title: '支付已取消', icon: 'none' });
      this.setData({ status: 'READY', statusText: STATUS_TEXT.READY });
      this.queryResult('JUMP_FAIL');
    });
  },

  /** §5.6 收银台返回：scene 1038 + 来源 appId 匹配 */
  handleReturn() {
    if (!this.jumped || !this.data.cashierAppId) return;
    let options;
    try { options = wx.getEnterOptionsSync(); } catch (e) { return; }
    // getEnterOptionsSync().scene 为数字，统一转字符串比较（文档示例写的是 '1038'）
    if (String(options.scene) !== '1038') return;
    const ref = options.referrerInfo || {};
    if (ref.appId !== this.data.cashierAppId) return;

    this.jumped = false;      // 一次跳转只判定一次，避免切后台再回来重复查询
    const extraData = ref.extraData;
    if (!extraData || !Object.keys(extraData).length) {
      // 物理返回键 / 半屏右上角关闭：需求原文说明此时 extraData 为空，需自行查询订单状态
      this.queryResult('NO_CALLBACK');
      return;
    }
    if (extraData.code === 'success') this.queryResult('FRONT_SUCCESS');
    else if (extraData.code === 'cancel') this.setStatus('CANCEL', '已取消支付，可重新发起');
    else this.setStatus('FAIL', extraData.errmsg || '支付失败');
  },

  async queryResult(source) {
    try {
      const r = await request.post('/api/pay/query', { orderNo: this.data.orderNo, source });
      const fen = Number(r.amountFen || 0);
      if (fen) this.setData({ amountText: (fen / 100).toFixed(2) });
      if (r.status === 'SUCCESS') { this.setStatus('SUCCESS', '', r.payTime); return; }
      if (r.status === 'FAILED') { this.setStatus('FAIL', r.errmsg || '支付失败'); return; }
      if (r.status === 'CLOSED') { this.setStatus('CLOSED', '订单已关闭'); return; }

      this.pollCount = (this.pollCount || 0) + 1;
      if (this.pollCount >= MAX_POLL) {
        this.setStatus('PAYING', '仍未收到支付结果，请稍后在订单列表查看');
        return;
      }
      this.setData({ status: 'PAYING', statusText: STATUS_TEXT.PAYING, errmsg: '' });
      if (this.pollTimer) clearTimeout(this.pollTimer);
      this.pollTimer = setTimeout(() => this.queryResult('POLL'), 3000);
    } catch (e) {
      this.setData({ errmsg: e.message || '支付结果查询失败' });
    }
  },

  setStatus(status, errmsg, payTime) {
    this.setData({
      status,
      statusText: STATUS_TEXT[status] || status,
      errmsg: errmsg || '',
      payTime: payTime || this.data.payTime || '',
    });
  },

  onTapRetry() {
    this.pollCount = 0;
    this.setData({ status: 'INIT', statusText: STATUS_TEXT.INIT, errmsg: '', tip: '' });
    this.prepare();
  },

  onTapOrders() {
    wx.switchTab({ url: '/pages/order/list/list' });
  },

  onTapHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
