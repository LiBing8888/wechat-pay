<template>
	<view :style="viewColor">
		<view
			:style="{ 'background-image': `linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%),url(${store.mer_banner})` }"
			class="store-detail">
			<view class="section head" v-if="store.mer_id">
				<image :src="store.mer_avatar"></image>
				<view class="text-wrap">
					<view class="name line1">
						<text class="name_store">{{ store.mer_name }}</text>
						<image v-if="margin_ico_switch == 1 && margin_ico && store.is_margin == 10" :src="margin_ico"
							class="store-margin"></image>
						<text v-if="store.type_name" class="font-bg-red ml8">{{ store.type_name }}</text>
						<text v-else-if="store.is_trader" class="font-bg-red ml8">自营</text>
					</view>
					<view class="fans">{{ store.care_count < 10000 ? store.care_count : (store.care_count / 10000).toFixed(2)
						+ '万' }}人关注</view>
					</view>
					<button :class="{ followed: store.care }" hover-class="none" @click="handleToggleFollow(store)">
						<text v-show="!store.care" class="iconfont icon-ic_love"></text>
						{{ store.care ? '已关注' : '关注' }}
					</button>
				</view>
				<view class="section wrap">
					<view class="name">店铺评级</view>
					<view class="score-wrap">
						<view class="star" :class="'star' + keyColor">
							<view
								:style="{ width: `${star.toFixed(2)}%`, backgroundImage: `url(${domain}/static/diy/score1${keyColor}.png) left top/111rpx 19rpx no-repeat` }">
							</view>
						</view>
						<view>{{ score.toFixed(1) }}</view>
					</view>
				</view>
				<view class="section wrap" @click="popupShow = true">
					<view class="name">店铺二维码</view>
					<view><text class="iconfont icon-ic_QRcode"></text></view>
				</view>
				<navigator v-if="store.isset_certificate"
					:url="`/pages/store/qualifications/index?mer_id=${store.mer_id}&uid=${this.uid}&storeName=${store.mer_name}`"
					class="section wrap">
					<view class="name">店铺资质</view>
					<view><text class="iconfont icon-a-ic_ic_orderforgoods1"></text></view>
				</navigator>
				<view @click="goChat" class="section wrap">
					<view class="name">联系客服</view>
					<view><text class="iconfont icon-ic_customerservice"></text></view>
				</view>
				<view class="section info">
					<view class="item very">
						<view class="name">店铺简介</view>
						<view class="value">{{ store.mer_info }}</view>
					</view>
					<view class="item very">
						<view class="name">店铺地址</view>
						<view class="value">{{ store.mer_address }}</view>
						<view v-if="store.lat && store.long && mer_location == 1" class="iconfont icon-ic_location51"
							@click="showMaoLocation(store.lat, store.long)"></view>
					</view>
					<view v-if="store.service_phone" class="item">
						<view class="name">联系电话</view>
						<view class="value">{{ store.service_phone }}</view>
					</view>
					<view class="item">
						<view class="name">开店时间</view>
						<view class="value">{{ store.create_time | dateFormat }}</view>
					</view>
				</view>
				<view :class="{ mask: popupShow }" @click="popupShow = false">
					<view :class="{ 'popup-active': popupShow }" class="popup-qrcode">
						<view class="qrcode-main">
							<view class="name">{{ store.mer_name }}</view>
							<view class="info">保存二维码可分享店铺给好友哦~</view>
							<view class="acea-row row-center-wrapper mt-30">
							 <!-- 加载中 -->	
								<view v-if="qrCodeLoading" class="qr-loading">
									<view class="loading-icon"></view>
									<text>二维码生成中...</text>
								</view>
								
								<!-- 加载失败 -->
								<view v-else-if="qrCodeError" class="qr-error">
									<text class="iconfont icon-tishiyin"></text>
									<text>生成失败，请重试</text>
									<button class="retry-btn" @click="loadQrcode">重试</button>
								</view>
							
								<!-- #ifdef MP-WEIXIN -->
								<image v-else-if="popupShow && qrCodeReady" :src="qrCodeImage" mode="widthFix" class="qr-preview-img" @click.stop />
								<!-- #endif -->
								
								<!-- #ifndef MP-WEIXIN -->
								<tki-qrcode
									v-if="popupShow && qrCodeReady"
									ref="qrcodeRef"
									:val="qrCodeValue"
									:size="200"
									:unit="'rpx'"
									:icon="logoLocalPath"
									:iconSize="60"
									:lv="3"
									:onval="true"
									:loadMake="true"
									@result="onQrGenerated"
									@error="onQrError"
								/>	
								<!-- #endif -->
								<button class="save-btn" @click.stop="saveQRCode">保存二维码</button>
							</view>
						</view>
						<view class="qrclose"><text class="iconfont icon-ic_close1" @click="popupShow = false"></text></view>
					</view>
				</view>

				<view :class="{ mask: showQrPreview }" @click="showQrPreview = false">
					<view :class="{ 'popup-active': showQrPreview }" class="popup-qrcode">
						<view class="qrcode-main">
							<view class="name">{{ store.mer_name }}</view>
							<view class="info">长按图片保存到相册</view>
							<image :src="qrcodeTempPath" mode="widthFix" class="qr-preview-img" @click.stop />
						</view>
						<view class="qrclose"><text class="iconfont icon-ic_close1" @click="showQrPreview = false"></text></view>
					</view>
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
import { mapGetters, mapState } from 'vuex';
import { configMap, getCustomer } from '@/utils';
import { merchantQrcode } from '@/api/store.js';
import { imgToBase } from '@/api/user.js';
import { HTTP_REQUEST_URL } from '@/config/app';
import { toLogin } from '@/libs/login.js';
import storeFollowMixin from '@/mixins/store-follow';
import tkiQrcode from '../component/tki-qrcode/tki-qrcode.vue'
export default {
	mixins: [storeFollowMixin],
	components: {
		tkiQrcode
	},
	computed: {
		...configMap({ margin_ico_switch: 0, margin_ico: '' }, mapGetters(['isLogin', 'uid', 'viewColor', 'keyColor'])),
		...mapState({
			store(state) {
				return state.store.storeInfoMap[this.id] || {};
			}
		}),
		score() {
			if (this.store.postage_score === undefined) return 0;
			return (parseFloat(this.store.postage_score) + parseFloat(this.store.product_score) + parseFloat(this.store.service_score)) / 3;
		},
		star() {
			return (this.score / 5) * 100;
		},
		qrCodeValue() {
			return `${this.domain}/pages/store/home/index?id=${this.id}`
		}
	},
	filters: {
		dateFormat: function (value) {
			if (!value) {
				return '';
			}
			return value.split(' ')[0];
		}
	},
	watch: {
	  popupShow(val) {
	    if (val) {
	      this.loadQrcode()
	    } else {
	      this.qrCodeReady = false
	      this.qrCodeLoading = false
	      this.qrCodeError = false
	      if (this.$refs.qrcodeRef) {
	        this.$refs.qrcodeRef._clearCode()
	      }
	    }
	  }
	},
	data() {
		return {
			domain: HTTP_REQUEST_URL,
			id: 0,
			popupShow: false,
			storeCode: '',
			openSettingBtnHidden: true, //是否授权
			mer_location: '',
			qrcodeTempPath: '',
			logoLocalPath: '',
			qrCodeReady: false,  
			qrCodeLoading: false,  // 新增：加载中状态
			qrCodeError: false,     // 新增：加载失败状态
			showQrPreview: false,   // 新增：微信浏览器二维码预览
			qrCodeImage: '',        // 新增：小程序码图片
		};
	},
	onLoad: function (options) {
		uni.getStorage({
			key: 'GLOBAL_DATA',
			success: (res) => {
				this.mer_location = res.data.mer_location;
			}
		});
		this.id = options.mer_id || options.id;
		this.getStore();
	},
	onReady: function () { },
	mounted: function () { },
	methods: {
	 // 二维码生成回调（tki-qrcode 的 @result 返回图片路径）
		onQrGenerated(e) {
			this.qrcodeTempPath = e
			this.storeCode = e
		},
		
		// 保存二维码到相册
		saveQRCode() {
		  if (!this.storeCode) {
		    uni.showToast({ title: '二维码未生成', icon: 'none' })
		    return
		  }
		  // #ifdef H5
		  if (this.$wechat && this.$wechat.isWeixin()) {
		    this.showQrPreview = true
		    uni.showToast({ title: '请长按图片保存', icon: 'none', duration: 2000 })
		  } else {
		    const link = document.createElement('a')
		    link.href = this.qrcodeTempPath
		    link.download = 'qrcode.png'
		    document.body.appendChild(link)
		    link.click()
		    document.body.removeChild(link)
		    uni.showToast({ title: '保存成功' })
		  }
		  // #endif
		  
		  // #ifdef MP-WEIXIN
		  this.savePosterPath(this.storeCode)
		  // #endif
		  
		  // #ifdef APP-PLUS
		  uni.saveImageToPhotosAlbum({
		    filePath: this.qrcodeTempPath,
		    success: () => {
		      uni.showToast({ title: '保存成功' })
		    },
		    fail: (err) => {
		      console.error('保存失败', err)
		      uni.showToast({ title: '保存失败', icon: 'none' })
		    }
		  })
		  // #endif
		},
		
		// #ifdef MP-WEIXIN
		savePosterPath(url) {
			uni.downloadFile({
				url,
				success: (resFile) => {
					if (resFile.statusCode === 200) {
						uni.getSetting({
							success: (res) => {
								if (!res.authSetting['scope.writePhotosAlbum']) {
									uni.authorize({
										scope: 'scope.writePhotosAlbum',
										success: () => {
											uni.saveImageToPhotosAlbum({
												filePath: resFile.tempFilePath,
												success: (res) => {
													return uni.showToast({
														title: '保存成功！'
													});
												},
												fail: (res) => {
													return uni.showToast({
														title: res.errMsg
													});
												},
												complete: (res) => { }
											});
										},
										fail: () => {
											uni.showModal({
												title: '您已拒绝获取相册权限',
												content: '是否进入权限管理，调整授权？',
												success: (res) => {
													if (res.confirm) {
														uni.openSetting({
															success: (res) => {
																console.log(res.authSetting);
															}
														});
													} else if (res.cancel) {
														return uni.showToast({
															title: '已取消！'
														});
													}
												}
											});
										}
									});
								} else {
									uni.saveImageToPhotosAlbum({
										filePath: resFile.tempFilePath,
										success: (res) => {
											return uni.showToast({
												title: '保存成功！'
											});
										},
										fail: (res) => {
											return uni.showToast({
												title: res.errMsg
											});
										},
										complete: (res) => { }
									});
								}
							},
							fail: (res) => { }
						});
					} else {
						return uni.showToast({
							title: resFile.errMsg
						});
					}
				},
				fail: (res) => {
					return uni.showToast({
						title: res.errMsg
					});
				}
			});
		},
		// #endif
		
		async loadQrcode() {
			this.qrCodeReady = false
			this.qrCodeError = false
			this.qrCodeLoading = true
			
			// #ifdef MP-WEIXIN
			let params = {
				type: 'routine'
			}
			merchantQrcode(this.id, params)
				.then((res) => {
					this.qrCodeImage = res.data.url
					this.storeCode = res.data.url
					this.qrCodeReady = true
				})
				.catch((err) => {
					console.error('获取小程序码失败:', err)
					this.qrCodeError = true
				})
				.finally(() => {
					this.qrCodeLoading = false
				})
			// #endif
			
			// #ifndef MP-WEIXIN
			this.prepareLogo()
			// #endif
		},
		
		async prepareLogo() {
			if (this.cachedLogoPath) {
					this.logoLocalPath = this.cachedLogoPath
					this.qrCodeReady = true
					this.qrCodeLoading = false
					return
			}
			
			try {
					const res = await imgToBase({ image: this.store.mer_avatar })
					if (res && res.data && res.data.image) {
							let base64Data = res.data.image
							if (!base64Data.startsWith('data:image')) {
								base64Data = 'data:image/png;base64,' + base64Data
							}
							
							this.cachedLogoPath = base64Data
							this.logoLocalPath = base64Data
							this.qrCodeReady = true
					} else {
							throw new Error('格式错误')
					}
			} catch (error) {
					this.qrCodeError = true
			} finally {
					this.qrCodeLoading = false
			}
		},
		
		base64ToTempFile(base64Data) {
			return new Promise((resolve, reject) => {
				const fs = uni.getFileSystemManager()
				const tempFilePath = `${wx.env.USER_DATA_PATH}/logo_${Date.now()}.png`
				const base64Str = base64Data.split(',')[1]
				
				fs.writeFile({
					filePath: tempFilePath,
					data: base64Str,
					encoding: 'base64',
					success: () => {
						resolve(tempFilePath)
					},
					fail: (err) => {
						console.error('writeFile fail:', err)
						reject(err)
					}
				})
			})
		},
		// 二维码生成失败回调
		onQrError(err) {
			console.error('二维码生成错误:', err)
			this.qrCodeLoading = false
			this.qrCodeError = true
			uni.showToast({
				title: '二维码生成失败',
				icon: 'none'
			})
		},
		call: function () {
			let that = this;
			if (that.store.service_phone) {
				uni.showModal({
					title: '提示',
					content: '暂无在线客服，确定拨打客服电话:' + that.store.service_phone + '吗？',
					success: function (res) {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: that.store.service_phone
							});
						}
					}
				});
			} else {
				return that.$util.Tips({
					title: '暂无可用客服'
				});
			}
		},
		async getStore() {
			try {
				await this.$store.dispatch("getStoreInfo", {
					merId: this.id
				});
			} catch (error) {
				console.error(error.message);
				this.$util.Tips({
					title: error.message
				});
			}
		},
		// 联系客服
		goChat() {
			if (this.isLogin) {
				let mer = this.store.services_type;
				let url = `/pages/chat/customer_list/chat?mer_id=${this.store.mer_id}&uid=${this.uid}`;
				let data = {
					type: mer.services_type,
					service_phone: mer.service_phone,
					customer_url: mer.mer_customer_url,
					customer_corpId: mer.mer_customer_corpId,
					customer_link: mer.mer_customer_link
				};
				getCustomer(data, url);
			} else {
				toLogin();
			}
		},
		//查看地图
		showMaoLocation(lat, long) {
			console.log(lat, long);
			if (!lat || !long)
				return this.$util.Tips({
					title: '请设置允许商城访问您的位置！'
				});
			//#ifdef H5
			if (this.$wechat.isWeixin() === true) {
				this.$wechat
					.seeLocation({
						latitude: Number(lat),
						longitude: Number(long),
						name: this.store.mer_name,
						address: this.store.mer_address ? this.store.mer_address : ''
					})
					.then((res) => {
						console.log('success');
					});
			} else {
				//#endif
				uni.openLocation({
					latitude: parseFloat(lat),
					longitude: parseFloat(long),
					scale: 8,
					geocode: true,
					name: this.store.mer_name,
					address: this.store.mer_address ? this.store.mer_address : '',
					success: function (res) {
						console.log(res);
					}
				});
				// #ifdef H5
			}
			//#endif
		},
	}
};
</script>

