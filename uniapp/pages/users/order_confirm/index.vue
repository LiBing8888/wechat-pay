<template>
	<BaseContainer>
		<!-- 导航栏，仅在小程序和APP中显示 -->
		<!-- #ifndef WEB -->
		<view class="nav-wrapper fixed">
			<BaseNavBar title="提交订单" lightText :bold="false" />
		</view>
		<!-- #endif -->

		<!-- 顶部渐变背景 -->
		<LinearBackground />

		<!-- 订单提交页面主体区域 -->
		<view class="order-submission relative">
			<!-- 年/次卡商品头部（服务类型+地址） -->
			<ReservationHeader
				v-if="isYearCard"
				:reservation_type="showYearCardTypeSwitch ? 3 : 0"
				:service_type="yearCardSelectedType"
				:serviceTypeList="yearCardServiceTypeList"
				:serviceTypeLabels="{ 1: '到店核销', 2: '上门核销' }"
				:merId="merId"
				:addressId="addressId"
				:fetchAddress="true"
				:productType="5"
				:cartId="cartId"
				@changeType="handleYearCardChangeType"
			/>

			<!-- 预约订单预约日期展示 -->
			<ReserverationDate :reservationDate="bookingOrderReserverationDate" v-if="bookingOrderReserverationDate" />

			<!-- 地址选择器 -->
			<AddressSelector :cartId="cartId" :addressId.sync="addressId" :couponId="couponId" v-if="isAddressVisible"
				@loaded="handleAddressLoaded" />

			<!-- 购物车店铺和商品列表 -->
			<CartList :list="cartInfo.order" :cartInfo="cartInfo" :remarkMap.sync="remarkMap" v-if="cartInfo"
				@change-delivery="handleChangeDeliveryType" @select-coupon="handleSelectCoupon"
				:isAgreePresaleProtocol.sync="isAgreePresaleProtocol" :deliverySettingList="deliverySettingList"
				:yearCardSelectedType="yearCardSelectedType" :serviceType="serviceType" />
			<!-- 自提联系人信息 -->
			<SelfTakeContact :contactInfo.sync="contactInfo" v-if="hasSelfTakeOrder || isYearCardTake" />

			<!-- 商品关联的系统表单 -->
			<view class="form-wrapper" v-if="systemFormConfig">
				<BaseSystemForm ref="systemForm" :config="systemFormConfig" require-flag-position="before" />
			</view>

			<!-- 订单汇总信息 -->
			<OrderSummary :cartInfo="cartInfo" :userInfo="userInfo" v-if="cartInfo"
				@changeUseIntegral="handleChangeUseIntegral" @select-coupon="handleSelectCoupon" />

			<!-- 占位，防止底部按钮被遮挡 -->
			<view style="height:200rpx"></view>

			<!-- 底部按钮 -->
			<view class='footer acea-row row-between-wrapper' v-if="cartInfo">
				<view class="footer_count">
					<view class="acea-row">
						<view>合计:</view>
						<view class='pColor'>
							<priceFormat :price="cartInfo.order_price" weight intSize="48" floatSize="32" labelSize="32">
							</priceFormat>
						</view>
					</view>
					<view class="coupon_price" v-if="cartInfo.total_coupon > 0">
						优惠减:¥ {{ cartInfo.total_coupon }}
						<text @click="handleOpenDiscount">优惠明细</text>
					</view>

					<!-- 优惠明细弹窗 -->
					<DiscountDetails :isShowDiscount="isDiscountVisible" :couponData="cartInfo" @close="handleCloseDiscount" />
				</view>
				<view class='settlement' :class="submitBtnInfo.className" @click="handleSubmitOrder">{{
					submitBtnInfo.text }}</view>
			</view>
		</view>


	</BaseContainer>
</template>

