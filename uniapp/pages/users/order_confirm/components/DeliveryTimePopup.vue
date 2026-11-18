<template>
  <uni-popup ref="popup" type="bottom">
    <view class="mask-content bg-f">
      <view class="title font-500">
        预计送达时间
        <view class="close iconfont icon-ic_close popup-close" @click="close"></view>
      </view>
      <view class="box">
        <view class="scroll-box flex-box">
          <scroll-view scroll-y="true" class="scroll-left">
            <view class="left-item flex-box" v-for="(item, index) in dateList" :key="index"
              :class="{ 'act-left-item': dateIndex === index }" @click="handleChangeDateIndex(index)">
              <text class="left-text fs-24">{{ item.label }}</text>
            </view>
          </scroll-view>
          <scroll-view scroll-y="true" class="scroll-right">
            <template v-if="dateList[dateIndex]">
              <view class="right-item flex-box" v-for="(item, index) of dateList[dateIndex].timeRange" :key="index"
                :class="{ 'act-color': timeIndex === index }" @click="handleChangeTimeIndex(index)">
                <text class="right-text fs-28">{{ buildTimeStr(item) }}</text>
                <text class="iconfont icon-ic_complete fs-36" v-if="timeIndex === index"></text>
              </view>
            </template>
          </scroll-view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import dayjs from "@/plugin/dayjs/dayjs.min.js";

export default {
  name: "DeliveryTimePopup",
  props: {
    setting: Object,
    station: Object,
  },
  data() {
    return {
      dateIndex: 0,
      timeIndex: 0,
      timeList: []
    }
  },
  computed: {
    dateList() {
      // 未来n天可供选择
      const availableDays = this.setting.selectable_days;
      // 营业日期数组， 1-7 表示周一到周日
      const businessDate = this.station.business_date;
      // 营业开始时间
      const businessStartTime = this.station.business_time_start;
      // 营业结束时间
      const businessEndTime = this.station.business_time_end;

      // 当前日期
      const todayDate = dayjs();
      const todayDateText = todayDate.format("YYYY-MM-DD");

      // 配送时间段列表
      const timeRangeList = this.generateTimeRange(businessStartTime, businessEndTime);

      // 今天是否还可以配送
      // 当前时间是否小于今日最后的一个配送时间段
      // 例如今日最后一个配送时间段：20:30-21:00，则今日停止配送时间：20:29:59
      // 如果当前时间为 20:31，则今日无法进行配送
      let todayCanDelivery = false;
      if (timeRangeList.length) {
        const lastTimeRange = timeRangeList[timeRangeList.length - 1];
        todayCanDelivery = dayjs()
          .hour(lastTimeRange.startHour)
          .minute(lastTimeRange.startMinute)
          .second(0)
          .isAfter(todayDate);
      }

      // 可配送的起始日期，如果今天还可以配送，则从今天开始，否则从明天开始
      let startDeliveryDate = todayCanDelivery ? todayDate : todayDate.add(1, "day");

      const weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

      const dateList = [];

      for (let i = 0; i < availableDays; i++) {

        // 当前配送日期
        const date = startDeliveryDate.format("YYYY-MM-DD");

        const weekIndex = startDeliveryDate.day();

        // 是否为营业日期
        if (businessDate.includes(weekIndex)) {
          // 当前配送日期是星期几
          const week = weeks[startDeliveryDate.day()];

          // 是否为今天
          const isToday = date === todayDateText;

          // 是否为明天
          const isTomorrow = date === todayDate.add(1, "day").format("YYYY-MM-DD");

          dateList.push({
            isToday,
            label: isToday ? `今天(${week})` : isTomorrow ? `明天(${week})` : startDeliveryDate.format("MM月DD日"),
            date,
            week,
            timeRange: isToday ? this.filterTodayTimeRange(timeRangeList) : timeRangeList
          });
        }

        // 下一个配送日期
        startDeliveryDate = startDeliveryDate.add(1, "day");
      }

      return dateList;
    }
  },
  watch: {
    dateList: {
      handler() {
        // 日期列表初始化完成时，默认选中第一个日期
        this.dateIndex = 0;
        this.timeIndex = 0;
        this.handleConfirm();
      },
      immediate: true,
    }
  },
  methods: {
    open() {
      this.$refs.popup.open();
    },
    close() {
      this.$refs.popup.close();
    },
    // 生成今天的配送时间段列表
    filterTodayTimeRange(timeRangeList) {
      const now = dayjs();

      // 获取今天可配送的时间段索引
      // 获得当时时间段可用的最早时间段索引
      const validTimeRangeIndex = timeRangeList.findIndex(item => {
        const start = dayjs().hour(item.startHour).minute(item.startMinute).second(0);

        // 判断当前时间是否小于该时间段的开始时间
        return now.isBefore(start);
      });

      if (validTimeRangeIndex === -1) return [];

      return timeRangeList.slice(validTimeRangeIndex);
    },
    // 生成常规完整的配送时间段列表，非今天
    generateTimeRange(startTimeStr, endTimeStr) {
      // 营业开始时间
      const [startHour, startMinute] = startTimeStr.split(":");
      // 营业结束时间
      const [endHour, endMinute] = endTimeStr.split(":");

      const timeRangeList = [];
      let startTime = dayjs().hour(startHour).minute(startMinute).second(0);
      const endTime = dayjs().hour(endHour).minute(endMinute).second(0);

      while (1) {
        // 如果开始时间大于结束时间，则结束循环
        if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
          break;
        }

        let timeRangeEnd;
        const hour = startTime.minute();

        if (hour >= 30) {
          // 如果开始时间大于等于30分钟，则结束时间为下一个小时的整点
          // 例如：开始时间：10:30，则结束时间：11:00
          timeRangeEnd = startTime
            .hour(startTime.hour() + 1)
            .minute(0)
            .second(0);
        } else {
          // 否则结束时间为开始时间所在小时的30分钟
          // 例如：开始时间：10:10，则结束时间：10:30
          timeRangeEnd = startTime
            .minute(30)
            .second(0);
        }

        // 如果当前时间段结束时间大于营业结束时间，则结束时间为营业结束时间
        if (timeRangeEnd.isAfter(endTime)) {
          timeRangeEnd = endTime;
        }

        timeRangeList.push({
          startHour: startTime.hour(),
          startMinute: startTime.minute(),
          endHour: timeRangeEnd.hour(),
          endMinute: timeRangeEnd.minute(),
        });

        startTime = timeRangeEnd;
      }

      return timeRangeList;
    },
    buildTimeStr({ startHour, startMinute, endHour, endMinute }) {
      const format = (hour, minute) => {
        return hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0");
      };
      const start = format(startHour, startMinute);
      const end = format(endHour, endMinute);
      return `${start}-${end}`;
    },
    handleChangeDateIndex(index) {
      // 切换日期
      this.dateIndex = index;
      this.timeIndex = 0;
    },
    handleChangeTimeIndex(index) {
      // 切换时间
      this.timeIndex = index;
      this.handleConfirm(true);
    },
    handleConfirm(close = false) {
      // 确认选择日期和时间
      const { date, week, timeRange, label } = this.dateList[this.dateIndex] || {};
      const time = timeRange?.[this.timeIndex];

      if (date && week && time && label) {
        this.$emit("confirm", {
          date,
          week,
          time: this.buildTimeStr(time),
          label
        });
        close && this.close();
      }
    }
  }
}
</script>

