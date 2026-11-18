<template>
  <uni-popup ref="popup" type="bottom">
    <view class="mask-content bg-f">
      <view class="title font-500">
        选择地址
        <view class="close iconfont icon-ic_close popup-close" @click="close"></view>
      </view>
      <view class="search-box">
        <SearchBar placeholder="请输入提货点名称/地址" custom-class="custom-search-bar" @confirm="handleConfirmSearch" />
      </view>
      <view class="box">
        <scroll-view scroll-y="true" class="scroll-box">
          <!-- 空状态提示 -->
					<view class='noCommodity' v-if="filterStationResult.length === 0">
						<view class='pictrue'>
							<image :src="`${domain}/static/images/noAddress.png`"></image>
						</view>
						<view>暂无匹配的提货点</view>
					</view>
            
          <!-- 提货点内容 -->
          <view v-else class="station-item" v-for="(item, index) of filterStationResult" :key="index"
            :class="{ 'activite-item': index === defaultIndex }" @click="handleSelectStation(item, index)">
            <!-- 选中时的icon样式 -->
            <text v-if="index === defaultIndex" class="iconfont icon-a-icon_cornermark">
            </text>
            <!-- S 左侧信息 -->
            <view class="left-box">
              <!-- 提货点名字 -->
              <view class="name fs-28 fw-500">
                {{ item.station_name }}
              </view>
              <!-- 提货点地址 -->
              <view class="left-info address fs-22 fw-400">
                <text class="iconfont icon-ic_location51 fs-22 "></text>
                <view class="left-info-text address-text">
                  提货地址：{{ item.station_address }}
                </view>
              </view>
              <!-- 提货点营业时间 -->
              <view class="left-info time fs-22 fw-400">
                <text class="iconfont icon-icon_clock-2 fs-22"></text>
                <view class="left-info-text time-text">
                  营业时间：{{ item.business_time_start }}-{{ item.business_time_end }}
                </view>
              </view>
            </view>
            <!-- E 左侧信息 -->
            <!-- S 右侧信息 -->
            <view class="distance-box">
              <view class="distance fs-20 fw-400">
                距离{{ item.distance }}
              </view>
              <view class="icon-group" @click.stop.prevent>
                <!-- 电话按钮 -->
                <view class="icon-box phone-box" @click="handleCallPhone(item.phone)">
                  <text class="iconfont icon-ic_Phone fs-20"></text>
                </view>
                <!-- 导航按钮 -->
                <view class="icon-box location-box" @click="handleOpenMap(item)">
                  <text class="iconfont icon-icon_Location fs-20"></text>
                </view>
              </view>
            </view>
            <!-- E 右侧信息 -->

          </view>
        </scroll-view>
      </view>
      <view class="foot">
        <view class="btn" @click="handleConfirmStation">确定</view>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import SearchBar from "@/components/common/search_bar.vue";
import { HTTP_REQUEST_URL } from "@/config/app";

export default {
  name: "StationPopup",
  components: {
    SearchBar
  },
  props: {
    list: Array,
    stationId: Number
  },
  data() {
    return {
      searchContent: "",
      defaultIndex: 0,
      domain: HTTP_REQUEST_URL
    };
  },
  watch: {
    defaultIndexParams: {
      handler() {
        this.updateDefaultIndex();
      },
      immediate: true
    }
  },
  computed: {
    defaultIndexParams() {
      return [this.list, this.stationId];
    },
    filterStationResult() {
      if (!this.searchContent) return this.list;
      return this.list.filter(item => {
        return item.station_name.includes(this.searchContent) || item.station_address.includes(this.searchContent);
      });
    }
  },
  methods: {
    updateDefaultIndex() {
      this.defaultIndex = this.list.findIndex(item => item.station_id === this.stationId);
    },
    handleOpenMap(station) {
      this.$emit('openMap', station);
    },
    // 拨打电话
    handleCallPhone(phone) {
      uni.makePhoneCall({
        phoneNumber: phone
      })
    },
    handleConfirmSearch(searchContent) {
      this.searchContent = searchContent;
    },
    handleSelectStation(station, index) {
      this.defaultIndex = index;
    },
    handleConfirmStation() {
      const station = this.filterStationResult[this.defaultIndex];
      if (!station) {
        return this.$util.Tips({
          title: '请选择站点'
        });
      }
      this.$emit('confirm', station);
      this.close();
    },
    open() {
      this.$refs.popup.open();
    },
    close() {
      this.$refs.popup.close();
    }
  }
}
</script>

<style scoped lang="scss">
.mask-content {
  background-color: #F5F5F5;
  border-radius: 40rpx 40rpx 0 0;

  .title {
    padding: 40rpx 0 20rpx 0;
    margin-bottom: 40rpx;
    font-size: 16px;
    text-align: center;

    // margin-bottom: 40rpx;
    .close {
      position: absolute;
      right: 20rpx;
      top: 20rpx;
    }
  }

  .search-box {
    margin: 0 10rpx;
  }

  .box {
    padding: 0 30rpx;

    .scroll-box {
      max-height: 680rpx;

      // 去除滚动条
      ::v-deep * {
        scrollbar-color: #fff #fff;
        scrollbar-width: none;
      }

      .station-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 20rpx;
        padding: 28rpx 24rpx;
        background: #FFFFFF;
        border-radius: 16rpx 16rpx 16rpx 16rpx;
        border: 1rpx solid #FFFFFF;

        font-size: 28rpx;
        color: #333333;

        // .icon-a-icon_cornermark {
        // 	position: absolute;
        // 	top: -1rpx;
        // 	right: -1rpx;
        // 	color: var(--view-theme);
        // 	font-size: 56rpx;
        // }
        .left-box {
          width: 500rpx;
          padding-right: 50rpx;
          border-right: 1rpx solid #EEEEEE;

          .name {
            margin-bottom: 16rpx;
          }

          .left-info {
            display: flex;
            color: #999999;
            align-items: baseline;

            .iconfont {
              margin-right: 12rpx;

            }

            .left-info-text {
              width: 418rpx;
            }
          }

          .address {
            margin-bottom: 10rpx;
          }

        }

        .distance-box {
          display: flex;
          flex-direction: column;
          color: #999999;

          .icon-group {
            display: flex;
            color: var(--view-theme);
            justify-content: center;
            margin-top: 20rpx;

            .icon-box {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 40rpx;
              height: 40rpx;
              border-radius: 50%;
              background-color: #FCEAE9;

            }

            .location-box {
              margin-left: 20rpx;
            }
          }
        }
      }

      .activite-item {
        border: 1rpx solid var(--view-theme);

        .icon-a-icon_cornermark {
          position: absolute;
          top: -1rpx;
          right: -1rpx;
          color: var(--view-theme);
          font-size: 56rpx;
        }
      }

      
    }
  }

  .foot {
    padding: 50rpx 30rpx 20rpx;
    padding: 50rpx 30rpx calc(20rpx+ constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
    padding: 50rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/

    .btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      border-radius: 50rpx;
      color: #fff;
      font-size: 28rpx;
      background: var(--view-theme);
    }
  }
}
</style>