<script>
import BaseContainer from '@/components/common/base_container.vue';
import BaseNavBar from "@/components/common/base_nav_bar.vue";
import LinearBackground from "./components/LinearBackground.vue";
import AddressSelector from "./components/AddressSelector.vue";
import ReserverationDate from "./components/ReserverationDate.vue";
import CartList from "./components/CartList.vue";
import OrderSummary from "./components/OrderSummary.vue";
import { mapGetters } from "vuex";
import { DELIVERY_TYPE } from '@/constants/delivery';
import { GOODS_ACTIVITY_TYPE, GOODS_TYPE } from '@/constants/goods';
import { getUserInfo } from '@/api/user.js';
import {
	getOrderConfirm,
	createOrder
} from '@/api/order.js';
import DiscountDetails from '@/pages/users/components/discountDetails/index.vue';
import SelfTakeContact from './components/SelfTakeContact.vue';
import ReservationHeader from '@/components/reservation-header/index.vue';
import { FormUtils } from '@/utils/form';
import BaseSystemForm from '@/components/common/base_system_form.vue';
import { isEmojiCharacter } from '@/utils/emoji';
import { PAY_TYPE } from '@/constants/pay';
import { openPaySubscribe } from '@/utils/SubscribeMessage.js';
import { toLogin } from '@/libs/login.js';
import deliverySettingMixin from './mixins/delivery-setting.js';

