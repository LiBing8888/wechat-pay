<template>
	<view class="cartGoods-wrapper">
		<view class="goods-cart-list" :class="{ 'mar0': isCate }">
			<block v-for="(item, index) in list" :key="index">
				<view class='item acea-row row-between-wrapper bg-f boder-24'>
					<view class="store-title">
						<view class="checkbox" @click="storeAllCheck(item, index)">
							<text v-if="!item.allCheck" class="iconfont icon-ic_unselect"></text>
							<text v-else class="iconfont icon-a-ic_CompleteSelect"></text>
						</view>
						<navigator :url="`/pages/store/home/index?id=${item.mer_id}`" class="info">
							<text class="iconfont icon-ic_mall"></text>
							<view class="name">{{ item.mer_name }}</view>
							<text class="iconfont icon-ic_rightarrow"></text>
						</navigator>
						<view class="coupon-btn" v-if="item.hasCoupon > 0 && !isCate" @click="giveCoupon(item)">优惠券</view>
					</view>
					<view v-for="goods in item.list" :key="goods.cart_id" class='picTxt acea-row'>
						<view class="checkbox" @click.stop="goodsCheck(goods, index)">
							<text v-if="!goods.check" class="iconfont icon-ic_unselect"></text>
							<text v-else class="iconfont icon-a-ic_CompleteSelect"></text>
						</view>
						<view class="item-right acea-row row-between">
							<view class='pictrue'>
								<navigator :url='"/pages/goods_details/index?id=" + goods.product.product_id' hover-class='none'>
									<image class="image" :src="normalImg(goods)"></image>
								</navigator>
							</view>
							<view class='text'>
								<navigator :url='"/pages/goods_details/index?id=" + goods.product.product_id' hover-class='none'>
									<view class='line1'>{{ goods.product.store_name }}</view>
								</navigator>
								<view class='infor line1' v-if="goods.productAttr.sku" @click.stop='changeCart(goods, goods.product_id)'>
									{{ goods.productAttr.sku }}
									<text class="iconfont icon-ic_downarrow"></text>
								</view>
								<view v-if="goods.product.once_max_count > 0 || goods.product.once_min_count > 0" class="buy_limit">
									{{ getBuyLimitText(goods) }}
								</view>
								<view class="carnum-count acea-row row-between">
									<view class='money acea-row row-middle'>
										<priceFormat :price="goods.productAttr.price" weight intSize="36" floatSize="24" labelSize="24">
										</priceFormat>
										<view v-if="goods.productAttr.show_svip_price" class="vipImg">
											<image :src="`${domain}/static/images/svip.png`"></image>
										</view>
									</view>
									<view class='carnum acea-row row-center-wrapper'>
										<view class="reduce"
											@click.stop='subCart(goods)'>
											<text class="iconfont icon-ic_Reduce"></text>
										</view>
										<view class='num' @click.stop>{{ goods.cart_num }}</view>
										<view class="plus"
											@click.stop='addCart(goods)'>
											<text class="iconfont icon-ic_increase"></text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
