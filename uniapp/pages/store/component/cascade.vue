<template>
  <view>
    <uni-popup ref="popupRef" type="bottom" :mask-click="true" @maskClick="cancel">
      <view class="slider">
        <view class="share-header">
          <view class="share-title">{{ title }}</view>
          <view @click="cancel" class="iconfont icon-shenpizhongxin-jujue"></view>
        </view>
        <!-- 内容 -->
        <view class="classify rd-t-40rpx">
          <scroll-view class="scroll-view_H" scroll-x="true" show-scrollbar="false">
            <view class="list">
              <view class="item" :style="{width:width+'px' }">
                <view class="tips">一级分类</view>
                <scroll-view scroll-y="true" class="scroll-Y">
                  <view class="itemn line1" :class="{
                    active: currentOne === index,
                  }" v-for="(item, index) in listData" :key="index" @click="categoryTap(index)">
                    <text>{{ item.name }}</text>
                  </view>
                </scroll-view>
              </view>
              <!-- 二级菜单 -->
              <view class="item on" v-if="listData[currentOne] && listData[currentOne].children" :style="{width:width+'px' }">
                <view class="tips">二级分类 </view>
                <scroll-view scroll-y="true" class="scroll-Y">
                  <view class="itemn line1" :class="{active: currentTwo === indexJ}"
                    v-for="(j, indexJ) in listData[currentOne].children" :key="indexJ"
                    @click="categoryTwoTap(indexJ)">
                    <text class="over-text">{{ j.name }}</text>
                  </view>
                </scroll-view>
              </view>
              <!-- 三级菜单 -->
              <view class="item on2" :style="{width:width+'px' }"
                v-if="listData[currentOne] && listData[currentOne].children && listData[currentOne].children[currentTwo] && listData[currentOne].children[currentTwo].hasOwnProperty('children')">
                <view class="tips on2">三级分类</view>
                <scroll-view scroll-y="true" class="scroll-Y">
                  <view class="itemn line1" :class="{checked: x.checkbox
                  }" v-for="(x, indexX) in listData[currentOne].children[currentTwo].children" :key="indexX">
                    <checkbox-group @change="checkboxChange($event, x)">
                      <!-- #ifndef MP -->
                      <checkbox :value="x.value.toString()" :checked="x.checkbox" style="transform: scale(0.9)" />
                      <!-- #endif -->
                      <!-- #ifdef MP -->
                      <checkbox :value="x.value" :checked="x.checkbox" style="transform: scale(0.9)" />
                      <!-- #endif -->
                    </checkbox-group>
                    <text>{{ x.name }}</text>
                  </view>
                </scroll-view>
              </view>

            </view>
          </scroll-view>

          <view class="slider-laber-bottom">
            <button class="reset laber-bottom" @click="reset">重置</button>
            <button class="laber-bottom confirm" @click="confirm">确认</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>

