<template>
  <BaseContainer>
    <!-- 导航搜索栏 -->
    <view class="sticky nav-bar-wrapper">
      <SearchNavBar placeholder="搜索城市/商圈等" :searchIcon="false" theme="gray" :value.sync="searchValue" autofocus />
    </view>

    <!-- 搜索结果 -->
    <view class="circle-result-list" @click="handleCircleItemClick" v-if="searchResultEnrichList.length">
      <view class="circle-result-item" v-for="item of searchResultEnrichList" :key="item.id" hover-class="none"
        :data-circle-id="item.circleId">
        <view class="circle-item-title flex-y-center none-event">
          <view class="iconfont icon-ic_location51" />
          <view class="circle-item-title-text flex-1 line1">
            <text v-for="(token, index) of item.titleTokens" :key="index" :class="{ 'hightlight': token.hightlight }">{{
              token.text }}</text>
          </view>
        </view>
        <view class="circle-item-detail line1 none-event" v-if="item.positioning_status">
          <template v-if="item.distance">{{ item.distance }}，</template>{{ item.address }}
        </view>
      </view>
    </view>

    <EmptyPage v-else-if="isSearching" title="暂无搜索结果" />
  </BaseContainer>
</template>

<script>
import BaseContainer from "@/components/common/base_container.vue";
import SearchNavBar from "@/components/common/search_nav_bar.vue";
import { debounce } from "@/utils";
import { mapState } from "vuex";
import { getDistanceInMeters } from "@/utils/location";
import EmptyPage from "@/components/emptyPage.vue";
import { handleToHomePage } from "@/utils/navigation";
import { selectCircleWithDiyTemplates } from "@/utils/circle";

export default {
  name: "CircleSearch",
  components: {
    BaseContainer,
    SearchNavBar,
    EmptyPage,
  },
  data() {
    return {
      searchValue: "", // 搜索关键词
      searchResultList: [], // 搜索结果列表
      isSearching: false, // 是否正在搜索
    };
  },
  computed: {
    ...mapState({
      circleMap: state => state.circle.circleMap,
      location: state => state.location.location
    }),
    // 填充了距离等信息的搜索结果列表
    searchResultEnrichList() {
      return this.searchResultList.map(circle => {
        const result = {
          ...circle,
          titleTokens: this.handleTitleHightlight(circle.name),
        };

        // 计算距离的前提条件
        const calcDistanceCondition = [
          !!this.location,
          circle.positioning_status === 1,
          !!circle.latitude && !!circle.longitude,
        ];

        // 如果所有条件都满足，则计算距离
        if (calcDistanceCondition.every(condition => condition)) {
          const userLocation = this.location;
          const circleLocation = {
            latitude: Number(circle.latitude),
            longitude: Number(circle.longitude),
          };
          const distance = getDistanceInMeters(userLocation, circleLocation);
          if (distance > 1000) {
            result.distance = `${(distance / 1000).toFixed(2)}km`;
          } else {
            result.distance = `${distance.toFixed(0)}m`;
          }
        }

        return result;
      });
    },
    // 扁平化的商圈列表
    flatCircleList() {
      return Object.values(this.circleMap);
    }
  },
  watch: {
    searchValue() {
      this.handleSearch();
    }
  },
  onLoad() {
    // 初始化定位信息
    this.$store.dispatch("initLocation");

    // 刷新商圈树
    this.$store.dispatch("refreshCircleTree");

    // 防抖处理
    this.handleSearch = debounce(this.handleSearch, 300);
  },
  methods: {
    // 搜索
    handleSearch() {
      if (!this.searchValue) {
        this.searchResultList = [];
        return;
      }
      if (!this.isSearching) {
        this.isSearching = true;
      }
      this.searchResultList = this.flatCircleList.filter(circle => circle.name.includes(this.searchValue));
    },
    // 处理标题高亮
    handleTitleHightlight(title) {
      const hightlightList = [];
      const isInclude = this.searchValue && title.includes(this.searchValue);

      // 如果搜索结果标题中包含搜索文字，则进行高亮处理
      if (isInclude) {
        while (1) {
          const index = title.indexOf(this.searchValue);

          // 高亮部分之前的文字
          hightlightList.push({
            text: title.substring(0, index),
            hightlight: false,
          });

          // 高亮部分
          hightlightList.push({
            text: this.searchValue,
            hightlight: true,
          });

          // 高亮部分之后的文字
          title = title.substring(index + this.searchValue.length);

          // 如果高亮部分之后的文字不包含搜索文字，则将剩余文字作为一个 token 进行返回
          // 并结束循环
          if (!title || !title.includes(this.searchValue)) {
            hightlightList.push({
              text: title,
              hightlight: false,
            });
            break;
          }
        }
      } else {
        // 否则直接将搜索结果标题作为一个 token 进行返回
        hightlightList.push({
          text: title,
          hightlight: false,
        });
      }

      return hightlightList;
    },
    // 处理商圈点击事件
    handleCircleItemClick(e) {
      const circleId = e.target.dataset.circleId;
      if (circleId && this.circleMap[circleId]) {
        selectCircleWithDiyTemplates(this.circleMap[circleId]);
        handleToHomePage();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.nav-bar-wrapper {
  top: 0;
  z-index: 1;
}

.circle-result-list {
  margin-top: 12rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx 40rpx 34rpx;
}

.circle-result-item {

  &+.circle-result-item {
    margin-top: 48rpx;
  }

  .circle-item-title {
    .icon-ic_location51 {
      font-size: 24rpx;
      color: #999;
      margin-right: 12rpx;
    }

    .circle-item-title-text {
      font-weight: 500;
      font-size: 28rpx;
      line-height: 40rpx;

      .hightlight {
        color: #FF9000;
      }
    }
  }

  .circle-item-detail {
    margin-top: 4rpx;
    padding-left: 34rpx;
    font-size: 24rpx;
    color: #999999;
    line-height: 34rpx;
  }
}
</style>