import { changeCartNum, cartProductAttr, cartDel } from '@/api/order.js';
import { CART_TIME, CART_ID } from '@/config/cache';
import Cache from '@/utils/cache';
import { HTTP_REQUEST_URL } from "@/config/app";
import diyTabbar from '@/mixins/diy-tabbar';
export default {
	mixins: [diyTabbar],
	props: {
		cartList: {
			type: Array,
			default: () => []
		},
		hide_mer_status: {
			type: Boolean,
			default: false
		},
		isFooter: {
			type: Boolean,
			default: false
		},
		isCate: {
			type: Boolean,
			default: false
		}
	},
	components: {},
	data() {
			return {
				domain: HTTP_REQUEST_URL,
				list: this.cartList,
				productValue: [], //系统属性
				attr: {
					cartAttr: false,
					productAttr: [],
					productSelect: {}
				},
				isOpen: false, //是否打开属性组件
				currSku: '',
				goods: {},
				attrValue: '', //已选属性
				attrImage: '',
				uniqueValue: "",
				newVal: {},
				oldVal: {},
				skuList: [],
				isCart: true,
				cart_id: '',
			};
		},
	watch: {
		"attr.cartAttr"(v) {
			this.$emit('updateIsOpen', v);
		},
		cartList(newVal) {
			this.list = newVal
		}
	},
	methods: {
		getBuyLimitText(goods) {
			const minLimit = goods.product.once_min_count;
			const maxLimit = goods.product.once_max_count;
			const text = [];
			if (minLimit > 0) {
				text.push(`${minLimit}件起购`);
			}
			if (maxLimit > 0) {
				text.push(`最多${maxLimit}件`);
			}
			return text.join('，');
		},
		normalImg(goods) {
			const src = (goods.productAttr && goods.productAttr.image) || goods.product.image;
			return this.$util.setDomain(src);
		},
		goCat: function () {
			this.$emit('goCat', {
				cart_id: this.goods.cart_id,
				cart_num: this.goods.cart_num,
				product_attr_unique: this.newVal.unique
			});
		},
		updateList(list) {
			this.list = list
		},
		// 商铺全选
		storeAllCheck(item, index) {
			let cart_id = (Cache.get(CART_ID) && JSON.parse(Cache.get(CART_ID))) || []
			// 店铺取消
			if (item.allCheck) {
				item.allCheck = false
				item.list.forEach((el, index) => {
					el.check = false
					cart_id.forEach((id, i) => {
						if (id == el.cart_id)
							cart_id.splice(i, 1)
					})
				})
			} else {
				item.allCheck = true
				item.list.forEach((el, index) => {
					el.check = true
					if (cart_id.indexOf(el.cart_id) == -1) cart_id.push(el.cart_id)
				})
			}
			Cache.set(CART_ID, Array.from([...new Set(cart_id)]))
			const timestamp = Date.now();
			Cache.set(CART_TIME, timestamp);
			this.$emit('updateCartList', 'goodsCheck', this.list);
			// this.cartAllCheck('goodsCheck')
		},
		goodsCheck(goods, index) {
			goods.check = !goods.check
			let arr = (Cache.get(CART_ID) && JSON.parse(Cache.get(CART_ID))) || []
			if (goods.check) {
				arr.push(goods.cart_id)
				Cache.set(CART_ID, Array.from([...new Set(arr)]))
			} else {
				let new_set = new Set(arr)
				new_set.delete(goods.cart_id)
				Cache.set(CART_ID, Array.from([...new_set]))
			}
			const timestamp = Date.now();
			Cache.set(CART_TIME, timestamp);
			this.$emit('updateCartList', 'goodsCheck', this.list);
			// this.cartAllCheck('goodsCheck',this.list)
		},
		cartAllCheck(type) {
			this.$emit('cartAllCheck', type);
		},
		giveCoupon(item) {
			this.$emit('giveCoupon', item);
		},
		/*
		 * 更改商品属性
		 */
		changeCart: function (goods, id) {
			let that = this;
			if (that.goods == goods) {
				that.attr.cartAttr = true;
				that.$emit('openAddCart', { attr: that.attr, productValue: that.productValue, goods: that.goods });
				uni.$emit('openCartAttrWindow', { attr: that.attr, productValue: that.productValue, goods: that.goods });
				return
			} else {
				cartProductAttr(id).then(res => {
					goods.attr = res.data.attr;
					goods.attrValue = res.data.attrValue
					that.attrValue = goods.productAttr.sku
					that.attrImage = goods.product.image
					that.goods = JSON.parse((JSON.stringify(goods)));
					that.currSku = goods.productAttr.sku.split(",");
					that.$set(that.attr, 'productAttr', res.data.attr);
					const sku = {}
					res.data.attrValue.forEach((itemn) => {
						sku[itemn.sku] = itemn;
					})
					that.$set(that, 'productValue', sku);
					let productSelect = sku[that.attrValue];
					that.DefaultSelect(goods)
					that.attr.cartAttr = true;
					that.$emit('openAddCart', { attr: that.attr, productValue: that.productValue, goods: that.goods });
					uni.$emit('openCartAttrWindow', { attr: that.attr, productValue: that.productValue, goods: that.goods });
				}).catch(err => {
					return that.$util.Tips({
						title: err
					});
				});
			}
		},
		/**
		 * 默认选中属性
		 *
		 */
		DefaultSelect: function (goods) {
			let productAttr = this.attr.productAttr;
			let value = [];
			let arr = []
			if (this.currSku) {
				value = this.currSku
			} else {
				for (var key in this.productValue) {
					if (this.productValue[key].stock > 0) {
						value = this.attr.productAttr.length ? key.split(",") : [];
						break;
					}
				}
			}
			for (let i = 0; i < productAttr.length; i++) {
				this.$set(productAttr[i], "index", value[i]);
			}
			let productSelect = this.productValue[value.join(",")];
			if (productSelect && productAttr.length) {
				this.$set(this.attr.productSelect, "store_name", goods.product.store_name);
				this.$set(this.attr.productSelect, "image", productSelect.image ? productSelect.image : goods.product.image);
				this.$set(this.attr.productSelect, "price", productSelect.price);
				this.$set(this.attr.productSelect, "stock", productSelect.stock);
				this.$set(this.attr.productSelect, "unique", productSelect.unique);
				this.$set(this.attr.productSelect, "svip_price", productSelect.svip_price);
				if (productSelect.stock == 0) {
					this.$set(this.attr.productSelect, "cart_num", 0);
				} else {
					this.$set(this.attr.productSelect, "cart_num", 1);
				}
			} else if (!productSelect && productAttr.length) {
				this.$set(this.attr.productSelect, "store_name", goods.product.store_name);
				this.$set(this.attr.productSelect, "image", goods.product.image);
				this.$set(this.attr.productSelect, "price", goods.product.price);
				this.$set(this.attr.productSelect, "svip_price", productSelect.svip_price);
				this.$set(this.attr.productSelect, "stock", 0);
				this.$set(this.attr.productSelect, "unique", "");
				this.$set(this.attr.productSelect, "cart_num", 0);
			} else if (!productSelect && !productAttr.length) {
				this.$set(this.attr.productSelect, "store_name", goods.product.store_name);
				this.$set(this.attr.productSelect, "image", goods.product.image);
				this.$set(this.attr.productSelect, "price", goods.product.price);
				this.$set(this.attr.productSelect, "svip_price", productSelect.svip_price);
				this.$set(this.attr.productSelect, "stock", goods.product.stock);
				this.$set(this.attr.productSelect, "unique", goods.product.unique || "");
				this.$set(this.attr.productSelect, "cart_num", 1);
			} else if (productSelect && !productAttr.length) {
				this.$set(this.attr.productSelect, "store_name", goods.product.store_name);
				this.$set(this.attr.productSelect, "image", productSelect.image);
				this.$set(this.attr.productSelect, "price", productSelect.price);
				this.$set(this.attr.productSelect, "svip_price", productSelect.svip_price);
				this.$set(this.attr.productSelect, "stock", productSelect.stock);
				this.$set(this.attr.productSelect, "unique", productSelect.unique);
				if (productSelect.stock == 0) {
					this.$set(this.attr.productSelect, "cart_num", 0);
				} else {
					this.$set(this.attr.productSelect, "cart_num", 1);
				}
			}
			this.goCart(productSelect);
		},
		goCart(productSelect) {
			let that = this;
			//如果有属性,没有选择,提示用户选择
			if (
				that.attr.productAttr.length &&
				that.isOpen === true &&
				productSelect.stock == 0
			)
				return that.$util.Tips({
					title: "产品库存不足，请选择其它"
				});
			if (that.attr.productSelect.cart_num == 0) {
				return that.$util.Tips({
					title: '购买个数不能为0！'
				})
			}
		},
		/**
		 * 属性变动赋值
		 *
		 */
		ChangeAttr: function (res) {
			let productSelect = this.productValue[res];
			this.currSku = res;
			this.newVal = this.productValue[res];
			this.attr.productSelect = { ...this.attr.productSelect, ...productSelect }
			if (!productSelect || productSelect.stock <= 0) {
				this.$set(this.attr.productSelect, "stock", 0);
				this.$set(this.attr.productSelect, "unique", "");
				this.$set(this.attr.productSelect, "cart_num", 0);
			}
		},
		subCart(goods) {
			this.updateCartNum(goods, false);
		},
		addCart(goods) {
			this.updateCartNum(goods, true);
		},
		updateCartNum(goods, isIncrease) {
			let goodStock = goods?.productAttr?.stock;
			goodStock = goodStock === undefined ? 0 : goodStock;
			let nextCartNum = isIncrease ? goods.cart_num + 1 : goods.cart_num - 1;
			let onceMinCount = goods.product.once_min_count; // 每次最少购买的数量
			let onceMaxCount = goods.product.once_max_count || Number.MAX_SAFE_INTEGER; // 限购数量
			let actualMaxCount = Math.min(onceMaxCount, goodStock); // 实际最大可购买数量
			// 处理数量为1时点击减少的情况
			if (!isIncrease && goods.cart_num === 1) {
				// 调用删除操作
				this.deleteCartItem(goods);
				return;
			}
			if (nextCartNum < onceMinCount) {
				goods.numSub = true; // 禁止减少
				this.$util.Tips({
					title: `最少购买${onceMinCount}件（限购）`
				});
				return;
			} else if (nextCartNum > actualMaxCount) {
				goods.numAdd = true; // 禁止增加
				// 根据实际情况给出不同的提示
				let tipTitle = '';
				if (onceMaxCount < goodStock) {
					// 限购限制
					tipTitle = `最多购买${onceMaxCount}件（限购）`;
				} else {
					// 库存不足限制
					tipTitle = `最多购买${goodStock}件（库存不足）`;
				}
				this.$util.Tips({
					title: tipTitle
				});
				return;
			}
			
			return changeCartNum(goods.cart_id, {
				cart_num: nextCartNum
			}).then(res => {
				goods.cart_num = nextCartNum;
				this.$util.getCartNum(true, null)
				this.$emit('updateTotalCount', Number(isIncrease));
				this.$emit('updateCartList', 'goodsCheck', this.list);
			}).catch(error => {
				this.$util.Tips({
					title: error
				});
			});
		},
		deleteCartItem (goods) {
			uni.showModal({
				title: '提示',
				content: '确定要从购物车中删除该商品吗？',
				success: (res) => {
					if (res.confirm) {
						cartDel({cart_id: goods.cart_id}).then(res => {
							this.$util.Tips({
								title: '删除成功'
							});
							this.$util.getCartNum(true, null);
							this.$emit('updateTotalCount', -goods.cart_num);
							this.$emit('getCartList');
						}).catch(error => {
							this.$util.Tips({
								title: error || '删除失败'
							});
						});
					}
				}
			});
		},
		onMyEvent: function () {
			this.$set(this.attr, 'cartAttr', false);
			this.$set(this, 'isOpen', false);
		},
		handleChangeAttrVal(val) {
			this.$set(this.attr.productAttr[val.indexw], 'index', this.attr.productAttr[val.indexw].attr_value[val.indexn].attr);
		}
	}
}
</script>