export default {
	name: 'order-confirm',
	options: {
		styleIsolation: 'shared',
	},
	mixins: [deliverySettingMixin],
	components: {
		BaseContainer,
		BaseNavBar,
		LinearBackground,
		AddressSelector,
		ReserverationDate,
		CartList,
		OrderSummary,
		DiscountDetails,
		SelfTakeContact,
		BaseSystemForm,
		ReservationHeader
	},
	data() {
		return {
			from: this.getFromType(), // 来源类型
			couponId: "", // 优惠券ID
			formId: "", // 是否来自预约商品页面且携带了表单参数
			addressId: 0, // 地址ID
			cartId: "", // 购物车ID
			contactInfo: {
				real_name: "", // 收货人姓名
				phone: "", // 收货人电话
			}, // 自提联系人信息
			payType: 'weixin', //支付方式

			selfPickData: {}, // 选择到店自提的门店id与提货点数据（门店id：提货点数据）
			localDeliveryData: {}, // 选择同城配送的门店id与数据（门店id：数据）
			merUseCoupon: {}, // 使用的店铺优惠券： mer_id -> coupon_user_id[]
			useIntegral: false, // 使用积分

			cartInfo: null, // 购物车信息

			isAgreePresaleProtocol: false, // 是否同意预售协议
			remarkMap: {}, // 各个商户的备注信息
			userInfo: {}, // 用户信息

			isDiscountVisible: false, // 是否显示优惠明细

			serviceType: "", // 服务类型
			merId: "", // 商户ID

			cartError: null, // 刷新购物车时的错误信息
			yearCardSelectedType: 1, // 年/次卡商品当前选中的服务类型（1到店，2上门）
			yearCardTypeChangedByUser: false, // 用户是否手动切换过年/次卡服务类型
		}
	},
	computed: {
		...mapGetters(['isLogin']),
		// 是否是年/次卡商品
		isYearCard() {
			return this.cartInfo?.order_model === 5;
		},
		// 是否显示年/次卡类型切换（service_type为3时显示）
		showYearCardTypeSwitch() {
			return this.cartInfo && this.cartInfo.service_type === 3;
		},
		// 年/次卡商品当前服务类型（1到店，2上门，3到店+上门）
		yearCardServiceType() {
			const type = this.cartInfo?.service_type;
			if (type === 1 || type === 2) return type;
			return 1; // 默认到店
		},
		// 年/次卡商品服务类型列表
		yearCardServiceTypeList() {
			const type = this.cartInfo?.service_type;
			const all = [
				{ name: '上门服务', type: 2 },
				{ name: '到店服务', type: 1 },
			];
			if (type === 1) return [all[1]]; // 仅到店
			if (type === 2) return [all[0]]; // 仅上门
			return all; // 到店+上门
		},
		// 是否显示地址选择器
		isAddressVisible() {
			if (!this.cartInfo) return true;
			return this.cartInfo?.order_model === GOODS_ACTIVITY_TYPE.NORMAL && this.cartInfo?.allow_address;
		},
		// 检查当前用户地址是否有商户无法送达
		hasNotInRange() {
			return this.cartInfo?.order.some(item => item.order.delivery_status === false);
		},
		// 提交按钮信息
		submitBtnInfo() {
			const yearCardDoorToDoorNoAddress = this.isYearCard && this.yearCardSelectedType === 2 && !this.addressId;
			const isNoAddress = this.cartInfo?.status === "noAddress" || yearCardDoorToDoorNoAddress;
			const allowSubmit = !isNoAddress && !this.hasNotInRange && this.cartError === null;
			return {
				text: isNoAddress ? '选择地址' : '立即结算',
				className: allowSubmit ? "" : "disabled",
				allowSubmit
			};
		},
		// 是否是预约订单
		isBookingOrder() {
			return this.cartInfo?.order_model === GOODS_TYPE.BOOKING;
		},
		// 预约订单的预约日期
		bookingOrderReserverationDate() {
			if (!this.isBookingOrder) return null;
			const { reservationAttr, reservation_date } = this.cartInfo.order[0].list[0];
			const { start_time, end_time } = reservationAttr;

			return `${reservation_date} ${start_time} - ${end_time}`;
		},
		// 是否含有自提类型订单
		hasSelfTakeOrder() {
			if (this.isBookingOrder) return false;
			return this.cartInfo?.order.some(item => item.order.isTake);
		},
		// 年/次卡商品到店服务
		isYearCardTake() {
			return this.isYearCard && this.yearCardSelectedType === 1;
		},
		// 关联的系统表单（订单模型为非预约订单时）
		systemFormConfig() {
			const conditions = [
				this.isBookingOrder,
				!this.cartInfo?.mer_form_id,
				!this.cartInfo?.mer_form_info?.value
			];

			// 如果满足任一条件，则返回 null ，不渲染表单
			if (conditions.some(condition => condition)) return null;
			const formValue = this.cartInfo.mer_form_info.value;
			return FormUtils.processFormConfig(formValue);
		}
	},
	watch: {
		// 用户选择新地址之后，刷新订单信息
		addressId() {
			// 到店模式下，由 DeliveryType 组件加载自提点后自行刷新
			if (this.isYearCardTake || this.serviceType == 1) return;
			this.refreshCartInfo();
		},
		// 订单信息变更后，重新初始化优惠券相关使用信息
		cartInfo() {
			this.initCouponUseInfo();
			// 年/次卡商品初始化选中类型，并从购物车数据获取商户ID
			if (this.isYearCard) {
				// 用户未手动切换时，才从接口数据初始化类型
				if (!this.yearCardTypeChangedByUser) {
					this.yearCardSelectedType = this.yearCardServiceType;
				}
				if (!this.merId && this.cartInfo.order.length) {
					this.merId = this.cartInfo.order[0].mer_id;
				}
			}
		}
	},
	onLoad(options) {
		if (!this.isLogin) {
			toLogin();
			return;
		}
		if (!options.cartId) return this.$util.Tips({
			title: '请选择要购买的商品'
		}, {
			tab: 3,
			url: 1
		});

		this.couponId = Number(options.couponId) || 0;
		this.formId = options.formId || "";
		this.cartId = options.cartId;
		this.serviceType = options.serviceType;
		this.merId = options.merId;
		this.addressId = Number(options.addressId) || 0;
		if (this.payType == 'weixin') {
			this.payType = this.from
		}
		this.getUserInfo();
		this.refreshCartInfo();
	},
	methods: {
		// 地址选择器加载完成
		handleAddressLoaded() {
			!this.cartInfo && this.refreshCartInfo();
		},
		precheckSubmitOrder() {
			if (!this.payType) {
				return '请选择支付方式';
			}
			if (this.cartInfo.status === "noAddress") {
				return '请选择收货地址';
			};
			if (this.cartInfo.status !== "finish" && this.cartInfo.order_model === GOODS_ACTIVITY_TYPE.NORMAL) {
				return '收货地址不在配送区域';
			}
			if (this.cartInfo.status === "noDeliver") {
				return '暂不发货';
			}

			// 预售订单需要检查是否同意协议
			if (this.cartInfo.order_type === GOODS_ACTIVITY_TYPE.PRE_SALE && !this.isAgreePresaleProtocol && this.cartInfo.order[0].list[0].productPresell.presell_type === 2) {
				return '请阅读并勾选协议，否则无法进行操作';
			}

			// 自提订单需要检查收货人信息
			if (this.hasSelfTakeOrder) {
				const { real_name, phone } = this.contactInfo;
				if (!real_name) {
					return '请填写收货人姓名';
				}
				if (!phone) {
					return '请填写收货人电话';
				}
				if (!/^1([3-9])\d{9}$/i.test(phone)) {
					return '收货人电话格式不正确';
				}
			}
			
			// 检查收货地址是否在配送范围内
			if (this.hasNotInRange) {
				return '收货地址不在配送范围内!';
			}

			// 预约订单不需要检查同城配送、自提点相关检查，直接跳过
			if (this.isBookingOrder) return null;

			for (const storeOrder of this.cartInfo.order) {
				if (storeOrder.order.isCityTake) {
					// 同城配送相关检查

					// 该店铺选择的同城配送站点和日期等数据
					const deliverySetting = this.deliverySettingMap[storeOrder.mer_id];
					if (!deliverySetting) {
						return "找不到该店铺的配送设置数据";
					}
					const localData = this.localDeliveryData[storeOrder.mer_id];
					if (!localData || !localData.take_id) {
						return '请选择同城配送点';
					}

					if (deliverySetting.delivery_time_type === 1) {
						// 如果支持自定义配送时间，则需要检查是否选择了配送时间
						if (!localData.date || !localData.week || !localData.time) {
							return '请选择配送时间';
						}
					}
				} else if (storeOrder.order.isTake) {
					// 自提相关检查

					// 该店铺的自提相关配置
					const selfPickConfig = this.selfPickData[storeOrder.mer_id];
					if (!selfPickConfig || !selfPickConfig.take_id) {
						return '请选择自提点';
					}
				}
			}

			return null;
		},
		// 提交订单
		async handleSubmitOrder() {
			if (!this.submitBtnInfo.allowSubmit) return;
			const errorMsg = this.precheckSubmitOrder();
			if (errorMsg) {
				this.$util.Tips({
					title: errorMsg
				});
				return;
			}

			let formValue = null;

			if (this.formId === "1") {
				// 来自预约商品页面且携带了表单参数
				// 从缓存中获取表单参数
				formValue = uni.getStorageSync('extendInfo');
			} else if (this.systemFormConfig) {
				// 来自普通商品页面且携带了表单参数
				const rawFormValue = this.$refs.systemForm.getData();

				// 如果表单数据为空，则拒绝提交，表单组件内部会提示用户填写表单
				if (!rawFormValue) return;

				formValue = [Object.entries(rawFormValue)
					.reduce((result, [key, info]) => {
						result[key] = info.value;
						return result;
					}, {})];
			}

			const payload = {
				cart_id: this.cartId.split(","), // 购物车ID
				use_coupon: this.merUseCoupon, // 使用的店铺优惠券和平台优惠券
				pay_type: this.payType, // 支付方式
				mark: this.remarkMap, // 各个商户的备注信息 map
				order_type: this.cartInfo.order_type, // 订单类型
				key: this.cartInfo.key, // 订单 key
				use_integral: this.useIntegral, // 是否使用积分
				receipt_data: {}, // ??
				extend: formValue, // 表单参数
				// #ifdef WEB
				return_url: 'http://' + window.location.host + '/pages/users/order_list/index', //回调地址
				// #endif
			}
			if (this.cartInfo.order_model !== GOODS_TYPE.BOOKING) {
				Object.assign(payload, {
					takes: this.selfPickData, // 自提相关数据
					city_takes: this.localDeliveryData, // 同城配送数据
					post: this.contactInfo, // 自提联系人信息
				});
			}
			// 年/次卡商品
			if (this.isYearCard) {
				if (this.yearCardSelectedType === 1) {
					let customerInfo = {
						real_name: this.contactInfo.real_name || '',
						phone: this.contactInfo.phone || ''
					};
					if (!customerInfo.real_name) {
						const cachedInfo = uni.getStorageSync('customerInfo');
						if (cachedInfo && cachedInfo.real_name) {
							customerInfo = cachedInfo;
						}
					}
					Object.assign(payload, {
						post: customerInfo,
						takes: this.selfPickData,
					});
				} else {
					payload.address_id = this.addressId;
				}
			} else if (this.serviceType === "1") {
				let customerInfo = {
					real_name: this.contactInfo.real_name || '',
					phone: this.contactInfo.phone || ''
				};
				if (!customerInfo.real_name) {
					const cachedInfo = uni.getStorageSync('customerInfo');
					if (cachedInfo && cachedInfo.real_name) {
						customerInfo = cachedInfo;
					}
				}
				Object.assign(payload, {
					post: customerInfo,
					takes: this.selfPickData,
				});
			} else {
				payload.address_id = this.addressId;
			}

			if (payload.mark) {
				const values = Object.values(payload.mark);
				if (values.length) {
					const hasEmoji = values.some(value => isEmojiCharacter(value));
					if (hasEmoji) {
						this.$util.Tips({
							title: '备注不允许输入表情！'
						});
						return;
					}
				}
			}

			const userBalance = parseFloat(this.userInfo.now_money);
			const totalPrice = parseFloat(this.cartInfo.order_price);

			if (payload.pay_type === PAY_TYPE.BALANCE && userBalance < totalPrice) {
				this.$util.Tips({
					title: '余额不足！'
				});
				return;
			}
			try {
			 const selfTakeContact = payload.post;
				uni.setStorageSync('selfTakeContactInfo', selfTakeContact);
			} catch (e) {
				console.error('保存联系人信息失败', e);
			}
			this.handlePayment(payload);
		},
		async handlePayment(payload) {
			uni.showLoading({
				title: '订单支付中',
				mask: true
			});

			// #ifdef MP
			await openPaySubscribe();
			// #endif

			try {
				const res = await createOrder(payload);
				uni.hideLoading();
				const payStatus = res.data.status;
				if (payStatus !== 'success') {
					uni.navigateTo({
						url: `/pages/users/order_payment/index?order_id=${res.data.order_id}&from_type=order`
					});
					return;
				}

				const {
					order_id: orderId,
					pay_key: callbackKey,
					config: jsConfig
				} = res.data.result;
				const redirectUrl = `/pages/order_pay_status/index?order_id=${orderId}&msg=${res.message}`;

				switch (payStatus) {
					case 'ORDER_EXIST':
					case 'EXTEND_ORDER':
					case 'PAY_ERROR':
					case 'error':
						return this.$util.Tips({
							title: res.message
						}, {
							tab: 5,
							url: redirectUrl
						});
					case 'success':
						return this.$util.Tips({
							title: res.message,
							icon: 'success'
						}, {
							tab: 5,
							url: redirectUrl
						});
					case 'alipay':
					case "alipayQr":
						uni.navigateTo({
							url: `/pages/order_pay_back/index?keyCode=${callbackKey}&url=${jsConfig}`
						})
						return;
					// #ifndef MP
					case "wechat":
					case "weixin":
					case "weixinApp":
						return this.handleWechatEnvPay(orderId, jsConfig, redirectUrl);
					// #endif
					// #ifdef MP
					case "routine":
						return this.handleMpPay(orderId, jsConfig, redirectUrl);
					// #endif
					case "balance":
						return this.$util.Tips({
							title: res.message
						}, {
							tab: 5,
							url: redirectUrl + '&status=1'
						});
					// #ifdef H5
					case "h5":
						return this.handleH5Pay(orderId, jsConfig, res.message);
					// #endif
					// #ifdef APP-PLUS
					case "alipayApp":
						return this.handleAlipayAppPay(orderId, jsConfig, redirectUrl);
					// #endif
					default:
						return this.$util.Tips({
							title: '取消支付'
						}, {
							tab: 5,
							url: `/pages/order_pay_status/index?order_id=${orderId}&msg=取消支付&status=0`
						});
				}

			} catch (error) {
				uni.hideLoading();
				this.$util.Tips({
					title: error
				});
			}
		},
		// APP-PLUS环境下的支付宝支付
		async handleAlipayAppPay(orderId, jsConfig, redirectUrl) {
			uni.requestPayment({
				provider: 'alipay',
				orderInfo: jsConfig,
				success: (e) => {
					return this.$util.Tips({
						title: '支付成功',
						icon: 'success'
					}, {
						tab: 5,
						url: redirectUrl
					});
				},
				fail: (e) => {
					let pages = '/pages/order_pay_status/index?order_id=' +
						orderId + '&msg=支付失败'
					return this.$util.Tips({
						title: '支付失败'
					}, {
						tab: 5,
						url: pages
					});
				},
				complete: () => {
					uni.hideLoading();
					let pages = '/pages/order_pay_status/index?order_id=' +
						orderId + '&msg=取消支付'
					return this.$util.Tips({
						title: ''
					}, {
						tab: 5,
						url: pages
					});
				},
			});
		},
		// H5环境下的支付
		async handleH5Pay(orderId, jsConfig, message) {
			let host = window.location.protocol + "//" + window.location.host;
			let url = `${host}/pages/order_pay_status/index?order_id=${orderId}&msg=${message}`
			let eUrl = encodeURIComponent(url)
			let jsurl = jsConfig.mweb_url || jsConfig.h5_url
			let locations = `${jsurl}&redirect_url=${eUrl}`
			setTimeout(() => {
				location.href = locations;
			}, 100);
		},
		// 微信小程序环境下的支付
		async handleMpPay(orderId, jsConfig, redirectUrl) {
			jsConfig.timeStamp = jsConfig.timestamp;
			const payMethod = uni.requestOrderPayment ? 'requestOrderPayment' : 'requestPayment';
			uni[payMethod]({
				...jsConfig,
				success: (res) => {
					this.$util.Tips({
						title: '支付成功',
						icon: 'success'
					}, {
						tab: 5,
						url: redirectUrl
					});
				},
				fail: (e) => {
					const url = '/pages/order_pay_status/index?order_id=' + orderId + '&msg=取消支付';
					this.$util.Tips({
						title: '取消支付'
					}, {
						tab: 5,
						url: url + '&status=0'
					});
				},
			});
		},
		// 非微信小程序环境下的微信支付
		async handleWechatEnvPay(orderId, jsConfig, redirectUrl) {
			jsConfig.timeStamp = jsConfig.timestamp;
			// #ifndef APP-PLUS
			// 一般是微信公众号环境下微信支付
			try {
				const res = await this.$wechat.pay(jsConfig);
				return this.$util.Tips({
					title: res.message,
					icon: 'success'
				}, {
					tab: 4,
					url: redirectUrl
				});
			} catch (error) {
				if (error.errMsg == 'chooseWXPay:cancel') return this.$util.Tips({
					title: '取消支付'
				}, {
					tab: 5,
					url: redirectUrl + '&status=0'
				});
			}
			// #endif
			// #ifdef APP-PLUS
			// 一般是APP内的微信支付
			const payMethod = uni.requestOrderPayment ? 'requestOrderPayment' : 'requestPayment';
			uni[payMethod]({
				provider: 'wxpay',
				orderInfo: jsConfig,
				success: (e) => {
					const url = '/pages/order_pay_status/index?order_id=' + orderId +
						'&msg=支付成功';
					this.$util.Tips({
						title: '支付成功',
						icon: 'success'
					}, {
						tab: 4,
						url
					});
				},
				fail: (e) => {
					const url = '/pages/order_pay_status/index?order_id=' + orderId + '&msg=取消支付';
					this.$util.Tips({
						title: '取消支付',
					}, {
						tab: 4,
						url
					});
				},
				complete: () => {
					const url = '/pages/order_pay_status/index?order_id=' + orderId + '&msg=取消支付';
					this.$util.Tips({
						title: '',
					}, {
						tab: 4,
						url: url
					});
				},
			});
			// #endif
		},
		// 打开优惠明细
		handleOpenDiscount() {
			this.isDiscountVisible = true;
		},
		// 关闭优惠明细
		handleCloseDiscount() {
			this.isDiscountVisible = false;
		},
		// 初始化优惠券使用信息
		initCouponUseInfo() {
			const cartInfo = this.cartInfo;
			if (cartInfo.platformCoupon.length) {
				this.merUseCoupon[0] = cartInfo.platformCoupon.reduce((result, { coupon_user_id, checked }) => {
					checked && result.push(coupon_user_id);
					return result;
				}, []);
			}

			// 优惠券使用信息
			const couponMap = {};

			const func = (couponList, merId) => {
				if (!couponList.length) return;
				couponMap[merId] = couponList.reduce((result, { coupon_user_id, checked }) => {
					checked && result.push(coupon_user_id);
					return result;
				}, []);
			}

			// 平台优惠券
			func(cartInfo.platformCoupon, 0);

			// 店铺优惠券
			cartInfo.order.forEach(item => {
				func(item.coupon, item.mer_id);
			});

			this.merUseCoupon = couponMap;
		},
		// 切换积分使用状态
		handleChangeUseIntegral(value) {
			this.useIntegral = value;
			this.refreshCartInfo();
		},
		// 获取个人信息
		getUserInfo() {
			getUserInfo().then(res => {
				this.userInfo = res.data
			});
		},
		// 选择店铺优惠券
		handleSelectCoupon({ merId, couponUserId }) {
			// 如果该商户的优惠券数组不存在，则初始化为空数组
			if (!this.merUseCoupon[merId]) {
				this.merUseCoupon[merId] = [];
			}

			// 如果优惠券已存在，则移除；否则添加
			if (this.merUseCoupon[merId].includes(couponUserId)) {
				this.merUseCoupon[merId] = this.merUseCoupon[merId].filter(id => id !== couponUserId);
			} else {
				this.merUseCoupon[merId].push(couponUserId);
			}

			// 刷新购物车订单信息
			this.refreshCartInfo();
		},
		// 切换配送方式
		handleChangeDeliveryType(payload) {
			const clearSelfPickupData = () => {
				// 清理自提数据中关于该商户的配置
				delete this.selfPickData[payload.merId];
			}

			const clearLocalDeliveryData = () => {
				// 清理同城数据中关于该商户的配置
				delete this.localDeliveryData[payload.merId];
			}

			if (payload.type === DELIVERY_TYPE.LOCAL_DELIVERY) {
				// 配送方式为同城配送
				clearSelfPickupData();
				this.$set(this.localDeliveryData, payload.merId, payload.data);
			} else if (payload.type === DELIVERY_TYPE.SELF_PICKUP) {
				// 配送方式为自提
				clearLocalDeliveryData();
				this.$set(this.selfPickData, payload.merId, payload.data);
			} else {
				// 普通方式配送
				clearSelfPickupData();
				clearLocalDeliveryData();
			}

			this.refreshCartInfo();
		},
		getFromType() {
			// #ifdef H5
			return this.$wechat.isWeixin() ? 'weixin' : 'h5'
			// #endif
			// #ifdef MP
			return 'routine'
			// #endif
			// #ifdef APP-PLUS
			return 'weixin'
			// #endif
		},
		// 年/次卡商品切换服务类型
		handleYearCardChangeType(item) {
			this.yearCardTypeChangedByUser = true;
			this.yearCardSelectedType = item.type;
			// 切换到到店时，由 DeliveryType 加载自提点后自行刷新
			if (item.type !== 1) {
				this.refreshCartInfo();
			}
		},
		async refreshCartInfo() {
			uni.showLoading({ mask: true });
			const payload = {
				cart_id: this.cartId.split(","),
				use_coupon: this.merUseCoupon,
				use_integral: this.useIntegral,
				city_takes: this.localDeliveryData
			};

			// 年/次卡商品
			if (this.isYearCard) {
				if (this.yearCardSelectedType === 1) {
					payload.takes = this.selfPickData;
				} else if (this.addressId) {
					payload.address_id = this.addressId;
				}
			} else if (Object.keys(this.selfPickData).length > 0) {
				payload.takes = this.selfPickData;
			} else if (this.serviceType === "1") {
				payload.takes = this.selfPickData;
			} else if (this.addressId) {
				payload.address_id = this.addressId;
			}

			try {
				const res = await getOrderConfirm(payload);
				uni.hideLoading();
				this.cartError = null;
				this.cartInfo = res.data;
			} catch (error) {
				uni.hideLoading();
				this.cartError = error;
				this.$util.Tips({
					title: error
				});
			} finally {
			}
		}
	}
}
</script>

