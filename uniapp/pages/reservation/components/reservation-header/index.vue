<template>
	<view class="reservation-header boder-24">
		<view v-if="reservation_type == 3" class="reservation-type acea-row">
			<view v-for="(item,index) in actualServiceTypeList" :key="index" class="type-name acea-row row-center row-middle" :class="{on : item.type==service_type}" @click="changeType(item)">
				{{item.name}}
				<text v-if="item.type==service_type" class="type_tag" :class="'type_tag'+service_type" :style="{ backgroundImage: `url(${domain}/static/images/type_tag.png)`}"></text>
			</view>
		</view>
		<view class="reservation-address">
			<!--上门服务地址-->
			<view v-if="service_type == 2 && addressInfo" class="acea-row row-between-wrapper">
				<view class="address-info" v-if="addressInfo.real_name" @click="onAddress">
					<view class="address-name">
						<text style="margin-right: 12rpx;">{{addressInfo.real_name}}</text>
						<text>{{addressInfo.phone}}</text>
					</view>
					<view class="address-detail line1">
						{{addressInfo.province}}{{addressInfo.city}}{{addressInfo.district}}{{addressInfo.street || ''}}{{addressInfo.detail}}
					</view>
				</view>
				<navigator v-else :url="addressUrl" hover-class="none" class='addressCon'>
					<view class='setaddress'>设置收货地址</view>
				</navigator>
				<view class="address-more" @click="handleArrowClick">
					<text class="iconfont icon-ic_rightarrow"></text>
				</view>
			</view>
			<!--到店服务地址-->
			<view v-else class="acea-row row-between-wrapper">
				<view class="address-info info-arrive">
					<view class="address-name">
						<text>{{merData.mer_name}}</text>
						<!-- <text>18435762634</text> -->
					</view>
					<view class="address-detail line1">
						{{merData.mer_address}}
					</view>
				</view>
				<view class="address-location acea-row " :style="{ backgroundImage: `url(${domain}/static/images/type_loaction.png)`}">
					<view class="location-distance acea-row row-center row-middle">距您{{innerDistance}}</view>
					<image class="loaction-avatar" :src="merData.mer_avatar"></image>
					<view class="location-point"></view>
				</view>
			</view>
			<view class='line'>
				<image :src="`${domain}/static/images/line.jpg`"></image>
			</view>
		</view>
	</view>
</template>

<script>
import { HTTP_REQUEST_URL } from '@/config/app';
import { getAddressList, getAddressDetail } from '@/api/user.js';
import { getReservationMerData, getReservationMerDistance } from '@/api/activity.js';

export default {
	name: 'ReservationHeader',
	props: {
		reservation_type: {
			type: Number,
			default: 0
		},
		service_type: {
			type: Number,
			default: 2
		},
		serviceTypeList: {
			type: Array,
			default: () => []
		},
		merId: {
			type: [String, Number],
			default: ''
		},
		addressId: {
			type: [String, Number],
			default: 0
		},
		fetchAddress: {
			type: Boolean,
			default: false
		},
		distance: {
			type: [String, Number],
			default: ''
		},
		serviceTypeLabels: {
			type: Object,
			default: () => ({})
		},
		productType: {
			type: [String, Number],
			default: 4
		},
		cartId: {
			type: [String, Number],
			default: ''
		}
	},
	computed: {
		addressUrl() {
			let url = '/pages/users/user_address/index?product_type=' + this.productType;
			if (this.cartId) {
				url += '&cartId=' + this.cartId;
			}
			return url;
		},
		actualServiceTypeList() {
			if (this.serviceTypeLabels && Object.keys(this.serviceTypeLabels).length) {
				return this.serviceTypeList.map(item => ({
					...item,
					name: this.serviceTypeLabels[item.type] || item.name
				}));
			}
			console.log(this.serviceTypeList)
			return this.serviceTypeList;
		}
	},
	data() {
		return {
			domain: HTTP_REQUEST_URL,
			addressInfo: {},
			merData: {},
			innerDistance: '',
		}
	},
	watch: {
		merId: {
			handler(val) {
				if (val) this.fetchMerData(val);
			},
			immediate: true
		},
		addressId: {
			handler(val) {
				if (this.fetchAddress) this.fetchAddressInfo(val);
			},
			immediate: true
		},
		distance(val) {
			this.innerDistance = val;
		}
	},
	methods: {
		changeType(item) {
			this.$emit('changeType', item);
		},
		onAddress() {
			this.$emit('onAddress');
		},
		// 处理箭头点击事件
		handleArrowClick() {
			if (this.addressInfo && this.addressInfo.real_name) {
				this.onAddress();
			} else {
				uni.navigateTo({
					url: this.addressUrl
				});
			}
		},
		// 获取商户信息
		fetchMerData(id) {
			getReservationMerData(id).then(res => {
				this.merData = res.data;
				this.fetchMerDistance(id, { latitude: res.data.lat, longitude: res.data.long });
			});
		},
		fetchMerDistance(id, data) {
			getReservationMerDistance(id, data).then(res => {
				this.innerDistance = res.data.distance;
			});
		},
		// 获取地址信息
		fetchAddressInfo(addressId) {
			if (addressId) {
				getAddressDetail(addressId).then(res => {
					this.addressInfo = res.data || {};
				});
			} else {
				getAddressList().then(res => {
					this.addressInfo = res.data.list.length > 0 ? res.data.list[0] : {};
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.reservation-header {
	background: rgba(255,255,255,.9);
}
.reservation-type {
	height: 80rpx;
	.type-name {
		height: 80rpx;
		text-align: center;
		flex: 0 0 50%;
		position: relative;
		&.on {
			height: 96rpx;
			background: #fff;
			color: var(--view-theme);
			font-weight: 500;
			top: -16rpx;
			border-radius: 24rpx 24rpx 0 0;
		}
		.type_tag {
			width: 48rpx;
			height: 80rpx;
			position: absolute;
			bottom: 0;
			background-size: 100% 100%;
			&.type_tag2 {
				right: -48rpx;
				transform: rotateY(180deg);
			}
			&.type_tag1 {
				left: -48rpx;
			}
		}
	}
}
.reservation-address {
	padding: 32rpx 26rpx 32rpx 32rpx;
	position: relative;
	.line {
		position: absolute;
		left: 2%;
		bottom: 0;
		width: 96%;
		height: 4rpx;
		image {
			width: 100%;
			height: 100%;
			display: block;
		}
	}
}
.address-info {
	width: 580rpx;
	&.info-arrive {
		width: 450rpx;
	}
	.address-name {
		font-size: 30rpx;
		font-weight: 600;
	}
	.address-detail {
		margin-top: 12rpx;
	}
}
.address-location {
	width: 188rpx;
	height: 104rpx;
	background-size: 100% 100%;
	flex-direction: column;
	align-items: center;
	.location-distance {
		background: #fff;
		box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.0784);
		min-width: 130rpx;
		max-width: 160rpx;
		height: 36rpx;
		position: relative;
		font-size: 20rpx;
		&::after {
			content: "";
			display: block;
			width: 9rpx;
			height: 9rpx;
			border: 9rpx solid transparent;
			border-top-color: #fff;
			position: absolute;
			bottom: -20rpx;
		}
	}
	.loaction-avatar {
		margin-top: 8rpx;
		width: 52rpx;
		height: 52rpx;
		border-radius: 8rpx;
		border: 6rpx solid #fff;
		box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.0784);
	}
	.location-point {
		width: 6rpx;
		height: 6rpx;
		background: var(--view-theme);
		border-radius: 100%;
		margin-top: 2rpx;
	}
}
</style>