<style lang="scss">
.cartGoods-wrapper {
	position: relative;
}
.goods-cart-list {
	margin: 171rpx 0 20rpx;

	&.mar0 {
		margin-top: 0;
	}
}

.goods-cart-list .item {
	margin-bottom: 20rpx;

	.store-title {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0 30rpx;
		height: 85rpx;

		.checkbox {
			width: 60rpx;

			.iconfont {
				font-size: 40rpx;
				color: #CCCCCC;
			}

			.icon-a-ic_CompleteSelect {
				color: var(--view-theme);
			}
		}

		.info {
			flex: 1;
			display: flex;
			align-items: center;

			.iconfont {
				font-size: 36rpx;
			}

			.name {
				margin: 0 0 0 10rpx;
				font-size: 28rpx;
				color: #282828;
				font-weight: 500;
			}

			.icon-ic_rightarrow {
				margin-top: 6rpx;
				font-size: 28rpx;
			}
		}

		.coupon-btn {
			color: var(--view-theme);
			font-size: 22rpx;
			width: 100rpx;
			line-height: 36rpx;
			background: var(--view-minorColor);
			border-radius: 18rpx;
			text-align: center;
		}
	}
}

.vipImg {
	width: 65rpx;
	height: 28rpx;
	margin-left: 10rpx;

	image {
		width: 100%;
		height: 100%;
		display: block;
	}
}