<style scoped lang="scss">
::v-deep checkbox .uni-checkbox-input.uni-checkbox-input-checked,
::v-deep checkbox .wx-checkbox-input.wx-checkbox-input-checked {
	border: 1px solid var(--view-theme) !important;
	background-color: var(--view-theme) !important;
	color: #fff !important;
	border-radius: 100% !important;
}

::v-deep checkbox .uni-checkbox-input,
::v-deep checkbox .wx-checkbox-input {
	border-radius: 100% !important;
}

::v-deep radio .wx-radio-input.wx-radio-input-checked,
::v-deep uni-radio .uni-radio-input.uni-radio-input-checked {
	border: 1px solid var(--view-theme) !important;
	background-color: var(--view-theme) !important;
}


::v-deep uni-checkbox-group,
.checkgroup {
	width: 100%;

	.checkbox {
		float: right;
	}
}

::v-deep .icon-icon_question.iconfont {
	color: #bbb;
	font-size: 36rpx;
	margin-left: 16rpx;
}

.nav-wrapper {
	background-image: linear-gradient(90deg, var(--view-bntColor22) 0%, var(--view-bntColor21) 100%);
	top: 0;
	left: 0;
	right: 0;
	z-index: 1;
}

.order-submission {
	padding: 0 20rpx;
	margin-top: -70rpx;
}

