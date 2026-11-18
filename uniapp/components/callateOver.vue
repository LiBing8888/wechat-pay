<template>
	<view class="empty-box bg-f boder-24">
		<image class="image" :src="noImage"></image>
		<view class="txt">订单已全部核销</view>
		<view class="btn-count">
			<view class="btn" @click="goOrderDetails">订单详情</view>
			<view class="btn btn-cancle" @click="goBack">返回工作台</view>	
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
	import { HTTP_REQUEST_URL } from '@/config/app';
	export default{
		props: {
			title: {
				type: String,
				default: '暂无记录',
			},
			noImage: {
				type: String,
				default: HTTP_REQUEST_URL+'/static/images/callcate-over.png',
			}
		},
		data() {
			return {
				
			}
		},
	  inject: ['customMethod'],
		methods: {
			goOrderDetails() {
				this.customMethod();
			},
			goBack() {
				this.$emit('goBack')
			}
		}
	}

</script>

<style lang="scss">
	.empty-box{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 710rpx;
		margin: 0 auto;
		padding: 160rpx 0 140rpx;
		.image{
			width:172rpx;
			height: 154rpx;
		}
		.txt{
			margin-top: 34rpx;
			font-size: 36rpx;
			color: #333;
		}
		.btn-count {
			margin-top: 60rpx;
			.btn {
				width: 500rpx;
				height: 88rpx;
				border-radius: 50rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #2A7EFB;
				color: #fff;
				border: 1px solid #2A7EFB;
			}
			.btn-cancle {
				color: #2A7EFB;
				background: #fff;
				margin-top: 24rpx;
			}
		}
	}
</style>
