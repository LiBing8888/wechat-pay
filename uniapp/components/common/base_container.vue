<!-- 提供各种全局 CSS 变量，安全区域尺寸/小程序胶囊尺寸等 -->
<template>
  <view :style="cssVars" class="base-container" :class="classList">
    <slot />
  </view>
</template>

<script>
import deviceEnvMixin from "@/mixins/device-env";

export default {
  name: "BaseContainer",
  mixins: [deviceEnvMixin],
  props: {
    /**
     * 是否需要最小高度
     */
    hasMinHeight: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ""
    }
  },
  computed: {
    classList() {
      const classList = [
        {
          className: "has-min-height",
          rule: this.hasMinHeight
        },
        {
          className: this.customClass,
          rule: !!this.customClass
        }
      ];

      return classList.filter(item => item.rule).map(item => item.className);
    }
  }
}
</script>

<style scoped lang="scss">
.base-container {
  &.has-min-height {
    min-height: 100vh;
  }

  font-family: PingFang SC;
  overflow-x: hidden;
}
</style>
