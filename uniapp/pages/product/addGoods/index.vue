<template>
	<view>
		<NavBar titleText="添加商品" textSize="34rpx" iconColor="#333333" textColor="#333333" isScrolling showBack></NavBar>
		<view class="p-20">
			<view class="w-full bg--w111-fff rd-16rpx pt-32 pr-30 pb-32 pl-30">
				<view class="fs-30 fw-500 lh-42rpx">商品信息</view>
				<view class="mt-30 flex-between-center">
					<text class="fs-30 lh-42rpx required-label">商品名称</text>
					<text class="text-24 text--w111-666">{{ setFormData.store_name.length }}/40</text>
				</view>
				<view class="w-full bg--w111-f5f5f5 rd-12rpx p-20 mt-12">
					<textarea v-model="setFormData.store_name" :maxlength="40" placeholder="请填写商品名称"
						placeholder-class="text--w111-ccc" class="fs-30" auto-height />
				</view>
				<view class="mt-40">
					<text class="fs-30 lh-42rpx required-label">商品图片</text>
				</view>
				<view class="fs-22 text--w111-999 mt-12">建议：图片尺寸为750*750px，最多上传10张</view>
				<view class="grid-column-4 grid-gap-8rpx mt-20">
					<view class="relative h-156" v-for="(item, index) in setFormData.slider_image" :key="index">
						<image :src="item" mode="aspectFill" class="w-full h-156 rd-12rpx"></image>
						<view class="abs-lt w-60 h-38 fs-20 bg-mer text--w111-fff flex-center cover-tag" v-if="index === 0">封面
						</view>
						<view class="abs-rt w-32 h-32 of0b21 flex-center fs-24" @click="handleDeleteSliderImage(index)">
							<text class="iconfont icon-ic_close text--w111-fff fs-20"></text>
						</view>
					</view>
					<view class="h-156 flex-col flex-center upload bg--w111-f5f5f5 text--w111-999 rd-12rpx"
						@click="uploadPicture(9)" v-if="setFormData.slider_image.length < 9">
						<text class="iconfont icon-ic_camera1 fs-40"></text>
						<text class="fs-24 lh-34rpx pt-8">上传图片</text>
					</view>
				</view>
				<!-- <view class="mt-30">
					<text class="fs-30 lh-42rpx">商品视频</text>
				</view>
				<view class="fs-22 text--w111-999 mt-12">建议：视频尺寸为750*750px，支持MP4格式</view>
				<view class="grid-column-4 grid-gap-8rpx mt-20">
					<view class="relative h-156" v-if="setFormData.video_link">
						<video :src="setFormData.video_link" mode="aspectFill" class="w-full h-156 rd-12rpx"></video>
						<view class="abs-rt w-32 h-32 of0b21 flex-center fs-24 z-10" @click="deleteVideo">
							<text class="iconfont icon-ic_close text--w111-fff fs-20"></text>
						</view>
					</view>
					<view class="h-156 flex-col flex-center upload bg--w111-f5f5f5 text--w111-999 rd-12rpx"
						@click="uploadVideo" v-if="!setFormData.video_link">
						<text class="iconfont icon-icon_video fs-40"></text>
						<text class="fs-24 lh-34rpx pt-8">添加视频</text>
					</view>
				</view> -->
			</view>
			<view class="w-full bg--w111-fff rd-16rpx mt-22 px-30">
				<view class="h-106 flex-between-center bb-e" @click="selectPlatform">
					<text class="fs-30 lh-42rpx required-label form-label">平台商品分类</text>
					<view class="flex-y-center overflow-hidden">
						<text class="fs-30 text--w111-333 pr-12 line1" v-if="setFormData.cate_name">{{ setFormData.cate_name
						}}</text>
						<text class="fs-30 text--w111-999 pr-12" v-else>请选择平台分类</text>
						<text class="iconfont icon-ic_rightarrow fs-36 text--w111-999"></text>
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" @click="selectStoreClass">
					<text class="fs-30 lh-42rpx form-label">商户商品分类</text>
					<view class="flex-y-center overflow-hidden">
						<text class="fs-30 text--w111-333 pr-12 line1" v-if="setFormData.mer_cate_id.length">
							{{ selectedMerchantCateName.join(',') }}
						</text>
						<text class="fs-30 text--w111-999 pr-12" v-else>请选择商户分类</text>
						<text class="iconfont icon-ic_rightarrow fs-36 text--w111-999"></text>
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" @click="selectBrand">
					<text class="fs-30 lh-42rpx">商品品牌</text>
					<view class="flex-y-center">
						<text class="fs-30 text--w111-333 pr-12" v-if="setFormData.brand_name">{{ setFormData.brand_name }}</text>
						<text class="fs-30 text--w111-999 pr-12" v-else>请选择商品品牌</text>
						<text class="iconfont icon-ic_rightarrow fs-36 text--w111-999"></text>
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">单位</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="text" maxlength="1" v-model="setFormData.unit_name" placeholder="请填写商品单位"
							placeholder-class="text--w111-999 fs-30" class="fs-32" />
					</view>
				</view>
			</view>
			<view class="w-full bg--w111-fff rd-16rpx mt-22 pt-32 pr-30 pl-30">
				<view class="fs-30 fw-500 lh-42rpx">规格设置</view>
				<!-- <view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">规格类型</text>
					<view class="flex-y-center">
						<view class="flex-y-center">
							<text class="iconfont icon-ic_unselect fs-34 text--w111-ccc"></text>
							<text class="fs-30 text--w111-666 pl-8">单规格</text>
						</view>
						<view class="flex-y-center ml-52">
							<text class="iconfont icon-ic_unselect fs-34 text--w111-ccc"></text>
							<text class="fs-30 text--w111-666 pl-8">多规格</text>
						</view>
					</view>
				</view> -->
				<view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">售价</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="digit" v-model="setFormData.attrValue[0].price" class="fs-32" placeholder="请填写售价"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<!-- <view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">成本价</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="digit" v-model="setFormData.attrValue[0].cost" class="fs-32" placeholder="请填写成本价"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view> -->
				<!-- <view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">划线价</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="digit" v-model="setFormData.attrValue[0].ot_price" class="fs-32" placeholder="请填写划线价"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view> -->
				<view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">库存</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="number" v-model="setFormData.attrValue[0].stock" class="fs-32" placeholder="请填写库存"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" v-show="isMore">
					<text class="fs-30 lh-42rpx">规格编码</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="text" v-model="setFormData.attrValue[0].bar_code" class="fs-32" placeholder="请填写规格编码"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" v-show="isMore">
					<text class="fs-30 lh-42rpx">条形码</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="number" v-model="setFormData.attrValue[0].bar_code_number" class="fs-32" placeholder="请填写条形码"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" v-show="isMore">
					<text class="fs-30 lh-42rpx">重量</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="number" v-model="setFormData.attrValue[0].weight" class="fs-32" placeholder="请填写重量"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" v-show="isMore">
					<text class="fs-30 lh-42rpx">体积</text>
					<view class="flex-1 flex justify-end text-right">
						<input type="number" v-model="setFormData.attrValue[0].volume" class="fs-32" placeholder="请填写体积"
							placeholder-class="text--w111-999 fs-30" />
					</view>
				</view>
				<view class="h-106 flex-center text--w111-666" @tap="toggleMore">
					<text class="fs-26">{{ isMore ? '收起' : '展开' }}</text>
					<text class="iconfont fs-30" :class="isMore ? 'icon-ic_uparrow' : 'icon-ic_downarrow'"></text>
				</view>
			</view>
			<view class="w-full bg--w111-fff rd-16rpx mt-22 pt-32 pr-30 pl-30 pb-32">
				<view class="fs-30 lh-42rpx">商品详情</view>
				<view class="fs-22 text--w111-999 mt-12">建议：图片尺寸为750*750px，最多上传10张</view>
				<view class="grid-column-4 grid-gap-8rpx mt-20">
					<view class="relative h-156" v-for="(item, index) in contentPicture" :key="index">
						<image :src="item" mode="aspectFill" class="w-full h-156 rd-12rpx"></image>
						<view class="abs-rt w-32 h-32 of0b21 flex-center fs-24" @click="handleDeleteContentPicture(index)">
							<text class="iconfont icon-ic_close text--w111-fff fs-20"></text>
						</view>
					</view>
					<view class="h-156 flex-col flex-center upload bg--w111-f5f5f5 text--w111-999 rd-12rpx"
						@click="uploadContentPicture(10)" v-if="contentPicture.length < 10">
						<text class="iconfont icon-ic_camera1 fs-40"></text>
						<text class="fs-24 lh-34rpx pt-8">上传图片</text>
					</view>
				</view>
			</view>
			<view class="w-full bg--w111-fff rd-16rpx mt-22 pt-32 pr-30 pl-30">
				<view class="fs-30 lh-42rpx fw-500">其他设置</view>
				<view class="fs-30 lh-42rpx mt-32 required-label">配送方式</view>
				<view class="h-106 flex-y-center bb-e">
					<checkbox-group class="flex-y-center" @change="deliveryWayChange">
						<label class="mr-48" v-for="(val, i) in deliveryFreeList" :key="val.value">
							<view>
								<checkbox :value="val.value" :checked="setFormData.delivery_way.includes(val.value)"
									style="transform:scale(0.8)" />
								<text class="relative top-2">{{ val.name }}</text>
							</view>
						</label>
					</checkbox-group>
				</view>
				<view class="h-106 flex-between-center bb-e">
					<text class="fs-30 lh-42rpx">是否包邮</text>
					<view class="flex-1 flex justify-end text-right">
						<switch :checked="setFormData.delivery_free == 1" class="fs-32 switch-small" @change="deliveryFreeChange" />
					</view>
				</view>
				<view class="h-106 flex-between-center bb-e" @click="tempIdSelect" v-if="setFormData.delivery_free == 0">
					<text class="fs-30 lh-42rpx required-label">运费模板</text>
					<view class="flex-y-center">
						<text class="fs-30 text--w111-333 pr-12" v-if="setFormData.tempName">{{ setFormData.tempName }}</text>
						<text class="fs-30 text--w111-999 pr-12" v-else>请选择运费模板</text>
						<text class="iconfont icon-ic_rightarrow fs-36 text--w111-999"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="pb-safe">
			<view class="h-200"></view>
		</view>
		<view class="fixed-lb w-full pb-safe bg--w111-fff z-10">
			<view class="footer-box flex-center">
				<view class="w-690 h-88 flex-center bg-mer text--w111-fff fs-28 rd-44rpx" @tap="confirmSave">提交</view>
			</view>
		</view>
		<!-- 选择平台分类弹框 -->
		<uni-popup ref="select_platform" type="bottom">
			<platfrom @close="closePlatfrom" :cateId="setFormData.cate_id || 0" :classifiedData="platformClassificationData"
				@getPlatData="getPlatData" />
		</uni-popup>
		<classify ref="classify" :visible="visibleClass" :cateData="merchantClassification" @closeDrawer="classCloseDrawer"
			@successChange='successChange'></classify>
		<uni-popup ref="select_popup" type="bottom">
			<linkage-assembly selectProductTitle="选择品牌" :form="setFormData" :classifiedData="brand"
				:selectProductItem="productItem" @getLinkageData="getLinkageData" @multipleList="multipleList"
				@close="handleClose"></linkage-assembly>
		</uni-popup>
		<uni-popup ref="tempId" type="bottom">
			<linkage-assembly selectProductTitle="选择运费模板" :form="setFormData" :classifiedData="classified['temp_id']"
				:selectProductItem="productItem" :mer_id="merId" @getLinkageData="getTempIdData" @multipleList="multipleList"
				@close="$refs.tempId.close()" @scrolltolower="scrolltolower"></linkage-assembly>
		</uni-popup>
	</view>
