<template>
  <view class="good-body">
    <view class="good-name item_tags" @click="handleToProductPage" v-if="visible.name">
      <view class="good-promotion-type tags_item" v-if="promotionType">{{ promotionType }}</view>
      <view class="good-name-content line1">{{ good.store_name }}</view>
    </view>
    <view class="good-price-info" @click="handleToProductPage" v-if="visible.price || visible.svipPrice">
      <priceFormat :price="good.price" weight intSize="36" floatSize="26" labelSize="26" v-if="visible.price" :color="themeColor" />
      <svip-price v-if="visible.svipPrice && good.svip_price" :price="good.svip_price" />
    </view>
    <view @click="handleToProductPage" style="margin-top: 12rpx;" v-if="visible.label">
      <ActivityLabelList :labels="good.product.activity_labels" v-if="good.product.activity_labels.length" :limit="3" />
    </view>
    <view class="good-sale-score" @click="handleToProductPage">
      <view class="good-score" v-if="visible.score">{{ good.rate }}评分</view>
      <view class="good-sale" v-if="visible.sale">已售{{ good.sales }}</view>
      <view class="good-reply-count" v-if="visible.replyCount">{{ good.reply_count | formatReplyCount }}条评论</view>
    </view>
    <view class="good-store-info" v-if="isStoreInfoVisible">
      <view class="store-distance" v-if="visible.distance && distance">{{ distance }}km</view>
      <view class="store-name line1" @click="toMerPage">
        {{ good.merchant.mer_name }}
      </view>
      <view class="iconfont icon-ic_rightarrow" @click="toMerPage"></view>
    </view>
  </view>
</template>

<script>
import svipPrice from '@/components/svip-price.vue';
import { mapState } from "vuex";
import { getDistanceInMeters } from "@/utils/location";
import { getProductPromotionType } from "@/utils/product.js";
import { buildGoodDetailUrl } from "@/libs/order";
import ActivityLabelList from '@/components/good/activity-label-list.vue';
export default {
  name: "goodInfo",
  components: {
    svipPrice,
    ActivityLabelList
  },
  inject: ["parentMerId"],
  props: {
    good: Object,
    dataConfig: Object,
    visible: Object
  },
	methods: {
		handleToProductPage() {
			uni.navigateTo({
				url: buildGoodDetailUrl(this.good)
			});
		},
		// 跳转到商城主页
		toMerPage() {
			uni.navigateTo({
				url:`/pages/store/home/index?id=${this.good.merchant.mer_id}`
			});
		}
  },
  filters: {
    formatReplyCount(count) {
      if (count < 10000) return count;
      return parseInt(count / 10000) + "万+";
    }
  },
  computed: {
    ...mapState({
      location: state => state.location.location,
      viewColor: state => state.app.viewColor
    }),
    promotionType() {
      return getProductPromotionType(this.good.product);
    },
    themeColor() {
      if (this.dataConfig.toneConfig.tabVal === 0) {
        var match = this.viewColor.match(/--view-theme:\s*([^;]+)/);
        return match ? match[1].trim() : '#E93323';
      }
      return '';
    },
    distance() {
      if (this.good.merchant && this.location) {
        const { lat, long } = this.good.merchant;
        const distance = getDistanceInMeters(this.location, { 
          latitude: Number(lat),
          longitude: Number(long)
        }) / 1000;
        return distance.toFixed(2);
      }

      return null;
    },
    isStoreInfoVisible() {
      return !this.parentMerId;
    }
  }
}
</script>

<style scoped lang="scss">
.good-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;

  .good-name {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  .good-promotion-type {
    background-color: var(--view-theme);
    border: 1px solid var(--view-theme);
    color: #fff;
  }

  .good-name-content {
    line-height: 28px;
    flex: 1;
  }

  .good-price-info {
    color: var(--good-price-color);
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: auto;
  }

  .good-sale-score {
    display: flex;
    margin-top: auto;
    font-size: 11px;
    gap: .5em;
    color: #666;
    .good-score {
      color: var(--good-score-color, inherit);
    }

    .good-sale {
      color: var(--good-sale-color, inherit);
    }
  }

  .good-store-info {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #666;
    margin-top: 12rpx;

    .store-distance {
      margin-right: 6rpx;
    }

    .store-name {
      color: #282828;
      margin-right: 6rpx;
    }

    .iconfont {
      color: #282828;
      font-size: 8px;
    }
  }
}
</style>
