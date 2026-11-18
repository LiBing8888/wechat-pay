<template>
  <BaseContainer customClass="select-location-page">

    <!-- 导航搜索栏 -->
    <view class="sticky nav-bar-wrapper">
      <SearchNavBar placeholder="搜索城市/商圈等" readonly @input-click="handleToSearchPage" />
    </view>


    <!-- 商圈选择器 -->
    <CircleSelector v-if="circleInited" ref="circleSelector" @select="handleSelectCircle"
      :selectedCircleId="selectedCircleInfo ? selectedCircleInfo.circleId : 0" :circleList="circleList">
      <!-- 当前地址 -->
      <view class="current-address-wrapper flex-y-center">
        <view class="iconfont icon-ic_location1"></view>
        <view class="current-address flex-1 flex-y-center overflow-hidden">
          <view class="line1">
            当前选择：
            <text v-if="selectedCircleInfo && selectedCircleInfo.name">(商圈){{ selectedCircleInfo.name }}</text>
            <text v-else-if="locationLoading" class="iconfont icon-ic_loading"></text>
            <template v-else>
              {{ address || '未选择地址' }}
            </template>
          </view>
        </view>
        <view class="re-location-btn flex-y-center" @click="handlePickerLocation">
          <image src="@/static/images/aim.png" mode="aspectFit" class="aim-icon" />
          重新定位
        </view>
      </view>
      <!-- 用户地址 -->
      <view class="user-address-list" v-if="userAddressList.length">
        <view class="module-title">用户地址</view>
        <view class="user-address-item" @click="handleSelectAddress(item)" v-for="item in userAddressList"
          :key="item.address_id">
          {{ buildFullAddress(item) }}
        </view>
      </view>
      <!-- 商圈推荐 -->
      <view class="circle-recommend-list" v-if="recommendCircles.length">
        <view class="module-title">商圈推荐</view>
        <view>
          <view class="circle-recommend-item flex-center" v-for="item of recommendCircles" :key="item.circleId"
            @click="handleSelectCircle(item.circleId)">
            <view class="line1">
              {{ item.name }}
            </view>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="divider-box"></view>
    </CircleSelector>
  </BaseContainer>
</template>

<script>
import BaseContainer from "@/components/common/base_container.vue";
import SearchNavBar from "@/components/common/search_nav_bar.vue";
import CircleSelector from "@/components/circle-selector/index.vue";
import { geocoding } from "@/api/staff";
import { getAddressList } from "@/api/user";
import { mapGetters, mapState } from "vuex";

import { selectCircleWithDiyTemplates, clearSelectedZoneWithDiyTemplates } from "@/utils/circle";
import { SELECT_SCROLL_EVENT } from "@/components/circle-selector/constants";

