<template>
	<view :style="viewColor">
		<form @submit="formSubmit" report-submit='true'>
			<view class='addAddress'>
			<view class='list bg-f boder-24'>
				<view class="address-paste">
				<textarea class="paste-input" v-model="addressValue" placeholder="粘贴收件人姓名、手机号、收货地址、可快速识别您的收货信息" @blur="identify()"/></textarea>
			</view>
				<view class='item acea-row row-between-wrapper'>
					<view class='name'>姓名</view>
					<input type='text' placeholder='请输入姓名' name='real_name' :value="userAddress.real_name" placeholder-class='placeholder'></input>
				</view>
				<view class='item acea-row row-between-wrapper'>
					<view class='name'>联系电话</view>
					<input type='text' placeholder='请输入联系电话' name="phone" :value='userAddress.phone' placeholder-class='placeholder'></input>
				</view>
				<view class='item acea-row row-between-wrapper'>
					<view class='name'>所在地区</view>
					<view class="region">
						<view class="region_count acea-row row-between-wrapper" @click="changeRegion">
							<text v-if="!addressInfo.length" style="color:#cdcdcd;">请选择地址</text>
							<text v-else class="line1 region-width">{{addressText}}</text>
						</view>
						<view class="location" @click="selfLocation">
							<text class="iconfont icon-ic_location1"></text>
							定位
						</view>
					</view>
				</view>
				<view class='item acea-row row-between-wrapper'>
					<view class='name'>详细地址</view>
					<input type='text' class="location-input" placeholder='请填写具体地址' name='detail' placeholder-class='placeholder' v-model="userAddress.detail"></input>
				</view>
			</view>
				<view class='default acea-row row-middle boder-24'>
					<checkbox-group @change='ChangeIsDefault'>
						<checkbox :checked="userAddress.is_default ? true : false" />设置为默认地址</checkbox-group>
				</view>
				<button class='keepBnt acea-row row-middle row-center font-500' form-type="submit" :disabled="loading">立即保存</button>
				<!-- #ifdef MP -->
				<view class="wechatAddress acea-row row-middle row-center font-500" v-if="!address_id" @click="getWxAddress">导入微信地址</view>
				<!-- #endif -->
				<!-- #ifdef H5 -->
				<view class="wechatAddress acea-row row-middle row-center font-500" v-if="this.$wechat.isWeixin() && !address_id" @click="getAddress">导入微信地址</view>
				<!-- #endif -->
			</view>
		</form>
		<areaWindow ref="areaWindow" :display="display" :address="addressInfo"
				 @submit="OnChangeAddress" @changeClose="changeClose"></areaWindow>
		
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
	import { editAddress, getAddressDetail } from '@/api/user.js';
	import { getCityV2, getCityList } from '@/api/api.js';
	import { mapGetters } from "vuex";
	import areaWindow from '@/components/areaWindow';
	import { getGeocoder } from '@/api/store.js';
	import { toLogin } from '@/libs/login.js';
	import AddressParse from '../components/zh-address-parse.min.js'
	export default {
		components: {
			areaWindow,
		},
		data() {
			return {
				cartId: '', //购物车id
				pinkId: 0, //拼团id
				couponId: 0, //优惠券id
				address_id: 0, //地址id
				productType: 0,
				userAddress: {
					is_default: false
				}, //地址详情
				region: ['省', '市', '区'],
				valueRegion: [0, 0, 0],
				district: [],
				multiArray: [],
				multiIndex: [0, 0, 0],
				cityId: 0,
				display: false,
				addressInfo:[],
				latitude: '',
				longitude: '',
				loading: false,
				addressValue: "",
			};
		},
		computed: {...mapGetters(['isLogin','viewColor']),
			addressText(){
				return this.addressInfo.map(v=>v.name).join('/');
			}
		},
		onLoad(options) {
			// 判断环境
			// #ifdef H5
			this.isWeixin = this.$wechat && this.$wechat.isWeixin();
			// #endif
			
			// #ifdef APP-PLUS
			this.isApp = true;
			// #endif
			if (this.isLogin) {
				this.cartId = options.cartId || '';
				this.pinkId = options.pinkId || 0;
				this.couponId = options.couponId || 0;
				this.address_id = options.id || 0;
				this.productType = options.product_type || 0;
				uni.setNavigationBarTitle({
					title: options.id ? '修改地址' : '添加地址'
				})
				this.getUserAddress();
				this.getCityList();
			} else {
				toLogin()
			}
		},
		onReady() {
			// 根据不同环境，延迟提示
			setTimeout(() => {
				if (this.isWeixin) {
					uni.showToast({
						title: '长按输入框选择「粘贴」可快速填充',
						icon: 'none',
						duration: 2000
					});
				}
			}, 1000);
		},
		onUnload() {
			// 不再需要移除剪贴板监听，因为没有添加
		},
		methods: {
			OnChangeAddress(address){
				this.addressInfo = address;
			},
			// 地址数据
			getCityList: function() {
				let that = this;
				getCityV2(0).then(res => {
					this.district = res.data
				})
			},
			changeRegion(){
				this.display = true;
			},
			// 关闭地址弹窗；
			changeClose: function() {
				this.display = false;
			},
			getUserAddress: function() {
				if (!this.address_id) return false;
				let that = this;
				getAddressDetail(this.address_id).then(res => {
					let region = [res.data.province, res.data.city, res.data.district];
					that.$set(that, 'userAddress', res.data);
					that.$set(that, 'region', region);
					that.city_id = res.data.city_id
					that.addressInfo = res.data.area
				});
			},
			// 导入共享地址（小程序）
			getWxAddress: function() {
				let that = this;
				uni.authorize({
					scope: 'scope.address',
					success: function(res) {
						uni.chooseAddress({
							success: function(res) {
								getCityList(res.provinceName + '/' + res.cityName + '/' + res.countyName).then(res => {
									that.addressInfo = res.data;
								}).catch(err => {
									console.log('获取城市信息失败:', err);
									// 即使获取城市信息失败，也填充基础地址信息
									that.addressInfo = [];
								})
								that.userAddress.real_name = res.userName;
								that.userAddress.phone = res.telNumber;
								that.userAddress.detail = res.detailInfo;
							},
							fail: function(err) {
								// 修复：安全处理错误信息
								console.log('chooseAddress fail:', err);
								const errMsg = err.errMsg || err.message || '';
								if (errMsg.includes('cancel')) {
									return that.$util.Tips({
										title: '取消选择地址'
									});
								}
								if (errMsg.includes('auth deny') || errMsg.includes('authorize')) {
									return that.$util.Tips({
										title: '请授权使用地址信息'
									});
								}
								uni.showToast({
									title: errMsg || '获取地址失败',
									icon: 'none',
									duration: 1000
								});
							},
						})
					},
					fail: function(err) {
						// 修复：安全处理授权失败
						console.log('authorize fail:', err);
						const errMsg = err.errMsg || err.message || '';
						if (errMsg.includes('auth deny') || errMsg.includes('deny')) {
							uni.showModal({
								title: '您已拒绝导入微信地址权限',
								content: '是否进入权限管理，调整授权？',
								success(modalRes) {
									if (modalRes.confirm) {
										uni.openSetting({
											success: function(settingRes) {
												console.log('openSetting success:', settingRes);
											},
											fail: function(settingErr) {
												console.log('openSetting fail:', settingErr);
											}
										});
									} else if (modalRes.cancel) {
										return that.$util.Tips({
											title: '已取消！'
										});
									}
								}
							})
						} else {
							uni.showToast({
								title: errMsg || '授权失败',
								icon: 'none',
								duration: 1000
							});
						}
					},
				})
			},
			// 导入共享地址（微信）；
			getAddress() {
				let that = this;
				that.$wechat.openAddress().then(res => {
					getCityList(res.provinceName+'/'+res.cityName+'/'+res.countryName).then(res=>{
						that.addressInfo = res.data;
					})
					that.userAddress.real_name = res.userName;
					that.userAddress.phone = res.telNumber;
					that.userAddress.detail = res.detailInfo;
				}).catch(err => {
					console.log(err);
				});
			},
			selfLocation() {
				let self = this
				uni.showLoading({
					title: '定位中',
					mask: true,
				});
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						let latitude, longitude;
						latitude = res.latitude.toString();
						longitude = res.longitude.toString();
						self.latitude = res.latitude
						self.longitude = res.longitude
						getGeocoder({
							lat: latitude,
							long: longitude
						}).then(res => {
							const data = res.data;
							getCityList(data.address_component.province+'/'+data.address_component.city+'/'+data.address_component.district+'/'+(!data.address_reference.town ? '' : data.address_reference.town.title)).then(res=>{
								self.addressInfo = res.data;
								self.$set(self.userAddress, 'detail', data.formatted_addresses.recommend);
								uni.hideLoading();
							}).catch(e=>{
								uni.hideLoading();
								uni.showToast({
									title: '定位匹配失败，请手动输入地址',
									icon: 'none',
									duration: 1000
								});
							})
						}).catch(e=>{
							uni.hideLoading();
							uni.showToast({
								title: '地址解析失败，请手动输入地址',
								icon: 'none',
								duration: 1000
							});
						})
					},
					fail: (res) => {
						uni.hideLoading();
						uni.showToast({
							title: res.errMsg,
							icon: 'none',
							duration: 1000
						});
					}
				});
			},
			identify() {
				const options = {
					type: 0, // 哪种方式解析，0：正则，1：树查找
					textFilter: [], // 预清洗的字段
					nameMaxLength: 4, // 查找最大的中文名字长度
				}
				const parseResult = AddressParse(this.addressValue.trim(), options)
				console.log(parseResult)
				// type参数0表示使用正则解析，1表示采用树查找, textFilter地址预清洗过滤字段。
				if (this.addressValue.trim()) {
					getCityList(parseResult.province + '/' + parseResult.city + '/' + parseResult.area).then(res => {
						this.addressInfo = res.data;
						this.userAddress.phone = parseResult.phone;
						this.userAddress.real_name = parseResult.name;
						this.userAddress.detail = parseResult.detail;
					}).catch(err => {
						return this.$util.Tips({
							title: err
						});
					})
				}
			},
			/**
			 * 提交用户添加地址
			 *
			 */
			formSubmit: function(e) {
				let that = this,
					value = e.detail.value;
				if (!value.real_name) return that.$util.Tips({
					title: '请填写收货人姓名'
				});
				if (!value.phone) return that.$util.Tips({
					title: '请填写联系电话'
				});
				if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(value.phone)) return that.$util.Tips({
					title: '请输入正确的手机号码'
				});
				if (!that.addressInfo.length) return that.$util.Tips({
					title: '请选择所在地区'
				});
				if (!value.detail) return that.$util.Tips({
					title: '请填写详细地址'
				});
				value.address_id = that.address_id;
				value.is_default = that.userAddress.is_default ? 1 : 0;
				value.area = that.addressInfo;
				uni.showLoading({
					title: '保存中',
					mask: true
				})
				that.loading = true;
				let parameters = uni.getStorageSync('parameters');
				editAddress(value).then(res => {
					if (that.address_id)
						that.$util.Tips({
							title: '修改成功',
							icon: 'success'
						});
					else
						that.$util.Tips({
							title: '添加成功',
							icon: 'success'
						});
					that.$store.dispatch('refreshAddressList', { force: true });
					setTimeout(function() {
						if (that.cartId) {
							let cartId = that.cartId;
							let pinkId = that.pinkId;
							let couponId = that.couponId;
							that.cartId = '';
							that.pinkId = '';
							that.couponId = '';
							uni.$emit('updataAddress')
							if(that.productType == 20){
								uni.navigateTo({
									url: '/pages/points_mall/integral_order?cartId=' + cartId + '&addressId=' + (that.id ? that.id : res.data
										.address_id) + '&pinkId=' + pinkId + '&couponId=' + couponId
								});
							}else{
								uni.navigateTo({
									url: '/pages/users/order_confirm/index?cartId=' + cartId + '&addressId=' + (that.id ? that.id : res.data
										.address_id) + '&pinkId=' + pinkId + '&couponId=' + couponId
								});
							}
						} else {
							if(that.productType == 4) {
								uni.navigateTo({
									url: '/pages/reservation/reservation/index'+parameters+'&addressId=' + (that.id ? that.id : res.data.address_id)
								});
								uni.setStorageSync('parameters', '');
							}else {
								// #ifdef H5
								return history.back();
								// #endif
								// #ifndef H5
								return uni.navigateBack({
									delta: 1,
								})
								// #endif
							}

						}
						that.loading = false;
					}, 1000);
				}).catch(err => {
					that.loading = false;
					return that.$util.Tips({
						title: err
					});
				})
			},
			ChangeIsDefault: function(e) {
				this.$set(this.userAddress, 'is_default', !this.userAddress.is_default);
			},
		}
	}
