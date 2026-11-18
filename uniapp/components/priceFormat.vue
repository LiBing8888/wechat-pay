<template>
	<text :class="['price-format', weight ? 'semiBold' : 'regular', { 'custom-color': color }]" :style="viewColor">
		<text class="intPrice" :data-x="unit" :style="{ fontSize: intPriceSize }">
			<text class="normal" :class="{'font600' : coupon}" :style="{ fontSize: labelPriceSize }">¥</text>
		{{ intPrice }}</text>
		<text v-if="coupon" class="floatPrice" :style="{ fontSize: floatPriceSize }">{{ couponPrice }}</text>
		<text v-else class="floatPrice" :style="{ fontSize: floatPriceSize }">{{floatPrice}}</text>

	</text>
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
import { mapGetters } from 'vuex';

	export default {
		name: 'PriceFormat',
		props: {
			unit: {
				type: String,
				default: "rpx"
			},
			price: {
				type: String | Number,
				default: ""
			},
			// 粗体
			weight: {
				type: Boolean,
				default: false
			},
			intSize: {
				type: String,
				default: '32'
			},
			floatSize: {
				type: String,
				default: '22'
			},
			labelSize: {
				type: String,
				default: '20'
			},
			coupon: {
				type: Boolean,
				default: false
			},
			// 价格颜色
			color: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				floatPrice: "",
				couponPrice: ""
			};
		},
		computed: {
			...mapGetters(['viewColor']),
			
			intPriceSize() {
				if (this.unit === 'rpx') {
					return uni.upx2px(this.intSize) + 'px';
				}
				return this.intSize + this.unit;
			},
			floatPriceSize() {
				if (this.unit === 'rpx') {
					return uni.upx2px(this.floatSize) + 'px';
				}
				return this.floatSize + this.unit;
			},
			labelPriceSize() {
				if (this.unit === 'rpx') {
					return uni.upx2px(this.labelSize) + 'px';
				}
				return this.labelSize + this.unit;
			},
			intPrice() {
				const str = this.price+'' //转成字符串
				const arr = str.split(".") //使用分隔符分割字符串成数组
				let tempStr = arr[1] ? arr[1] : '00' //如果小数点后有值就用该值，没有默认'00'
				this.floatPrice = tempStr.length === 1 ? '.'+tempStr + '0' : '.'+tempStr //小数点后只有一位的话补0
				this.couponPrice = (tempStr.length==2&&tempStr == '00') ? '' : '.'+tempStr
				return arr[0] || '0'
			}
		},
		watch: {

		}
	}
</script>

<style lang="scss" scoped>
	.custom-color {
		color: var(--view-theme);
	}
	.normal {
		font-family: "黑体"
	}
	.font600 {
		font-weight: 600;
	}

	.semiBold {
		font-weight: 600;
	}

	.regular {
		font-weight: 400;
	}
</style>
