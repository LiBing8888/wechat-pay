<template>
  <view>
    <view class="store-address" v-if="currentStation">
      <view class="pick-up-point-box">
        <view class="name line2" @click="handleOpenSelectPopup">
          <text>{{ currentStation.station_name }}</text>
          <text class='iconfont icon-ic_rightarrow'></text>
        </view>
        <view class="info line2">
          <text class="distance">距您{{ currentStation.distance }}</text>
          <text>{{ currentStation.station_address }}</text>
        </view>
      </view>
      <view class="map" @click="handleOpenMap(currentStation)">
        <text class="iconfont icon-ic_location5"></text>
        <view class="map_text">地图</view>
      </view>
    </view>
    <StationPopup ref="stationPopup" :list="config" :stationId="stationId" @openMap="handleOpenMap" @confirm="handleStationChange" />
  </view>
</template>

<script>
import StationPopup from "./StationPopup.vue";

export default {
  name: "StationSelector",
  components: {
    StationPopup
  },
  props: {
    config: Array,
    stationId: Number
  },
  computed: {
    stationMap() {
      return this.config.reduce((acc, item) => {
        acc[item.station_id] = item;
        return acc;
      }, {});
    },
    currentStation() {
      return this.stationMap[this.stationId];
    }
  },
  methods: {
    // 打开配送点选择弹窗
    handleOpenSelectPopup() {
      this.$refs.stationPopup.open();
    },
    // 打开配送点地图
    handleOpenMap(station) {
      const payload = {
        latitude: Number(station.lat),
        longitude: Number(station.lng),
        name: station.station_name,
        address: station.station_address,
      };

      if (this?.$wechat?.isWeixin()) {
        this.$wechat.seeLocation(payload)
      } else {
        uni.openLocation({
          ...payload,
          scale: 8
        });
      }
    },
    handleStationChange(station) {
      this.$emit('change', station);
    }
  }
}
</script>

<style scoped lang="scss">
.store-address {
  padding: 26rpx 28rpx;
  margin: 0 30rpx;
  background: #F6F6F6;
  border-radius: 16rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /*新版本*/
  .pick-up-point-box {
    padding-right: 44rpx;

    .name {
      // width: 148rpx;
      margin-right: 20rpx;
      font-weight: 500;
      font-size: 28rpx;
      color: #333333;

      .icon-ic_rightarrow {
        font-size: 28rpx;
        color: #333333;
        margin-left: 4rpx;
      }
    }

    .info {
      flex: 1;
      font-weight: 400;
      font-size: 24rpx;
      color: #666666;
      margin-top: 20rpx;

      .distance {
        // border-right: 1rpx solid #CCCCCC;
        // padding-right: 12rpx;
        // margin-right: 12rpx;
        position: relative;

        &::after {
          position: relative;
          bottom: 0;
          display: inline-block;
          content: '';
          width: 1rpx;
          height: 18rpx;
          background-color: #CCCCCC;
          margin: 0 12rpx;
        }
      }
    }
  }

  .map {
    flex-shrink: 0;
    text-align: center;
    position: relative;
    padding-left: 44rpx;

    &::before {
      content: '';
      display: inline-block;
      width: 2rpx;
      height: 42rpx;
      background-color: #DDDDDD;
      position: absolute;
      left: 0;
      top: 18rpx;
    }

    .iconfont {
      color: #333333;
    }

    .map_text {
      color: #333333;
    }
  }
}
</style>
