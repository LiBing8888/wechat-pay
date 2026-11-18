// 商圈模块
import { getStoreGroupTree, getRecommendCircles } from "@/api/circle";
import { DIY_MUTATIONS } from "./diy";
import { IS_IN_IFRAME } from "@/config/env";
import { buildCircleMap, normalizeCircleList } from "@/utils/circle";

export const CIRCLE_MUTATIONS = {
  SAVE_CIRCLE_TREE: "SAVE_CIRCLE_TREE",
  SAVE_RECOMMEND_CIRCLES: "SAVE_RECOMMEND_CIRCLES",
  BUILD_CIRCLE_MAP: "BUILD_CIRCLE_MAP",
  GET_CIRCLE_BY_ID: "GET_CIRCLE_BY_ID",
  SET_SELECTED_CIRCLE: "SET_SELECTED_CIRCLE",
  CLEAR_SELECTED_CIRCLE: "CLEAR_SELECTED_CIRCLE",
}

const SAVE_KEY = {
  CIRCLE_INFO: "_CIRCLE_INFO_"
}

export default {
  state() {
    let selectedCircleInfo = uni.getStorageSync(SAVE_KEY.CIRCLE_INFO);

    // 如果是在 iframe 中，则不使用缓存
    if (IS_IN_IFRAME || !selectedCircleInfo || !selectedCircleInfo.circleId || !selectedCircleInfo.name) {
      selectedCircleInfo = null;
    }

    return {
      selectedCircleInfo, // 当前选中的商圈信息
      circleTree: [], // 商圈树
      circleMap: {}, // 商圈映射
      recommendCircles: [], // 推荐商圈列表
    };
  },
  mutations: {
    // 保存推荐商圈列表
    [CIRCLE_MUTATIONS.SAVE_RECOMMEND_CIRCLES](state, circles) {
      state.recommendCircles = normalizeCircleList(circles);
    },
    // 保存商圈树
    [CIRCLE_MUTATIONS.SAVE_CIRCLE_TREE](state, tree) {
      state.circleTree = tree;
    },
    // 构建商圈映射
    [CIRCLE_MUTATIONS.BUILD_CIRCLE_MAP](state, tree) {
      state.circleMap = buildCircleMap(tree);
    },
    // 根据id获取商圈
    [CIRCLE_MUTATIONS.GET_CIRCLE_BY_ID](state, id) {
      return state.circleMap[id];
    },
    // 设置当前选中的商圈
    [CIRCLE_MUTATIONS.SET_SELECTED_CIRCLE](state, circleInfo) {
      state.selectedCircleInfo = circleInfo;
      uni.setStorageSync(SAVE_KEY.CIRCLE_INFO, state.selectedCircleInfo);
    },
    // 清空当前选中的商圈
    [CIRCLE_MUTATIONS.CLEAR_SELECTED_CIRCLE](state) {
      state.selectedCircleInfo = null;
      uni.removeStorageSync(SAVE_KEY.CIRCLE_INFO);
    },
  },
  actions: {
    // 刷新商圈树
    async refreshCircleTree({ commit, state }) {
      try {
        const res = await getStoreGroupTree();
        const normalizedTree = normalizeCircleList(res.data);
        commit(CIRCLE_MUTATIONS.SAVE_CIRCLE_TREE, normalizedTree);
        commit(CIRCLE_MUTATIONS.BUILD_CIRCLE_MAP, normalizedTree);

        // 如果当前选中的商圈不存在，则清空当前选中的商圈
        if (state.selectedCircleInfo && !state.circleMap[state.selectedCircleInfo.circleId]) {
          commit(CIRCLE_MUTATIONS.CLEAR_SELECTED_CIRCLE);
          commit(DIY_MUTATIONS.CLEAR_CURRENT_DIY_ID)
        }
      } catch (error) {
        throw error;
      }
    },
    // 获取推荐商圈列表
    async getRecommendCircles({ commit }, location) {
      try {
        const res = await getRecommendCircles(location);
				// const res = await getRecommendCircles({latitude: '34.31', longitude: '108.78'});
        commit(CIRCLE_MUTATIONS.SAVE_RECOMMEND_CIRCLES, res.data);
      } catch (error) {
        throw error;
      }
    }
  },
  getters: {
    circleId: state => state.selectedCircleInfo?.circleId,
  }
}