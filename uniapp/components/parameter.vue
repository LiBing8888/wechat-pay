<template>
	<view v-if="specsInfo.params && specsInfo.params.length > 0"
		class="attribute acea-row row-between-wrapper parameter-box" @click="seeSpecs">
		<view class="iconfont-box align-center">
				<view class="iconfont icon-canshu-01"></view>
			</view>
		<view class="list line1 acea-row">
			<view class="param-box" v-for="(item, index) in specsInfo.params" :key="index">
				<view class="item params">{{ item.value.join("、") }}</view>
				<view class="param-label">{{ item.label }}</view>
			</view>
		</view>
		<view class="iconfont icon-ic_rightarrow"></view>
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
	export default {
		props: {
			specsInfo: {
				type: Object,
				default: () => {}
			},
		},
		data() {
			return {};
		},
		mounted() {},
		methods: {
			seeSpecs(){
				this.$emit('seeSpecs');
			}
		}
	}
</script>

<style scoped lang="scss">
.param-box {
	font-size: 26rpx;
	line-height: 40rpx;
	padding-right: 20rpx;

	.params {
		margin-right: 0;
	}

	&:not(:last-child) {
		position: relative;
		margin-right: 20rpx;
		&::after {
			content: "";
			position: absolute;
			right: 0;
			top: 10rpx;
			bottom: 10rpx;
			width: 1px;
			background-color: #F5F5F5;
		}
	}
}

.params-label {
	align-self: flex-start;
	line-height: 50rpx;
}

.list {
	flex: 1;
	flex-wrap: nowrap;
	margin-right: 20rpx;
}

.parameter-box {
	overflow: hidden;
	padding-top: 24rpx;
	padding-bottom: 24rpx;
	height: auto;
}

.param-label {
	margin-top: 8rpx;
}
</style>
