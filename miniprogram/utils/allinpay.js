/** 半屏 openEmbeddedMiniProgram 的基础库版本要求，以微信官方文档为准（文档 §5.5、§11） */
const MP_MIN_SDK = '2.26.2';

function compareVersion(v1, v2) {
  const a = String(v1 || '0').split('.');
  const b = String(v2 || '0').split('.');
  const len = Math.max(a.length, b.length);
  while (a.length < len) a.push('0');
  while (b.length < len) b.push('0');
  for (let i = 0; i < len; i++) {
    const x = parseInt(a[i], 10) || 0;
    const y = parseInt(b[i], 10) || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/** extraData 所有参数值需为字符串（需求原文 / §6.1-②）；后端已保证，此处再兜底一次 */
function toStrData(params) {
  const out = {};
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    if (v !== null && v !== undefined) out[k] = String(v);
  });
  return out;
}

function baseSdkVersion() {
  const info = wx.getAppBaseInfo ? wx.getAppBaseInfo() : wx.getSystemInfoSync();
  return info.SDKVersion;
}

/**
 * 跳转通联收银台小程序。
 * halfScreenEnabled 由后端下发：未获批时保持 false，直接走 navigateToMiniProgram（需求原文）。
 * 收银台是第三方已发布小程序，envVersion 用 release。
 */
function jumpToCashier(pageData) {
  const extraData = toStrData(pageData.extraData);
  const appId = pageData.cashierAppId;
  const sdk = baseSdkVersion();

  return new Promise((resolve, reject) => {
    if (!appId) { reject(new Error('缺少 cashierAppId')); return; }
    const opts = { appId, extraData, envVersion: 'release' };
    const canHalfScreen = pageData.halfScreenEnabled && compareVersion(sdk, MP_MIN_SDK) >= 0;
    const api = canHalfScreen ? wx.openEmbeddedMiniProgram : wx.navigateToMiniProgram;
    if (!api) { reject(new Error('当前基础库不支持跳转小程序')); return; }
    api(Object.assign({}, opts, { success: resolve, fail: reject }));
  });
}

module.exports = { jumpToCashier, compareVersion, toStrData, MP_MIN_SDK };
