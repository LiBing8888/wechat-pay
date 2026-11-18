<template>
	<view :style="viewColor">
		<view class="address-window popup-main bg-f" :class="address.address == true ? 'on' : ''">
			<view class='title font-500'>选择地址<text class='iconfont icon-ic_close popup-close' @tap='close'></text></view>
			<scroll-view scroll-y="true" class='list'>
				<view class='item acea-row row-between-wrapper' :class='active == index ? "t-color" : ""'
					v-for="(item, index) in addressList" @tap='tapAddress(index, item.address_id)' :key='index'>
					<text class='iconfont icon-ic_location5' :class='active == index ? "t-color" : ""'></text>
					<view class='address'>
						<view class='name font-bold' :class='active == index ? "t-color" : ""'>{{ item.real_name }}<text
								class='phone'>{{ item.phone }}</text></view>
						<view class='line1'>{{ item.province }}{{ item.city }}{{ item.district }}{{ item.street || '' }}{{ item.detail }}
						</view>
					</view>
					<text class='iconfont icon-complete' :class='active == index ? "t-color" : ""'></text>
				</view>
			</scroll-view>
			<!-- 无地址 -->
			<view class='pictrue' v-if="!is_loading && !addressList.length">
				<image :src="`${domain}/static/images/noAddress.png`"></image>
				<view>暂无地址</view>
			</view>
			<view class='addressBnt' @tap='goAddressPages'>添加新地址</view>
		</view>
		<view class='mask' catchtouchmove="true" :hidden='address.address == false' @tap='close'></view>
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
import { mapGetters, mapState } from "vuex";
import { HTTP_REQUEST_URL } from '@/config/app';

export default {
	props: {
		pagesUrl: {
			type: String,
			default: '',
		},
		address: {
			type: Object,
			default: function () {
				return {
					address: true,
					addressId: 0,
				};
			}
		},
		isLog: {
			type: Boolean,
			default: false,
		},
		autoLoad: {
			type: Boolean,
			default: false
		},
	},
	computed: {
		...mapGetters(['viewColor']),
		...mapState({
			rawAddressList: state => state.address.addressList
		})
	},
	data() {
		return {
			domain: HTTP_REQUEST_URL,
			active: 0,
			//地址列表
			addressList: [],
			is_loading: true
		};
	},
	created() {
		this.autoLoad && this.getAddressList();
	},
	methods: {
		tapAddress: function (e, addressid) {
			this.active = e;
			this.$emit('OnChangeAddress', addressid);
		},
		close: function () {
			this.$emit('changeClose');
			this.$emit('changeTextareaStatus');
		},
		goAddressPages: function () {
			this.$emit('changeClose');
			this.$emit('changeTextareaStatus');
			uni.navigateTo({
				url: this.pagesUrl
			});
		},
		async getAddressList() {
			try {
				await this.$store.dispatch('refreshAddressList');
				const addressList = [];
				for (let i = 0; i < this.rawAddressList.length; i++){
					const item = this.rawAddressList[i];
					if (item.address_id == this.address.addressId) {
						this.active = i;
					}
					addressList.push({
						...item,
					});
				} 

				this.addressList = addressList;
				this.is_loading = false;
			} catch (error) {
				this.$util.Tips({
					title: error
				});
			}
		}
	}
}
</script>
<style scoped lang="scss">
.address-window .title {
	height: 123rpx;
	line-height: 123rpx;
}

.address-window .title .iconfont {
	position: absolute;
	right: 28rpx;
	top: 30rpx;
}

.address-window .list {
	max-height: 650rpx;
}

.address-window .list .item {
	margin-left: 30rpx;
	padding-right: 30rpx;
	border-bottom: 1px solid #f5f5f5;
	height: 129rpx;
	font-size: 25rpx;
	color: #333;
}

.address-window .list .item .iconfont {
	font-size: 37rpx;
	color: #2c2c2c;
}

.address-window .list .item .iconfont.icon-complete {
	font-size: 30rpx;
	color: #fff;
}

.address-window .list .item .address {
	width: 560rpx;
}

.address-window .list .item .address .name {
	font-size: 28rpx;
	color: #282828;
	margin-bottom: 4rpx;
}

.address-window .list .item .address .name .phone {
	margin-left: 18rpx;
}

.address-window .addressBnt {
	font-size: 28rpx;
	color: #fff;
	width: 690rpx;
	height: 88rpx;
	border-radius: 50rpx;
	text-align: center;
	line-height: 88rpx;
	margin: 85rpx auto;
	background-color: var(--view-theme);
}

.address-window .pictrue {
	text-align: center;
}

.address-window .pictrue image,
.address-window .pictrue uni-image {
	width: 414rpx;
	height: 305rpx;
}

.address-window .pictrue view {
	color: #999;
}

.t-color {
	color: var(--view-theme) !important;
}
</style>
