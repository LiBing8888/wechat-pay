<template>
	<view class="card-verification">
		<view v-if="actualOrderList.length > 0">
			<view class='cancellate'>
				<view class="bg-f boder-24">
					<view class="order acea-row row-between">
						<view class="order_sn">订单号：{{actualOrderData.order_sn}}</view>
					</view>
					<view class='list'>
						<view class='item acea-row'>
							<view v-for="goods in actualOrderList" :key="goods.cart_id" class='picTxt acea-row row-between-wrapper'>
								<view class='pictrue'>
									<image :src='goods.cart_info.product.image'></image>
								</view>
								<view class='text'>
									<view class='line1 name'>{{goods.cart_info.product.store_name}}</view>
									<!-- <view class='attr'>默认规格</view> -->
									<view class="callate_bom acea-row row-between">
										<view class="callate_text">
											已核销：<text class="text-blue">{{getUsedCount(goods)}}</text>/{{getTotalCount(goods)}}
										</view>
										<view v-if="!readonly" class='acea-row row-center-wrapper'>
											<view class="reduce" :class="(goods.numSub || goods.refund_num == 1) ? 'on' : ''" @click.stop='subCart(goods)'>
												<text class="iconfont icon-ic_Reduce"></text>
											</view>
											<input
												class="num-input"
												type="number"
												:value="goods.refund_num"
												@input="onNumInput($event, goods)"
												@blur="onNumBlur(goods)"
											/>
											<view class="add" :class="(goods.max_count <= goods.refund_num || goods.numAdd) ? 'on' : ''" @click.stop='addCart(goods)'>
												<text class="iconfont icon-ic_increase"></text>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<!--核销记录-->
				<view v-if="actualRecordList.length > 0" class="callate_record mt-20 bg-f boder-24">
					<view class="title">核销记录</view>
					<view>
						<view v-for="(item,index) in actualRecordList" :key="index" class="record-item acea-row row-between">
							<view class="record-time">{{item.create_time}}</view>
							<view class="record-count">核销{{item.verify_count}}次</view>
						</view>
					</view>
					<view class="load-more" v-if="!recordLoaded">
						<text v-if="recordLoading" class="loading-text">加载中...</text>
						<text v-else class="load-text" @click="loadMoreRecords">点击加载更多</text>
					</view>
				</view>
				<view v-else class="no-record bg-f mt-20 boder-24">
					<emptyPage title="暂无核销记录~" :noImage="`${domain}/static/images/noRecord.png`"></emptyPage>
				</view>
			</view>
			<view class='footer acea-row row-between-wrapper' v-if="!readonly && actualOrderList.length > 0">
				<view v-if="isVerified" @click="handleGoBack" class="acea-row row-middle footer-full-btn">
					<text class="button-verified">返回工作台</text>
				</view>
				<template v-else>
					<view @click="handleGoBack" class="acea-row row-middle">
						<text class="button-return">返回工作台</text>
					</view>
					<view class='acea-row row-middle'>
						<form @submit="goCallate" report-submit='true'>
							<button class='placeOrder' formType="submit">确认核销</button>
						</form>
					</view>
				</template>
			</view>
		</view>
		<!--核销成功弹窗-->
		<view v-if="!readonly && showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
			<view class="modal-content" @click.stop>
				<view class="modal-title">核销成功</view>
				<view class="modal-desc">当前订单已完成核销</view>
				<view class="modal-btn" @click="closeSuccessModal">知道了</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { cardVerifyCode, cardVerifyRecord } from '@/api/admin.js';
	import { getOrderCardLog } from '@/api/order.js';
	
	import { mapGetters } from "vuex";
	import { HTTP_REQUEST_URL } from '@/config/app';
	import emptyPage from '@/components/emptyPage.vue';
	export default {
		name: 'CardVerification',
		components: {
			emptyPage
		},
		props: {
			verifyCode: {
				type: String,
				default: ''
			},
			merId: {
				type: [String, Number],
				default: ''
			},
			isScan: {
				type: [String, Number],
				default: 0
			},
			readonly: {
				type: Boolean,
				default: false
			},
			recordList: {
				type: Array,
				default: () => []
			},
			orderData: {
				type: Object,
				default: () => ({})
			},
			orderList: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				domain: HTTP_REQUEST_URL,
				localOrderList: [],
				localRecordList: [],
				isVerified: false,
				showSuccessModal: false,
				recordPage: 1,
				recordLimit: 20,
				recordLoading: false,
				recordLoaded: false
			};
		},
		computed: {
			...mapGetters(['isLogin']),
			hasParentData() {
				return this.orderData && this.orderData.order_sn;
			},
			actualOrderData() {
				return this.orderData;
			},
			actualOrderList() {
				return this.localOrderList.length > 0 ? this.localOrderList : this.orderList;
			},
			actualRecordList() {
				return this.localRecordList.length > 0 ? this.localRecordList : this.recordList;
			}
		},
		watch: {
			actualOrderData: {
				handler(val) {
					if (val && val.order_id) {
						this.fetchRecordList();
						this.updateMaxCount();
					}
				},
				immediate: true
			},
			orderList: {
				handler(val) {
					if (val && val.length > 0) {
						this.localOrderList = val.map(item => ({
							...item,
							refund_num: item.refund_num || 1,
							max_count: this.getMaxCount(),
							numSub: item.numSub !== undefined ? item.numSub : (item.refund_num <= 1),
							numAdd: item.numAdd !== undefined ? item.numAdd : this.isMaxCountReached(item.refund_num)
						}));
					} else {
						this.localOrderList = [];
					}
				},
				immediate: true,
				deep: true
			}
		},
		mounted() {
		},
		methods: {
			getUsedCount(goods) {
				let card;
				if (this.merId && this.verifyCode) {
					card = this.actualOrderData?.storeUserCard;
				} else {
					card = this.actualOrderData?.user_cards?.[0];
				}
				if (card) {
					return card.used_count || 0;
				}
				return 0;
			},
			getTotalCount(goods) {
				let card;
				if (this.merId && this.verifyCode) {
					card = this.actualOrderData?.storeUserCard;
				} else {
					card = this.actualOrderData?.user_cards?.[0];
				}
				if (card) {
					return card.remaining_count == -1 ? "不限次数" : card.total_count;
				}
				return 0;
			},
			getMaxCount() {
				let card;
				if (this.merId && this.verifyCode) {
					card = this.actualOrderData?.storeUserCard;
				} else {
					card = this.actualOrderData?.user_cards?.[0];
				}
				if (card) {
					if (card.remaining_count == -1) {
						return 99999;
					}
					return card.remaining_count || 0;
				}
				return 0;
			},
			isMaxCountReached(num) {
				let card;
				if (this.merId && this.verifyCode) {
					card = this.actualOrderData?.storeUserCard;
				} else {
					card = this.actualOrderData?.user_cards?.[0];
				}
				if (card && card.remaining_count == -1) {
					return false;
				}
				const max = this.getMaxCount();
				return num >= max;
			},
			updateMaxCount() {
				const maxCount = this.getMaxCount();
				this.localOrderList.forEach(item => {
					this.$set(item, 'max_count', maxCount);
					this.$set(item, 'numAdd', this.isMaxCountReached(item.refund_num));
				});
			},
			fetchRecordList(isLoadMore = false) {
				if (!this.actualOrderData?.order_id) return;
				if (this.recordLoading || (this.recordLoaded && !isLoadMore)) return;
				this.recordLoading = true;
				const apiParams = {
					page: this.recordPage,
					limit: this.recordLimit
				};
				const requestFn = this.merId && this.verifyCode 
					? cardVerifyRecord(this.merId, this.actualOrderData.order_id, apiParams)
					: getOrderCardLog(this.actualOrderData.order_id, apiParams);
				requestFn.then(res => {
					this.recordLoading = false;
					const list = res.data?.list || [];
					if (isLoadMore) {
						this.localRecordList.push(...list);
					} else {
						this.localRecordList = list;
					}
					this.recordLoaded = list.length < this.recordLimit;
				}).catch(() => {
					this.recordLoading = false;
				});
			},
			loadMoreRecords() {
				if (this.recordLoading || this.recordLoaded) return;
				this.recordPage++;
				this.fetchRecordList(true);
			},
			
			// 商品递减
			subCart(goods) {
				if (goods.refund_num <= 0) return;
				const index = this.localOrderList.findIndex(item => item.cart_id === goods.cart_id);
				if (index === -1) return;
				const localGoods = this.localOrderList[index];
				if (localGoods.refund_num <= 1) {
					this.$set(localGoods, 'refund_num', 1);
					this.$set(localGoods, 'numSub', true);
				} else {
					this.$set(localGoods, 'refund_num', localGoods.refund_num - 1);
					this.$set(localGoods, 'numSub', false);
					this.$set(localGoods, 'numAdd', this.isMaxCountReached(localGoods.refund_num - 1));
				}
			},
			// 商品增加
			addCart(goods) {
				const index = this.localOrderList.findIndex(item => item.cart_id === goods.cart_id);
				if (index === -1) return;
				const localGoods = this.localOrderList[index];
				if (this.isMaxCountReached(localGoods.refund_num)) {
					this.$set(localGoods, 'refund_num', localGoods.max_count);
					this.$set(localGoods, 'numAdd', true);
				} else {
					this.$set(localGoods, 'refund_num', localGoods.refund_num + 1);
					this.$set(localGoods, 'numAdd', this.isMaxCountReached(localGoods.refund_num + 1));
					this.$set(localGoods, 'numSub', false);
				}
			},
			// 手动输入数量
			onNumInput(e, goods) {
				const index = this.localOrderList.findIndex(item => item.cart_id === goods.cart_id);
				if (index === -1) return;
				const localGoods = this.localOrderList[index];
				let val = parseInt(e.detail.value);
				if (isNaN(val) || val < 0) val = 0;
				if (val > localGoods.max_count) {
					val = localGoods.max_count;
					this.$set(localGoods, 'refund_num', '');
					this.$nextTick(() => {
						this.$set(localGoods, 'refund_num', val);
						this.$set(localGoods, 'numSub', val <= 1);
						this.$set(localGoods, 'numAdd', this.isMaxCountReached(val));
					});
				} else {
					this.$set(localGoods, 'refund_num', val);
					this.$set(localGoods, 'numSub', val <= 1);
					this.$set(localGoods, 'numAdd', this.isMaxCountReached(val));
				}
			},
			// 失焦校验
			onNumBlur(goods) {
				const index = this.localOrderList.findIndex(item => item.cart_id === goods.cart_id);
				if (index === -1) return;
				const localGoods = this.localOrderList[index];
				let val = localGoods.refund_num;
				if (!val || val < 1) val = 1;
				if (val > localGoods.max_count) val = localGoods.max_count;
				// 先置空再赋值，强制触发视图更新
				this.$set(localGoods, 'refund_num', '');
				this.$nextTick(() => {
					this.$set(localGoods, 'refund_num', val);
					this.$set(localGoods, 'numSub', val <= 1);
					this.$set(localGoods, 'numAdd', this.isMaxCountReached(val));
				});
			},
			getSelectedProduct() {
				let arr = [];
				this.localOrderList.forEach((item) => {
					if (item.refund_num > 0) {
						arr.push({ id: item.order_product_id, num: item.refund_num });
					}
				});
				return arr;
			},
			async goCallate() {
				let that = this;
				const [err, { confirm }] = await uni.showModal({
					title: "提示",
					content: `确定要核销此订单吗？`,
				});
				if (err || !confirm) return;
				let selectedProducts = this.getSelectedProduct();
				let parmas = selectedProducts[0] || { id: 0, num: 1 };
				cardVerifyCode(that.merId, that.actualOrderData.order_id, { verify_code: that.verifyCode, data: parmas })
					.then(res => {
						that.showSuccessModal = true;
						that.recordPage = 1;
						that.recordLoaded = false;
						that.fetchRecordList();
					})
					.catch(res => {
						that.$util.Tips({ title: res });
					});
			},
			closeSuccessModal() {
				this.showSuccessModal = false;
				this.$emit("getOrderData")
			},
			handleGoBack() {
				uni.navigateTo({
					url: '/pages/admin/business/index?is_sys=0'
				});
				
			}
		}
	}
