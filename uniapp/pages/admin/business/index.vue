<template>
	<BaseContainer>
		<view class="page-wrapper">
			<view class="headerBg">
				<NavBar titleText="工作台" textSize="34rpx" iconColor="#ffffff" textColor="#ffffff" :isScrolling="false" showBack></NavBar>
				<view class="inner"></view>
			</view>
			<view class="page-content">
				<view :style="[ptSafe]">
					<view class="h-80" style="width: 300px;margin: 0 auto;"></view>
				</view>
				<view class="header acea-row row-middle">
					<image :src="userInfo.avatar" class="avatar"></image>
					<view class="text-box">
						<view class="flex-y-center">
							<text class="fs-32 fw-500 lh-44rpx pr-16 nickname">{{ userInfo.nickname }}</text>
							<view class="h-42 flex-center fs-24 text--w111-fff pl-16 pr-14 rd-30rpx b-f mr-16"
								v-if="isShowMer" @tap="changeTips">切换店铺
								<text class="iconfont icon-ic_downarrow fs-22 ml-4"></text>
							</view>
							<RoleToggle use-theme-color />
						</view>
						<view class="pt-4 fs-22 lh-30rpx">{{ userInfo.phone || "" }}</view>
					</view>
					<!-- #ifdef MP-WEIXIN || APP-PLUS -->
					<navigator :url="cancellationUrl" hover-class="none">
						<text class="iconfont icon-ic_Scan fs-40 text--w111-fff"></text>
					</navigator>
					<!-- #endif -->
				</view>
				<view class="today">
					<view class="title-box">
						<navigator class="link" :url="orderPageUrl" hover-class="none">
							今日销售额(元)<text class="iconfont icon-ic_rightarrow"></text>
						</navigator>
						<view class="money semiBold fw-bold">{{orderData.today.payPrice}}</view>
					</view>
					<view class="acea-row pt-54">
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.today.payPrice }}</view>
							<view class="">今日成交额</view>
						</view>
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.yesterday.payPrice }}</view>
							<view class="">昨日成交额</view>
						</view>
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.month.payPrice }}</view>
							<view class="">本月成交额</view>
						</view>
					</view>
					<view class="acea-row pt-54 pb-40">
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.today.orderNum }}</view>
							<view class="">今日订单数</view>
						</view>
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.yesterday.orderNum }}</view>
							<view class="">昨日订单数</view>
						</view>
						<view class="item">
							<view class="num fw-500 semiBold">{{ orderData.month.orderNum }}</view>
							<view class="">本月订单数</view>
						</view>
					</view>
				</view>
				<view class="goods grid-column-4 rd-24rpx bg--w111-fff mt-20">
					<navigator :url="`/pages/admin/orderList/index?types=2&merId=${service.mer_id}`" hover-class="none" class="w-full flex-col flex-center pt-28 pb-26rpx fs-26">
						<view class="img-box">
							<view class="img">
								<view v-if="census.unshipped" class="num">{{ census.unshipped > 99 ? '99+' : census.unshipped }}</view>
								<image src="../static/admin-work-order1.png" mode=""></image>
							</view>
						</view>
						<view class="pt-12">待发货</view>
					</navigator>
					<navigator :url="`/pages/admin/orderList/index?types=6&merId=${service.mer_id}`" hover-class="none" class="w-full flex-col flex-center pt-28 pb-26rpx fs-26">
						<view class="img-box">
							<view class="img">
								<view v-if="census.refund" class="num">{{ census.refund > 99 ? '99+' : census.refund }}</view>
								<image src="../static/admin-work-order2.png" mode=""></image>
							</view>
						</view>
						<view class="pt-12">待售后</view>
					</navigator>
					<navigator :url="`/pages/admin/orderList/index?types=3&merId=${service.mer_id}`" hover-class="none" class="w-full flex-col flex-center pt-28 pb-26rpx fs-26">
						<view class="img-box">
							<view class="img">
								<view v-if="census.untake" class="num">{{ census.untake > 99 ? '99+' : census.untake }}</view>
								<image src="../static/admin-work-order3.png" mode=""></image>
							</view>
						</view>
						<view class="pt-12">待收货</view>
					</navigator>
					<navigator :url="`/pages/admin/orderList/index?types=1&merId=${service.mer_id}`" hover-class="none" class="w-full flex-col flex-center pt-28 pb-26rpx fs-26">
						<view class="img-box">
							<view class="img">
								<view v-if="census.unpaid" class="num">{{ census.unpaid }}</view>
								<image src="../static/admin-work-order4.png" mode=""></image>
							</view>
						</view>
						<view class="pt-12">待支付</view>
					</navigator>
				</view>
				<view class="pt-34 pb-40 rd-24rpx mt-20 mb-20 bg--w111-fff">
					<view class="pl-28 fs-30 fw-500 lh-44rpx">店铺管理</view>
					<view class="grid-column-4" v-if="service && service.mer_id">
						<navigator class="w-full py-24 flex-col flex-center" :url="`/pages/product/list/index?mer_id=${service.mer_id}`" hover-class="none">
							<image class="w-48 h-48" src="../static/admin-work-menu1.png" mode=""></image>
							<view class="pt-20">商品管理</view>
						</navigator>
						<navigator class="w-full py-24 flex-col flex-center" :url="`/pages/admin/orderList/index?types=2&merId=${service.mer_id}`" hover-class="none">
							<image class="w-48 h-48" src="../static/admin-work-menu2.png" mode=""></image>
							<view class="pt-20">订单管理</view>
						</navigator>
						<navigator class="w-full py-24 flex-col flex-center" :url="`/pages/admin/orderList/index?types=6&merId=${service.mer_id}`" hover-class="none">
							<image class="w-48 h-48" src="../static/admin-work-menu4.png" mode=""></image>
							<view class="pt-20">售后维权</view>
						</navigator>
						<navigator class="w-full py-24 flex-col flex-center"
							:url="cancellationUrl" hover-class="none">
							<image class="w-48 h-48" src="../static/admin-work-menu3.png" mode=""></image>
							<view class="pt-20">订单核销</view>
						</navigator>
						<view class="w-full py-24 flex-col flex-center" @tap="serviceChat">
							<image class="w-48 h-48" src="../static/footer5-1.png" mode=""></image>
							<view class="pt-20">客服聊天</view>
						</view>
					</view>
				</view>
			<shopList ref="shopList" @changeStoreClose="changeClose" @getService="getService" :is_sys='is_sys'></shopList>
		</view>
	</view>
	</BaseContainer>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import shopList from '../components/shopList';
