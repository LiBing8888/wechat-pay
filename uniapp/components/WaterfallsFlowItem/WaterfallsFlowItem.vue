<template>
  <view v-if="type == 0" class="wf-item-page wf-page0" :style="viewColor">
		<view class='pictrue relative'>
			<easy-loadimage
			mode="widthFix"
			:image-src="item.image"
			:borderSrc="item.border_pic"
			width="100%"
			borderRadius="16rpx 16rpx 0 0"></easy-loadimage>
			<view v-if="item.stock == 0" class="sell_out abs-center flex-center text--w111-fff fs-30">已售罄</view>
		</view>
		<view class="px-20">
			<view v-if="item.distance" class="mt-16">
				<MerDistanceInfo :info="item" />
			</view>
			<view class='fs-28 line2 mt-20 mb-16'>{{item.store_name}}</view>
			<ActivityLabelList :labels="item.product.activity_labels" v-if="item.product.activity_labels.length" :limit="3" />
			<view class="flex-y-center mt-20">
				<view class='text-theme'>
					<priceFormat :price="item.price" weight intSize="40" floatSize="26" labelSize="26"></priceFormat>
				</view>
			</view>
			<view v-if="item.show_svip_info && item.show_svip_info.show_svip_price && item.svip_price" class="acea-row row-middle svip">
				<text class='vip-money'>¥{{item.svip_price}}</text>
				<view class="vipImg">
					<image :src="`${domain}/static/images/svip.png`" class="vip-img"></image>
				</view>
			</view>
		</view>
		<view v-if="addCart && item.product_type != 3" class="add-cart acea-row row-middle row-center" @click.stop='addCat(item)'>
			<text class="iconfont icon-ic_ShoppingCart1"></text>
		</view>
  </view>
	<view v-else-if="type == 1" class="wf-page1" :style="viewColor">
		<view class='pictrue relative'>
			<easy-loadimage
			mode="widthFix"
			:image-src="item.image"
			:borderSrc="item.border_pic"
			width="100%"
			borderRadius="16rpx 16rpx 0 0"></easy-loadimage>
			<view v-if="item.stock == 0" class="sell_out abs-center flex-center text--w111-fff fs-30">已售罄</view>
		</view>
		<view class='text'>
			<view v-if="item.distance" class="mt-16">
				<MerDistanceInfo :info="item" />
			</view>
			<view class='fs-26 line1 mb-20'>{{item.store_name}}</view>
			<ActivityLabelList :labels="item.product.activity_labels" v-if="item.product.activity_labels.length" :limit="3" />
			<view class='flex-y-center mt-20 text-theme'>
				<priceFormat :price="item.price" weight intSize="40" floatSize="26" labelSize="26"></priceFormat>
			</view>
			<view v-if="item.show_svip_info&&item.show_svip_info.show_svip && item.show_svip_info.show_svip_price" class="acea-row row-middle svip">
				<text class='vip-money'>¥{{item.svip_price}}</text>
				<view class="vipImg">
					<image :src="`${domain}/static/images/svip.png`" class="vip-img"></image>
				</view>
			</view>
			<view class="mt-16 fs-22 text--w111-666">{{item.rate}}评分 {{item.reply_count}}条评论</view>
			<view class="flex-y-center fs-22 text--w111-666 mt-6" v-if="item.merchant" @click.stop="goShop(item.merchant.mer_id)">
				<text class="line1 max-200">{{item.merchant.mer_name}}</text>
				<view class="flex-y-center ml-12 text--w111-282828" v-if="isStore != '1'">
					进店
					<text class="iconfont icon-ic_rightarrow fs-20 mt-4"></text>
				</view>
			</view>
			<view v-if="addCart && item.product_type != 3" class="add-cart acea-row row-middle row-center" @click.stop='addCat(item)'>
				<text class="iconfont icon-ic_ShoppingCart1"></text>
			</view>
		</view>
	</view>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016-2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import MerDistanceInfo from '@/components/MerDistanceInfo.vue';
import {mapGetters} from "vuex";
import { HTTP_REQUEST_URL } from '@/config/app';
import ActivityLabelList from '@/components/good/activity-label-list.vue';
import easyLoadimage from '@/components/easyLoadimage/easyLoadimage.vue'
export default {
	components:{
		MerDistanceInfo,
		ActivityLabelList,
		easyLoadimage
	},
	computed: {
		...mapGetters(['viewColor'])
	},
	props: {
		item: {
			type: Object,
			require: true
		},
		type: {
			type: Number,
			default: 0
		},
		isStore: {
			type: [String, Number],
			default: '1'
		},
		addCart: {
			type: Boolean,
			require: false
		},
		isLogin: {
			type: Boolean,
			require: false
		}
  },
	data(){
		return {
			domain: HTTP_REQUEST_URL,
		}
	},
	methods: {
		goShop(id) {
			this.$emit('goShop', id);
		},
		authOpen(){
			this.$emit('authOpen');
		},
		followToggle(item){
			this.$emit('followToggle', item);
		},
		addCat(item){
			this.$emit('addCat', item);
		}
	}
}

</script>
<style lang="scss" scoped>
.wf-item-page {
	background: #fff;
	overflow: hidden;
	border-radius: 24rpx;
	padding-bottom: 20rpx;
}
.wf-page0 .coupon{
	background:rgba(255,248,247,1);
	border:1px solid rgba(233,51,35,1);
	border-radius:4rpx;
	font-size:20rpx;
	margin-left: 18rpx;
	padding: 1rpx 4rpx;
}

.svip{
	margin: 5rpx 0 15rpx;
}
.vip-money {
	color: #282828;
	font-size: 22rpx;
	margin-left: 6rpx;
	font-weight: bold;
}
.vipImg {
	width: 65rpx;
	height: 28rpx;
	margin-left: 4rpx;
	.vip-img {
		width: 100%;
		height: 100%;
		display: block;
	}
}
.relative{
	position: relative;
}
.sell_out {
	width: 150rpx;
	height: 150rpx;
	border-radius: 50%;
	background: rgba(0,0,0,.6);
	&::before{
		content: "";
		display: block;
		width: 140rpx;
		height: 140rpx;
		border-radius: 100%;
		border: 1px dashed #fff;
		position: absolute;
		top: 5rpx;
		left: 5rpx;
	}
}
.wf-page1 .text {
	padding: 20rpx 17rpx 26rpx 17rpx;
	font-size: 30rpx;
}
.max-200{
	max-width: 200rpx;
}
</style>