</template>
<script>

import inputGoodsDetils from '../components/inputGoodsDetils.vue';
import linkageAssembly from '../components/linkageAssembly.vue';
import { navigateTo, serialize, setStorage, getStorage, Toast, removeStorage, Loading, hideLoading, Modal } from '../../../libs/uniApi.js';
import { categoryBrandlist, categorySelect, categoryList, attrList, templateList, productDetail, getDeliveryType, productCreate } from '@/api/product.js';
import platfrom from '../components/platform.vue';
import store from '@/store';
import storeClassification from '../components/store_classification.vue';
import NavBar from "../components/NavBar.vue";
import classify from '../components/classify/index.vue';
import { TOKENNAME, HTTP_REQUEST_URL } from '@/config/app.js';
import { handleBack } from '@/utils/navigation';
export default {
	components: {
		inputGoodsDetils,
		linkageAssembly,
		platfrom, // 选择平台分类组件
		storeClassification,
		NavBar,
		classify
	},
	data() {
		return {
			domain: HTTP_REQUEST_URL,
			step: 1,
			setFormData: {
				image: '', //主图
				attrValue: [
					{
						price: "",
						cost: "",
						ot_price: "",
						stock: "",
						bar_code: "",
						bar_code_number: "",
						weight: "",
						volume: "",
						is_default_select: 0,
						is_show: 1,
						image: ""
					}
				],
				slider_image: [],
				video_link: '', // 商品视频链接
				store_name: '', // 商品名
				brand_id: '', // 品牌id
				brand_name: '', // 品牌名称
				cate_id: '', // 平台分类
				cate_name: '', // 平台名称
				mer_cate_id: [], // 店铺分类
				mer_cate_name: '', // 店铺分类名称
				unit_name: '', // 商品单位
				spec_type: 0, // 0.单规格 1：多规格
				delivery_way: [], // 配送方式 1 到店核销 2 快递配送
				delivery_free: 0, // 是否包邮 0不包邮 1包邮
				temp_id: '', // 运费模板ID
				tempName: '',// 运费模板名称
				content: "",
				is_show: 0
			},
			popupContainerKey: false,
			productItem: {} || [],
			selectProductTitle: '选择平台分类',
			deliveryType: [],
			deliveryFreeList: [
				{
					value: '1',
					name: '到店自提'
				},
				{
					value: '2',
					name: '快递配送'
				},
				{
					value: '3',
					name: '闪送'
				}
			],
			merId: '',
			product_id: '', // 商品Id
			isUpload: true,
			templateListPage: {
				page: 1,
				limit: 10000
			},
			// 分类数据容器
			classified: {
				cate_id: [],
				mer_cate_id: [],
				brand_id: [],
				attr: [],
				temp_id: []
			},
			platformClassificationData: [], // 平台分类数据
			merchantClassification: [], // 店铺分类
			brand: [], // 品牌分类
			isMore: false,
			visibleClass: false,
			contentPicture: [],
		};
	},
	onLoad(opt) {
		this.merId = opt.mer_id;
		this.product_id = opt.product_id;
		// this.getDeliveryType();
		this.initData();
	},
	computed: {
		// 店铺商品分类 id -> info 映射
		merchantCateMap() {
			const map = {};
			const buildMap = (cateList) => {
				for (const item of cateList) {
					map[item.value] = item;
					if (item.children?.length) {
						buildMap(item.children);
					}
				}
			}
			buildMap(this.merchantClassification);

			return map;
		},
		// 已选店铺商品分类名称
		selectedMerchantCateName() {
			return this.setFormData.mer_cate_id.map(id => this.merchantCateMap[id]?.label);
		}
	},
	methods: {
		deliveryFreeChange(val) {
			this.setFormData.delivery_free = val.detail.value ? 1 : 0;
		},
		// 获取数据
		async initData() {
			const tasks = [
				categoryBrandlist(this.merId), // 获取品牌
				categorySelect(this.merId), // 获取商户分类
				categoryList(this.merId) // 获取平台分类
			];

			try {
				const [brand, merchantClassification, platformClassificationData] = await Promise.all(tasks);
				this.brand = brand.data;
				this.merchantClassification = merchantClassification.data;
				this.platformClassificationData = platformClassificationData.data;
			} catch (error) {
				this.$util.Tips({
					title: error.message || error
				});
			}
		},
		//获取送货方式信息
		getDeliveryType() {
			let that = this
			getDeliveryType(that.merId).then(
				res => {
					that.deliveryType = res.data.delivery_way.map(String);
					if (!that.product_id) that.setFormData.delivery_way = that.deliveryType;
					if (that.deliveryType.length == 2) {
						that.deliveryFreeList = [
							{ value: '1', name: '到店核销' },
							{ value: '2', name: '快递配送' }
						]
					} else {
						if (that.deliveryType.length == 1 && that.deliveryType[0] == '1') {
							that.deliveryFreeList = [{ value: '1', name: '到店核销' }]
						} else {
							that.deliveryFreeList = [{ value: '2', name: '快递配送' }]
						}
					}
				},
				error => {
					that.$util.Tips({
						title: error.msg
					})
				}
			);
		},
		// 删除图片
		deleteImage(index) {
			this.setFormData.imageList.splice(index, 1);
		},
		// 选择平台分类
		selectPlatform() {
			this.$refs.select_platform.open();
		},
		// 关闭频台分类
		closePlatfrom() {
			this.$refs.select_platform.close();
		},
		// 获取平台类数据
		getPlatData(item, taplist) {
			this.setFormData.cate_id = item.value;
			this.setFormData.cate_name = item.label;
			this.$refs.select_platform.close();
		},
		// 选择店铺分类
		selectStoreClass() {
			this.visibleClass = true;
		},

		// 获取品牌分类弹框
		selectBrand() {
			this.$refs.select_popup.open();
		},
		// 获取品牌分类数据
		getLinkageData(item) {
			this.setFormData.brand_id = item[0].value;
			this.setFormData.brand_name = item[0].label;
			this.$refs.select_popup.close();
		},
		// 获取多选数据
		multipleList(data, model) {
			if (model == 'mer_cate_id') {
				this.platformClassification[1].value = data.map(item => item.label).join('，');
				this.platformClassification[1].allreadySelect = data;
				this.setFormData.mer_cate_id = data.map(item => item.value);
			}
		},
		// popup弹框中返回数据结束
		// 关闭弹框
		close() {
			this.$refs.select_popup.close();
		},
		// 多选切换
		checkChange(value, item) {
			this.setFormData[item.model] = value;
			if (item.model == 'delivery_way') {
				if (value.includes('2')) {
					this.transport[1].DoNotShow = false;
				} else {
					this.transport[1].DoNotShow = true;
				}
				console.log(this.transport[1]);
			}
		},

		handleClose() {
			this.$refs.select_popup.close();
		},
		// 送货方式选择
		deliveryWayChange(obj) {
			this.setFormData.delivery_way = obj.detail.value;
		},
		// 是否包邮选择
		deliveryFreeChange(val) {
			if (val.detail.value) {
				this.setFormData.delivery_free = 1;
			} else {
				this.setFormData.delivery_free = 0;
			}
		},
		// 选择运费模板
		tempIdSelect() {
			this.getTemplateList();
		},
		// 请求运费模板列表
		getTemplateList() {
			templateList(this.merId, this.templateListPage).then(res => {
				res.data.list.forEach(item => {
					this.$set(item, 'value', item.shipping_template_id);
					this.$set(item, 'label', item.name);
				});
				this.classified['temp_id'] = res.data.list;
				this.$refs.tempId.open();
			});
		},
		// 内部scroll-view滑动到最底部
		scrolltolower() {
		},
		// 获取运费模板数据
		getTempIdData(obj) {
			this.setFormData.temp_id = obj[0].value;
			this.setFormData.tempName = obj[0].label;
			this.$refs.tempId.close();
		},
		// 设置运费模板
		setGoodsTemp() {
			navigateTo(1, '/pages/product/addGoods/freightTemplate', { mer_id: this.merId });
		},
		uploadPicture(count, type) {
			let that = this
			that.$util.uploadImageOne({ url: 'upload/image', count: count }, res => {
				let data = []
				res.map(item => {
					data.push(item)
				})
				that.setFormData.slider_image = [...that.setFormData.slider_image, ...data];
				if (that.setFormData.slider_image.length >= 9) that.setFormData.slider_image.length = 9;
				this.setFormData.image = this.setFormData.slider_image[0];
				this.setFormData.attrValue[0].image = this.setFormData.slider_image[0];
			});
		},
		uploadContentPicture() {
			let that = this
			that.$util.uploadImageOne({ url: 'upload/image', count: 10 }, res => {
				let data = []
				res.map(item => {
					data.push(item)
				})
				that.contentPicture = [...that.contentPicture, ...data];

				if (that.contentPicture.length >= 10) that.setFormData.slider_image.length = 10;

			});
		},
		// 上传视频
		uploadVideo() {
			let that = this
			uni.chooseVideo({
				sourceType: ['camera', 'album'],
				success: res => {
					uni.showLoading({
						title: '视频上传中',
					});
					if (Math.ceil(res.size / 1024) < 50 * 1024) {
						uni.uploadFile({
							url: `${HTTP_REQUEST_URL}/api/upload/video`,
							filePath: res.tempFilePath,
							name: 'file',
							formData: {
								user: 'test'
							},
							header: {
								// #ifdef MP
								'Content-Type': 'multipart/form-data',
								// #endif
								[TOKENNAME]: 'Bearer ' + store.state.app.token
							},
							success: uploadFileRes => {
								uni.hideLoading();
								let data = JSON.parse(uploadFileRes.data);
								that.setFormData.video_link = (data.data.src);
							},
							complete: a => {
								uni.hideLoading();
							},
							fail: function(res) {
								uni.hideLoading();
								uni.showToast({
									title: res.message || '上传失败',
									icon: 'none'
								});
							}
						});
					} else {
						uni.hideLoading();
						uni.showModal({
							title: '提示',
							content: '视频超出限制50MB'
						});
					}
				},
				fail: err => {
					uni.showToast({
						title: err.message || '选择视频失败',
						icon: 'none'
					});
				}
			});
		},
		// 删除视频
		deleteVideo() {
			this.setFormData.video_link = '';
		},
		handleDeleteSliderImage(index) {
			this.setFormData.slider_image.splice(index, 1);
		},
		handleDeleteContentPicture(index) {
			this.contentPicture.splice(index, 1);
		},
		classCloseDrawer() {
			this.visibleClass = false
		},
		successChange(val) {
			this.setFormData.mer_cate_id = val;
			this.visibleClass = false;
		},
		toggleMore() {
			this.isMore = !this.isMore;
		},
		/**
		 * 将图片链接数组转换为富文本 HTML
		 * @param {string[]} urls 图片链接数组
		 * @param {object} opts 可选项
		 * @param {string} opts.wrapTag 包裹标签，默认 'p'
		 * @param {string} opts.className img 的 class，默认 ''
		 * @param {string} opts.style 内联样式，例如 'max-width:100%;height:auto;'
		 * @param {string} opts.alt 默认的 alt 文本
		 * @returns {string} 富文本 HTML 字符串
		 */
		buildEditorImageHtml(
			urls = [],
			{ wrapTag = 'p', className = '', style = 'max-width:100%;height:auto;', alt = '图片' } = {}
		) {
			const clean = (v) => String(v).replace(/[`'"]/g, '').trim(); // 去除反引号/引号/空格
			const isUrl = (u) => /^https?:\/\/.+/i.test(u);              // 简单校验 http/https

			return urls
				.filter(Boolean)
				.map(clean)
				.filter(isUrl)
				.map((url) => {
					const cls = className ? ` class="${className}"` : '';
					const sty = style ? ` style="${style}"` : '';
					return `<${wrapTag}><img src="${url}" alt="${alt}"${cls}${sty} /></${wrapTag}>`;
				})
				.join('');
		},
		confirmSave() {
			if (!this.setFormData.store_name) return Toast('请填写商品名称');
			if (!this.setFormData.image) return Toast('请上传商品图片');
			if (!this.setFormData.cate_id) return Toast('请选择平台分类');
			if (!this.setFormData.attrValue[0].price) return Toast('请填写商品售价');
			// if (!this.setFormData.attrValue[0].cost) return Toast('请填写商品成本价');
			// if (!this.setFormData.attrValue[0].ot_price) return Toast('请填写商品划线价');
			if (!this.setFormData.attrValue[0].stock) return Toast('请填写商品库存');
			if (!this.setFormData.delivery_way.length) return Toast('请选择配送方式');
			if (this.setFormData.delivery_free == 0 && !this.setFormData.temp_id) return Toast('请选择运费模板');
			const html = this.buildEditorImageHtml(this.contentPicture);
			this.$set(this.setFormData, 'content', html);

			productCreate(this.merId, this.setFormData).then(res => {
				Modal('提交成功', '点击确定，返回商品管理', {
					showCancel: false,
				}).then(() => {
					const pages = getCurrentPages();
					const page = pages[pages.length - 2];
					page?.$vm?.init?.();
					handleBack();
				})
			}).catch(err => {
				uni.showToast({
					title: err,
					icon: 'none'
				})
			})
		}
	}
};
</script>
<style lang="scss">
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

.grid-gap-8rpx {
	grid-gap: 8rpx;
	gap: 8rpx;
}

.of0b21 {
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 0 12rpx 0 12rpx;
}

.bb-e {
	border-bottom: 1rpx solid #eee;
}

.icon-a-ic_CompleteSelect {
	color: $primary-admin;
}

.bg-mer {
	background-color: $primary-admin;
}

.footer-box {
	height: 126rpx;

	.w-690 {
		width: 690rpx;
	}
}

.mr-48 {
	margin-right: 48rpx;
}

.top-2 {
	top: 2rpx;
}

.form-label {
	flex-shrink: 0;margin-right: 40rpx;
}

.required-label::after {
	content: '*';
	color: #ED4014;
}

.switch-small {
	transform: scale(0.8);
	transform-origin: right center;
}

.z-10 {
	z-index: 10;
}

.cover-tag {
	border-top-left-radius: 12rpx;
	border-bottom-right-radius: 12rpx;
}
</style>
