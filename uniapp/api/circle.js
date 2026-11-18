import request from "@/utils/request.js";

/**
 * 获取代理入驻协议
 * @returns 
 */
export function getAgentApplicationProtocol() {
  return request.get("agreement/circle_entry_agree");
}

/**
 * 提交代理入驻申请
 * @param {Object} data 
 * @returns 
 */
export function submitAgentApplication(data) {
  return request.post("circleAgent/create", data);
}

/**
 * 获取商圈代理入驻申请记录
 * @returns 
 */
export function getAgentApplicationRecords(query) {
  return request.get("circleAgent/list", query);
}

/**
 * 撤销代理入驻申请
 * @param {number} id 申请记录ID
 * @returns 
 */
export function cancelAgentApplication(id) {
  return request.post(`circleAgent/revoke/${id}`);
}

/**
 * 重新提交代理入驻申请
 * @param {number} id 申请记录ID
 * @param {Object} data 
 * @returns 
 */
export function updateAgentApplication(id, data) {
  return request.post(`circleAgent/update/${id}`, data);
}

/**
 * 获取代理入驻申请信息
 * @param {number} id 申请记录ID
 * @returns 
 */
export function getAgentApplicationInfo(id) {
  return request.get(`circleAgent/detail/${id}`);
}

/**
 * 获取组织树形结构
 * @returns 
 */
export function getCircleTree(query) {
  return request.get("intention/circles", query, { noAuth: true });
}

/**
 * 获取店铺分组树形结构
 * @param {Object} query 
 * @returns 
 */
export function getStoreGroupTree(query) {
  return request.get("store/group/options", query, { noAuth: true });
}

/**
 * 获取推荐店铺分组列表
 * @param {Object} data 
 * @returns 
 */
export function getRecommendCircles(data) {
  return request.get("store/group/recommend", data, { noAuth: true });
}