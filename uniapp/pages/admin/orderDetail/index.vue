<template>
	<BaseContainer>
		<!-- 自定义顶部背景颜色 -->
		<!-- #ifdef MP || APP-PLUS -->
		<view class="top">
			<view class="sys-head fixed">
				<view class="sys-bar" :style="{height:sysHeight}"></view>
				<!-- #ifdef MP -->
				<view class="sys-title">
					<view class='iconfont icon-ic_leftarrow' :style="{lineHeight:sysHeight}" @tap='goBack'></view>
					订单详情
				</view>
				<!-- #endif -->
				<view class="bg"></view>
			</view>
		</view>
		<!-- #endif -->
		<view class="order-details pos-order-details" :style="{marginTop:marTop}">
			<view class="header">
				<view class="state">{{ getOrderStatus(orderInfo) }}</view>
				<view class="data">
					<!-- <view class="order-num">订单：{{ orderInfo.order_sn }}</view> -->
					<view>
						<span class="create-time">
							{{ getOrderStatusDesc() }}
						</span>
					</view>
				</view>
			</view>
			<view class="pad20 order-details-count">
				<view class="remarks acea-row bg-f boder-24" v-if="goname != 'looks'" style="align-items: center;">
					<span class="iconfont icon-ic_notes"></span>
					<view class="line1" style="text-align: left; flex: 1; margin-left: 10rpx;" @click="modify('1')">
						 <text v-if="orderInfo.remark">{{orderInfo.remark}}</text>
						 <text v-else style="color: #ccc;">订单未备注，点击添加备注信息</text>
					</view>
				</view>
				<!--年/次卡商品用户信息-->
				<view v-if="orderInfo.is_virtual == 5" class="year-card-user-info bg-f boder-24 mt20">
					<view class="user-info-left">
						<image v-if="orderInfo.user && orderInfo.user.avatar" :src="orderInfo.user.avatar" class="avatar-img" />
						<span v-else class="iconfont icon-a-ic_user1"></span>
					</view>
					<view class="user-info-right">
						<view class="user-top-row acea-row row-middle">
							<view class="user-nickname">{{ (orderInfo.user && orderInfo.user.nickname) || '' }}</view>
							<view class="user-tags acea-row row-middle">
								<span v-if="orderInfo.user.is_svip" class="member-tag acea-row row-center-wrapper">SVIP</span>
								<!-- <span class="level-tag acea-row row-center-wrapper">
									<span class="iconfont icon-huiyuandengji"></span>
									<span class="level-text">{{ getLevelText((orderInfo.user && orderInfo.user.level) || '') }}</span>
								</span> -->
							</view>
						</view>
						<view class="user-id">用户ID：{{ (orderInfo.user && orderInfo.user.uid) || '' }}</view>
					</view>
				</view>
				<template v-else>
					<view class="bg-f boder-24 mt20 oder-user-info">
						<view class="orderingUser acea-row row-middle">
							<span class="iconfont icon-a-ic_user1"></span>{{ (orderInfo.user && orderInfo.user.nickname) || ''  }}
						</view>
						<view v-if="orderInfo.real_name || orderInfo.user_phone || orderInfo.user_address" class="address acea-row row-between">
							<view class="address-count">
								<view class="name">
									{{ orderInfo.real_name }}<span class="phone">{{ orderInfo.user_phone }}</span>
								</view>
								<view>{{ orderInfo.user_address }}</view>
							</view>
							<!-- #ifdef H5 -->
							<button class="copy copy-data" :data-clipboard-text="'收货人姓名：'+orderInfo.real_name+'\n收货人电话：'+ orderInfo.user_phone+'\n收货人地址：'+orderInfo.user_address">复制</button>
							<!-- #endif -->
							<!-- #ifdef MP || APP-PLUS -->
							<button class="copy" @tap="copyText">复制</button>
							<!-- #endif -->
						</view>
					</view>
					<view class="line">
						<image :src="`${domain}/static/images/line.jpg`" />
					</view>
				</template>
				
				
				<view class="pos-order-goods mt20 bg-f boder-24">
					<!-- 商品数量和核销记录按钮 -->
					<view class="goods-header acea-row row-between">
						<view class="goods-count">共{{ orderInfo.total_num || 0 }}件商品</view>
						<view v-if="orderInfo.is_virtual == 5" class="check-record-btn" @click="goCheckRecord">
							<span class="iconfont icon-ic_record"></span>
							<span>核销记录</span>
							<span class="iconfont icon-ic_rightarrow"></span>
						</view>
					</view>
					<navigator :url="`/pages/goods_details/index?id=${item.cart_info.product.product_id}`" hover-class="none" class="goods" v-for="(item, index) in orderInfo.orderProduct" :key="index">
						<view class="acea-row row-between">
							<view class="picTxt acea-row row-between-wrapper">
								<view class="pictrue">
									<image :src="item.cart_info.productAttr.image || item.cart_info.product.image" />
								</view>
								<view class="text acea-row row-between row-column">
									<view class="info line2">{{ item.cart_info.product.store_name }}</view>
									<!--年/次卡-->
									<view v-if="orderInfo.is_virtual == 5" class="card-attr attr">服务：{{card_rule.used_count}}/{{card_rule.remaining_count == -1 ? "不限次数" : card_rule.total_count}}</view>
									<view v-else class="attr line1">{{ item.cart_info.productAttr.sku || '默认' }}</view>
								</view>
							</view>
							<view class="money">
								<view class="x-money">
									<priceFormat :price="item.cart_info.productAttr.price" weight intSize="32" floatSize="22" labelSize="22"></priceFormat>
								</view>
								<view v-if="orderInfo.order_type == 0" class="y-money regular">
									￥{{item.cart_info.productAttr.ot_price}}
								</view>
								<view class="num">x{{ item.product_num }}
									<text class="font-color refund_num" v-if="item.product_num-item.refund_num>0">(-{{item.product_num-item.refund_num}})</text>
								</view>
								
							</view>
						</view>
					</navigator>
					<!--年/次卡商品订单信息-->
					<view v-if="orderInfo.is_virtual == 5" class="acea-row row-between">
						<view>有效期间</view>
						<view>
							{{cardValidity}}
						</view>
					</view>
					<view v-else class="public-total acea-row row-right">
						共{{ orderInfo.total_num }}件商品，已支付
						<view class="money">
							<priceFormat :price="orderInfo.pay_price" weight intSize="32" floatSize="22" labelSize="22"></priceFormat>
						</view> ( 运费 ¥{{orderInfo.pay_postage}} )
					</view>
				</view>
				<!-- 提货点信息 -->
				<PickUpPointInfo v-if="orderInfo.take && orderInfo.is_virtual !=5" :orderInfo="orderInfo"/>
				<!-- 配送员信息 -->
				<DeliveryInfo v-if="orderInfo.deliveryOrder" :orderInfo="orderInfo"/>
				<view class="wrapper mt20 boder-24 bg-f">
					<view class="item acea-row row-between">
						<view>订单编号</view>
						<view class="conter acea-row row-middle row-right">
							<view>{{ orderInfo.order_sn }}</view>
							<!-- #ifdef H5 -->
							<button class="copy copy-data" :data-clipboard-text="orderInfo.order_sn">复制</button>
							<!-- #endif -->
							<!-- #ifdef MP || APP-PLUS -->
							<span class="copy copy-data" @click="copyNum(orderInfo.order_sn)">复制</span>
							<!-- #endif -->
						</view>
					</view>
					<view class="item acea-row row-between">
						<view>下单时间</view>
						<view class="conter">{{ orderInfo.create_time }}</view>
					</view>
					<view class="item acea-row row-between">
						<view>支付状态</view>
						<view class="conter">
							{{ orderInfo.paid == 1 ? "已支付" : "未支付" }}
						</view>
					</view>
					<view class="item acea-row row-between">
						<view>支付方式</view>
						<view class="conter">{{ orderInfo.pay_type == 0 ? "余额支付" : (orderInfo.pay_type == 1 || orderInfo.pay_type == 2 || orderInfo.pay_type == 3) ? "微信支付" : orderInfo.pay_type == 7 ? '线下支付' : "支付宝支付" }}</view>
					</view>
					<view v-if="orderInfo.mark" class="item acea-row row-between">
						<view>买家留言</view>
						<view class="conter acea-row row-middle row-right">
							<view>{{ orderInfo.mark }}</view>
							<!-- #ifdef H5 -->
							<button class="copy copy-data" :data-clipboard-text="orderInfo.mark">复制</button>
							<!-- #endif -->
							<!-- #ifdef MP || APP-PLUS -->
							<span class="copy copy-data" @click="copyNum(orderInfo.mark)">复制</span>
							<!-- #endif -->
						</view>
					</view>
				</view>
				<block v-if="orderInfo.order_extend">
					<view v-for="(item,index) in orderInfo.order_extend" :key="index" class='wrapper mt20 boder-24 bg-f'>
						<!-- <view v-for="(item,index) in orderInfo.order_extend" v-if="item && index" :key="index" class='item acea-row row-between'>
							<view>{{index}}：</view>
							<view v-if="!Array.isArray(item)" class='conter'>{{item}}</view>
							<view v-else class='conter virtual_image'>
								<image v-for="(pic,i) in item" :key="i" class="picture" :src="pic" @click="getPhotoClickIdx(item,i)"></image>
							</view>
						</view> -->
						<view v-for="(itm,idx) in item" v-if="itm" :key="idx" class='item acea-row row-between'>
							<view>{{idx}}</view>
							<view v-if="!Array.isArray(itm)" class='conter'>{{itm}}</view>
							<view v-else class='conter virtual_image'>
								<image v-for="(pic,i) in itm" :key="i" class="picture" :src="pic" @click="getPhotoClickIdx(itm,idx)"></image>
							</view>
						</view>
					</view>
				</block>
				<view class="wrapper mt20 boder-24 bg-f">
					<view class="item acea-row row-between">
						<view>商品总价</view>
						<view class="conter">¥{{ orderInfo.total_price }}</view>
					</view>
					<view v-if="orderInfo.coupon_price > 0" class="item acea-row row-between">
						<view>优惠券抵扣</view>
						<view class="conter">-¥{{ orderInfo.coupon_price }}</view>
					</view>
					<view v-if="orderInfo.svip_discount > 0" class="item acea-row row-between">
					  <view>会员商品优惠</view>
					  <view class="conter">-¥{{ orderInfo.svip_discount }}</view>
					</view>
					<view v-if="orderInfo.integral_price > 0" class="item acea-row row-between">
						<view>积分抵扣</view>
						<view class="conter">-¥{{ orderInfo.integral_price }}</view>
					</view>
					<view v-if="orderInfo.pay_postage > 0" class="item acea-row row-between">
						<view>运费</view>
						<view class="conter">¥{{ orderInfo.pay_postage }}</view>
					</view>
					<view class="actualPay acea-row row-right">
						实付款
						<view class="money">
							<priceFormat :price="orderInfo.pay_price" weight intSize="32" floatSize="22" labelSize="22"></priceFormat>
						</view>
					</view>
				</view>
				<view class="wrapper mt20 boder-24 bg-f" v-if="orderInfo.delivery_type != '3'&& orderInfo.delivery_type">
					<view v-if="orderInfo.delivery_type != '6'" class="item acea-row row-between">
						<view>配送方式</view>
						<view class="conter" v-if="orderInfo.delivery_type === '1' || orderInfo.delivery_type === '4'">
							快递
						</view>
						<view class="conter" v-if="orderInfo.delivery_type === '2'">送货</view>
						<view class="conter" v-if="orderInfo.delivery_type === '7'">自动发卡</view>
					</view>
					<view v-if="orderInfo.is_virtual !== 5" class="item acea-row row-between">
						<view v-if="orderInfo.delivery_type === '1' || orderInfo.delivery_type === '4'">快递公司：</view>
						<view v-if="orderInfo.delivery_type === '2'">送货人</view>
						<view v-if="orderInfo.delivery_type === '6'">发货方式</view>
						<view class="conter line1">{{ orderInfo.delivery_name ? orderInfo.delivery_name : '' }}</view>
					</view>
					<view v-if="orderInfo.is_virtual !== 5" class="item acea-row row-between">
						<view v-if="orderInfo.delivery_type === '1' || orderInfo.delivery_type === '4'">快递单号：</view>
						<view v-if="orderInfo.delivery_type === '2'">送货人电话</view>
						<view v-if="orderInfo.delivery_type === '6'">卡密信息</view>
						<view class="conter" style="display: flex;">
							<text>{{ orderInfo.delivery_id ? orderInfo.delivery_id : ''}}</text>
							<!-- #ifndef H5 -->
							<text class='copy' @tap='copyKm'>复制</text>
							<!-- #endif -->
							<!-- #ifdef H5 -->
							<text class="copy copy-data" :data-clipboard-text="orderInfo.delivery_id">复制</text>
							<!-- #endif -->
						</view>
					</view>
				</view>
				<view class="foot-height"></view>
				<view class="footer-btn-box footer acea-row row-right row-middle" v-if="goname != 'looks'">
					<!-- <view class="more"></view> -->
				
					<view class="bnt cancel" @click="modify('0')" v-if="orderInfo.paid == 0">
						一键改价
					</view>
					<navigator v-if="orderInfo.status!=-1&&orderInfo.status<9&&orderInfo.paid == 1" class="bnt cancel" :url="'/pages/admin/refundList/index?mer_id='+mer_id+'&order_id='+orderInfo.order_id">
						立即退款
					</navigator>
					<view class="bnt cancel" @click="modify('1')">订单备注</view>
					
					<view class="bnt cancel" v-if="orderInfo.order_type == 2 && (orderInfo.status == 0 || orderInfo.status == 1)" @click="confirmService">确认送达</view>
					<navigator class="bnt delivery" v-if="orderInfo.paid == 1 && orderInfo.status == 0 && orderInfo.order_type == 0 && orderInfo.is_virtual != 5" :url="'/pages/admin/delivery/index?id='+orderInfo.order_id+'&merId='+mer_id">去发货</navigator>
					<view class="bnt delivery" v-if="orderInfo.paid == 1 && (orderInfo.status == 0 || orderInfo.status == 1) && orderInfo.is_virtual == 5" @click="goCancellation">去核销</view>
					<view class="bnt delivery" v-if="orderInfo.paid == 1 && (orderInfo.status == 0 || orderInfo.status == 9) && orderInfo.order_type == 1" @click="goCancellation">去核销</view>
					<view class="bnt delivery" v-if="orderInfo.order_type == 2 && orderInfo.status == 0" @click="cityAssign()">派单</view>
					<view class="bnt delivery" v-if="orderInfo.order_type == 2 && orderInfo.status == 1" @click="cityAssign(true)">改派</view>
					<view class="bnt delivery" v-if="orderInfo.pay_type == 7 && orderInfo.paid === 0" @click="offlinePay">
						确认支付
					</view>
				</view>
			</view>
			<PriceChange :change="change" :orderInfo="orderInfo" v-on:closechange="changeclose($event)" v-on:savePrice="savePrice"
			 :status="status"></PriceChange>
			<OrderAssign
				ref="orderAssign"
				v-if="orderInfo.mer_id"
				:merId="this.mer_id"
				@refresh="handleAssignSuccess" />
		</view>
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
	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import PriceChange from "@/components/shared-order/PriceChange/index.vue";
	// #ifdef H5
	import ClipboardJS from "@/plugin/clipboard/clipboard.js";
	// #endif
	import {
		getAdminOrderDetail,
		setAdminOrderPrice,
		setAdminOrderRemark,
		setOfflinePay,
		setOrderRefund,
		orderCancellation,
		confirmServiceApi,
		confirmPayApi
	} from "@/api/admin";
	import { isMoney } from '@/utils/validate.js'
	import { HTTP_REQUEST_URL } from '@/config/app';
	import OrderAssign from "../components/order_assign.vue";
	import BaseContainer from "@/components/common/base_container.vue";
	import PickUpPointInfo from "@/components/shared-order/order_detail_pick_info.vue"
	import DeliveryInfo from "@/components/shared-order/order_detail_delivery_info.vue";

	import {
		getBookingOrderStatus,
		addBookingOrderType ,
		getDeliveryOrderAdminStatus,
		getVerifyOrderAdminStatus,
		getCityDeliveryOrderAdminStatus,
	} from "@/utils/order";

	export default {
		name: "AdminOrder",
		components: {
			BaseContainer,
			PriceChange,
			OrderAssign,
			PickUpPointInfo,
			DeliveryInfo,
		},
		props: {},
		data: function() {
			return {
				sysHeight: sysHeight,
				order: false,
				change: false,
				order_id: "",
				mer_id: '',
				orderInfo: {
					_status: {},
					user: {}
				},
				domain: HTTP_REQUEST_URL,
				status: "",
				title: "",
				payType: "",
				types: "",
				clickNum: 1,
				goname:'',
				card_rule: {},
				//#ifdef H5
				marTop: 0,
				//#endif
				//#ifdef MP
				marTop: uni.getSystemInfoSync().statusBarHeight+43+'px',
				//#endif
				//#ifdef APP-PLUS
				marTop: uni.getSystemInfoSync().statusBarHeight+'px',
				//#endif
			};
		},
		watch: {
			"$route.params.oid": function(newVal) {
				let that = this;
				if (newVal != undefined) {
					that.order_id = newVal;
					that.getIndex();
				}
			}
		},
		computed: {
			cardValidity() {
			  // 如果 card_rule 不存在，返回空字符串
			  if (!this.card_rule) {
			    return '';
			  }  
			  const { validity_type, valid_start_time, valid_end_time } = this.card_rule;  
			  // 有效期文案
			  let validityText = '';
			  if (validity_type === 1) {
			    validityText = '永久有效';
			  } else {
			    validityText = `${valid_start_time}~${valid_end_time}`;
			  }  
			  // 3. 组合
			  return  validityText;
			}
		},
		onLoad: function(option) {
			let self = this
			this.order_id = option.id
			this.mer_id = option.mer_id
			this.goname = option.goname
			this.getIndex();
			// #ifdef H5
			this.$nextTick(function() {
				var clipboard = new ClipboardJS('.copy-data');
				clipboard.on('success', function(e) {
					self.$util.Tips({
						title:'复制成功'
					})
				});
				clipboard.on('error', function(e) {
					self.$util.Tips({
						title:'复制失败'
					})
				});
			});
			// #endif

		},
		methods: {
			goBack: function() {
				uni.navigateBack()
			},
			more: function() {
				this.order = !this.order;
			},
			modify: function(status) {
				this.change = true;
				this.status = status;
			},
			changeclose: function(msg) {
				this.change = msg;
			},
			// 图片预览
			getPhotoClickIdx(list, idx) {
				uni.previewImage({
					current: list[idx], //  传 Number H5端出现不兼容
					urls: list
				});
			},
			/**
			 *
			 * 剪切卡密内容
			 */
			// #ifndef H5
			copyKm: function() {
				let that = this;
				uni.setClipboardData({
					data: that.orderInfo.delivery_id,
					success: function(res){
					}
				});
			},
			// #endif
			copyText: function (e) {
			    let arr = [
			      {
			        name: "收货人姓名",
			        value: this.orderInfo.real_name
			      },
			      {
			        name: "收货人电话",
			        value: this.orderInfo.user_phone
			      },
			      {
			        name: "收货人地址",
			        value: this.orderInfo.user_address
			      }
			    ]
			    wx.setClipboardData({
			      data: `${arr.map(item =>`${item.name}: ${item.value}`).join("\n")}`,
			      success: function (res) {
			        wx.getClipboardData({
			          success: function (res) {
			            wx.showToast({
			              title: '复制成功'
			            })
			          }
			        })
			      }
			    })
			},
			// 查看核销记录
			goCheckRecord() {
				uni.navigateTo({
					url: `/pages/admin/verification_record/index?order_id=${this.order_id}&cal_code=${this.orderInfo.verify_code}&mer_id=${this.mer_id}`
				});
			},
			getIndex: function() {
				let that = this;
				getAdminOrderDetail(that.mer_id,that.order_id).then(
					res => {
						that.orderInfo = res.data;
						that.$set(that, "card_rule", res.data.user_cards?.[0]);
					},
					err => {
						that.$util.Tips({
							title: err
						}, {
							tab: 3,
							url: 1
						});
					}
				);
			},
			/*核销订单*/
			goCancellation() {
				let that = this;
				uni.navigateTo({
					url: '/pages/admin/cancellate_result/index?mer_id='+that.mer_id+'&cal_code='+that.orderInfo.verify_code+'&order_id='+that.order_id,
				})
			},
			async savePrice(opt) {
				let that = this,
					data = {},
					price = opt.price,
					refund_price = opt.refund_price,
					refund_status = that.orderInfo.refund_status,
					remark = opt.remark;
				data.order_id = that.orderInfo.order_id;
				if (that.status == 0) {
					data.price = price;
					let parmas = {
						 pay_postage: opt.orderInfo.pay_postage,
						 coupon_price: opt.orderInfo.coupon_price,
						 total_price: Number(opt.orderInfo.total_price)
					}
					setAdminOrderPrice(that.mer_id,data.order_id, parmas ).then(
						res => {
							that.change = false;
							that.$util.Tips({
								title: '改价成功',
								icon: 'success'
							})
							that.getIndex();
						},
						err => {
							console.log(err, 'err')
							that.change = false;
							that.$util.Tips({
								title: err
							});
						}
					);
				} else if (that.status == 0 && refund_status === 1) {
					if (!isMoney(refund_price)) {
						return that.$util.Tips({
							title: '请输入正确的金额'
						});
					}
					data.price = refund_price;
					data.type = opt.type;
					setOrderRefund(that.mer_id,data).then(
						res => {
							that.change = false;
							that.$util.Tips({
								title: res.message
							});
							that.getIndex();
						},
						err => {
							console.log(err, 'err')
							that.change = false;
							that.$util.Tips({
								title: err
							});
						}
					);
				} else {
					if (!remark) {
						return this.$util.Tips({
							title: '请输入备注'
						})
					}
					// data.remark = remark;
					console.log(data);
					setAdminOrderRemark(that.mer_id,data.order_id,{ remark: remark }).then(
						res => {
							that.change = false;
							this.$util.Tips({
								title: res.message,
								icon: 'success'
							})
							that.getIndex();
						},
						err => {
							that.change = false;
							that.$util.Tips({
								title: err
							});
						}
					);
				}
			},
			offlinePay: function() {
				let that = this;
				uni.showModal({
					title: '提示',
					content: '确定该订单已支付',
					success: function(res) {
						if (res.confirm) {
							confirmPayApi(that.mer_id,that.orderInfo.order_id).then(res => {
								that.getIndex();
								return that.$util.Tips({
									title: '操作成功',
									icon: 'success'
								});
								
							}).catch(err => {
								return that.$util.Tips({
									title: err
								});
							})
						}
					}
				})
			},
			copyNum(id) {
				uni.setClipboardData({
					data: id,
					success: function() {
						console.log('success');
					}
				});
			},
			copyData(id){
				uni.setClipboardData({
					data: id,
					success: function() {
						console.log('success');
					}
				});
			},
			// #ifdef H5
			webCopy(item, index) {
				console.log('yunxingle')
				let items = item
				let indexs = index
				let self = this
				if (self.clickNum == 1) {
					console.log('22')
					self.clickNum += 1
					self.webCopy(items, indexs)
				}
			},
			// #endif
			// 同城配送派单
			cityAssign(isReassign = false, isCity = true) {
				const orderId = this.orderInfo.order_id
				this.$refs.orderAssign.openPanel(orderId, isReassign, isCity);
			},
			// 派单成功
			handleAssignSuccess() {
				this.getIndex()
			},
			// 确认送达
			async confirmService() {
				const [err, { confirm }] = await uni.showModal({
				  title: "提示",
				  content: `确定要确认送达吗？`,
				});
				if (err || !confirm) return;
				uni.showLoading({
				  mask: true
				});
				const merId = this.mer_id
				const orderId = this.order_id
				confirmServiceApi(merId, orderId).then(res => {
					uni.hideLoading();
					this.$util.Tips({
						title: res.message,
						icon: 'success'
					});
					this.getIndex();
				}).catch(err => {
					this.$util.Tips({
						title: err
					});
				})
			},
			// 订单状态
			getOrderStatus(order) {
				// 已取消状态
				if (order.status === -1) return "已取消";
				// 未支付状态
				if (!order.paid) return "待支付";
				if (order.is_booking_order) {
					return getBookingOrderStatus(order);
				}
				// 年/次卡商品
				if (order.is_virtual == 3) {
					if (order.status === 0) return "待使用";
					if (order.status === 2) return "待评价";
					return "交易完成";
				}
				// 年/次卡订单（is_virtual==5）
				if (order.is_virtual == 5) {
					if (order.status === 0 || order.status === 1) return "待核销";
					if (order.status === 2) return "待评价";
					return "交易完成";
				}
				if (order.order_type == 0) {
					return getDeliveryOrderAdminStatus(order)
				}
				if (order.order_type == 1) {
					return getVerifyOrderAdminStatus(order)
				}
				if (order.order_type == 2) {
					return getCityDeliveryOrderAdminStatus(order)
				}
				return "";
			},
			// 获取会员等级文本
			getLevelText(level) {
				if (!level) return 'V1';
				// 如果是数字等级，添加V前缀
				if (!isNaN(level)) {
					return 'V' + level;
				}
				// 如果已包含V前缀，直接返回
				if (level.startsWith('V') || level.startsWith('v')) {
					return level.toUpperCase();
				}
				return 'V' + level;
			},
			// 根据订单状态返回不同的描述
			getOrderStatusDesc() {
				const status = this.getOrderStatus(this.orderInfo);
				if (status === "待评价") {
					return "所有产品已核销，可提醒用户五星好评哦～";
				} else if (status === "交易完成") {
					return "订单已完成";
				} else if (status === "待使用" || status === "待核销") {
					return "需用户出示二维码或数字即可核销";
				} else if (status === "已取消") {
					return "订单已取消";
				} else {
					return `${this.orderInfo.create_time} ${this.orderInfo.order_type == 2 ? "闪送" : this.orderInfo.order_type == 1 ? "到店自提" : "快递配送"}`;
				}
			},
		}
	};
