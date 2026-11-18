<template>
	<view class="select_popup_container">
		<view class="popup_title">
			<!-- <navigator v-if="mer_id" :url="`pages/product/addGoods/freightTemplate?mer_id=${mer_id}`" hover-class="none" class="manage_btn">管理</navigator> -->
			<view class="fs-32 fw-500 flex-center">{{ selectProductTitle }}</view>
			<!-- <view class="close" @click="close"><text class="iconfont">&#xe761;</text></view> -->
		</view>
		<!-- 已选列表 -->
		<view class="selected_list" v-if="selectProductItem.multiple && multipleList.length">
			<view class="selected_list_item" v-for="(item, index) in multipleList" :key="index">
				<view>{{ item.label }}</view>
				<view @click="deleteSelectedList(item, index)"><view class="iconfont">&#xe6a0;</view></view>
			</view>
		</view>
		<!-- 标签头部 -->
		<view class="tap">
			<scroll-view scroll-x="true" class="popup_tap">
				<view class="popup_tap_content">
					<view class="popup_tap_item" v-for="(item, index) in tap" :key="index" @click="handleSelectTapId(item, index)" :class="{ selectTapEd: selectTapId == item.value }">
						<view>{{ item.label }}</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 内容选择 -->
		<view class="content">
			<scroll-view scroll-y="true" class="popup_sroll" @scrolltolower="scrolltolower">
				<view class="content_list">
					<view v-for="(item, index) in assemblyList" :key="index" class="content_list_item" :class="{ selectSingleCase: item.selectEd }">
						<view @click="selectItem(item, assemblyList)">{{ item.label }}</view>
						<view v-if="selectProductItem.multiple && !item.children"><text class="iconfont" @click="selectPushMultiple(item, assemblyList)">&#xe70e;</text></view>
					</view>
				</view>
			</scroll-view>
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
import { serialize } from '../../../libs/uniApi.js';
export default {
	props: {
		selectProductTitle: {
			type: String,
			default: ''
		},
		// 从外部传入的分类数据
		classifiedData: {
			type: Array,
			default: () => {
				return [];
			}
		},
		// 表单数据
		form: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// 外部选项数据，携带需要进项判断的参数

		selectProductItem: {
			type: Object,
			default: () => {
				return {
				};
			}
		},
		mer_id: {
			type: String,
			default: "0"
		}

	},
	data() {
		return {
			assemblyList: [],
			tap: [], // 标签数据
			selectTapId: '',
			tapIndex: '', // 选中d的tap的下标
			multipleList: [] // 多选的数组, 可用于展示
		};
	},
	watch: {
		tap: {
			handler(val) {
				// console.log(val);
			},
			deep: true
		},

		multipleList: {
			handler(val) {
				this.$emit('multipleList', val, this.selectProductItem.model);
			}
		},
		// 监听外部传入的数据变化，重新渲染数据（只监听引用变化，避免深度监听导致无限循环）
		classifiedData: {
			handler(val) {
				if (val && val.length) {
					this.initData();
				}
			}
		}
	},
	created() {
		this.initData();
		this.tap.push({ value: '', label: '请选择', samelevel: this.assemblyList });
	},
	methods: {
		initData() {
			// 使用深拷贝将 assemblyList 与 classifiedData 完全解耦，避免触发无限循环
			let tempData = JSON.parse(JSON.stringify(this.classifiedData));
			// 品牌数据没有 value， label 字段
			tempData.forEach(item => {
				if (!item.value) {
					item.value = item.brand_id;
				}
				if (!item.label) {
					item.label = item.brand_name;
				}
			});
			this.addClassifiedAttr(tempData, 'children', 'selectEd', false);
			// 代表有选中项
			if (this.selectProductItem.singleColumn && (this.selectProductItem.allreadySelect && this.selectProductItem.allreadySelect.length) ) {
				this.assemblyList = serialize(tempData);
				this.assemblyList.forEach(item => {
					if (this.selectProductItem.allreadySelect.map(val => val.value).includes(item.value)) {
						item.selectEd = true;
					}
				});
				return;
			}
			// 多选有数据
			if (this.selectProductItem.allreadySelect && this.selectProductItem.allreadySelect.length && !this.selectProductItem.multiple) {
				this.tap = this.selectProductItem.allreadySelect;
				this.selectTapId = this.tap[0].value;
				this.handleSelectTapId(this.tap[0], 0);
				return;
			}
			this.assemblyList = serialize(tempData);
		},
		selectItem(item, samelevel) {
			// 深拷贝 item，防止修改影响外部响应式数据
			const clonedItem = JSON.parse(JSON.stringify(item));

			if (this.selectProductItem.multiple) {
				if (!clonedItem.children || !clonedItem.children.length) {
					clonedItem.selectEd = !clonedItem.selectEd;
					// 将修改同步回原 item，更新视图
					item.selectEd = clonedItem.selectEd;
				}
			} else {
				this.assemblyList.forEach(val => {
					if (val.selectEd !== false) {
						val.selectEd = false;
					}
				});
				clonedItem.selectEd = true;
				item.selectEd = true;
			}

			if (this.tap.some(val => val.value === item.value)) {
				return;
			}

			if (this.selectTapId !== '') {
				if (!item.children || !item.children.length) {
					this.tap[this.tap.length - 1].label = item.label;
					this.tap[this.tap.length - 1].value = item.value;

					this.$emit('getLinkageData', this.tap, this.selectProductItem.model);
					return;
				}

				this.tap.splice(this.tapIndex, 1, JSON.parse(JSON.stringify(clonedItem)));
				this.tap.splice(this.tapIndex + 1, this.tap.length);
				this.selectTapId = '';
				this.assemblyList = JSON.parse(JSON.stringify(item.children));
				this.addClassifiedAttr(this.assemblyList, 'children', 'selectEd', false);
				this.tap.push({ value: '', label: '请选择', samelevel: [...this.assemblyList] });
				return;
			}

			if (item.children && item.children.length && !this.selectTapId) {
				this.tap.splice(this.tap.length - 1, 0, JSON.parse(JSON.stringify(clonedItem)));
				this.assemblyList = JSON.parse(JSON.stringify(item.children));
				this.addClassifiedAttr(this.assemblyList, 'children', 'selectEd', false);
			} else {
				this.tap[this.tap.length - 1].label = item.label;
				this.tap[this.tap.length - 1].value = item.value;
				if (this.selectProductItem.multiple) {
					return;
				}
				this.$emit('getLinkageData', this.tap, this.selectProductItem.model);
			}
		},

		// 多选时添加事件
		selectPushMultiple(item, samelevel) {

			item.selectEd = true;

			this.multipleList.push(item);
			this.multipleList = this.unique(this.multipleList);
		},
		// 数组去重
		unique(arr) {
			var obj = {};
			return arr.filter(ele => {
				if (!obj[ele]) {
					obj[ele] = true;
					return true;
				}
			});
		},
		// 删除已选项
		deleteSelectedList(item, index) {
			this.multipleList.splice(index, 1);
			this.assemblyList.forEach(val => {
				if (item.value == val.value) {
					val.selectEd = false;
				}
			});
		},
		// 将数组用 "/" 连接
		connectionString(arr, lab = '/') {
			return arr.map(item => item.label).join('/');
		},

		handleSelectTapId(item, index) {
			if (!item.value) {
				this.assemblyList = this.tap[this.tap.length - 2].children;
				this.selectTapId = '';
				return;
			}

			if (index == this.tap.length - 1) {
				this.selectTapId = item.value;
				this.assemblyList = this.tap[this.tap.length - 2].children;
				return;
			}

			this.selectTapId = item.value;
			this.tapIndex = index;
			this.assemblyList = item.samelevel;
		},
		// 递归添加属性
		addClassifiedAttr(arr, childKey, addkey, value) {
			arr.forEach(item => {
				// 添加条件判断，避免不必要的响应式更新，防止无限递归
				if (item[addkey] !== value) {
					this.$set(item, addkey, value);
				}
				if (item[childKey] && item[childKey].length) {
					this.addClassifiedAttr(item[childKey], childKey, addkey, value);
				}
			});
		},
		close() {
			this.$emit('close');
		},
		// 滑动组件滑倒底部时触发事件
		scrolltolower() {
			this.$emit('scrolltolower', this.selectProductItem.model);
		}
	}
};
</script>