<style scoped lang="scss">
.mask-content {
  border-radius: 40rpx 40rpx 0 0;

  .title {
    padding: 40rpx 0;
    font-size: 16px;
    text-align: center;

    .close {
      position: absolute;
      right: 20rpx;
      top: 20rpx;
    }
  }

  .box {
    .scroll-box {

      // margin-bottom: 52rpx;
      .scroll-left {
        height: 470rpx;
        width: 230rpx;
        flex-shrink: 0;
        background-color: #F5F5F5;

        // 去除滚动条
        ::v-deep * {
          scrollbar-color: #fff #fff;
          scrollbar-width: none;
        }

        .left-item {
          align-items: center;
          padding: 30rpx 0;
          background-color: #F5F5F5;

          &:last-child {
            padding-bottom: calc(var(--safe-area-inset-bottom) + 30rpx);
          }

          .left-text {
            margin-left: 34rpx;
          }
        }

        .act-left-item {
          background-color: #fff;
        }
      }

      .scroll-right {
        height: 470rpx;

        // 去除滚动条
        ::v-deep * {
          scrollbar-color: #fff #fff;
          scrollbar-width: none;
        }

        .right-item {
          justify-content: space-between;
          align-items: center;
          padding: 30rpx 0;

          &:last-child {
            padding-bottom: calc(var(--safe-area-inset-bottom) + 30rpx);
          }

          .right-text {
            margin-left: 34rpx;
          }

          .icon-ic_complete {
            margin-right: 32rpx;
          }
        }
      }

    }

    .check-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40rpx;
      margin-bottom: 50rpx;
      font-size: 28rpx;

      .check-item-text {
        display: flex;
        align-items: center;

        .err-txt {
          display: flex;
          // align-items: center;
          align-items: baseline;
          color: $theme-color;
          font-size: 22rpx;
          font-weight: 400;
          margin-left: 20rpx;

          .iconfont {
            margin-right: 10rpx;
            font-size: 22rpx;
            color: $theme-color;
          }
        }
      }

      .iconfont {
        font-size: 38rpx;
        color: #CCCCCC;

        &.icon-a-ic_CompleteSelect {
          color: var(--view-theme);
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


.animated {
  animation-duration: .3s
}

.flex-box {
  display: flex;
}

.act-color {
  color: var(--view-theme)
}

.fs-24 {
  font-size: 24rpx;
}

.fs-28 {
  font-size: 28rpx;
}

.fs-36 {
  font-size: 36rpx;
}
</style>
