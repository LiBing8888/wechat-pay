<template>
	<!-- 在线客服 -->
	<view class="custmer">
		<!-- #ifdef H5 || APP-PLUS -->
		<view class="customerService" :class="positions?'':'on'" :style="[customerServiceStyle]" @touchmove.stop.prevent="setTouchMove" @click="licks">
			<view class="pictrue-box">
				<image :src="logoConfig" class="pictrue" :style="[imgStyle]"></image>
			</view>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP -->
		<view class="customerService" :class="positions?'':'on'" :style="[customerServiceStyle]" @touchmove.stop.prevent="setTouchMove" v-if="routineContact === 0" @click="licks">
			<image :src="logoConfig" :style="[imgStyle]" class="pictrue"></image>
		</view>
		<button class="customerService-sty" 
			:class="positions?'':'on'" 
			:style="[customerServiceStyle]" 
			@touchmove.stop.prevent="setTouchMove" 
			open-type='contact'
			bindcontact="handleContact" 
			binderror="handleContactError"
			data-type="contact" 
			v-if="routineContact === 1">
			<image class="pictrue" :src="logoConfig" :style="[imgStyle]"></image>
		</button>
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapGetters
	} from "vuex";
	import {
			configMap,
			getCustomer
		} from '@/utils/index.js'
	import { diyUtil } from '@/utils/diy';
	import { toLogin } from '@/libs/login.js';
	import { getSystemInfo } from "@/utils/device";
	export default {
		name: 'customerService',
		inject: ["parentMerId"],
		props: {
			dataConfig: {
				type: Object,
				default: () => {}
			}
		},
		inject: ["parentMerId"],
		data() {
			const systemInfo = getSystemInfo();
			const topConfig = this.dataConfig.topConfig.val;
			return {
				screenHeight: systemInfo.screenHeight,
				screenWidth: systemInfo.screenWidth,
				routineContact: parseFloat(this.dataConfig.buttonConfig.tabVal),
				logoConfig: this.dataConfig.logoConfig.url,
				topConfig: topConfig ? topConfig + "%" : "80%",
				positions: this.dataConfig.locationConfig.tabVal
			};
		},
		computed: {
			...mapGetters(['userInfo', "uid", "isLogin"]),
			...configMap({
				service_type: {}
			}),
			imgStyle() {
				return {
					'box-shadow': diyUtil.buildShadowStyle(this.dataConfig.shadowConfig),
				};
			},
			customerServiceStyle() {
				return {
					top: this.topConfig,
					marginTop: `-${this.dataConfig.offsetYConfig.val * 2}rpx`,
				};
			}
		},
		methods: {
			// 点击客服按钮后的回调
			handleContact(e) {
				console.log('客服会话打开', e.detail);
				// 如果能正常进入，说明客服功能可用
				// 这里不做额外操作，保持默认
			},
			// 客服打开失败时的回调（比较少触发）
			handleContactError(e) {
				console.error('客服功能不可用', e);
				// 执行备用操作
				this.licks();
			},
			async licks(){
				if (this.dataConfig.buttonConfig.tabVal) {  
					if (!this.isLogin) {
						toLogin()
						return
					}
					if (this.parentMerId) {
						try {
							const storeInfo = await this.$store.dispatch("getStoreInfo", {
								merId: this.parentMerId
							});
							// 前往商户客服
							const mer = storeInfo.services_type
							const data = {
								type: mer.services_type,
								service_phone: mer.service_phone,
								customer_url: mer.mer_customer_url,
								customer_corpId: mer.mer_customer_corpId,
								customer_link: mer.mer_customer_link
							}
							let url = `/pages/chat/customer_list/chat?mer_id=${this.parentMerId}&uid=${this.uid}`
							getCustomer(data, url)
						} catch (error) {
							this.$util.Tips({
								title: error.message
							});
						}

					} else {
						const sys = this.service_type;
						const data = {
							type: sys.sys_service_switch,
							service_phone: sys.sys_phone,
							customer_url: sys.customer_url,
							customer_corpId: sys.customer_corpId,
							customer_link: sys.customer_link
						}
						let url = `/pages/chat/customer_list/chat?type=0`
						getCustomer(data, url)
					}
				} else{
					const link = diyUtil.checkUrl(this.dataConfig.logoConfig.link, this.parentMerId);
					this.$util.JumpPath(link);
				}
			},
			setTouchMove(e) {
				const { clientX, clientY } =  e.touches[0];
				if (clientY > 66 && clientY < this.screenHeight - 150) {
					this.topConfig = clientY + "px";
				}
			},
		}
	}
</script>

<style lang="scss">
  .custmer {
    touch-action: none;
  }
	.customerService,.customerService-sty {
		width: fit-content;
		position: fixed;
		right: 20rpx;
		z-index: 40;
		&.on {
			left:20rpx;
		}

		.pictrue-box,
		.pictrue {
			width: 86rpx;
			height: 86rpx;
			border-radius: 50%;
		}
	}
	.customerService-sty{
		background-color: rgba(0,0,0,0) !important;
	}
</style>
