<template>
  <view class="search-bar flex-y-center" :class="classList">
    <view class="back-btn flex-center" @click="handleBack">
      <view class="iconfont icon-ic_left" />
    </view>
    <view class="input-wrapper flex-y-center" @click="handleInputWrapperClick">
      <view class="iconfont icon-ic_search" v-if="searchIcon" />
      <input class="search-input" :class="{ 'none-event': readonly }" :placeholder="placeholder" :value="value"
        @input="handleInput" @confirm="handleConfirm" @focus="handleFocus" confirm-type="search"
        placeholder-style="color: var(--color)" :disabled="readonly" :focus="autofocus" />
      <button class="clear-btn flex-center" v-if="value" @click="handleClear">
        <view class="iconfont icon-ic_close" />
      </button>
    </view>
    <slot />
  </view>
</template>

<script>
export default {
  props: {
    // 搜索框 placeholder
    placeholder: {
      type: String,
      default: ""
    },
    // 搜索框 value
    value: {
      type: String,
      default: ""
    },
    // 搜索框是否只读，如果只读，则触发readonly事件
    readonly: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: "white"
    },
    searchIcon: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    classList() {
      return [
        {
          class: this.theme,
          used: !!this.theme
        },
        {
          class: "none-icon",
          used: !this.searchIcon
        }
      ]
        .filter(item => item.used)
        .map(item => item.class);
    }
  },
  methods: {
    handleInput(event) {
      this.$emit("update:value", event.target.value);
    },
    handleConfirm(event) {
      this.$emit("confirm", event.target.value);
    },
    handleFocus() {
      this.$emit("focus");
    },
    handleInputWrapperClick() {
      this.readonly && this.$emit("input-click");
    },
    handleClear() {
      this.$emit("update:value", "");
    },
    handleBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({
          url: "/pages/index/index"
        });
      }
    }
  }
}
</script>

<style scoped lang="scss">
.search-bar {
  --content-height: 58rpx;
  --font-size: 24rpx;
  --color: #999;
  --input-bg-color: #f5f5f5;
  --input-padding-inline: 34rpx;
  background-color: #fff;
  gap: 16rpx;
  padding-top: calc(var(--safe-area-inset-top) + var(--nav-padding-y-gap));
  padding-bottom: var(--nav-padding-y-gap);
  padding-inline: 20rpx;

  // #ifdef MP
  padding: {
    right: calc(var(--menu-btn-right) + var(--menu-btn-width) + 16rpx) !important;
  }

  // #endif

  &.gray {
    background-color: #f5f5f5;
    --input-bg-color: #fff;
  }

  &.none-icon {
    --input-padding-inline: 24rpx;
  }
}

.back-btn {
  width: 40rpx;
  height: 40rpx;

  .iconfont {
    font-size: 40rpx;
    color: #000;
  }
}

.input-wrapper {
  height: var(--content-height);
  flex: 1;
  background-color: var(--input-bg-color);
  border-radius: 100rpx;
  padding-inline: var(--input-padding-inline);

  .icon-ic_search {
    margin-right: 18rpx;
    color: #999;
  }

  .search-input {
    flex: 1;
    font-size: var(--font-size);
  }
}

.clear-btn {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #DDD;
  margin-left: 20rpx;

  .iconfont {
    color: #fff;
    font-size: 20rpx;
  }
}
</style>