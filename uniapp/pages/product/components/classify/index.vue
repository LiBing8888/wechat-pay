<template>
	<base-drawer mode="bottom" :visible="visible" background-color="transparent" :mask="true" :maskClosable="true" @close="closeDrawer">
		<view class="classify rd-t-40rpx">
			<view class="title">修改分类
				<view class="close acea-row row-center-wrapper" @tap="closeDrawer">
					<text class="iconfont icon-ic_close"></text>
				</view>
			</view>
			<view class="list acea-row" v-if="categoryList.length">
				<view class="item">
					<view class="tips">一级分类</view>
					<scroll-view scroll-y="true" class="scroll-Y">
						<view class="itemn line1"
							:class="{ checked: index == currentOne, on: checkedIds.includes(item.value + '') }"
							v-for="(item, index) in categoryList" :key="index" @click="categoryTap(index)">
							<!-- #ifndef MP -->
							<checkbox :value="(item.value).toString()" :checked='checkedIds.includes(item.value.toString())'
								color="#ffffff" backgroundColor="#ffffff" activeBackgroundColor="#2A7EFB" activeBorderColor="#2A7EFB"
								style="transform:scale(0.9)" @click="handleCheckboxClick(item)" />
							<!-- #endif -->
							<!-- #ifdef MP -->
							<checkbox :value="item.value" :checked='checkedIds.includes(item.value + "")' style="transform:scale(0.9)"
								color="#ffffff" @click="handleCheckboxClick(item)" />
							<!-- #endif -->
							{{ item.label }}
						</view>
					</scroll-view>
				</view>
				<view class="item on" :class="!categoryList[currentOne].children.length ? 'on3' : ''"
					v-if="categoryList[currentOne]">
					<view class="tips">二级分类</view>
					<scroll-view scroll-y="true" class="scroll-Y">
						<view class="itemn line1" :class="{ checked: jIndex == currentTwo, on: checkedIds.includes(j.value + '') }"
							v-for="(j, jIndex) in categoryList[currentOne].children" :key="jIndex" @click="categoryTwoTap(jIndex)">
							<!-- #ifndef MP -->
							<checkbox @click="handleCheckboxClick(j)" :value="(j.value).toString()"
								:checked='checkedIds.includes(j.value.toString())' color="#ffffff" backgroundColor="#ffffff"
								activeBackgroundColor="#2A7EFB" activeBorderColor="#2A7EFB" style="transform:scale(0.9)" />
							<!-- #endif -->
							<!-- #ifdef MP -->
							<checkbox :value="j.value" :checked='checkedIds.includes(j.value + "")' style="transform:scale(0.9)" @click="handleCheckboxClick(j)" />
							<!-- #endif -->
							{{ j.label }}
						</view>
					</scroll-view>
				</view>
			</view>

			<view class="empty-box" v-else>
				<emptyPage title="暂无分类～" src="/statics/images/empty-box.png"></emptyPage>
			</view>
			<view class="footer acea-row row-between-wrapper">
				<view class="bnt acea-row row-center-wrapper" @tap="reset">重置</view>
				<view class="bnt on acea-row row-center-wrapper" @tap="define">确定</view>
			</view>
		</view>
	</base-drawer>