</script>

<style lang="scss">
	/*商户管理订单详情*/
	.sys-head .bg{
		background: linear-gradient( 90deg, #2A7EFB 0%,#01ABF8 100%);
	}
	.pos-order-details .header {
		height: 212rpx;
		padding: 40rpx 30rpx;
		background-image: linear-gradient(1turn, #f5f5f5, hsla(0, 0%, 96.1%, 0)), linear-gradient(270deg, #01abf8, #2a7efb);
		background-position: 0 100%, 0 0;
		background-repeat: no-repeat;
		background-size: 100% 62px, 100% 100%;
	}
	.state {
		font-size: 30rpx !important;
		font-weight: 500;
		margin-bottom: 9px;
	}
	.create-time {
		font-size: 28rpx;
		color: #FFF;
	}
	.pos-order-details .header .state {
		font-size: 36rpx;
		color: #fff;
	}
	.pos-order-details .header .data {
		margin-left: 35rpx;
		font-size: 28rpx;
	}
	.pos-order-details .header .data .order-num {
		font-size: 30rpx;
		margin-bottom: 8rpx;
	}
	.order-details-count {
		margin-top: -50rpx;
	}
	.pos-order-details .remarks {
		width: 100%;
		height: 86rpx;
		padding: 0 30rpx;
	}
	.pos-order-details .remarks .iconfont {
		font-size: 40rpx;
	}
	.pos-order-details .remarks input {
		width: 630rpx;
		height: 100%;
		font-size: 30rpx;
	}
	.pos-order-details .remarks input::placeholder {
		color: #666;
	}
	.pos-order-details .oder-user-info {
		padding: 20rpx 30rpx 32rpx;
	}
	.pos-order-details .orderingUser {
		padding-bottom: 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	.pos-order-details .orderingUser .iconfont {
		font-size: 40rpx;
		margin-right: 15rpx;
	}
	.pos-order-details .address {
		margin-top: 0;
	}
	.pos-order-details .footer .more {
		font-size: 27rpx;
		color: #aaa;
		width: 100rpx;
		height: 64rpx;
		text-align: center;
		line-height: 64rpx;
		margin-right: 25rpx;
		position: relative;
	}
	.pos-order-details .footer .delivery {
		background: linear-gradient(to right, #2291f8 0%, #1cd1dc 100%);
		background: -webkit-linear-gradient(to right, #2291f8 0%, #1cd1dc 100%);
		background: -moz-linear-gradient(to right, #2291f8 0%, #1cd1dc 100%);
	}
	.pos-order-details .footer .more .order .arrow {
		width: 0;
		height: 0;
		border-left: 11rpx solid transparent;
		border-right: 11rpx solid transparent;
		border-top: 20rpx solid #e5e5e5;
		position: absolute;
		left: 15rpx;
		bottom: -18rpx;
	}
	.pos-order-details .footer .more .order .arrow:before {
		content: '';
		width: 0;
		height: 0;
		border-left: 9rpx solid transparent;
		border-right: 9rpx solid transparent;
		border-top: 19rpx solid #fff;
		position: absolute;
		left: -10rpx;
		bottom: 0;
	}
	.pos-order-details .footer .more .order {
		width: 200rpx;
		background-color: #fff;
		border: 1px solid #eee;
		border-radius: 10rpx;
		position: absolute;
		top: -200rpx;
		z-index: 9;
	}
	.pos-order-details .footer .more .order .item {
		height: 77rpx;
		line-height: 77rpx;
	}
	.pos-order-details .footer .more .order .item~.item {
		border-top: 1px solid #f5f5f5;
	}
	.pos-order-details .footer .more .moreName {
		width: 100%;
		height: 100%;
	}
	.order-details .header.on {
		background-color: #666 !important;
	}
	.order-details .header .pictrue {
		width: 110rpx;
		height: 110rpx;
	}
	.order-details .header .pictrue image {
		width: 100%;
		height: 100%;
	}
	.order-details .header .data {
		color: rgba(255, 255, 255, 0.8);
		font-size: 24rpx;
		margin-left: 27rpx;
	}
	.order-details .header.on .data {
		margin-left: 0;
	}
	.order-details .header .data .state {
		font-size: 30rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 7rpx;
	}
	.data {
		margin-left: 0 !important;
	}
	.order-details .nav {
		background-color: #fff;
		font-size: 26rpx;
		color: #282828;
		padding: 25rpx 0;
	}
	.order-details .nav .navCon {
		padding: 0 40rpx;
	}
	.order-details .nav .navCon .on {
		font-weight: bold;
		color: #e93323;
	}
	.order-details .nav .progress {
		padding: 0 65rpx;
		margin-top: 10rpx;
	}
	.order-details .nav .progress .line {
		width: 100rpx;
		height: 2rpx;
		background-color: #939390;
	}
	.order-details .nav .progress .iconfont {
		font-size: 25rpx;
		color: #939390;
		margin-top: -2rpx;
		width: 30rpx;
		height: 30rpx;
		line-height: 33rpx;
		text-align: center;
		margin-right: 0 !important;
	}
	.order-details .address {
		font-size: 26rpx;
		color: #999;
		padding-top: 36rpx;
		position: relative;
	}
	.address-count{
		max-width: 580rpx;
	}
	.order-details .address .name {
		font-size: 30rpx;
		color: #282828;
		margin-bottom: 16rpx;
	}
	.order-details .address .name .phone {
		margin-left: 24rpx;
	}
	.order-details .line {
		width: 670rpx;
		height: 3rpx;
		position: relative;
		left: 15rpx;
	}
	.order-details .line image {
		width: 100%;
		height: 100%;
		display: block;
	}
	.order-details .wrapper {
		padding: 30rpx;
	}
	.order-details .wrapper .item {
		font-size: 28rpx;
	}
	.order-details .wrapper .item~.item {
		margin-top: 26rpx;
	}
	.order-details .wrapper .item .conter {
		color: #333;
		text-align: right;
		max-width: 500rpx;
	}
	.order-details .wrapper .item .virtual_image .picture{
		width: 106rpx;
		height: 106rpx;
		border-radius: 8rpx;
		margin-right: 10rpx;
		&:nth-child(4n),&:last-child{
			margin-right: 0;
		}
	}
	.address .copy,.order-details .wrapper .item .conter .copy{
		font-size: 20rpx;
		color: #999;
		border-radius: 3rpx;
		border: 1px solid #999;
		height: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 26rpx;
		width: 68rpx;
	}
	.order-details .wrapper .actualPay {
		border-top: 1rpx solid #f0f0f0;
		margin-top: 30rpx;
		padding-top: 30rpx;
	}
	.foot-height {
		height: 100rpx;
		height: calc(100rpx+ constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
		height: calc(100rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
	}
	.order-details .wrapper .actualPay .money {
		font-weight: bold;
		font-size: 30rpx;
		color: #FF9600;
	}
	.order-details .footer {
		width: 100%;
		height: 100rpx;
		height: calc(100rpx+ constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
		height: calc(100rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
		position: fixed;
		bottom: 0;
		left: 0;
		background-color: #fff;
		padding: 0 30rpx;
		border-top: 1px solid #eee;
	}
	.order-details .footer .bnt {
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		line-height: upx;
		border-radius: 50rpx;
		color: #fff;
		font-size: 24rpx;
	}
	.order-details .footer .bnt.cancel {
		color: #666;
		border: 1px solid #ddd;
	}
	.order-details .footer .bnt.default {
		color: #444;
		border: 1px solid #444;
	}
	.order-details .footer .bnt~.bnt {
		margin-left: 18upx;
	}
	.pos-order-goods {
		padding: 30rpx;
		position: relative;
		.goods-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 30rpx;
			.goods-count {
				font-size: 28rpx;
				color: #282828;
			}
			.check-record-btn {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				color: #999;
				.iconfont {
					font-size: 26rpx;
					&:first-child {
						margin-right: 6rpx;
					}
					&:last-child {
						margin-left: 6rpx;
					}
				}
			}
		}
	}
	.pos-order-goods .goods {
		overflow: hidden;
		margin-bottom: 26rpx;
		&:last-child{
			margin-bottom: 0;
		}
	}
	.pos-order-goods .goods .picTxt {
		width: 470rpx;
	}
	.pos-order-goods .goods .picTxt .pictrue {
		width: 130rpx;
		height: 130rpx;
	}
	.pos-order-goods .goods .picTxt .pictrue image {
		width: 100%;
		height: 100%;
		border-radius: 16rpx;
	}
	.pos-order-goods .goods .picTxt .text {
		width: 320rpx;
		height: 130rpx;
	}
	.pos-order-goods .goods .picTxt .text .info {
		font-size: 28rpx;
	}
	.pos-order-goods .goods .picTxt .text .attr {
		font-size: 24rpx;
		color: #999;
		&.card-attr {
			font-size: 24rpx;
		}
	}
	
	.pos-order-goods .goods .money {
		width: 164rpx;
		text-align: right;
		font-size: 28rpx;
	}
	.pos-order-goods .goods .money .refund_num{
		display: inline-block;
		margin-left: 10rpx;
	}
	.pos-order-goods .goods .money .x-money {
		color: #282828;
	}
	.pos-order-goods .goods .money .num {
		color: #ff9600;
		margin: 5rpx 0;
	}
	.pos-order-goods .goods .money .y-money {
		color: #999;
		text-decoration: line-through;
		font-size: 22rpx;
	}
	.pos-order-goods .cancellate{
		font-size: 24rpx;
		float: right;
		margin-top: 10rpx;
		text{
			margin-left: 26rpx;
		}
	}
	.pos-order-goods .cancelled{
		color: #FF9600;
	}
	.pos-order-goods .goods .uncancell{
		color: #999999;
	}
	.public-total {
		font-size: 28upx;
		margin-top: 60rpx;
		text-align: right;
	}
	.public-total .money {
		color: #FF9600;
		margin: 0 8rpx;
	}
	// 订单底部按钮区域
	.footer-btn-box {
		flex-wrap: nowrap;
	}
	// 年/次卡用户信息样式
	.year-card-user-info {
		padding: 24rpx;
		display: flex;
		align-items: center;
		.user-info-left {
			width: 80rpx;
			height: 80rpx;
			background-color: #F5F5F5;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
			.avatar-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
				object-fit: cover;
			}
			.iconfont {
				font-size: 40rpx;
				color: #999;
			}
		}
		.user-info-right {
			flex: 1;
			.user-top-row {
				margin-bottom: 12rpx;
				.user-nickname {
					font-size: 30rpx;
					font-weight: 500;
					color: #282828;
					margin-right: 16rpx;
				}
				.user-tags {
					display: flex;
					align-items: center;
					.member-tag {
						background: linear-gradient( 90deg, #484643 0%, #1F1B17 100%);
						color: #FDDAA4;
						font-size: 18rpx;
						width: 56rpx;
						height: 26rpx;
						line-height: 26rpx;
						border-radius: 14rpx;
						margin-right: 10rpx;
					}
					.level-tag {
						background-color: #FFF7E6;
						color: #FA8C16;
						width: 64rpx;
						height: 26rpx;
						line-height: 26rpx;
						border-radius: 100rpx;
						border: 1px solid #FACC7D;
						.iconfont {
							font-size: 22rpx;
							margin-right: 4rpx;
						}
						.level-text {
							font-size: 18rpx;
						}
					}
				}
			}
			.user-id {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
</style>
