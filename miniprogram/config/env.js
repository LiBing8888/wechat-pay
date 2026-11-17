/**
 * 环境划分（文档 §5.1.2）
 * CURRENT 由构建脚本按目标环境改写；发布前请人工核对一次。
 *
 * 注意：dev/test 域名需在 MP 后台「开发管理 → 服务器域名」登记；
 * 开发者工具联调本机 Mock 时，需在「详情 → 本地设置」勾选“不校验合法域名”
 * （project.config.json 已设 urlCheck=false），真机联调要用局域网 IP 或内网穿透。
 */
const ENVS = {
  dev: { apiBase: 'http://127.0.0.1:8787' },
  test: { apiBase: 'https://pay-test.example.com' },
  prod: { apiBase: 'https://pay.example.com' },
};

const CURRENT = 'dev';

module.exports = Object.assign({ CURRENT: CURRENT }, ENVS[CURRENT]);