</script>

<style scoped lang="scss">
	.card-verification {
		padding-bottom: 140rpx;
	}
	.cancellate {
		padding: 30rpx 24rpx;
		.order {
			height: 90rpx;
			padding: 0 24rpx;
			align-items: center;
			color: #282828;
			font-size: 28rpx;
		}
		.item {
			padding: 4rpx 24rpx 32rpx;
		}
		.picTxt {
			width: 100%;
			position: relative;
			align-items: center;
			.pictrue {
				width: 130rpx;
				height: 130rpx;
				image {
					width: 100%;
					height: 100%;
					border-radius: 16rpx;
				}
			}
			.text {
				width: 510rpx;
				font-size: 28rpx;
				color: #282828;
			}
			.text .attr {
				margin-top: 12rpx;
				color: #999999;
				font-size: 24rpx;
			}
			.callate_text {
				font-size: 24rpx;
				color: #666;
				.text-blue {
					color: #2A7EFB;
				}
			}
			.callate_bom {
				margin-top: 14rpx;
				align-items: center;
				.num-input {
					width: 72rpx;
					height: 36rpx;
					text-align: center;
					font-size: 24rpx;
					background: #F5F5F5;
					border-radius: 4rpx;
					margin: 0 10rpx;
					padding: 0;
				}
				.iconfont {
					font-size: 20rpx;
					color: #333;
				}
				.on {
					color: #ccc;
				}
			}
		}
	}
	.callate_record {
		padding: 30rpx 24rpx 2rpx 24rpx;
		.title {
			font-size: 28rpx;
			font-weight: 500;
			margin-bottom: 20rpx;
		}
		.record-item {
			padding: 30rpx 0;
			border-bottom: 1px solid #eee;
			&:last-child {
				border-bottom: none;
			}
		}
		.record-count {
			color: #666;
		}
		.load-more {
			padding: 24rpx 0;
			text-align: center;
			.loading-text {
				font-size: 24rpx;
				color: #999;
			}
			.load-text {
				font-size: 24rpx;
				color: #2A7EFB;
			}
		}
	}
	.no-record {
		text-align: center;
		color: #999;
		font-size: 26rpx;
		padding-bottom: 140rpx;
	}
	.footer {
		z-index: 9;
		width: 100%;
		height: 112rpx;
		height: calc(112rpx + constant(safe-area-inset-bottom));
		height: calc(112rpx + env(safe-area-inset-bottom));
		background-color: #fafafa;
		position: fixed;
		padding: 0 24rpx;
		box-sizing: border-box;
		border-top: 1px solid #eee;
		bottom: 0;
	}
	.footer .placeOrder {
		color: #fff;
		font-size: 26rpx;
		width: 340rpx;
		height: 72rpx;
		border-radius: 100rpx;
		text-align: center;
		line-height: 72rpx;
		background-color: #2A7EFB;
		border: none;
	}
	.footer .button-return {
		color: #2A7EFB;
		border: 1px solid #2A7EFB;
		font-size: 26rpx;
		width: 340rpx;
		height: 72rpx;
		border-radius: 100rpx;
		text-align: center;
		line-height: 72rpx;
		background-color: #fff;
	}
	.footer-full-btn {
		width: 100%;
		justify-content: center;
		.button-verified {
			color: #fff;
			font-size: 26rpx;
			width: 100%;
			height: 72rpx;
			border-radius: 100rpx;
			text-align: center;
			line-height: 72rpx;
			background-color: #2A7EFB;
		}
	}
	.empty-box {
		padding-top: 160rpx;
	}
	.modal-overlay {
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
	.modal-content {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.modal-title {
		font-size: 32rpx;
		font-weight: 500;
	}
	.modal-desc {
		font-size: 28rpx;
		color: #999;
		margin: 30rpx 0 48rpx;
	}
	.modal-btn {
		width: 100%;
		height: 72rpx;
		background-color: #2A7EFB;
		border-radius: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 30rpx;
	}
</style>
