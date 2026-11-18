<template>
	<view class="product-type-popup" v-if="visible">
		<view class="popup-overlay" @click="close"></view>
		<view class="popup-content">
			<view class="popup-header">
				<text class="popup-title">选择商品类型</text>
				<text class="popup-close" @click="close">×</text>
			</view>
			<view class="popup-body">
				<checkbox-group @change="handleChange">
					<view v-for="(item, index) in productTypeArr" :key="index" class="checkbox-item">
						<checkbox :value="item.product_type.toString()" :checked="selectedValues.includes(item.product_type.toString())" />
						<text>{{ item.type_name }}</text>
					</view>
				</checkbox-group>
			</view>
			<view class="popup-footer">
				<view class="popup-button cancel" @click="close">取消</view>
				<view class="popup-button confirm" @click="confirm">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ProductTypePopup',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		productTypeArr: {
			type: Array,
			default: () => []
		},
		selectedValues: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			localSelectedValues: []
		};
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				this.localSelectedValues = [...this.selectedValues];
			}
		}
	},
	methods: {
		handleChange(e) {
			this.localSelectedValues = e.detail.value;
		},
		confirm() {
			this.$emit('confirm', this.localSelectedValues);
			this.close();
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped lang="scss">
	.product-type-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		
		.popup-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
			animation: fadeIn 0.3s ease-out;
		}
		
		.popup-content {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: #fff;
			border-top-left-radius: 20rpx;
			border-top-right-radius: 20rpx;
			padding: 30rpx;
			animation: slideUp 0.3s ease-out;
			
			.popup-header {
					display: flex;
					align-items: center;
					margin-bottom: 30rpx;
					position: relative;
					
					.popup-title {
						font-size: 32rpx;
						font-weight: 500;
						color: #333;
						flex: 1;
						text-align: center;
					}
					
					.popup-close {
						font-size: 40rpx;
						color: #999;
						cursor: pointer;
						position: absolute;
						right: 0;
					}
				}
			
			.popup-body {
					max-height: 500rpx;
					overflow-y: auto;
					margin-bottom: 30rpx;
					display: flex;
					flex-wrap: wrap;
					gap: 20rpx;
					
					.checkbox-item {
						padding: 10rpx 20rpx;
						margin-bottom: 10rpx;	
						checkbox {
							margin-right: 10rpx;
						}						
						text {
							font-size: 26rpx;
							color: #333;
						}
					}
				}
			
			.popup-footer {
				display: flex;
				gap: 20rpx;
				
				.popup-button {
					flex: 1;
					height: 80rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 28rpx;
					border-radius: 10rpx;
					cursor: pointer;
				}
				
				.popup-button.cancel {
					background-color: #f5f5f5;
					color: #666;
				}
				
				.popup-button.confirm {
					background-color: var(--view-theme);
					color: #fff;
				}
			}
		}
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
