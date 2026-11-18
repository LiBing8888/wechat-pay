<template>
  <view :style="cssVars">
    <!-- #ifdef MP -->
    <view @click="handleOpenPopup">
      <slot></slot>
    </view>
    <!-- #endif -->

    <!-- #ifndef MP -->
    <view class="relative" @click="handleOpenPopup">
      <slot></slot>
    </view>
    <!-- #endif -->

    <uni-popup ref="popup" type="bottom">
      <view class="popup-container bg-f">
        <view class="selector-popup-header flex-between-center">
          <button class="cancel-btn header-btn flex-center" @click="handleClosePopup">取消</button>
          <button class="confirm-btn header-btn flex-center" @click="handleConfirm">确定</button>
        </view>

        <!-- 搜索框 -->
        <view class="search-container">
          <view class="search-box">
            <text class="iconfont icon-ic_search search-icon"></text>
            <input class="search-input" v-model="searchKeyword" placeholder="请输入商户名称搜索"
              placeholder-class="search-placeholder" @input="handleSearch" />
            <text v-if="searchKeyword" class="iconfont icon-ic_close2 clear-icon" @click="handleClearSearch"></text>
          </view>
        </view>

        <scroll-view class="merchant-list-wrapper" scroll-y v-if="popupBodyIsVisible">
          <view v-if="loading" class="loading-container">
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="merchantList.length === 0" class="empty-container">
            <text class="empty-text">{{ searchKeyword ? '未找到相关商户' : '暂无商户' }}</text>
          </view>
          <view v-else class="merchant-list">
            <view v-for="(merchant, index) in merchantList" :key="merchant.circle_id" class="merchant-item"
              :class="{ 'selected': selectedMerchantId === merchant.circle_id }"
              @click="handleSelectMerchant(merchant)">
              <view class="merchant-info">
                <text class="merchant-name">{{ merchant.name }}</text>
              </view>
              <view class="merchant-check" v-if="selectedMerchantId === merchant.circle_id">
                <text class="iconfont icon-ic_check"></text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import deviceEnvMixin from "@/mixins/device-env";
import { getMerchantListForApply } from '@/api/store';
import { debounce } from '@/utils/index';

export default {
  name: "MerSelectPopup",
  mixins: [deviceEnvMixin],
  props: {
    merchantId: {
      type: Number,
      default: 0,
    },
    merchantName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      merchantList: [],
      selectedMerchantId: this.merchantId,
      searchKeyword: '',
      loading: false,
      popupBodyIsVisible: false,
    };
  },
  watch: {
    merchantId(val) {
      this.selectedMerchantId = val;
    }
  },
  methods: {
    handleOpenPopup() {
      this.$nextTick(() => {
        this.$refs.popup.open();
        this.popupBodyIsVisible = true;
        if (this.merchantList.length === 0) {
          this.getMerchantList();
        }
      });
    },
    handleClosePopup() {
      this.$refs.popup.close();
      setTimeout(() => {
        this.popupBodyIsVisible = false;
        this.searchKeyword = '';
      }, 300);
    },
    async getMerchantList(name = '') {
      try {
        this.loading = true;
        const params = {};
        if (name) {
          params.name = name;
        }
        const res = await getMerchantListForApply(params);
        this.merchantList = res.data || [];
      } catch (error) {
        uni.showToast({
          title: error || '获取商户列表失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    handleSearch: debounce(function () {
      this.getMerchantList(this.searchKeyword.trim());
    }, 300),
    handleClearSearch() {
      this.searchKeyword = '';
      this.handleSearch();
    },
    handleSelectMerchant(merchant) {
      if (this.selectedMerchantId === merchant.circle_id) {
        this.selectedMerchantId = 0;
      } else {
        this.selectedMerchantId = merchant.circle_id;
      }
    },
    handleConfirm() {
      const selectedMerchant = this.merchantList.find(m => m.circle_id === this.selectedMerchantId);
      this.$emit("update:merchantId", this.selectedMerchantId);
      this.$emit("update:merchantName", selectedMerchant ? selectedMerchant.name : '');
      this.$emit("select", {
        merchantId: this.selectedMerchantId,
        merchantName: selectedMerchant ? selectedMerchant.name : ''
      });
      this.handleClosePopup();
    },
  }
}
</script>

<style scoped lang="scss">
.popup-container {
  border-radius: 30rpx 30rpx 0 0;
  background-color: #fff;
}

.selector-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
}

.header-btn {
  width: 120rpx;
  height: 80rpx;
  background: transparent;
  font-size: 34rpx;
  color: #333333;
  border: none;
  padding: 0;
  line-height: 80rpx;

  &.confirm-btn {
    color: #007aff;
  }
}

.search-container {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #E5E5E5;
}

.search-box {
  display: flex;
  align-items: center;
  height: 70rpx;
  background: #F5F5F5;
  border-radius: 35rpx;
  padding: 0 24rpx;
  position: relative;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 100%;
}

.search-placeholder {
  color: #999;
}

.clear-icon {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.merchant-list-wrapper {
  --selector-container-height: 60vh;
  height: var(--selector-container-height);
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text,
.empty-text {
  color: #999;
  font-size: 28rpx;
}

.merchant-list {
  padding: 0 30rpx;
}

.merchant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &.selected {
    .merchant-name {
      color: #007aff;
      font-weight: 500;
    }
  }
}

.merchant-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.merchant-name {
  font-size: 30rpx;
  color: #333;
}

.merchant-check {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  .iconfont {
    font-size: 36rpx;
    color: #007aff;
  }
}

.flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bg-f {
  background-color: #fff;
}
</style>
