const request = require('../../utils/request');
const { apiBase, CURRENT } = require('../../config/env');

Page({
  data: {
    env: '',
    apiBase: '',
    scene: '',
    refAppId: '',
    logged: false,
    tip: '',
  },

  onShow() {
    const app = getApp();
    const opts = (app && app.globalData && app.globalData.enterOptions) || {};
    this.setData({
      env: CURRENT,
      apiBase,
      scene: opts.scene === undefined ? '未知' : String(opts.scene),
      refAppId: (opts.referrerInfo && opts.referrerInfo.appId) || '—',
      logged: request.isLoggedIn(),
    });
  },

  onTapRelogin() {
    request.logout();
    request
      .login()
      .then(() => this.setData({ logged: true, tip: '已重新登录' }))
      .catch((e) => this.setData({ tip: '登录失败：' + (e.code || e.message) }));
  },

  onTapClear() {
    wx.clearStorageSync();
    this.setData({ logged: false, tip: '缓存已清空' });
  },

  onTapDemoPay() {
    wx.navigateTo({ url: '/pages/pay/pay?orderNo=B202611170001' });
  },
});