import BaseContainer from '@/components/common/base_container.vue';
import NavBar from '../components/NavBar.vue';
import { mapGetters } from "vuex";
import {HTTP_REQUEST_URL} from '@/config/app.js';
import RoleToggle from '@/components/role-toggle.vue';
import { orderStatistics } from "@/api/admin";
import baseMoney from "@/components/BaseMoney.vue"
export default {
	name: 'business',
	components: {
		shopList,
		BaseContainer,
		NavBar,
		RoleToggle,
		baseMoney
	},
	data() {
		return {
			is_sys: '',
			downStatus: false,
			service: {
				mer_id: 0
			},
			census: {},
			orderData: {
			  today: {},
			  yesterday: {},
			  month: {}
			},
			isShowMer: false
		}
	},
	computed: {
		...mapGetters(["userInfo"]),
		cancellationUrl() {
			return `/pages/admin/order_cancellation/index?mer_id=${this.service.mer_id}`;
		},
		orderPageUrl() {
			return '/pages/admin/order/index?mer_id=' + this.service.mer_id;
		},
		list() {
			if (!this.service) return [];
			const merId = this.service.mer_id;
			const list = [];
			if (this.service.is_verify) {
				list.push({
					title: '订单核销',
					url: this.cancellationUrl,
					icon: 'iconfont icon-dingdanhexiao'
				});
			}
			list.push({
				type: 'customer',
				title: '客服记录',
				url: '/pages/chat/customer_list/index?type=1&mer_id=' + merId,
				icon: 'iconfont icon-kefujilu'
			});
			if (this.service.customer) {
				list.push({
					title: '订单管理',
					url: this.orderPageUrl,
					icon: 'iconfont icon-dingdanguanli'
				});
			}
			if (this.service.is_goods) {
				list.push({
					title: '商品管理',
					url: '/pages/product/list/index?mer_id=' + merId,
					icon: 'iconfont icon-shangjiaguanli'
				});
			}
			return list;
		},
		ptSafe(){
			return {
				'padding-top': uni.getWindowInfo().statusBarHeight + 'px'
			}
		}
	},
	watch:{
		service(val){
			this.getOrderStatistics(this.service.mer_id);
		}
	},
	onLoad: function (options) {
		this.$store.dispatch("USERINFO");
		this.is_sys = options.is_sys;
		this.getStoreList({ is_sys: this.is_sys });
		uni.setNavigationBarTitle({
			title: this.is_sys ? '平台管理' : '商家管理'
		})
	},
	methods: {
		getOrderStatistics(mer_id) {
		    let that = this;
		    orderStatistics(mer_id).then(res=>{
				that.census = res.data.order;
				that.orderData = res.data.data;
			})
		},
		getStoreList (data) {
			this.$nextTick(() => {
				this.$refs.shopList.getStoreList(data);
				setTimeout(()=>{
					let storeList = this.$refs.shopList.storeList;
					if(storeList.length > 1){
						this.isShowMer = true;
					}
				},1000)
			});
		},
		changeTips(data) {
			this.downStatus = !this.downStatus;
			this.$refs.shopList.isShowStore();
		},
		changeClose() {
			this.downStatus = false;
		},
		goNext(item) {
			if (item.type == 'customer' && this.service.status == 0) {
				return this.$util.Tips({
					title: '客服已离线，请开启客服状态！'
				});
			} else {
				uni.navigateTo({
					url: item.url,
				});
			}

		},
		getService(data) {
			this.service = data;
		},
		serviceChat(){
			uni.navigateTo({
				url: `/pages/chat/customer_list/index?type=1&mer_id=${this.service.mer_id}`
			});
		}
	}
}
</script>

