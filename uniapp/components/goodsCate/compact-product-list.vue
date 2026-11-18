<!-- 包含紧凑小图商品的列表 -->
<template>
  <scroll-view class="compact-product-list" scroll-y @scrolltolower="handleScrollToLower" @scroll="handleScroll"
    :bounces="false" enhanced>
    <view class="product-item" v-for="(item, index) in list" :key="index" @click.stop="goProductDetail(item)">
		<easy-loadimage :image-src="item.recommend_image ? item.recommend_image : item.image" 
		width="176rpx" height="176rpx" borderRadius="16rpx"></easy-loadimage>
      <view class="product-body flex-1 flex-col ml-20">
        <view class="product-name line1">{{ item.store_name }}</view>
        <ActivityLabelList :labels="item.product.activity_labels" v-if="item.product.activity_labels.length" :limit="3" />
				<text v-if="item.product_type != 0 && item.product_type != 10" :class="'font_bg-red type'+item.product_type">{{item.product_type == 1 ? "秒杀" : item.product_type == 2 ? "预售" : item.product_type == 3 ? "助力" : item.product_type == 4 ? "拼团" : ""}}</text>
        <view class="product-bottom flex-y-center">
          <priceFormat :price="item.price" weight intSize="40" floatSize="24" labelSize="24"></priceFormat>
          <view class="svip-price-container" v-if="checkShowVipPrice(item)">
            <svip-price :price="item.svip_price"></svip-price>
          </view>

          <view v-if="item.cart && item.cart.cart_id" class="flex-y-center ml-auto">
            <view class="flex-center w-48 h-48 rd-30rpx bg--w111-f5f5f5 text--w111-333"
              :class="{ 'disabled-btn': item.min_qty && item.cart.cart_num == item.min_qty }"
              @tap.stop="handleDesCartNum(item)">
              <text class="iconfont icon-ic_Reduce fs-32"></text>
            </view>
            <view class="fs-30 text--w111-333 px-20" v-if="item.cart && item.cart.cart_id">
              <input v-model="item.cart.cart_num" type="text" maxlength="2" @input="inputClick($event, item)"
                @confirm="setProCartNum($event, item)" class="w-48 text-center" @blur="setProCartNum($event, item)" />
            </view>
            <view class="flex-center w-48 h-48 rd-30rpx bg-theme text--w111-fff" @tap.stop="handleAddCartNum(item)">
              <text class="iconfont icon-ic_increase fs-32"></text>
            </view>
          </view>
          <view class="buy-btn-box flex-center relative ml-auto" @click.stop="addCart(item)" v-else>
            <view class="iconfont icon-ic_ShoppingCart1 fs-30"></view>
          </view>
        </view>
      </view>
    </view>
    <slot />
  </scroll-view>
</template>

<script>
import productListMixin from "./mixins/product-list-mixin";
import HTTP_REQUEST_URL from '@/config/app';
import svipPrice from '@/components/svip-price.vue';
import ActivityLabelList from "@/components/good/activity-label-list.vue";
import easyLoadimage from '@/components/easyLoadimage/easyLoadimage.vue'
export default {
  name: "CompactProductList",
  mixins: [productListMixin],
  components: {
    svipPrice,
    ActivityLabelList,
	easyLoadimage
  },
  methods: {
    checkShowVipPrice(item) {
      // 如果购物车输入框存在，由于容器宽度限制，不显示SVIP价格
      const isCartInputVisible = item.cart && item.cart.cart_id;
      const isVipPriceVisible = item.show_svip_info && item.show_svip_info.show_svip_price && item.svip_price;

      return !isCartInputVisible && isVipPriceVisible;
    },
    getImage(good) {
      const img = good.recommend_image ? good.recommend_image : good.image;
      return img || HTTP_REQUEST_URL + '/static/images/logo_bgh.png';
    },
  }
}
</script>

<style scoped lang="scss">
.compact-product-list {
  padding-top: 12rpx;
  height: 100%;
}
.font_bg-red {
	width: 48rpx;
}
.product-item {
  display: flex;
  padding-inline: 20rpx;

  &+.product-item {
    margin-top: 24rpx;
  }
}

.product-image {
  width: 176rpx;
  height: 176rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.product-body {
  overflow: hidden;
}

.product-name {
  font-size: 28rpx;
  color: #333333;
  line-height: 40rpx;
  margin-bottom: 12rpx;
}

.svip-price-container {
  margin-left: 8rpx;
}

.product-bottom {
  margin-top: auto;
}

.buy-btn-box {
  width: 48rpx;
  height: 48rpx;
  background-color: var(--view-theme);
  border-radius: 50%;
  color: #fff;
}

.ml-auto {
  margin-left: auto;
}

.disabled-btn {
  color: #DEDEDE;
}
</style>
