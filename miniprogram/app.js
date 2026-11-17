const request = require('./utils/request');

App({
  globalData: {
    enterOptions: null,
    scene: 0,
  },

  onLaunch() {
    // 记录进入场景（1038 = 小程序打开小程序，用于支付结果兜底判定）
    try {
      const opts = wx.getEnterOptionsSync();
      this.globalData.enterOptions = opts;
      this.globalData.scene = opts.scene;
    } catch (e) {
      console.warn('getEnterOptionsSync 不可用', e);
    }
    // 会话预热：订单列表/详情需要登录态；支付页不依赖登录（文档 §5.2）
    request.login().catch((e) => console.warn('静默登录失败，将在 401 时重试', e && e.code));
  },

  onShow(options) {
    this.globalData.enterOptions = options;
  },
});
