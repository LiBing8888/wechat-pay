<template>
  <view class="activity-label-list flex" v-if="sortedLabels.length">
    <template v-for="label of sortedLabels">
      <view class="label-text line1 flex-y-center" v-if="label.style_type === 1" :key="label.id" :style="[getLabelStyle(label)]">
        {{
          label.label_name
        }}
      </view>
      <image v-else :src="label.icon" mode="heightFix" :key="label.icon" class="label-icon"
        @error="handleImageError(label.icon)" />
    </template>
  </view>
</template>

<script>
export default {
  name: 'ActivityLabelList',
  props: {
    labels: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    }
  },
  data() {
    return {
      errorIconSet: {}
    }
  },
  computed: {
    sortedLabels() {
      const copyLabels = JSON.parse(JSON.stringify(this.labels));
      return copyLabels
        .sort((a, b) => b.default_type - a.default_type)
        .filter(label => !this.errorIconSet[label.icon])
        .slice(0, this.limit);
    }
  },
  methods: {
    getLabelStyle(label) {
      const style = {};
      if (label.color) style.color = label.color;
      if (label.bg_color) style.backgroundColor = label.bg_color;
      if (label.border_color) style.border = `1px solid ${label.border_color}`;
      return style;
    },
    handleImageError(icon) {
      this.$set(this.errorIconSet, icon, true);
    }
  }
}
</script>

<style scoped lang="scss">
.activity-label-list {
  flex-wrap: wrap;
  
	margin-bottom: 8rpx;
  .label-text {
    font-size: 20rpx;
    border-radius: 5rpx;
    padding: 0 4rpx;
    line-height: 28rpx;
    background-color: #f4f4f4;
		margin-right: 8rpx;
  }
  
  .label-icon {
    height: 32rpx;
    width: auto;
  }
}
</style>
