// 订单状态
export const ORDER_STATUS = {
  REFUND: -1, // 已退款
  PENDING: 1, // 待服务/待收货
  WAIT_COMMENT: 2, // 待评价
  COMPLETED: 3, // 已完成
}

// 退款单状态
export const ORDER_REFUND_STATUS = {
  CANCELLED: -2, // 已取消
  REJECTED: -1, // 已拒绝
  PENDING: 0, // 待审核
  WAIT_RETURN: 1, // 待退货
  WAIT_RECEIVE: 2, // 待收货
  REFUNDED: 3, // 已退款
  PLATFORM_INTERVENTION: 4, // 平台介入中
}

// 退款单状态文本
export const ORDER_REFUND_TEXT = {
  [ORDER_REFUND_STATUS.CANCELLED]: '已取消',
  [ORDER_REFUND_STATUS.REJECTED]: '已拒绝',
  [ORDER_REFUND_STATUS.PENDING]: '待审核',
  [ORDER_REFUND_STATUS.WAIT_RETURN]: '待退货',
  [ORDER_REFUND_STATUS.WAIT_RECEIVE]: '待收货',
  [ORDER_REFUND_STATUS.REFUNDED]: '已退款',
  [ORDER_REFUND_STATUS.PLATFORM_INTERVENTION]: '平台介入中',
}