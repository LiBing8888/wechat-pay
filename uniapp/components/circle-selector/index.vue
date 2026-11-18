<template>
  <view class="circle-selector-container" :style="[cssVars]" :class="{ 'is-popup': isPopup }">
    <view id="slot-content">
      <slot />
    </view>
    <!-- 商圈选择器一级选择 - 横向滚动 -->
    <CircleSelectorHeader :list="circleList" :activeIndex.sync="levelFirstActiveIndex" @more="handleOpenMoreCircle"
      :moreBtn="hotCircle" :isPopup="isPopup">
      <view class="absolute sidebar-container">
        <CircleSelectorSidebar :list="flattenedCircleGroups" :activeIndex.sync="levelSecondActiveIndex" />
      </view>
    </CircleSelectorHeader>

    <!-- 商圈选择器列表 -->
    <view class="circle-flat-list-container" v-if="listIsVisible">
      <CircleSelectorList :list="flattenedCircleGroups" :activeIndex.sync="levelSecondActiveIndex" :isPopup="isPopup"
        :selectedCircleId="selectedCircleId" :slotHeight="slotHeight" @select="handleSelectCircle" />
    </view>

    <!-- 热门商圈弹窗 -->
    <CircleHotPopup v-if="hotCircle && circleHotPopupVisible" :selectedCircleId="selectedCircleId"
      @close="handleCloseMoreCircle" @select="handleSelectCircle" />
  </view>
</template>

<script>
import CircleSelectorHeader from "./circle-selector-header.vue";
import CircleSelectorList from "./circle-selector-list.vue";
import CircleSelectorSidebar from "./circle-selector-sidebar.vue";
import CircleHotPopup from "./circle-hot-popup.vue";
import { SELECTOR_HEADER_HEIGHT } from "./config";
import { buildCircleMap } from "@/utils/circle";

/**
 * 商圈选择器数据结构说明：
 *
 * circleList 为三级商圈的完整树状结构：
 * - 一级商圈（例如：陕西）
 *   - 二级商圈（例如：西安）
 *     - 三级商圈（例如：未央、雁塔）
 *
 * 组件展示需求：
 * 将一级商圈和对应的二级商圈“平铺”为多个展示分组（section），用于 UI 中分段展示：
 *
 * 例如：
 *   标题：陕西
 *   选项：陕西
 *
 *   标题：西安
 *   选项：西安、未央、雁塔
 *
 * 因此，我们需要将原有的树状结构转换为“分组化的平铺数据结构”。
 */

// 该选择器有两种使用方式，一种直接在页面中平铺展示，另一种是弹窗展示。
// 平铺展示时，为了和整个页面一起滚动，需要将页面中其他内容通过 slot 传入组件
// 并在组件外定义  --container-height CSS 变量，声明页面高度
// 页面中 mounted 之后，需要调用该组件内的 updateSlotHeight 方法，计算插槽内容高度
// 需要监听 uni.pageScroll 事件，然后通过 $emit 事件将滚动位置传播到组件中
// 参考 /pages/circle/select 页面

// 弹窗展示时，直接引用 /components/circle-selector/circle-selector-popup.vue 组件即可
// 参考 /pages/store/settled/index 页面

