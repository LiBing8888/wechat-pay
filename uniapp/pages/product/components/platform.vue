<template>
	<view class="select_popup_container relative">
		<!-- 头部内容 -->
		<view class="popup_title relative flex-center">
			<view class="fs-32 fw-500">请选择平台分类</view>
			<text class="iconfont icon-ic_close2 close" @click="close"></text>
		</view>
		<!-- 头部内容结束 -->
		<view class="tap_list">
			<view v-for="(item, index) of cateStack" :key="index" class="tap_list_item"
				:class="{ 'border': stackIndex === index }" @click="handleSelectStackItem(index)">
				{{ getStackItemName(index) }}
			</view>
		</view>
		<view class="content_list">
			<scroll-view scroll-y="true" class="popup_sroll">
				<view class="content_list_item" v-for="(cate, index) of currentStackCateList" :key="index"
					@click="handleSelectCate(cate, index)" :class="{ 'active': stackSelectCateIndex[stackIndex] === index }">{{
						cate.label }}</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		// 从外部传入的分类数据(平台分类)
		classifiedData: {
			type: Array,
			default: () => {
				return [];
			}
		},
		// 用来初始化分类栈的分类ID
		cateId: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			cateStack: [], // 分类栈
			stackIndex: 0, // 当前正在进行选择的分类栈索引
			stackSelectCateIndex: [], // 每个栈项目中被选中的分类索引
		};
	},
	computed: {
		currentStackCateList() {
			const stackItem = this.cateStack[this.stackIndex];
			return stackItem || [];
		},
		initDataParams() {
			return [
				this.classifiedData,
				this.cateId
			];
		}
	},
	watch: {
		initDataParams: {
			handler(val) {
				this.init();
			},
			immediate: true
		}
	},
	methods: {
		init() {
			if (this.cateId === 0) {
				this.cateStack = [this.classifiedData];
				// 如果cateId为0，则无需进行下级分类的初始化
				return;
			}

			const cateInfoMap = new Map();

			const initMap = cateList => {
				for (let index = 0; index < cateList.length; index++) {
					const cate = cateList[index];
					cateInfoMap.set(cate.value, {
						info: cate,
						index
					});
					if (cate.children?.length) {
						initMap(cate.children);
					}
				}
			}

			// 先将平台分类数据转换为Map，方便后续快速查找
			initMap(this.classifiedData);

			// 选中分类栈
			const stack = [];

			// 栈 item 中被选中的分类索引
			const stackSelectCateIndex = [];

			let currentCate = cateInfoMap.get(this.cateId);
			while (1) {
				const pid = currentCate.info.pid;
				if (pid === 0) {
					stack.unshift(this.classifiedData);
					stackSelectCateIndex.unshift(currentCate.index);
					break;
				}
				const parentCate = cateInfoMap.get(pid);
				stack.unshift(parentCate.info.children);
				stackSelectCateIndex.unshift(currentCate.index);
				currentCate = parentCate;
			}

			this.cateStack = stack;
			this.stackSelectCateIndex = stackSelectCateIndex;
			this.stackIndex = stack.length - 1;
		},
		handleSelectStackItem(index) {
			// 更新当前正在进行选择的分类栈索引
			this.stackIndex = index;
		},
		getStackItemName(index) {
			const SELECT_PLACEHOLDER = "请选择";
			if (this.stackSelectCateIndex[index] === undefined) return SELECT_PLACEHOLDER;
			const cateList = this.cateStack[index]; // 获取当前栈项目中的分类列表
			const cateItemIndex = this.stackSelectCateIndex[index];
			if (!cateList[cateItemIndex]) return SELECT_PLACEHOLDER;
			return cateList[cateItemIndex].label;
		},
		handleSelectCate(cate, cateIndex) {
			// 保存当前栈项目中被选中的分类索引
			this.$set(
				this.stackSelectCateIndex,
				this.stackIndex,
				cateIndex
			);

			// 如果进行了分类选择，则后续栈项目中被选中的分类索引需要被清空
			// 因此需要截取当前栈项目索引之前的分类索引
			this.stackSelectCateIndex = this.stackSelectCateIndex.slice(0, this.stackIndex + 1);

			if (!cate.children?.length) {
				// 如果当前分类没有子分类，则认为抵达了栈末端，触发回调
				const cateStackNameJoin = this.cateStack.map((_, index) => this.getStackItemName(index)).join("/");
				this.$emit('getPlatData', {
					...cate,
					label: cateStackNameJoin
				});
				return;
			}

			// 如果进行了分类选择，则需要更新栈项目中的分类列表
			// 因此需要截取当前栈项目索引之前的分类列表，并添加新的子分类列表
			this.cateStack = [
				...this.cateStack.slice(0, this.stackIndex + 1),
				cate.children
			];


			this.stackIndex++;
		},
		close() {
			this.$emit('close')
		}
	}
};
</script>

<style lang="scss" scoped>
.select_popup_container {
	background: #fff;
	border-radius: 40rpx 40rpx 0 0;
	z-index: 200;
}

.popup_title {
	padding: 44rpx 0;
	line-height: 32rpx;

	.close {
		position: absolute;
		top: 28rpx;
		right: 28rpx;
		z-index: 10;
		font-size: 36rpx;
		color: #e5e5e5;
	}
}

.tap_list {
	border-bottom: 1px solid #EEEEEE;
	width: 710rpx;
	margin: 0 0 44rpx 30rpx;
	display: flex;

	.border {
		border-bottom: 2px solid $primary-admin !important;
		color: $primary-admin !important;
	}

	&_item {
		padding-bottom: 28rpx;
		margin-right: 60rpx;
	}
}


.content_list {
	.popup_sroll {
		height: 742rpx;
	}


	.content_list_item {
		color: #333333;
		margin-bottom: 50rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&.active {
			color: $primary-admin;
		}

		>view {
			flex: 0.6;
		}

		>view:nth-child(2) {
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
</style>