::v-deep .placeholder {
	color: #ccc;
}

::v-deep .field-item {
	padding: 27rpx 30rpx;
	font-size: 30rpx;
	color: #282828;

	.icon-ic_rightarrow {
		color: #515151;
		font-size: 30rpx;
		margin-left: 4rpx;
	}

	input {
		flex: 1;
		height: 100%;
		margin-left: 20rpx;
		text-align: right;
	}
}

.footer {
	width: 100%;
	height: calc(120rpx + var(--safe-area-inset-bottom));
	background-color: #fff;
	padding: 0 30rpx var(--safe-area-inset-bottom);
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 30;

	.footer_count {
		font-size: 28rpx;

		>view {
			align-items: baseline;
		}

		.pColor {
			margin-left: 12rpx;
			color: var(--view-priceColor);
		}
	}

	.coupon_price {
		color: #999999;
		font-size: 22rpx;
		margin-top: 10rpx;

		text {
			color: #666666;
			background: #F5F5F5;
			border-radius: 26rpx;
			margin-left: 20rpx;
			height: 34rpx;
			line-height: 34rpx;
			display: inline-block;
			width: 104rpx;
			text-align: center;
			font-size: 18rpx;
		}
	}

	.settlement {
		font-size: 30rpx;
		color: #fff;
		width: 200rpx;
		height: 72rpx;
		background-color: var(--view-theme);
		border-radius: 60rpx;
		text-align: center;
		line-height: 72rpx;
		font-size: 26rpx;

		&.disabled {
			background-color: #cccccc;
		}
	}
}

.form-wrapper {
	margin-top: 20rpx;
	padding: 0 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	font-size: 30rpx;
}
</style>
