// 获取商品营销类型
export const getProductPromotionType = product => {
  const productType = product.product_type;
  if (productType === 1) {
    return "秒杀";
  } else if (productType === 2) {
    return "预售";
  } else if (productType === 3) {
    return "助力";
  } else if (productType === 4) {
    return "拼团";
  }

  return null;
}