</template>
<script>
import baseDrawer from "@/components/tui-drawer/tui-drawer.vue"
import emptyPage from '@/components/emptyPage.vue';
// import { getCategory, postBatchProcess } from "@/api/admin";
import { categoryBrandlist, categorySelect, categoryList, attrList, templateList, productDetail, getDeliveryType } from '@/api/product.js';
export default {
	components: {
		baseDrawer,
		emptyPage,
	},
	props: {
		visible: {
			type: Boolean,
			default: false,
		},
		cateData: {
			type: Array,
			default: () => []
		}
	},
	data: function () {
		return {
			categoryList: [],
			currentOne: 0,
			currentTwo: 0,
			checkedIds: [],
			ids: null //父级商品id
		};
	},
	watch: {
		cateData(val) {
			this.categoryList = val;
		}
	},
	methods: {
		handleCheckboxClick(e) {
			const cateId = e.value + '';
			if (this.checkedIds.includes(cateId)) {
				this.checkedIds = this.checkedIds.filter(item => item !== cateId);
			} else {
				this.checkedIds.push(cateId);
			}
		},
		categoryTwoTap(index) {
			this.currentTwo = index
		},
		categoryTap(index) {
			this.currentOne = index
			this.currentTwo = 0
		},
		getCheckId(cateIdList) {
			this.checkedIds = cateIdList;
			if (!cateIdList.length) return;
			
			// 查找当前选中分类中的第一个分类索引并进行回显
			const cateMap = {};
			const buildMap = list => {
				for (const item of list) {
					cateMap[item.value] = item;
					if (item.children?.length) {
						buildMap(item.children);
					}
				}
			}

			// 将所有的分类数据转换为Map，方便后续快速查找
			buildMap(this.cateData);

			// 获取传入分类 id 列表中每个分类 id 对应的一级分类 id 列表并去重
			const levelFirstIdSet = cateIdList.reduce((set, cateId) => {
				const cate = cateMap[cateId];
				if (!cate) return set;
				const pid = cate.pid || cate.value;
				if (!set.has(pid)) {
					set.add(pid);
				}
				return set;
			}, new Set());

			// 查找该商品关联的一级分类 id ，在商户一级分类列表中最小的索引，并回显
			const levelFirstIndex = this.cateData.findIndex(levelFirstCate => levelFirstIdSet.has(levelFirstCate.value));
			this.currentOne = levelFirstIndex || 0;
		},
		reset() {
			this.checkedIds = [];
		},
		define() {
			if (!this.checkedIds.length) return this.$util.Tips({
				title: '请选择分类'
			})
			this.$emit('successChange', this.checkedIds);
		},
		closeDrawer() {
			this.checkedIds = [];
			this.$emit('closeDrawer');
		}
	}
}
</script>

<style lang="scss" scoped>
/deep/ checkbox .wx-checkbox-input.wx-checkbox-input-checked {
	border: 1px solid $primary-admin;
	background-color: $primary-admin;
	color: #fff;
}

/deep/checkbox {
	margin-right: 13rpx;
}

/deep/uni-checkbox .uni-checkbox-input {
	border-radius: 4rpx;
	width: 28rpx;
	height: 28rpx;
}

.classify {
	background-color: #fff;
	padding-bottom: 60rpx;

	.title {
		text-align: center;
		height: 108rpx;
		line-height: 108rpx;
		font-size: 32rpx;
		font-family: PingFang SC, PingFang SC;
		font-weight: 600;
		color: #333333;
		position: relative;
		padding: 0 30rpx;

		.close {
			width: 36rpx;
			height: 36rpx;
			line-height: 36rpx;
			background: #EEEEEE;
			border-radius: 50%;
			position: absolute;
			right: 30rpx;
			top: 38rpx;

			.iconfont {
				font-weight: 300;
				font-size: 20rpx;
			}
		}
	}

	.list {
		height: 770rpx;

		.scroll-Y {
			height: 684rpx;
		}

		.item {
			width: 50%;
			padding-left: 32rpx;
			font-size: 26rpx;
			font-family: PingFang SC, PingFang SC;
			font-weight: 400;
			color: #666666;
			padding-top: 30rpx;

			.tips {
				color: #999;
				font-size: 24rpx;
				margin-bottom: 30rpx;
			}

			.itemn {
				margin-bottom: 58rpx;

				&.checked {
					color: #000;
				}

				&.on {
					color: $primary-admin;
				}
			}

			&.on {
				background-color: #FAFAFA;
			}

			&.on2 {
				background-color: #F5F5F5;
			}

			&.on3 {
				width: 66.66%;
			}
		}
	}

	.footer {
		box-sizing: border-box;
		padding: 0 20rpx;
		width: 100%;
		height: 112rpx;
		background-color: #fff;
		position: fixed;
		bottom: 0;
		z-index: 30;
		height: calc(112rpx + constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
		height: calc(112rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
		padding-bottom: constant(safe-area-inset-bottom); ///兼容 IOS<11.2/
		padding-bottom: env(safe-area-inset-bottom); ///兼容 IOS>11.2/
		left: 0;

		.bnt {
			width: 347rpx;
			height: 72rpx;
			border-radius: 50rpx;
			border: 1px solid $primary-admin;
			color: $primary-admin;
			font-size: 26rpx;
			font-family: PingFang SC, PingFang SC;
			font-weight: 500;

			&.on {
				background-color: $primary-admin;
				color: #fff;
			}
		}
	}
}

.empty-box {
	padding: 100rpx 0;
}
</style>
