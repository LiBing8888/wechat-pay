<template>
	<view v-if="hostProduct.length>0" class="pad20">
		<view class='recommend'>
			<view class="common-hd">
				<view class="title" :style="{ 'background-image': `url(${domain}/static/images/index-title.png)`}">为你推荐</view>
			</view>
			<view class='recommendList' :class="indexP?'on':''">
				<WaterfallsFlow :wfList='hostProduct' :addCart="true" @itemTap="goDetail" @addCat="selecAttr" :type="0" />
			</view>
		</view>
		<!-- 组件 -->
		<productWindow :attr="attr" :isShow='true' :iSplus='1' :destri="0" :isList="true" :isTab="isTab" :isCustom="isCustom" @myevent="onMyEvent" @ChangeAttr="ChangeAttr" @ChangeCartNum="ChangeCartNum"
		 @attrVal="attrVal" @goCat="goCat" @iptCartNum="iptCartNum" id='product-window' :payLimit="pay_limit" :maxCount="max_count" :minCount="min_count" :svipPrice="svipPrice" :image="storeInfo.image"></productWindow>
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
	import {mapGetters} from "vuex";
	import { goShopDetail } from '@/libs/order.js';
	import {initiateAssistApi} from '@/api/activity.js';
	import {toLogin} from '@/libs/login.js';
	import WaterfallsFlow from '@/components/WaterfallsFlow/WaterfallsFlow.vue';
	import { HTTP_REQUEST_URL } from '@/config/app';
	import productWindow from '@/components/productWindow';
	import util from '@/utils/util.js';
	import cartMixin from "@/mixins/cart";
	export default {
		components:{WaterfallsFlow, productWindow},
		computed: mapGetters(['uid']),
		mixins: [cartMixin],
		props: {
			hostProduct: {
				type: Array,
				default: function() {
					return [];
				}
			},
			indexP:{
				type: Boolean,
				default: false
			},
			isLogin:{
				type: Boolean,
				default: false
			},
			isTab: {
				type: Boolean,
				default: false
			},
			isCart: {
				type: Boolean,
				default: false
			},
			isCustom: {
				type: Boolean,
				default: () => false
			}
		},
		data() {
			return {
				domain: HTTP_REQUEST_URL,
				max_count: 0,
				min_count: 0,
				pay_limit: 1,
				svipData: {},
				svipPrice: false,
				attr: {
					cartAttr: false,
					productAttr: [],
					productSelect: {}
				},
				storeInfo: {},
				cart_num: 1, //购买数量
				isOpen: false, //是否打开属性组件
				selectedArr: [],
				productValue: [], //系统属性
				attrValue: "",
				uniqueValue: "",
			};
		},
		mounted() {

		},
		watch: {

		},
		onPullDownRefresh(){
			// 模拟上拉刷新
			setTimeout(()=>{
				const newList = this.hostProduct.reverse();
				this.hostProduct = newList;
				uni.stopPullDownRefresh();
			},500)
		},
		methods: {
			goDetail(item){
				if(item.cate_hot == 1){
					uni.navigateTo({
						url: '/pages/goods_recommend/index?id=' + item.product_id
					});
				}else{
					goShopDetail(item, this.uid).then(res => {
						if (this.isLogin) {
							initiateAssistApi(item.activity_id).then(res => {
								let id = res.data.product_assist_set_id;
								uni.hideLoading();
								uni.navigateTo({
									url: '/pages/activity/assist_detail/index?id=' + id
								});
							}).catch((err) => {
								uni.showToast({
									title: err,
									icon: 'none'
								})
							});
						} else {
							toLogin();
						}
					})
				}
			},
			onMyEvent: function() {
				this.$set(this.attr, 'cartAttr', false);
				this.$set(this, 'isOpen', false);
			},
			attrVal(val) {
				this.$set(this.attr.productAttr[val.indexw], 'index', this.attr.productAttr[val.indexw].attr_values[val.indexn]);
			},
		}
	}
</script>

<style scoped lang="scss">
	.common-hd {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 118rpx;
		.title {
			padding: 0 80rpx;
			font-size: 34rpx;
			color: $theme-color;
			font-weight: bold;
			background-repeat: no-repeat;
			background-size: 100% auto;
			background-position: left center;
		}
	}
	.recommend .recommendList {
		min-height: 100rpx;
	}
	.recommend .recommendList.on{
		padding: 0;
	}
	/deep/.looming-gray{
		border-radius: 16rpx 16rpx 0 0;
	}
</style>
