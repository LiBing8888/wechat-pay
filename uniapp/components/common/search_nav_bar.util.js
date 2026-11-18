import { getSystemInfo } from "@/utils/device";

// 获取搜索导航栏真实高度
export const getSearchNavBarHeight = () => {
  const systemInfo = getSystemInfo();
  const {
    statusBarHeight,
  } = systemInfo;

  const contentHeight = uni.upx2px(58); // 搜索导航栏内容高度
  const paddingBottom = uni.upx2px(10); // 搜索导航栏内边距底部
  const paddingTop = statusBarHeight + paddingBottom;
  const height = paddingTop + contentHeight + paddingBottom;
  return height;
}