.goods-cart-list .item .picTxt {
	width: 100%;
	padding: 25rpx 30rpx;
	position: relative;
	align-items: center;

	.checkbox {
		width: 55rpx;

		.iconfont {
			font-size: 40rpx;
			color: #CCCCCC;
		}

		.icon-a-ic_CompleteSelect {
			color: var(--view-theme);
		}
	}
}

.goods-cart-list .item .item-right {
	width: 590rpx;
}

.goods-cart-list .item .picTxt .pictrue {
	width: 180rpx;
	height: 180rpx;
}

.goods-cart-list .item .picTxt .pictrue .image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 16rpx;
}

.goods-cart-list .item .picTxt .text {
	width: 390rpx;
	font-size: 28rpx;
	color: #282828;
}

.goods-cart-list .item .picTxt .buy_limit {
	margin-top: 4rpx;
	color: var(--view-theme);
	font-size: 22rpx;

	& + .carnum-count {
		margin-top: 0;
	}
}

.goods-cart-list .item .picTxt .text .infor {
	display: inline-block;
	padding: 10rpx;
	border-radius: 4rpx;
	font-size: 24rpx;
	color: #999;
	margin-top: 16rpx;
	background-color: #F5F5F5;
	max-width: 400rpx;

	.icon-ic_downarrow {
		font-size: 24rpx;
		padding: 0 5rpx;
	}
}

.goods-cart-list .item .carnum-count {
	margin-top: 28rpx;
}

.goods-cart-list .item .picTxt .text .money {
	font-size: 32rpx;
	color: var(--view-theme);
}

.reduce, .plus {
	&.on {
		pointer-events: initial !important;
	}
}
</style>
