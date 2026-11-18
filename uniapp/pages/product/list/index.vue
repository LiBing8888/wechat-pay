<template>
	<BaseContainer>
		<view class="pt-20">
			<view class="px-20 flex-between-center">
				<view class="search-box flex-1 flex-y-center relative">
					<text class="iconfont icon-ic_search text--w111-999 fs-32 mr-16"></text>
					<input class="inputs" placeholder='请输入商品名称/ID' placeholder-class='placeholder' confirm-type='search'
						name="search" v-model="where.keyword" @confirm="init"></input>
					<text class="iconfont icon-ic_close1 fs-30 text--w111-999" v-show="where.keyword"
						@tap="where.keyword = ''"></text>
				</view>
				<view class="w-64 h-64 flex-center rd-50-p111- bg--w111-fff ml-24" @tap="addGoods">
					<text class="iconfont icon-ic_increase fs-36 fw-500"></text>
				</view>
			</view>
			<view class="nav-box flex-y-center">
				<view class="item" :class="where.type == item.type ? 'on' : ''" v-for="(item, index) in navList" :key="index"
					@click="navTap(item, index)">{{ item.name }}
					<image src="../static/adorn.png" v-if="where.type == item.type"></image>
				</view>
			</view>
			<view class="px-20" v-if="productList.length">
				<view v-for="(item, index) in productList" :key="index">
					<view class="w-full bg--w111-fff rd-24rpx p-24 mb-20">
						<view class="flex-between-center">
							<view class="w-136 h-136">
								<image :src="item.image" mode="aspectFill" class="w-full h-full rd-16rpx"></image>
							</view>
							<view class="flex-1 ml-20">
								<view class="fs-28 w-508 flex">
									<text class="line1 flex-1 mr-20">
										{{ item.store_name }}
									</text>
									<text class="product-stock-status">{{ getProductStatusText(item) }}</text>
								</view>
								<view class="fs-24 text--w111-666 mt-10">
									<text>销量: {{ item.sales }}</text>
									<text class="pl-40">库存: {{ item.stock }}</text>
									<text class="pl-40">评分: {{ item.rate }}</text>
								</view>
								<view class="mt-18">
									<baseMoney :money="item.price" symbolSize="20" integerSize="32" decimalSize="20" color="#FF7E00">
									</baseMoney>
								</view>
							</view>
						</view>
						<view class="mt-24 flex justify-end">
							<view class="w-144 h-56 rd-28rpx fs-24 btn-down flex-center" v-if="item.is_show == 1 && item.status == 1"
								@tap.stop="handleShelves(item, 0)">下架</view>
							<view class="w-144 h-56 rd-28rpx fs-24 btn-up flex-center" v-if="item.is_show == 0 && item.status == 1"
								@tap.stop="handleShelves(item, 1)">上架</view>
							<view class="w-144 h-56 rd-28rpx fs-24 btn-edit flex-center ml-16" @tap.stop="openDrawer(item)">编辑</view>
						</view>
					</view>
				</view>
			</view>
			<view class="px-20" v-else-if="!loading">
				<view class="w-full flex-col flex-center pt-82 bg--w111-fff rd-24rpx">
					<image class="empty-img" :src="`${domain}/static/images/no_thing.png`"></image>
					<view class="fs-26 text--w111-999 lh-36rpx pt-16">暂无商品，去看点什么吧</view>
				</view>
			</view>
		</view>
		<Loading :loaded="loaded" :loading="loading"></Loading>
		<view class="footerH"></view>
		<base-drawer mode="bottom" :visible="showEdit" background-color="transparent" :mask="true" :maskClosable="true"
			@close="() => { showEdit = false }">
			<view class="edit-list bg--w111-fff rd-t-40rpx">
				<view class="h-106 fs-32 text--w111-333 flex-center" v-for="(item, index) in editList" :key="index"
					v-show="item.isShow" @tap="editInfo(item.val)">{{ item.name }}</view>
			</view>
		</base-drawer>
		<uni-popup ref="select_platform" type="bottom">
			<platfrom @close="closePlatfrom" :classifiedData="platCateData" @getPlatData="getPlatData"
				:cateId="rowData ? rowData.cate_id : 0"></platfrom>
		</uni-popup>
		<classify ref="classify" :visible="visibleClass" :cateData="merCateData" @closeDrawer="classCloseDrawer"
			@successChange='successChange'></classify>
	</BaseContainer>
</template>