export default {
  name: "cascade",
  props: {
    listData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    title: {
      type: String,
      default: "",
    },
    maxCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      currentOne: 0,
      currentTwo: 0,
      checkedIds: [],
      width: 125,
      num: 3,
    };
  },
  
  mounted() {},
  methods: {
    popupOpen(val) {
      setTimeout(() => {
        this.width = uni.getSystemInfoSync().windowWidth / 3;
      }, 300);

      this.$refs.popupRef.open();

      if (val) {
        this.checkedIds = val;
        this.setCheckedStatus(this.listData, val);
      }
    },
    setCheckedStatus(data, ids) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.children && item.children.length > 0) {
          this.setCheckedStatus(item.children, ids);
        } else {
          item.checkbox = ids.includes(item.value);
        }
      }
    },
    checkboxChange(e, item) {
      let defaultids = e.detail.value;
      if (!!defaultids.length) {
        if (this.maxCount > 0) {
          const checkedCount = this.getCheckedCount(this.listData);
          if (checkedCount >= this.maxCount) {
            uni.showToast({
              title: `最多选择${this.maxCount}个分类`,
              icon: 'none'
            });
            return;
          }
        }
        item.checkbox = true;
      } else {
        item.checkbox = false;
      }
      this.$emit("change", item);
    },
    getCheckedCount(data) {
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.children && item.children.length > 0) {
          count += this.getCheckedCount(item.children);
        } else if (item.checkbox === true) {
          count++;
        }
      }
      return count;
    },
    categoryTap(index) {
      this.currentOne = index;
      this.currentTwo = 0;
    },
    categoryTwoTap(index) {
      this.currentTwo = index;
    },
    cancel() {
      this.$refs.popupRef.close();
    },
    reset() {
      this.clearCheckedStatus(this.listData);
      this.$emit("reset");
    },
    clearCheckedStatus(data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.checkbox = false;
        if (item.children && item.children.length > 0) {
          this.clearCheckedStatus(item.children);
        }
      }
    },
    confirm() {
      const name = this.extractCheckboxValues(this.listData);

      if (!name.value.length) {
        return;
      }

      this.$emit("submitOk", {
        value: name.value,
        names: name.names,
      });

      this.cancel();
    },
    extractCheckboxValues(data) {
      let result = [];
      let resultName = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        if (item.children && item.children.length > 0) {
          const childValues = this.extractCheckboxValues(item.children);
          result = result.concat(childValues.value);
          resultName = resultName.concat(childValues.names);
        } else if (item.checkbox === true) {
          result.push(item.value);
          resultName.push(item.name);
        }
      }

      return { value: result, names: resultName };
    },
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep .uni-popup {
    z-index: 100;
  }

  ::v-deep .uni-checkbox-input {
    width: 28rpx;
    height: 28rpx;
  }

  ::v-deep .uni-scroll-view ::-webkit-scrollbar {
    display: none;
  }

  .over-text {
    width: 100%;
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }

  .slider {
    position: relative;
    width: 100%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;

    .share-header {
      width: 100%;
      height: 104rpx;
      position: relative;

      .image {
        width: 100%;
        height: 100%;
      }

      .share-title {
        position: absolute;
        top: 38rpx;
        left: 50%;
        transform: translate(-50%, 0);
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 15px;
        color: $uni-text-color;
      }

      .iconfont {
        font-size: 32rpx;
        color: #c0c4cc;
        position: absolute;
        top: 30rpx;
        right: 32rpx;
      }
    }

    .slider-laber-bottom {
      position: absolute;
      display: flex;
      bottom: 30rpx;
      height: 86rpx;
      left: 30rpx;
      right: 30rpx;
      align-items: center;

      .laber-bottom {
        height: 100%;
        border-radius: 8rpx;
        border: none;
        font-size: 28rpx;
        line-height: 86rpx;

        &::after {
          border: 0;
        }
      }

      .reset {
        width: 184rpx;
        margin-right: 30rpx;
        background: #f0f1f5;
        color: $uni-text-color;
      }

      .confirm {
        width: calc(100% - 214rpx);
        background: #308bf8;
        color: #fff;
      }
    }
  }

  .classify {
    background-color: #fff;
    padding-bottom: 60rpx;

    .list {
      display: flex;
      height: 770rpx;
      margin-bottom: 40px;

      .scroll-Y {
        height: 784rpx;
      }

      .item {
        flex-shrink: 0;
        padding: 22rpx 32rpx 0 32rpx;
        font-size: 24rpx;
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        color: #666666;

        .tips {
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          font-size: 24rpx;
          color: #999999;
          margin-bottom: 30rpx;
        }

        .itemn {
          margin-bottom: 58rpx;
          display: flex;
          align-items: center;

          &.active {
            color: #2a7efb;
            font-weight: 500;
          }

          &.checked {
            color: #1890FF;
          }
        }

        &.on {
          background-color: #fafafa;
        }

        &.on2 {
          background-color: #f5f5f5 !important;
        }
      }
    }
  }
</style>