<style lang="scss" scoped>
.select_popup_container {
	background: #fff;
	border-radius: 16rpx 16rpx 0 0;
}
.popup_title {
	padding: 40rpx 30rpx 20rpx;
	position: relative;
	.manage_btn{
		font-weight: normal;
		color: $primary-admin;
		font-size: 24rpx;
		position: absolute;
		left: 30rpx;
		top: 40rpx;
	}

	.close {
		position: relative;
		z-index: 10;
		font-size: 28rpx;
		color: #8a8a8a;
	}
}

.selected_list {
	display: flex;
	flex-wrap: wrap;
	padding: 50rpx 30rpx;
	&_item {
		display: flex;
		align-items: center;
		color: $primary-admin;
		margin-right: 31rpx;
		margin-bottom: 40rpx;
		padding: 3rpx 11rpx;
		background: #fff6f5;
		.iconfont {
			display: inline-block;
			margin-left: 14rpx;
			font-size: 24rpx;
		}
	}
}

.popup_tap {
	display: flex;
	padding: 0 30rpx;
	color: #333333;
	font-size: 28rpx;
	border-bottom: 1px solid #eeeeee;
	margin-bottom: 40rpx;
	.popup_tap_content {
		display: flex;
	}
	&_item {
		margin-right: 60rpx;
		padding-bottom: 21rpx;
		white-space: nowrap;
	}
	.selectTapEd {
		color: $primary-admin;
		border-bottom: 3rpx solid $primary-admin;
	}
}

.content {
	.popup_sroll {
		max-height: 742rpx;
		min-height: 300rpx;
	}
	&_list {
		&_item {
			color: #333333;
			margin-bottom: 50rpx;
			margin-left: 40rpx;
			margin-right: 40rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			> view {
				flex: 0.6;
			}
			> view:nth-child(2) {
				flex: 0.4;
				display: flex;
				justify-content: flex-end;
			}
			.iconfont {
				color: $primary-admin;
				font-size: 36rpx !important;
			}
		}
	}
}
.selectSingleCase {
	color: $primary-admin;
}
.selectTapEd {
	color: $primary-admin;
	border-bottom: 3rpx solid $primary-admin;
}
</style>