<style lang="scss" scoped>
.font-bg-red {
	display: flex;
	align-items: center;
	background: var(--view-theme);
	border-color: var(--view-theme);
	color: #fff;
	font-size: 20rpx;
	text-align: center;
	line-height: 30rpx;
	height: 28rpx;
	border-radius: 5rpx;
	margin-right: 8rpx;

	&.ml8 {
		margin-left: 8rpx;
		margin-right: 0;
	}
}

.store-detail {
	padding-top: 80rpx;
	padding-right: 20rpx;
	padding-left: 20rpx;
	background: left top/750rpx 360rpx no-repeat fixed;

	.section {
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		background-color: #ffffff;
	}

	.head {
		display: flex;
		align-items: center;
		padding: 20rpx;

		image {
			width: 90rpx;
			height: 90rpx;
			border-radius: 6rpx;
		}

		.text-wrap {
			flex: 1;
			min-width: 0;
			margin-right: 20rpx;
			margin-left: 20rpx;
			line-height: 1;

			.store-margin {
				width: 28rpx;
				height: 30rpx;
				margin-left: 10rpx;
			}

			.name {
				display: flex;
				align-items: center;
				font-weight: bold;
				font-size: 28rpx;
				color: #282828;

				.name_store {
					display: inline-block;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					max-width: 140px;
				}
			}

			.fans {
				margin-top: 15rpx;
				font-weight: 500;
				font-size: 22rpx;
				color: #666666;
			}
		}

		button {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 113rpx;
			height: 48rpx;
			border-radius: 24rpx;
			background-image: linear-gradient(-90deg, var(--view-bntColor21) 0%, var(--view-bntColor22) 100%);
			font-weight: 500;
			font-size: 22rpx;
			color: #ffffff;

			.iconfont {
				margin-right: 6rpx;
				font-size: 22rpx;
			}
		}

		.followed {
			border: 2rpx solid #dddddd;
			background: none;
			color: #999999;
		}
	}

	.wrap {
		display: flex;
		align-items: center;
		padding: 32rpx 20rpx;

		.name {
			flex: 1;
			min-width: 0;
			font-weight: 400;
			font-size: 28rpx;
			color: #282828;
		}

		.score-wrap {
			display: flex;
			align-items: center;
			font-weight: 500;
			font-size: 28rpx;
			color: var(--view-theme);

			.star {
				position: relative;
				width: 111rpx;
				height: 19rpx;
				margin-right: 10rpx;
				background-position: left top/100%;
				background-repeat: no-repeat;
				background-size: 100%;
				overflow: hidden;

				view {
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
				}
			}
		}

		.iconfont {
			font-size: 36rpx;
		}

		.icon-pingfen {
			margin-right: 6rpx;
			font-size: 23rpx;
			color: #666666;
		}

		.active {
			color: $theme-color;
		}
	}

	.info {
		.item {
			display: flex;
			align-items: center;
			padding: 30rpx 20rpx;
			font-weight: normal;
			font-size: 28rpx;
			line-height: 30rpx;
			color: #282828;

			.name {
				margin-right: 18rpx;
			}

			.value {
				flex: 1;
				min-width: 0;
				color: #666666;
			}
		}

		.very {
			.name {
				align-self: flex-start;
			}

			.iconfont {
				font-size: 36rpx;
			}

			.icon-ic_location51 {
				color: var(--view-theme);
			}
		}
	}
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		opacity: 1;
		z-index: 100;
	}
	.popup-qrcode {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 101;
		width: 544rpx;
		transform: translate(-50%, -50%) scale(0);
		opacity: 0;
		transition: 0.3s;
		line-height: 1;
		text-align: center;
		color: #282828;

		.qrcode-main {
			width: 544rpx;
			padding-top: 48rpx;
			padding-bottom: 36rpx;
			border-radius: 24rpx;
			background-color: #ffffff;
		}

		.qrclose {
			margin-top: 50rpx;

			.icon-ic_close1 {
				color: #fff;
				font-size: 42rpx;
			}
		}

		.name {
			max-width: 90%;
			margin-right: auto;
			margin-left: auto;
			font-weight: bold;
			font-size: 32rpx;
		}

		.info {
			margin-top: 24rpx;
			font-weight: 500;
			font-size: 24rpx;
		}

		image {
			width: 384rpx;
			height: 384rpx;
			margin-top: 18rpx;
		}
	}

	.popup-active {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
	}
}
.save-btn {
  width: 200rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: var(--view-theme);
  color: #fff;
  font-size: 26rpx;
  border-radius: 30rpx;
  margin-top: 30rpx;
  
  &::after {
    border: none;
  }
}
.qr-loading, .qr-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 384rpx;
    height: 384rpx;
    background: #f5f5f5;
    border-radius: 16rpx;
    
    text {
        margin-top: 20rpx;
        font-size: 24rpx;
        color: #999;
    }
}

.qr-error {
	.iconfont {
		font-size: 60rpx;
		color: #ff6b6b;
	}
    
	.retry-btn {
		margin-top: 20rpx;
		width: 120rpx;
		height: 50rpx;
		line-height: 50rpx;
		background: var(--view-theme);
		color: #fff;
		font-size: 24rpx;
		border-radius: 25rpx;
	}
}

.loading-icon {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #e0e0e0;
	border-top-color: var(--view-theme);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.qr-preview-img {
	width: 384rpx;
	height: 384rpx;
	margin-top: 18rpx;
}
</style>