export default {
  name: "SelectLocation",
  components: {
    BaseContainer,
    SearchNavBar,
    CircleSelector
  },
  data() {
    return {
      locationLoading: false, // 定位中
      userAddressList: [], // 用户地址列表
      circleInited: false, // 区域数据是否初始化
    };
  },
  computed: {
    ...mapGetters(["location", "isLogin"]),
    ...mapState({
      address: state => state.location.address,
      circleList: state => state.circle.circleTree,
      circleMap: state => state.circle.circleMap,
      selectedCircleInfo: state => state.circle.selectedCircleInfo,
      recommendCircles: state => state.circle.recommendCircles,
    })
  },
  watch: {
    location() {
      this.updateRecommendCircles();
    }
  },
  onLoad() {
    uni.showLoading({ mask: true });
    const tasks = [
      this.initLocation().then(this.updateRecommendCircles)
    ];
    if (this.isLogin) {
      tasks.push(this.getUserAddressList());
    }
    this.tasks = tasks;
    this.$store.dispatch("refreshCircleTree")
      .then(() => {
        this.circleInited = true;
      });
  },
  mounted() {
    Promise.all(this.tasks).finally(() => {
      uni.hideLoading();
      this.$nextTick(() => {
        this.$refs.circleSelector.updateSlotHeight();
      });
    });
  },
  onPageScroll(e) {
    uni.$emit(SELECT_SCROLL_EVENT, e);
  },
  methods: {
    updateRecommendCircles() {
      return this.$store.dispatch("getRecommendCircles", this.location);
    },
    buildFullAddress(addressInfo) {
      return `${addressInfo.province}${addressInfo.city}${addressInfo.district}${addressInfo.street}${addressInfo.detail}`;
    },
    // 选择商圈
    async handleSelectCircle(circleId) {
      const circleInfo = this.circleMap[circleId];
      if (!circleInfo) {
        this.$util.Tips({
          title: "商圈信息异常",
          icon: "none",
        });
        return;
      }
      // 设置当前选中的商圈
      selectCircleWithDiyTemplates(circleInfo);
      // 跳转回上一页
      uni.navigateBack();
    },
    // 选择用户地址
    async handleSelectAddress(addressInfo) {
      uni.showLoading({ mask: true });
      const fullAddress = this.buildFullAddress(addressInfo);
      try {
        const res = await geocoding(fullAddress);
        uni.hideLoading();
        const { lng: longitude, lat: latitude } = res.data.location;
        this.handleUpdateLocation({ latitude, longitude }, fullAddress);
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: "none",
        });
      }
    },
    // 获取用户地址列表
    async getUserAddressList() {
      try {
        const res = await getAddressList({
          page: 1,
          limit: 4,
        });
        this.userAddressList = res.data.list;
      } catch (error) {
        this.$util.Tips({
          title: "获取用户地址失败: " + (error.message || error),
          icon: "none",
        });
      }
    },
    // 初始化定位信息
    async initLocation() {
      if (this.location) return;
      this.locationLoading = true;
      try {
        await this.$store.dispatch("initLocation");
      } catch (error) {
        this.$util.Tips({
          title: "定位失败: " + (error.message || error),
          icon: "none",
        });
      } finally {
        this.locationLoading = false;
      }
    },
    // 跳转到地址搜索页面
    handleToSearchPage() {
      uni.navigateTo({
        url: "/pages/circle/search",
      });
    },
    // 打开定位选择器
    async handlePickerLocation() {
      try {
        const result = await uni.chooseLocation();
        const locationData = Array.isArray(result) ? result[1] : result;
        const { name, address, latitude, longitude } = locationData;
        const fullAddress = address || name;
        this.handleUpdateLocation({ latitude, longitude }, fullAddress);
      } catch (error) {
        if (error.errMsg.includes('auth deny')) {
          this.$util.Tips({
            title: '缺少定位权限'
          });
          return;
        } else if (error.errMsg.includes('cancel') || error.errMsg === "chooseLocation:fail") {
          // 取消选择
          return;
        }
        uni.showToast({
          title: `定位失败: ` + (error.message || error),
          icon: 'none',
        });
      }
    },
    // 更新定位信息
    handleUpdateLocation(location, address) {
      this.$store.commit('SET_LOCATION', location);
      this.$store.commit('SET_ADDRESS', address || '');
      clearSelectedZoneWithDiyTemplates();
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-bar-wrapper {
  top: 0;
  z-index: 1;
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.current-address-wrapper {
  padding-inline: var(--padding-inline);
  height: 84rpx;
  font-size: 26rpx;
  border-bottom: 1px solid #eee;

  .icon-ic_location1 {
    font-size: 30rpx;
    color: var(--view-theme);
    margin-right: 8rpx;
  }

  .current-address {
    font-weight: 500;
    color: #333333;
    margin-right: 20rpx;

    .icon-ic_loading {
      display: inline-block;
      font-size: 30rpx;
      animation: loading 2s linear infinite;
    }
  }

  .re-location-btn {
    color: #2A7EFB;

    .aim-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 6rpx;
    }

    margin-left: auto;
  }
}

.module-title {
  font-size: 26rpx;
  color: #999999;
  line-height: 36rpx;
  margin-bottom: 30rpx;
}

.user-address-list {
  padding: var(--padding-inline);

  .user-address-item {
    font-size: 28rpx;
    color: #333333;
    line-height: 34rpx;

    &+.user-address-item {
      margin-top: 30rpx;
    }
  }
}

.circle-recommend-list {
  --gap-x: 28rpx;

  padding: {
    inline: var(--padding-inline);
    top: 10rpx;
    bottom: 40rpx;
  }

  .circle-recommend-item {
    display: inline-flex;
    width: calc((100% - var(--gap-x) * 2) / 3);
    height: 64rpx;
    background: #F5F5F5;
    border-radius: 200rpx;
    padding-inline: 20rpx;

    &:nth-child(n+4) {
      margin-top: 30rpx;
    }

    &:nth-child(3n-1) {
      margin-inline: var(--gap-x);
    }
  }
}

.divider-box {
  height: 20rpx;
  background-color: #F5F5F5;
}
</style>
<style>
.select-location-page {
  background-color: #fff;
  --padding-inline: 30rpx;
}
</style>
