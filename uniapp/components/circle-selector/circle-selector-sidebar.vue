<template>
  <scroll-view class="circle-selector-sidebar" scroll-y :scroll-into-view="scrollIntoViewId">
    <view class="circle-item flex-center" v-for="(circle, index) of list" :key="circle.circleId"
      :class="{ 'active': activeIndex === index }" @click="handleCircleClick(index)" :id="getCircleId(index)">
      <CircleSelectorSidebarCorner position="top" v-if="activeIndex === index && index > 0" />
      <view class="line1">{{ circle.name }}</view>
      <CircleSelectorSidebarCorner position="bottom" v-if="activeIndex === index && index <= list.length - 1" />
    </view>
    <view class="circle-sidebar-list-placeholder" />
  </scroll-view>
</template>

<script>
import CircleSelectorSidebarCorner from "./circle-selector-sidebar-corner.vue";

export default {
  name: "CircleSelectorSidebar",
  components: {
    CircleSelectorSidebarCorner,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      scrollIntoViewId: "",
    };
  },
  watch: {
    activeIndex(index) {
      this.scrollIntoViewId = this.getCircleId(index);
    },
  },
  methods: {
    getCircleId(index) {
      return `sidebar-circle-${index}`;
    },
    handleCircleClick(index) {
      this.$emit("update:activeIndex", index);
    },
  },
}
</script>

<style scoped lang="scss">
.circle-selector-sidebar {
  height: 100%;
  width: var(--sidebar-container-width);
  background-color: #f5f5f5;
}

.circle-item {
  height: 92rpx;
  padding-inline: 20rpx;

  &.active {
    background-color: #fff;
    position: relative;
    font-weight: 500;
  }
}

.circle-sidebar-list-placeholder {
  height: var(--safe-area-inset-bottom);
}
</style>
