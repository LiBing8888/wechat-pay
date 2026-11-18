import store from "@/store";
import { CIRCLE_MUTATIONS } from "@/store/modules/circle";
import { DIY_MUTATIONS } from "@/store/modules/diy";

/**
 * 选择商圈并设置当前选中的 DIY ID
 * @param {Object} circle - 商圈信息
 */
export function selectCircleWithDiyTemplates(circle) {
  store.commit(CIRCLE_MUTATIONS.SET_SELECTED_CIRCLE, circle);
  store.commit(DIY_MUTATIONS.SET_CURRENT_DIY_ID, circle.diy_temp_id);
}

/**
 * 清空当前选中的商圈和 DIY ID
 */
export function clearSelectedZoneWithDiyTemplates() {
  store.commit(CIRCLE_MUTATIONS.CLEAR_SELECTED_CIRCLE);
  store.commit(DIY_MUTATIONS.CLEAR_CURRENT_DIY_ID);
}

/**
 * 构建商圈映射
 * @param {Array} tree - 商圈树
 * @returns {Object} 商圈映射
 */
export function buildCircleMap(tree) {
  const map = {};
  const build = (circleList, level = 0) => {
    circleList.forEach(circle => {
      map[circle.circleId] = {
        ...circle,
        level
      };
      if (circle.children && circle.children.length > 0) {
        build(circle.children, level + 1);
      }
    });
  }
  build(tree);

  return map;
}

// 将 API 返回的商圈列表转换为组件需要的数据结构
export function normalizeCircleList(circleList, idKey = 'store_group_id') {
  return circleList.map(item => {
    const nextItem = {
      ...item,
      circleId: item[idKey],
    };

    if (item.children && item.children.length > 0) {
      nextItem.children = normalizeCircleList(nextItem.children, idKey);
    }

    return nextItem;
  });
}