<style scoped lang="scss">
.pagebox {
	position: relative;
	overflow: hidden;
	overflow-x: hidden;
}

.page-wrapper {
	position: relative;
	overflow-x: hidden;
	width: 100%;
}

.headerBg {
	position: absolute;
	top: 0;
	left: -25%;
	width: 150%;
	border-bottom-right-radius: 100%;
	border-bottom-left-radius: 100%;
	background: linear-gradient(270deg, $gradient-primary-admin 0%, $primary-admin 100%);
	// background: linear-gradient( 180deg, #2291F8 0%, rgba(34,145,248,0.3) 100%);

	.inner {
		height: 356rpx;
	}
}

.page-content {
	position: relative;
	z-index: 5;
	padding: 0 20rpx;

	.header {
		padding: 22rpx 20rpx 32rpx 12rpx;

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
		}

		.text-box {
			flex: 1;
			padding-left: 16rpx;
			color: #FFFFFF;
			min-width: 0;
		}

		.nickname {
			max-width: 200rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.today {
		border-radius: 24rpx;
		background: #FFFFFF;

		.title-box {
			padding: 40rpx 0 0 40rpx;
		}

		.link {
			display: inline-block;
			vertical-align: middle;
			font-size: 24rpx;
			line-height: 34rpx;
			color: #999999;
		}

		.iconfont {
			margin-left: 4rpx;
			font-size: 24rpx;
		}

		.money {
			margin-top: 16rpx;
			font-size: 56rpx;
			line-height: 56rpx;
			color: #FF7E00;
		}

		.item {
			flex: 1;
			text-align: center;
			font-size: 24rpx;
			line-height: 34rpx;
			color: #999999;
		}
		.pt-54{
			padding-top: 54rpx;
		}
		.pb-40{
			padding-bottom: 40rpx;
		}

		.num {
			margin-bottom: 12rpx;
			font-size: 36rpx;
			line-height: 36rpx;
			color: #333333;
		}
	}

	.goods {
		.img-box {
			position: relative;
			width: 76rpx;
			height: 76rpx;
			border-radius: 50%;
			margin: 0 auto 12rpx;
		}

		.img {
			width: 100%;
			height: 100%;
		}

		.num {
			position: absolute;
			top: -6rpx;
			left: 58rpx;
			z-index: 2;
			min-width: 24rpx;
			height: 24rpx;
			padding: 0 8rpx;
			border-radius: 12rpx;
			background: #FF7E00;
			font-weight: 500;
			font-size: 18rpx;
			line-height: 24rpx;
			color: #FFFFFF;
		}

		image {
			width: 100%;
			height: 100%;
		}
	}
}
.b-f{
	border: 1rpx solid #fff;
}
.pr-16{
	padding-right: 16rpx;
}
.ml-4 {
	margin-right: 4rpx;
}
</style>