<script>
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
import {
	productLstApi,
	productDeleteApi,
	productOffApi,
	productRecommendApi,
	categorySelect,
	categoryList,
	productEditPlatCateApi,
	productEditMerCateApi
} from "@/api/product";
import Loading from '@/components/Loading/index.vue';
import baseMoney from "@/components/BaseMoney.vue";
import baseDrawer from "@/components/tui-drawer/tui-drawer.vue";
import classify from '../components/classify/index.vue';
import platfrom from '../components/platform.vue';
import { navigateTo, navigateBack, serialize, setStorage, getStorage, removeStorage, Toast, Modal, } from '../../../libs/uniApi.js';
import { HTTP_REQUEST_URL } from '@/config/app.js';
import emptyPage from '@/components/emptyPage.vue';
import BaseContainer from '@/components/common/base_container.vue';

export default {
	name: 'productList',
	components: {
		Loading,
		baseMoney,
		baseDrawer,
		classify,
		platfrom,
		emptyPage,
		BaseContainer
	},
	data() {
		return {
			domain: HTTP_REQUEST_URL,
			where: {
				page: 1,
				limit: 20,
				keyword: "",
				type: '',
			},
			loaded: false,
			loading: false,
			mer_id: '',
			productList: [],
			swiperCur: 0,
			circular: true,
			navList: [
				{ name: '全部', type: '' },
				{ name: '出售中', type: 1 },
				{ name: '仓库中', type: 2 },
				{ name: '已售罄', type: 3 },
				{ name: '警戒库存', type: 4 }
			],
			editList: [
				{ name: '修改价格/库存', val: 0, isShow: true, },
				{ name: '修改平台分类', val: 1, isShow: true, },
				{ name: '修改商户分类', val: 2, isShow: true, },
			],
			current: 0,
			administer: 0,
			isAllSelect: false,
			type: '', //商品状态
			product_id: '',
			showEdit: false,
			visibleClass: false,
			platCateData: [],
			merCateData: [],
			rowData: {}
		}
	},
	onLoad(options) {
		this.mer_id = options.mer_id;
		this.initData();
		this.getList(this.mer_id);
	},
	methods: {
		navTap(item, index) {
			this.where.type = item.type;
			this.init();
		},
		init() {
			this.productList = [];
			this.where.page = 1;
			this.loaded = false;
			this.loading = false;
			this.getList(this.mer_id);
		},
		getProductStatusText(product) {
			if (product.status == 0) {
					return '待审核';
				}
				if (product.is_show == 1 && product.status == 1) {
					return '出售中';
				}
				if (product.is_show == 0 && product.status == 1) {
					return '仓库中';
				}
				return '未知状态';
		},
		// 跳转添加商品界面
		jumpAddGoods() {
			const data = getStorage('addGoodsFormData');
			if (data && data.product_id) {
				let waitDeleteData = ['addGoodsFormData', 'singleSpecification', 'attrValue', 'modifyPriceData', 'addGoodsSecoundData', 'goodsDis', 'editGoodsDetils'];
				waitDeleteData.forEach(item => {
					if (getStorage(item)) {
						removeStorage(item);
					}
				})
			}
			navigateTo(1, '/pages/product/addGoods/index', { mer_id: this.mer_id });
		},
		getList(mer_id) {
			var that = this;
			if (that.loading || that.loaded) return;
			that.loading = true;
			productLstApi(mer_id, that.where).then(res => {
				that.loading = false;
				that.loaded = res.data.list.length < that.where.limit;
				that.productList.push.apply(that.productList, res.data.list);
				that.where.page = that.where.page + 1;
			}).catch(err => {
				that.loading = false;
				that.loaded = false;
				that.$util.Tips({
					title: err.msg
				})
			})
		},
		openDrawer(item) {
			this.product_id = item.product_id;
			this.rowData = item;
			if (item.product_typ != 0 && item.type != 0) {
				this.editList[0].isShow = false;
			} else {
				this.editList[0].isShow = true;
			}
			this.showEdit = true;
		},
		//下架 0
		handleShelves(item, status) {
			let that = this;
			if (status == 0) {
				uni.showModal({
					content: '确定要下架该商品么？',
					success: function (res) {
						if (res.confirm) {
							that.onAndOff(item, 0)
							uni.showToast({
								title: '下架成功',
								icon: 'none'
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			} else {
				that.onAndOff(item, 1)
			}
		},
		//上下架
		onAndOff(item, status) {
			let that = this;
			productOffApi(that.mer_id, item.product_id, { status: status }).then((res) => {
				that.$util.Tips({
					title: res.message,
					icon: 'success'
				}, () => {
					that.$set(item, 'is_show', item.is_show == 0 ? 1 : 0);
				});
			}).catch(err => {
				return that.$util.Tips({
					title: err
				});
			});
		},
		//设置推荐
		handleRecommend(item) {
			let that = this
			let is_good = item.is_good ? 0 : 1
			productRecommendApi(that.mer_id, item.product_id, { is_good: is_good }).then((res) => {
				that.$util.Tips({
					title: res.message,
					icon: 'success'
				}, () => {
					that.$set(item, 'is_good', item.is_good == 0 ? 1 : 0);
				});
			}).catch(err => {
				return that.$util.Tips({
					title: err
				});
			});
		},
		more(index) {
			this.current = index
		},
		addGoods() {
			uni.navigateTo({
				url: `/pages/product/addGoods/index?mer_id=${this.mer_id}`
			})
		},
		// 获取数据
		async initData() {
			// 获取品牌
			// this.brand = (await categoryBrandlist(this.merId)).data;
			// 获取商户分类
			this.merCateData = (await categorySelect(this.mer_id)).data;
			// 获取平台分类
			this.platCateData = (await categoryList(this.mer_id)).data;
			// 数据回显
		},
		// 关闭频台分类
		closePlatfrom() {
			this.$refs.select_platform.close();
		},
		classCloseDrawer() {
			this.visibleClass = false
		},
		// 获取平台类数据
		getPlatData(item, taplist) {
			this.$refs.select_platform.close();
			productEditPlatCateApi(this.mer_id, this.product_id, {
				cate_id: item.value
			}).then(res => {
				Toast('修改成功');
				this.init();
			}).catch(err => {
				Toast(err);
			})
		},
		successChange(val) {
			this.visibleClass = false;
			productEditMerCateApi(this.mer_id, this.product_id, {
				ids: val
			}).then(res => {
				Toast('修改成功');
				this.init();
			}).catch(err => {
				Toast(err);
			})
		},
		editInfo(val) {
			this.showEdit = false;
			if (val == 0) {
				navigateTo(1, '/pages/product/list/specs?id=' + this.product_id + '&mer_id=' + this.mer_id)
			} else if (val == 1) {
				this.$refs.select_platform.open();
			} else if (val == 2) {
				this.$refs.classify.getCheckId(this.rowData.merCateId.map(val => val.mer_cate_id.toString()));
				this.visibleClass = true;
			}
		}
	},
	onReachBottom() {
		this.getList(this.mer_id)
	}
}
</script>

<style lang="scss" scoped>
.search-box {
	height: 72rpx;
	background: #FFFFFF;
	border-radius: 50rpx;
	padding: 0 34rpx;
}

.nav-box {
	padding: 20rpx 20rpx 18rpx 34rpx;
	position: sticky;
	top: 0;
	left: 0;
	width: 100%;
	background-color: #F5F5F5;
	z-index: 9;

	.item {
		font-weight: 400;
		font-size: 26rpx;
		color: #333333;
		padding: 10rpx 0;
		position: relative;

		&~.item {
			margin-left: 72rpx;
		}

		&.on {
			font-weight: 500;
			color: $primary-admin;
			font-size: 30rpx;
			font-family: PingFang SC, PingFang SC;
		}

		image {
			width: 14rpx;
			height: 14rpx;
			display: block;
			position: absolute;
			bottom: 0;
			right: -4rpx;
		}
	}
}

.btn-up {
	border: 1rpx solid #FF7E00;
	color: #FF7E00;
}

.btn-down {
	border: 1rpx solid #ccc;
}

.btn-edit {
	border-color: $primary-admin;
	background-color: $primary-admin;
	color: #fff;
}

.icon-ic_close1 {
	position: absolute;
	right: 20rpx;
	top: 20rpx;
}

.edit-list {
	padding: 45rpx 34rpx;
}

/deep/uni-radio .uni-radio-input.uni-radio-input-checked {
	border: 1px solid $primary-admin !important;
	background-color: $primary-admin !important;
}

/deep/checkbox .uni-checkbox-input.uni-checkbox-input-checked,
/deep/checkbox .wx-checkbox-input.wx-checkbox-input-checked {
	border: 1px solid $primary-admin !important;
	background-color: $primary-admin !important;
	color: #fff !important;
}

.empty-img {
	width: 440rpx;
	height: 360rpx;
}

.pt-82 {
	padding: 82rpx 0 160rpx;
}

.product-stock-status {
	margin-left: auto;
	color: #2A7EFB;
	font-size: 24rpx;
}
</style>