</script>

<style scoped lang="scss">
	/deep/checkbox .uni-checkbox-input.uni-checkbox-input-checked,
	/deep/checkbox .wx-checkbox-input.wx-checkbox-input-checked {
	  border: 1px solid var(--view-theme)!important;
	  background-color: var(--view-theme)!important;
	  color: #fff!important;
	}
	/deep/checkbox .uni-checkbox-input,
	/deep/checkbox .wx-checkbox-input {
		border-radius: 100%;
	}
	.addAddress{
		padding: 20rpx;
	}
	
	.addAddress .list {
		padding: 20rpx 30rpx 0;
	}
	.addAddress .address-paste {
		position: relative;
		margin-bottom: 30rpx;
	}
	
	.addAddress .paste-input {
		padding: 20rpx 20rpx 80rpx 20rpx;
		background-color: #F9F9F9;
		width: 100%;
		height: 240rpx;
		border-radius: 16rpx;
		box-sizing: border-box;
	}
	
	.paste-input .uni-textarea-placeholder {
		color: #bbb;
		font-size: 28rpx;
	}
	.addAddress .list .item {
		padding: 30rpx 0;
		position: relative;
		~.item {
			border-top: 1rpx solid #eee;
		}
	}
	.addAddress .list .item .location{
		position: absolute;
		right: 0;
		top: 30rpx;
		text-align: center;
		font-size: 28rpx;
		.iconfont{
			color: var(--view-theme);
			font-size: 34rpx;
			margin-right: 6rpx;
		}
	}
	.addAddress .list .item .name {
		width: 195rpx;
		font-size: 30rpx;
		color: #333;
	}
	.addAddress .list .item .address {
		flex: 1;
		margin-left: 20rpx;
	}
	.addAddress .list .item input,.region .region_count {
		width: 450rpx;
		font-size: 30rpx;
		box-sizing: border-box;
	}
	.region .region_count{
		height: 42rpx;
		line-height: 42rpx;
		.region-width{
			display: block;
			max-width: 360rpx;
		}
	}
	.addAddress .list .location-input{
		padding-right: 70rpx;
	}
	.addAddress .list .item .placeholder {
		color: #bbb;
	}
	.addAddress .list .item picker {
		width: 475rpx;
	}
	.addAddress .list .item picker .picker {
		width: 410rpx;
		font-size: 30rpx;
	}
	.addAddress .list .item picker .iconfont {
		font-size: 43rpx;
	}
	.addAddress .default {
		padding: 0 30rpx;
		height: 90rpx;
		background-color: #fff;
		margin-top: 23rpx;
	}
	.addAddress .default checkbox {
		margin-right: 15rpx;
	}
	.addAddress .keepBnt {
		width: 690rpx;
		height: 88rpx;
		border-radius: 50rpx;
		margin: 90rpx auto 0;
		font-size: 28rpx;
		color: #fff;
		background-color: var(--view-theme);
	}
	.addAddress .keepBnt[disabled]{
		background: #bbb;
	}
	.addAddress .wechatAddress {
			width: 690rpx;
			height: 88rpx;
			border-radius: 50rpx;
			margin: 40rpx auto 0;
			font-size: 28rpx;
			color: var(--view-theme);
			background: #ffffff;
			border: 1px solid var(--view-theme);
		}

		/* 粘贴地址确认弹窗 */
		.paste-dialog {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
		}

		.paste-dialog-content {
			width: 80%;
			max-width: 500rpx;
			background-color: #ffffff;
			border-radius: 20rpx;
			padding: 30rpx;
		}

		.paste-dialog-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333333;
			text-align: center;
			margin-bottom: 30rpx;
		}

		.paste-dialog-info {
			margin-bottom: 40rpx;
		}

		.paste-dialog-item {
			font-size: 28rpx;
			color: #666666;
			margin-bottom: 20rpx;
			word-break: break-all;
		}

		.paste-dialog-label {
			color: #999999;
			margin-right: 20rpx;
		}

		.paste-dialog-value {
			color: #333333;
		}

		.paste-dialog-buttons {
			display: flex;
			border-top: 1rpx solid #eeeeee;
			padding-top: 20rpx;
		}

		.paste-dialog-button {
			flex: 1;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			border-radius: 10rpx;
		}

		.paste-dialog-button.cancel {
			color: #666666;
			margin-right: 20rpx;
			background-color: #f5f5f5;
		}

		.paste-dialog-button.confirm {
			color: #ffffff;
			background-color: var(--view-theme);
		}

</style>