export default {
  name: "CircleSelector",
  components: {
    CircleSelectorHeader,
    CircleSelectorList,
    CircleSelectorSidebar,
    CircleHotPopup
  },
  props: {
    selectedCircleId: {
      type: Number,
      default: 0,
    },
    hotCircle: {
      type: Boolean,
      default: true
    },
    // 是否是弹窗模式
    isPopup: {
      type: Boolean,
      default: false
    },
    // 商圈列表
    circleList: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      levelFirstActiveIndex: 0,
      levelSecondActiveIndex: 0,

      circleHotPopupVisible: false,

      slotHeight: 0, // 插槽内容高度
      listIsVisible: this.isPopup, // 列表是否可见
    };
  },
  computed: {
    circleMap() {
      return buildCircleMap(this.circleList);
    },
    cssVars() {
      return {
        // 头部横向选择器高度
        '--header-selector-height': `${SELECTOR_HEADER_HEIGHT}px`,
      }
    },


    /**
     * 将一级商圈和其下的二级商圈转换为展示用的分组结构
     *   UI 需要将每个商圈层级按“标题 + 可选项列表”的方式展示：
     *
     *   标题：陕西
     *   可选：陕西
     *
     *   标题：西安
     *   可选：西安、未央、雁塔
     *
     * 实现方式说明：
     * 1. 先取出当前一级商圈（firstCircle），生成一个分组：
     *    children 中只包含一级商圈自身（作为可选项）。
     *
     * 2. 再处理所有二级商圈（secondLevelCircles）：
     *    每个二级商圈创建一个新的展示分组：
     *       children = [自身] + [其所有三级商圈]
     *    这样二级商圈在展示时会包含自身 + 旗下三级商圈的完整选项。
     *
     * 返回结构示例：
     * [
     *   {
     *     circleId: 100, name: "陕西",
     *     children: [{ circleId: 100, name: "陕西" }]
     *   },
     *   {
     *     circleId: 200, name: "西安",
     *     children: [
     *       { circleId: 200, name: "西安" },
     *       { circleId: 201, name: "未央" },
     *       { circleId: 202, name: "雁塔" }
     *     ]
     *   }
     * ]
     * 扁平化商圈列表
     */
    flattenedCircleGroups() {
      const firstCircle = this.circleList[this.levelFirstActiveIndex];
      if (!firstCircle) return [];

      // 原始二级商圈
      const secondLevelCircles = firstCircle.children ?? [];

      // 生成二级商圈展示组
      const enrichedSecondLevelCircles = secondLevelCircles.map(circle => {
        return {
          ...circle,
          children: [
            {
              circleId: circle.circleId,
              name: circle.name,
            }, // 二级商圈自身
            ...(circle.children ?? []) // 三级商圈列表（如果有）
          ]
        };
      });

      // 生成一级商圈的展示分组（只包含自身）
      const firstCircleGroup = {
        ...firstCircle,
        children: [
          {
            circleId: firstCircle.circleId,
            name: firstCircle.name
          }
        ]
      };

      // 返回一级商圈 + 二级商圈
      return [firstCircleGroup, ...enrichedSecondLevelCircles];
    }
  },
  created() {
    this.handleInitCircleIndex();
  },
  watch: {
    // 当一级商圈索引变化时，重置二级商圈索引
    levelFirstActiveIndex() {
      this.levelSecondActiveIndex = 0;
    },
  },
  methods: {
    // 计算插槽内容高度
    updateSlotHeight() {
      const query = uni.createSelectorQuery().in(this);
      query
        .select("#slot-content")
        .boundingClientRect((rectInfo) => {
          this.slotHeight = rectInfo.height;
          this.listIsVisible = true;
        })
        .exec();
    },
    // 初始化商圈索引
    handleInitCircleIndex() {
      if (!this.selectedCircleId) return;

      // 如果当前没有选中任何商圈，则不做初始化
      const selectedCircleInfo = this.circleMap[this.selectedCircleId];
      if (!selectedCircleInfo) return;

      // 当前选中商圈所属的一级商圈和二级商圈的id
      let firstLevelCircleId = 0;
      let secondLevelCircleId = 0;

      if (selectedCircleInfo.level === 0) {
        // 如果当前选中的商圈是第一级商圈
        firstLevelCircleId = selectedCircleInfo.circleId;
      } else if (selectedCircleInfo.level === 1) {
        // 如果当前选中的商圈是第二级商圈
        firstLevelCircleId = selectedCircleInfo.pid;
        secondLevelCircleId = selectedCircleInfo.circleId;
      } else if (selectedCircleInfo.level === 2) {
        // 如果当前选中的商圈是第三级商圈
        secondLevelCircleId = selectedCircleInfo.pid;
        firstLevelCircleId = this.circleMap[secondLevelCircleId]?.pid ?? 0;
      }

      // 如果当前选中商圈所属的一级商圈不存在，则不做初始化
      if (!firstLevelCircleId) return;

      // 当前选中商圈所属的一级商圈在商圈树中的索引
      const levelFirstActiveIndex = this.circleList.findIndex(circle => circle.circleId === firstLevelCircleId);

      // 如果当前选中商圈所属的一级商圈在商圈树中的索引不存在，则不做初始化
      if (levelFirstActiveIndex === -1) return;
      this.levelFirstActiveIndex = levelFirstActiveIndex;

      // 如果选中商圈不是二级商圈，则不做初始化
      if (!secondLevelCircleId) return;

      // 当前选中商圈所属的二级商圈在商圈树中的索引
      const levelSecondActiveIndex = this.flattenedCircleGroups.findIndex(circle => circle.circleId === secondLevelCircleId);

      // 如果当前选中商圈所属的二级商圈在商圈树中的索引不存在，则不做初始化
      if (levelSecondActiveIndex === -1) return;

      // watch levelFirstActiveIndex 变化时默认会重置二级商圈索引
      // 因此通过异步更新来规避默认重置二级商圈索引
      this.$nextTick(() => {
        this.levelSecondActiveIndex = levelSecondActiveIndex;
      });
    },
    // 打开热门商圈弹窗
    handleOpenMoreCircle() {
      this.circleHotPopupVisible = true;
    },
    // 关闭热门商圈弹窗
    handleCloseMoreCircle() {
      this.circleHotPopupVisible = false;
    },
    // 选择商圈
    handleSelectCircle(circleId) {
      this.$emit("select", circleId);
    },
  },
}
</script>
<style scoped lang="scss">
.circle-selector-container {
  // 头部内容高度 = 头部横向选择器高度 + 1px 边框
  --header-content-height: calc(var(--header-selector-height) + 1px);

  --container-height: var(--selector-container-height, 100vh);

  // 侧边栏容器高度 = 组件容器高度 - 导航栏高度 - 头部内容高度
  --sidebar-container-height: calc(var(--container-height) - var(--nav-bar-height) - var(--header-content-height));
  --sidebar-container-width: 168rpx;

  &.is-popup {
    --sidebar-container-height: calc(var(--container-height) - var(--header-content-height));
  }
}

.sidebar-container {
  // 侧边栏容器顶部位置 = 头部内容高度
  top: var(--header-content-height);
  left: 0;

  // 侧边栏容器高度 = 屏幕高度 - 导航栏高度 - 头部内容高度
  height: var(--sidebar-container-height);
}

.circle-flat-list-container {
  margin-left: var(--sidebar-container-width);
  min-height: var(--sidebar-container-height);
}
</style>