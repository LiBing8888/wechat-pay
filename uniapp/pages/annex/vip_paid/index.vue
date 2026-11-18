<template>
  <!-- svip会员模块 -->
	<BaseContainer>
		<view class="card-section" :style="{ backgroundImage: `url(${domain}/static/images/vip-bg.png)` }">
			<view class="header-card" :style="'background-image: url('+domain+'/static/images/header-card.png)'">
				<view class="acea-row row-middle">
					<image class="image" :src="userInfo.avatar || '/static/images/f.png'"></image>
					<view class="text">
						<view class="name">{{userInfo.nickname || ''}}</view>
						<view>开通享六大特权，省钱又省心</view>
					</view>
				</view>
			</view>
			<view class="right-section" :style="'background-image: url('+domain+'/static/images/right-section.png)'">
				<view class="section-hd acea-row row-center-wrapper">
					<view class="title acea-row row-center row-bottom">开通会员尊享权</view>
				</view>
				<view class="section-bd acea-row">
					<view v-for="item in memberRights" :key="item.id" class="item" @click="goUrl(item.link)">
						<image class="pic" :src="item.pic"></image>
						<view class="text">
							<view class="name line1">{{item.name}}</view>
							<view class="text_info line1">{{item.info}}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="type-section" id="card">
			<view class="title_bd">
				<view class="bold">会员套餐</view>
			</view>
			<scroll-view class="scroll" scroll-x="true">
				<view v-for="(item,index) in memberType" :key="item.group_data_id" class="item" :class="{on: index === type}"
					@click="checkType(item,index)">
					<view class="title line1">{{item.value && item.value.svip_name}}</view>
					<view class="new">
						<priceFormat :price="item.value.price | moneyFormat" weight intSize="50" floatSize="50" labelSize="34"></priceFormat>
					</view>
					<view class="old">¥{{item.value.cost_price | moneyFormat}}</view>
				</view>
			</scroll-view>
			<view v-if="memberType.length>0" class="buy" @click="pay">{{svip_type == 1 ? '立即体验' : '立即开通'}}</view>
			<view v-if="memberExplain" class="agree flex-center">
				<view class="agree-btn flex-center" :class="{'on': isAgree}" @click="isAgree = !isAgree">
					<text class="iconfont icon-ic_complete" v-if="isAgree"></text>
				</view>
				<view class="link">
					请查看并同意
					<navigator url="/pages/annex/vip_clause/index" hover-class="none" class="mark">
						《会员用户协议》
					</navigator>
				</view>
			</view>
		</view>
		<view v-if="goodsList.length" class="goods-section">
			<view class="section-hd">会员专享价 <text>会员购买享超低价</text></view>
			<view class="section-bd acea-row">
				<view v-for="item in goodsList" :key="item.product_id" class="item" @click="goDetail(item.product_id)">
          <image class="image" :src="item.image"></image>
					<view class="name">{{item.store_name}}</view>
					<view class="svip-price">
						<priceFormat :price="item.is_svip_price" weight intSize="28" floatSize="20" labelSize="20"></priceFormat>
						<image :src="`${domain}/static/images/svip.png`"></image>
					</view>
					<view class="shop-price">商城价：¥{{item.price}}</view>
				</view>
			</view>
		</view>
		<payment :payMode="payMode" :pay_close="pay_close" :is-call="true" @onChangeFun="onChangeFun"
			:order_id="pay_order_id" :totalPrice="totalPrice"></payment>
	</BaseContainer>
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
	let app = getApp();
	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import payment from '@/components/payment';
	import { mapGetters } from "vuex";
	import { memberCard, memberEquity, memberCardCreate, groomList } from '@/api/user.js';
	import { orderOfflinePayType } from '@/api/order.js';
	import { toLogin } from '@/libs/login.js';
	import { openPaySubscribe } from '@/utils/SubscribeMessage.js';
	import dayjs from '@/plugin/dayjs/dayjs.min.js';
	import { HTTP_REQUEST_URL } from '@/config/app';
	import { TABBAR_PAGE_PATHS } from '@/constants/pages';
	import BaseContainer from '@/components/common/base_container.vue';
	import payMixin from "@/mixins/pay";
	export default {
		mixins: [payMixin],
		components: {
			payment,
			BaseContainer,
		},
		filters: {
			dateFormat: function(value) {
				return dayjs(value * 1000).format('YYYY-MM-DD');
			},
			moneyFormat: function(value) {
				return parseFloat(value);
			}
		},
		data() {
			return {
				sysHeight: sysHeight,
				domain: HTTP_REQUEST_URL,
				memberType: [],
				userInfo: {},
				memberRights: [],
				memberExplain: [],
				memberCoupons: [],
				isGetFree: null,
				account: '',
				password: '',
				goodsList: [],
				pay_order_id: '',
				isAgree: false,
				payMode: [{
					name: '微信支付',
					icon: 'icon-a-ic_wechatpay',
					// #ifdef H5
					value: this.$wechat.isWeixin() ? 'weixin' : 'h5',
					// #endif
					// #ifdef MP
					value: 'routine',
					// #endif
					// #ifdef APP-PLUS
					value: 'weixin',
					// #endif
					title: '微信快捷支付',
					payStatus: app.globalData.pay_weixin_open
					}
					// #ifdef H5 ||APP-PLUS
					,
					{
					name: '支付宝支付',
					icon: 'icon-a-ic_alipay',
					// #ifdef H5 || APP-PLUS
					value: 'alipay',
					// #endif
					// #ifdef MP
					value: 'alipayQr',
					// #endif
					title: '支付宝支付',
					payStatus: app.globalData.alipay_open
					}
					// #endif
				],
				pay_close: false,
				totalPrice: '0',
				page: 1,
				limit: 15,
				finished: false,
				loading: false,
				memberEndTime: '',
				// #ifdef H5
				isWeixin: this.$wechat.isWeixin(),
				// #endif
				type: 0,
				svipDef: null,
				svip_type: 0
			}
		},
		watch: {},
		computed: mapGetters(['isLogin']),
		onLoad() {
			if (this.isLogin) {
				this.memberEquity();
				this.getMemberCard();
				this.groomList();
			} else {
				toLogin()
			}
		},
		onShow(){
			uni.removeStorageSync('form_type_cart');
		},
		onReachBottom() {
			this.groomList();
		},
		methods: {
			pay() {
				if (!this.isAgree) {
					return this.$util.Tips({
						title: '请查看并同意会员用户协议',
					});
				}
				if (this.totalPrice == 0) {
					this.createMemberCard('weixin');
				} else {
					this.pay_close = true;
				}
			},
			payClose: function() {
				this.pay_close = false;
			},
			goDetail(id) {
				uni.navigateTo({
					url: `/pages/goods_details/index?id=${id}`
				});
			},
			goUrl(url){
				if(url.indexOf("http") != -1){
					// #ifdef H5
					location.href = url
					// #endif
				}else{
					if(TABBAR_PAGE_PATHS.includes(url)){
						uni.switchTab({
							url
						})
					}else{
						uni.navigateTo({
							url
						})
					}
				}
			},
			// 付费会员权益
			memberEquity() {
				memberEquity().then(res => {
					this.memberRights = res.data.interests;
					this.userInfo = res.data.user;
					if(res.data.user.is_svip > 0){
						uni.navigateTo({
							url: '/pages/annex/vip_center/index'
						});
					}
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
			},
			// 付费会员数据
			getMemberCard() {
				uni.showLoading({
					title: '正在加载…'
				});
				memberCard().then(res => {
					uni.hideLoading();
					this.memberType = res.data.list;
					this.svipDef = res.data.def;
					this.svip_type = res.data.def.svip_type;
					this.totalPrice = res.data.def.price.toString();
					this.pay_order_id = res.data.def.group_data_id.toString();
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
			},
			groomList() {
				if (this.finished || this.loading) {
					return;
				}
				this.loading = true
				groomList({
					page: this.page,
					limit: this.limit
				}).then(res => {
					this.goodsList = this.goodsList.concat(res.data.list);
					this.finished = res.data.list.length < this.limit;
					this.loading = false;
					this.page += 1;
				}).catch(err => {

				});
			},
			checkType(svip,index) {
				this.type = index;
				this.svipDef = svip.value;
				this.svip_type = svip.value.svip_type;
				this.pay_order_id = svip.group_data_id;
				this.totalPrice = svip.value.price.toString();
			},
			payCheck: function(type) {
				this.createMemberCard(type);
			},
			// 立即购买
			createMemberCard(type) {
				uni.showLoading({
					title: '正在加载…'
				});
				let query = {
					pay_type: type,
					// #ifdef H5
					return_url: location.port ? location.protocol + '//' + location.hostname + ':' + location.port +
						'/pages/annex/vip_paid/index' : location.protocol + '//' + location.hostname +
						'/pages/annex/vip_paid/index'
					// #endif
				};
				let group_id = this.pay_order_id
				// #ifdef MP
				openPaySubscribe().then(() => {
					memberCardCreate(group_id,query).then(res => {
						if (parseFloat(this.totalPrice) > 0) {
							this.callPay(res);
						} else {
							uni.hideLoading();
							return this.$util.Tips({
								title: '开通成功',
							}, () => {
								uni.navigateTo({
									url: '/pages/annex/vip_center/index'
								})
							});
						}
					}).catch(err => {
						uni.hideLoading();
						uni.showToast({
							title: err,
							icon: 'none'
						});
					});
				});
				// #endif
				// #ifndef MP
				memberCardCreate(group_id,query).then(res => {
					if (parseFloat(this.totalPrice) > 0) {
						this.callPay(res);
					} else {
						uni.hideLoading();
						return this.$util.Tips({
							title: '开通成功',
						}, () => {
							uni.navigateTo({
								url: '/pages/annex/vip_center/index'
							})
						});
					}
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
				// #endif
			},
		},
		// 滚动监听
		onPageScroll(e) {}
	}
</script>

<style lang="scss" scoped>
	.card-section {
		padding: 64rpx 0 50rpx;
		background-repeat: no-repeat;
		background-position: top left;
		background-size: cover;
		background-color: #2f2e35;
		.header-card{
			width: 680rpx;
			height: 200rpx;
			margin: 0 auto;
			background-repeat: no-repeat;
			background-size: cover;
			padding: 33rpx 40rpx;
		}
		.image {
			width:76rpx;
			height: 76rpx;
			border-radius: 50%;
			border: 3rpx solid #fff;
			margin-right: 20rpx;
		}
		.text {
			flex: 1;
			font-size: 22rpx;
			line-height: 30rpx;
			color: #89735B;
		}
		.name {
			margin-bottom: 2rpx;
			font-weight: bold;
			font-size: 30rpx;
			line-height: 42rpx;
			color: #865622;
		}
		.info {
			margin-top: 74rpx;
			font-size: 24rpx;
			color: #865622;
		}
	}
	.sys-head .bg {
		background: linear-gradient( 180deg, #121019 0%, #33333A 100%);
	}
	.right-section {
		width: 690rpx;
		height: 520rpx;
		margin: 0 auto;
		background-size: cover;
		background-repeat: no-repeat;
		margin-top: -60rpx;
		.section-hd {
			padding-top: 34rpx;
			padding-bottom: 34rpx;
			.title {
				width: 543rpx;
				font-size: 28rpx;
				line-height: 1.1;
				color: #FFEED2;
			}
			.iconfont {
				font-size: 34rpx;
				color: #89735B;
			}
		}
		.section-bd {
			padding: 35rpx 30rpx 15rpx;
			.item {
				width: 210rpx;
				margin-bottom: 30rpx;
				text-align: center;
			}
			.pic {
				width: 80rpx;
				height: 80rpx;
				border-radius: 100%;
			}
			.text {
				flex: 1;
				overflow: hidden;
				white-space: nowrap;
				font-size: 20rpx;
				line-height: 33rpx;
				color: #92846D;
			}
			.name {
				margin-bottom: 2rpx;
				font-size: 24rpx;
				line-height: 37rpx;
				color: #F4D7A3;
			}
		}
	}
	.type-section {
		position: relative;
		top: -20rpx;
		border-radius: 24rpx 24rpx 0 0;
		background-color: #FFFFFF;
		padding: 0 30rpx 50rpx;
		.title_bd {
			padding: 26rpx 40rpx 0 0;
			font-size: 24rpx;
			color: #797979;
			.bold {
				display: inline-block;
				margin-right: 14rpx;
				font-weight: bold;
				font-size: 32rpx;
				line-height: 45rpx;
				color: #333333;
				+view {
					display: inline-block;
				}
			}
			.time {
				margin-left: 14rpx;
				font-size: 24rpx;
				color: #AE5A2A;
			}
		}
		.scroll {
			white-space: nowrap;
		}
		.item {
			display: inline-flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 210rpx;
			height: 240rpx;
			border-radius: 12rpx;
			margin: 32rpx 20rpx 30rpx 0;
			border: 1px solid #CFCFCF;
			line-height: 42rpx;
			&:last-child {
				margin-right: 0;
			}
			&.on {
				border: 3rpx solid #FCC282;
				background-color: #FEF7EC;
				.new {
					color: #DBAA4D;
				}
			}
			.title{
				color: #282828;
				font-weight: bold;
				font-size: 30rpx;
				width: 180rpx;
				text-align: center;
			}
		}
		.new {
			margin-top: 22rpx;
			font-weight: 600;
			font-size: 34rpx;
			color: #E7BE7D;
			.num {
				font-size: 48rpx;
				line-height: 48rpx;
			}
		}
		.old {
			margin-top: 13rpx;
			text-decoration: line-through;
			font-size: 24rpx;
			color: #999999;
		}
		.info {
			margin-top: 13rpx;
			font-size: 24rpx;
		}
		.agree {
			font-size: 22rpx;
			text-align: center;
			color: #999999;
			margin-top: 30rpx;

			.agree-btn {
				width: 32rpx;
				height: 32rpx;
				border-radius: 50%;
				border: 1px solid #CFCFCF;
				margin-right: 10rpx;

				.icon-ic_complete {
					font-size: 24rpx;
					color: #fff;
				}

				&.on {
					border: none;
					background-color: var(--view-theme);
				}
			}
			.mark {
				display: inline-block;
				color: #AE5A2A;
			}
		}
		.buy {
			height: 80rpx;
			border-radius: 12rpx;
			margin-top: 20rpx;
			background: linear-gradient(270deg, #E5BA62 0%, #ECCA7F 51%, #F3D99B 100%);
			font-size: 30rpx;
			font-weight: bold;
			line-height: 80rpx;
			text-align: center;
			color: #8A602E;
			border-radius:: 44rpx;
		}
		.cash {
			padding-top: 26rpx;
			padding-bottom: 29rpx;
			font-size: 28rpx;
			text-align: center;
			color: #754E19;
		}
	}
	.goods-section {
		margin-top: -20rpx;
		background: #ffffff left top/414px 215px no-repeat;
		background-image: linear-gradient(180deg, #FFF7E9 0%, #FFFFFF 100%);
		padding-bottom: calc(0rpx + constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
		padding-bottom: calc(0rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
		.section-hd {
			padding: 26rpx 30rpx 0;
			font-weight: bold;
			font-size: 32rpx;
			line-height: 45rpx;
			color: #333333;
			text {
				color: #BCA376;
				font-size: 24rpx;
				font-weight: normal;
				margin-left: 15rpx;
			}
		}
		.section-bd {
			padding: 0 30rpx 0 7rpx;
			margin-top: 26rpx;
			.item {
				width: 215rpx;
				padding-bottom: 24rpx;
				margin-left: 23rpx;
			}
			.image {
				width: 215rpx;
				height: 215rpx;
				border-radius: 16rpx;
			}
			.name {
				margin-top: 10rpx;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				font-size: 26rpx;
				line-height: 37rpx;
				color: #282828;
			}
			.text_info{
				color: #92846D;
			}
			.svip-price {
				margin-top: 6rpx;
				font-size: 26rpx;
				color: #282828;
				font-weight: bold;
				image {
					width: 65rpx;
					height: 28rpx;
					margin-left: 6rpx;
					position:  relative;
					top: 5rpx;
				}
			}
			.shop-price {
				margin-top: 4rpx;
				font-size: 20rpx;
				color: #666666;
			}
		}
	}
</style>
