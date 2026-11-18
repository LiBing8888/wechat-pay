import request from "@/utils/request.js";

/**
 * 获取商户入驻协议
 * @returns 
 */
export function getMerchantApplicationProtocol() {
  return request.get("agreement/business_entry_agree");
}
