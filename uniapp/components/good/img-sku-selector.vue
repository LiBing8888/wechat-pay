<template>
  <view class="img-sku-selector flex-y-center">
    <view class="flex-1 relative overflow-hidden">
      <scroll-view scroll-x scroll-with-animation class="flex-1" :scroll-into-view="activeSkuId">
        <view class="gap-16 flex-y-center">
          <view class="sku-item flex-center" :class="{ active: isSelectDefault }" @click="handleSelectDefault" :id="getSkuId(0)">
            <image :src="goodImage" mode="aspectFill" class="sku-item-image" />
          </view>
          <view class="sku-item flex-center" v-for="(item, key) in sku" :key="key"
            :class="{ active: !isSelectDefault && key === activeSku }" :id="getSkuId(item.value_id)"
            @click="handleSelectSku(key)">
            <image :src="item.image || goodImage" mode="aspectFill" class="sku-item-image" />
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="open-sku-btn line1" @click="handleOpenSku">
      共{{ skuCount }}款
      <text class="iconfont icon-ic_rightarrow"></text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'img-sku-selector',
  props: {
    goodImage: String,
    sku: {
      type: Object,
      default: () => ({})
    },
    activeSku: String,
    defaultSku: String
  },
  data() {
    return {
      isSelectDefault: true
    };
  },
  computed: {
    skuNameToIdMap() {
      return Object.entries(this.sku).reduce((acc, [key, value]) => {
        acc[key] = value.value_id;
        return acc;
      }, {});
    },
    activeSkuId() {
      if (this.isSelectDefault) return undefined;
      return this.getSkuId(this.skuNameToIdMap[this.activeSku]);
    },
    skuCount() {
      return Object.keys(this.sku).length;
    }
  },
  methods: {
    getSkuId(skuId) {
      return `sku-${skuId}`;
    },
    handleSelectDefault() {
      this.$emit("select", {
        skuName: this.defaultSku,
        isDefault: true
      });
      this.isSelectDefault = true;
    },
    handleSelectSku(skuName) {
      this.$emit("select", {
        skuName,
        isDefault: false
      });
      this.isSelectDefault = false;
    },
    handleOpenSku() {
      this.$emit("open");
    }
  }
}
</script>

<style scoped lang="scss">
.gap-16 {
  gap: 16rpx;
}
.img-sku-selector {
	margin-bottom: 25rpx;
}
.overflow-hidden {
  overflow: hidden;
}
.sku-item {
  height: 80rpx;
  border-radius: 16rpx;
  flex: 0 0 80rpx;

  .sku-item-image {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
  }

  &.active {
    border: 1px solid #333;

    .sku-item-image {
      width: 68rpx;
      height: 68rpx;
    }
  }
}

.open-sku-btn {
  margin-left: 16rpx;
  width: 96rpx;
  font-size: 22rpx;
  text-align: right;

  .iconfont {
    margin-left: 6rpx;
    font-size: 22rpx;
  }
}
</style>
