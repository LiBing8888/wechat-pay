const { apiBase } = require('../config/env');

const TOKEN_KEY = 'token';

let pending = null;

/** §5.2 静默登录：wx.login → 后端 /api/auth/mp/login → 业务 token */
function relogin() {
  if (pending) return pending;                    // 并发 401 只重登一次
  pending = new Promise((resolve, reject) => {
    wx.login({
      success: ({ code }) => {
        if (!code) { reject(new Error('NO_LOGIN_CODE')); return; }
        wx.request({
          url: apiBase + '/api/auth/mp/login',
          method: 'POST',
          data: { code },
          success: (res) => {
            const body = res.data || {};
            const d = body.data;
            if (body.code === 'SUCCESS' && d && d.token) {
              wx.setStorageSync(TOKEN_KEY, d.token);
              resolve(d.token);
            } else {
              reject(Object.assign(new Error(body.message || 'LOGIN_FAIL'), { code: body.code || 'LOGIN_FAIL' }));
            }
          },
          fail: () => reject(Object.assign(new Error('NETWORK'), { code: 'NETWORK_ERROR' })),
        });
      },
      fail: () => reject(Object.assign(new Error('LOGIN_FAIL'), { code: 'WX_LOGIN_FAIL' })),
    });
  }).then(
    (v) => { pending = null; return v; },
    (e) => { pending = null; throw e; }
  );
  return pending;
}

function request(path, { method = 'GET', data, retry = true, silent = false } = {}) {
  const token = wx.getStorageSync(TOKEN_KEY);
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiBase + path,
      method,
      data,
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success: (res) => {
        if (res.statusCode === 401) {
          if (retry && !silent) {
            relogin().then(
              () => request(path, { method, data, retry: false, silent }).then(resolve, reject),
              () => reject(Object.assign(new Error('会话失效'), { code: 'UNAUTHORIZED' }))
            );
          } else {
            reject(Object.assign(new Error('会话失效'), { code: 'UNAUTHORIZED' }));
          }
          return;
        }
        const body = res.data || {};
        if (body.code !== 'SUCCESS') {
          reject(Object.assign(new Error(body.message || 'ERROR'), { code: body.code || 'CHANNEL_ERROR' }));
          return;
        }
        resolve(body.data);
      },
      fail: (err) => reject(Object.assign(new Error('NETWORK'), { code: 'NETWORK_ERROR', raw: err })),
    });
  });
}

module.exports = {
  get: (p, d, o) => request(p, Object.assign({ data: d }, o)),
  post: (p, d, o) => request(p, Object.assign({ method: 'POST', data: d }, o)),
  request,
  login: relogin,
  isLoggedIn: () => !!wx.getStorageSync(TOKEN_KEY),
  logout: () => wx.removeStorageSync(TOKEN_KEY),
};
