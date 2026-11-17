import { get, post } from './http';

export type PayStatus = 'PAYING' | 'SUCCESS' | 'FAILED' | 'CLOSED';

export interface SchemeResult {
  openlink: string;
  /** unix 秒，前端仅展示用 */
  expireAt: number;
}

export interface QueryResult {
  status: PayStatus;
  amountFen?: number;
  payTime?: string;
  errmsg?: string;
}

export interface OrderDetail {
  orderNo: string;
  body: string;
  amountFen: number;
  amountText: string;
  status: PayStatus;
  reqsn: string;
}

/** §6.1-① 获取 Scheme 码（后端幂等：同一订单返回同一条） */
export const fetchScheme = (orderNo: string) =>
  post<SchemeResult>('/api/pay/h5/scheme', { orderNo });

/** §6.1-③ 支付结果查询，终态以此接口为准 */
export const queryPayResult = (orderNo: string, source = 'POLL') =>
  post<QueryResult>('/api/pay/query', { orderNo, source });

/** 订单信息（真实项目里属于商城自身接口） */
export const fetchOrderDetail = (orderNo: string) =>
  get<OrderDetail>('/api/order/detail', { orderNo });

/** §6.4 错误码 → 前端行为文案 */
export const PAY_ERROR_TIPS: Record<string, string> = {
  ORDER_NOT_FOUND: '订单不存在，请联系客服',
  PAY_ORDER_NOT_PAYABLE: '该订单已支付或已关闭，请到订单列表确认',
  PAY_ORDER_EXPIRED: '支付超时，请重新下单',
  SCHEME_GENERATE_FAILED: '拉起支付失败，请稍后重试',
  SCHEME_NO_PERMISSION: '支付通道未就绪，请稍后重试或联系客服',
  SCHEME_MINI_NOT_RELEASED: '小程序尚未发布，暂不能支付，请稍后重试',
  RATE_LIMITED: '操作过于频繁，请稍候再试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  ALLINPAY_SIGN_VERIFY_FAIL: '支付结果校验失败，请稍后重试',
  CHANNEL_ERROR: '支付通道异常，请稍后重试',
  NETWORK_ERROR: '网络异常，请检查网络后重试',
};

export const tipForCode = (code?: string): string =>
  (code && PAY_ERROR_TIPS[code]) || '支付发起失败，请稍后重试';
