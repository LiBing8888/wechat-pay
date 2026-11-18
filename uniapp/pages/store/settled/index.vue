<template>
	<!-- 小程序使用 page-meta -->
	<!--#ifdef MP-->
	<page-meta :page-style="pageStyle"></page-meta>
	<!--#endif-->
	<BaseContainer>
		<view v-if="!successful" :style="[commonCssVars]">
			<view class="navbar-wrapper">
				<BaseNavBar lightText />
			</view>
			<image :src="`${domain}/static/images/store-apply-bg.png`" class="bg-image" />
			<form report-submit='true'>
				<view class='merchantsSettled'>
					<view class="application-record" @click="jumpToList">
						申请记录
						<!-- <text class="iconfont icon-ic_rightarrow"></text> -->
					</view>
					<view class='list'>
						<view class="item">
							<view class="acea-row row-middle">
								<text class="item-name" data-required>店铺名称</text>
								<input type="text" maxlength="30" placeholder="请输入店铺名称" v-model="merchantData.enterprise_name" @input="validateBtn"
								placeholder-class='placeholder' />
							</view>
						</view>
						<view class="item">
							<view class="acea-row row-middle">
								<text class="item-name" data-required>用户姓名</text>
								<input type="text" placeholder="请输入姓名" v-model="merchantData.user_name" @input="validateBtn" placeholder-class='placeholder' />
							</view>
						</view>
						<view class="item">
							<view class="acea-row row-middle">
								<text class="item-name" data-required>联系电话</text>
								<input type="number" placeholder="请输入手机号" v-model="merchantData.phone" @input="validateBtn" placeholder-class='placeholder' />
							</view>
						</view>
						<view class="item" v-if="isShowCode">
							<view class="acea-row row-middle">
								<text class="item-name" data-required>验证码</text>
								<input type="text" placeholder="请输入验证码" class="codeIput" v-model="codeVal" @input="validateBtn"
								placeholder-class='placeholder' />
								<view class="imageCode" @click="again"><image :src="codeUrl" /></view>
							</view>
						</view>
						<view class="item">
							<view class="uni-list">
								<view class="uni-list-cell">
									<view class="uni-list-cell-db acea-row row-middle">
										<view class="item-name acea-row row-middle" data-required>
											<text>店铺分类</text>
											<text class="iconfont icon-icon_question" @click="getAgreement('sys_merchant_category','店铺分类说明')"></text>
										</view>
										<picker @change="bindPickerChange" :value="index" :range="array" range-key="category_name">
											<view v-if="mer_classification" class="input-value">{{ mer_classification }}</view>
											<view v-else class="input-placeholder input-value">请选择店铺分类</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</picker>
									</view>
								</view>
							</view>
						</view>
					
						<view class="item">
							<view class="uni-list">
								<view class="uni-list-cell">
									<view class="uni-list-cell-db acea-row row-middle">
										<view class="item-name acea-row row-middle">
											<text class="item-name" data-required>平台分类</text>
										</view>
										<view class="input-value cursor-pointer" @click="openCategoryCascade">
											<view v-if="selectedCategoryNames.length > 0" class="selected-categories">
												<scroll-view scroll-x="true">
													<view v-for="(name, index) in selectedCategoryNames" :key="index" class="category-tag">
														{{ name }}
														<text class="iconfont icon-ic_close2" @click.stop="removeCategory(index)"></text>
													</view>
												</scroll-view>
											</view>
											<view v-else class="input-placeholder">请选择平台分类</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</view>
									</view>
								</view>
							</view>
						</view>
						<cascade ref="categoryCascade" :listData="categoryCascadeData" title="平台分类" :maxCount="categoryNumberCount" @submitOk="handleCategorySubmit" @reset="handleCategoryReset" />
						<view class="item">
							<view class="uni-list">
								<view class="uni-list-cell">
									<view class="uni-list-cell-db acea-row row-middle">
										<view class="item-name acea-row row-middle" data-required>
											<text>店铺类型</text>
											<text class="iconfont icon-icon_question" @click="getAgreement('sys_merchant_type','店铺类型说明')"></text>
										</view>

										<picker @change="bindPickerChange1" :value="index1" :range="storeTypeArr" range-key="type_name">
											<view v-if="mer_storeType" class="input-value">{{ mer_storeType }}</view>
											<view v-else class="input-placeholder input-value">请选择店铺类型</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</picker>
									</view>
								</view>
							</view>
						</view>
						<view class="item">
							<view class="uni-list">
								<view class="uni-list-cell">
									<view class="uni-list-cell-db acea-row row-middle">
										<text class="item-name" data-required>商品类型</text>
										<view class="input-value" @click="showProductTypePopup">
											<view v-if="selectedProductTypeNames.length > 0" class="selected-types">
												<text class="selected-text">{{ selectedProductTypeNames.join(', ') }}</text>
											</view>
											<view v-else class="input-placeholder">请选择商品类型</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</view>
									</view>
								</view>
							</view>
						</view> 
					
					<!-- 商品类型选择弹窗 -->
					<ProductTypePopup 
						:visible="productTypePopupVisible" 
						:productTypeArr="productTypeArr"
						:selectedValues="selectedProductTypes"
						@confirm="handleProductTypeConfirm"
						@close="productTypePopupVisible = false"
					/>
					
					<view class="item">
							<view class="uni-list">
								<view class="uni-list-cell">
									<view class="uni-list-cell-db acea-row row-middle">
										<text class="item-name">所属区域</text>
										<CircleSelectorPopup :circleId.sync="merchantData.circleId" :circleList="circleList" v-if="circleInited">
											<view v-if="merCircleName" class="input-value">{{ merCircleName }}</view>
											<view v-else class="input-placeholder input-value">请选择所属区域</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</CircleSelectorPopup>
									</view>
								</view>
							</view>
						</view>
					<view class="item">
						<view class="uni-list">
							<view class="uni-list-cell">
								<view class="uni-list-cell-db acea-row row-middle">
									<text class="item-name">所属商户</text>
									<MerSelectPopup :merchantId.sync="merchantData.businessId" :merchantName.sync="merchantName">
										<view v-if="merchantName" class="input-value">{{ merchantName }}</view>
										<view v-else class="input-placeholder input-value">请选择所属商户</view>
										<view class='iconfont icon-ic_rightarrow'></view>
									</MerSelectPopup>
								</view>
							</view>
						</view>
					</view>
						<view class="item no-border">
							<view class='acea-row row-middle'>
								<text class="item-title">请上传营业执照及行业相关资质证明图片</text>
								<text class="item-desc">(图片最多可上传10张,图片格式支持JPG、PNG、JPEG)</text>
								<view class="upload">
									<view class='pictrue' v-for="(item,index) in pics" :key="index" :data-index="index" @click="getPhotoClickIdx">
										<image :src='item'></image>
										<text class='iconfont icon-ic_close2' @click.stop='DelPic(index)'></text>
									</view>
									<view class='pictrue acea-row row-center-wrapper row-column' @click='uploadpic' v-if="pics.length < 10">
										<text class='iconfont icon-ic_camera1'></text>
										<view>上传图片</view>
									</view>
								</view>
							</view>
						</view>
						<view class="item no-border acea-row row-middle">
							<checkbox-group @change='ChangeIsAgree'>
								<checkbox class="checkbox" :checked="isAgree ? true : false" />已阅读并同意</checkbox-group>
							<button class="settleAgree" @click="getConfig">《入驻协议》</button>
						</view>
						<button class='submitBtn' :class="validate === true ? 'on':''" @click="formSubmit">提交申请</button>
					</view>
				</view>
			</form>
			<view class="instructions" v-if="showProtocol">
				<view class="agreement-count">
					<view class="setAgCount">
						<view class="title">{{ protocolTitle }}</view>
						<view class="agBox">
							<view class="content">
								<jyf-parser :html="protocol" ref="article" :tag-style="tagStyle"></jyf-parser>
							</view>
						</view>
					</view>
					<text class="icon iconfont icon-ic_close1" @click="showProtocol = false"></text>
				</view>
			</view>
			<view class='loadingicon acea-row row-center-wrapper' v-if="loading">
				<text class='loading iconfont icon-jiazai' :hidden='loading==false'></text>
			</view>
			<Verify @success="success" @closeVerfiy="closeVerfiy" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
			</view>
		<view class="settledSuccessMain" v-else>
			<view class="settledSuccessful">
				<image class="image" :src="`${domain}/static/images/settledSuccessful.svg`" alt=""></image>
				<view class="success-text">
					<view class="title">恭喜，您的资料提交成功！</view>
					<view class="info">预计15个工作日内审核完毕，平台客服会及时与您联系！</view>
				</view>
				<view class="goHome" hover-class="none" @click="goHome">
					返回首页
				</view>
			</view>
		</view>
	</BaseContainer>
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

	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import {
		create,
		verify,
		merClassifly,
		getGoodsDetails,
		updateGoodsRecord,
		getStoreTypeApi,
		getMerchantListForApply
	} from '@/api/store.js';
	import {
		getCaptcha,
		getAgreementApi
	} from "@/api/user";
	import { mapGetters, mapState } from "vuex";
	import { configMap } from "@/utils";
	import parser from "@/components/jyf-parser/jyf-parser";
  import Verify from '../component/verify/verify.vue';
	import { toLogin } from '@/libs/login.js';
	import { HTTP_REQUEST_URL } from '@/config/app';
	import CircleSelectorPopup from '@/components/circle-selector/circle-selector-popup.vue';
	import cascade from "../component/cascade.vue";
	import MerSelectPopup from './components/mer-select-popup.vue';
	import ProductTypePopup from './components/product-type-popup.vue';
	import BaseContainer from "@/components/common/base_container.vue";
	import BaseNavBar from "@/components/common/base_nav_bar.vue";
	import { getSystemInfo } from "@/utils/device";
	import { getCircleTree } from "@/api/circle";
	import { normalizeCircleList, buildCircleMap } from "@/utils/circle";
	import { APPLY_TYPE } from '@/constants/apply';
	import { getCategoryList, storeCategory } from '@/api/store.js';

	const app = getApp();
	export default {
		components: {
			"jyf-parser": parser,
	    Verify,
			CircleSelectorPopup,
			MerSelectPopup,
			ProductTypePopup,
			BaseContainer,
			BaseNavBar,
			cascade
		},
		data() {
			return {
				sysHeight: sysHeight,
				domain: HTTP_REQUEST_URL,
				cartId: '', //购物车id
				pinkId: 0, //拼团id
				couponId: 0, //优惠券id
				text: "获取验证码",
				codeUrl: "",
				disabled: false,
				isAgree: false,
				showProtocol: false,
				isShowCode: false,
				loading: false,
				merchantData: {
					enterprise_name: "",
					user_name: "",
					phone: "",
					classification: '',
					circleId: 0,
					businessId: 0
				},
				validate: false,
				successful: false,
				keyCode: "",
				codeVal: "",
				protocol: this.sys_intention_agree,
				timer: "",
				index: 0,
				index1: 0,
				mer_classification: "",
				array: [{
					category_name: '',
					merchant_category_id: ''
				}],
				storeTypeArr: [{
					type_name: '',
					mer_type_id: ''
				}],
				mer_storeType: '',
				// 商品类型数据
				productTypeArr: [
					{ type_name: '普通商品', product_type: 0 },
					{ type_name: '虚拟商品', product_type: 1 },
					{ type_name: '卡密商品', product_type: 2 },
					{ type_name: '云盘商品', product_type: 3 },
					{ type_name: '预约商品', product_type: 4 },
					{ type_name: '年/次卡商品', product_type: 5 },
				],
				mer_productType: '',
				selectedProductTypes: [], // 存储选中的商品类型
				selectedProductTypeNames: [], // 存储选中的商品类型名称
				productTypePopupVisible: false, // 商品类型弹窗可见性
				starIndex: -1, // 当前选中的星级索引（-1表示未选择）
				pics: [],
				tagStyle: {
					img: 'width:100%;display:block;'
				},
				mer_i_id: null, // 商户申请id
				isType: false,
				protocolTitle: '商户入驻协议', // 弹窗标题：商户入驻协议 | 店铺类型说明 | 店铺分类说明
				pageStyle: 'overflow: visible;', // 小程序页面样式
				isFixed: false,
				merchantName: '',
				circleInited: false,
				circleList: [],
				// 分类数据源，从你的API获取
				platformCategoryList: [],
				// 转换后的级联选择数据（适配 cascade 组件）
				categoryCascadeData: [],
				// 用于存储选中的分类名称，用来展示或提交
				selectedCategoryNames: [],
				// 选中的分类数组（存储三级分类ID）
				selectedCategories: []

			};
		},
		beforeDestroy() {
			clearTimeout(this.timer)
		},
		computed: {
			...configMap({sys_intention_agree:''},mapGetters(['isLogin','viewColor','keyColor'])),
			categoryNumberCount() {
				const count = this.$store.state.app.globalData.category_number_count;
				return count && parseInt(count) > 0 ? parseInt(count) : 0;
			},
			circleMap() {
				return buildCircleMap(this.circleList);
			},
			merCircleName() {
				if (!this.merchantData.circleId) return '';
				const circleInfo = this.circleMap[this.merchantData.circleId];
				if (!circleInfo) return '';
				return circleInfo.name;
			},
			commonCssVars() {
				return {
					'--kv-img-offset-y-size': `-${this.getImageOffsetSize()}px`
				};
			},
		},
		onLoad(options) {
			if (this.isLogin) {
				this.getCircleList();
				const task = [
					this.getClassfication(),
					this.getStoreType(),
					this.getProductCategoryList()
				];
				if (options.mer_i_id) {
					this.mer_i_id = options.mer_i_id
					uni.showLoading({
						title: '获取数据中',
					});
					Promise.all(task)
						.then(() => {
							this.getGoodsDetails(options.mer_i_id)
						});
				}
			} else {
				toLogin()
			}
		},
		
		onShow() {},
		onReady() {},
		methods: {
			// 打开平台分类级联选择弹窗
			openCategoryCascade() {
				this.$refs.categoryCascade.popupOpen(this.selectedCategories);
			},
			// 平台分类选择确认
			handleCategorySubmit(res) {
				if (res && res.value && res.value.length > 0) {
					this.selectedCategories = res.value;
					this.selectedCategoryNames = res.names;
				} else {
					this.selectedCategories = [];
					this.selectedCategoryNames = [];
				}
				this.validateBtn();
			},
			// 平台分类重置
			handleCategoryReset() {
				this.selectedCategories = [];
				this.selectedCategoryNames = [];
				this.validateBtn();
			},
			// 删除选中的分类
			removeCategory(index) {
				this.selectedCategoryNames.splice(index, 1);
				this.selectedCategories.splice(index, 1);
				this.$set(this, 'selectedCategoryNames', this.selectedCategoryNames);
				this.$set(this, 'selectedCategories', this.selectedCategories);
			},
			async getCircleList() {
				try {
					const res = await getCircleTree({
						type: APPLY_TYPE.AGENT,
					});
					this.circleList = normalizeCircleList(res.data, 'circle_id');
				} catch (error) {
					this.$util.Tips({
						title: error,
						icon: 'none',
					});
				} finally {
					this.circleInited = true;
				}
			},
			getImageOffsetSize() {
				const { statusBarHeight } = getSystemInfo();
				const minSize = 44;
				if (statusBarHeight < minSize) {
					// 如果状态栏高度小于最小值，则需要将背景图片向上偏移，偏移量为最小值减去状态栏高度
					return minSize - statusBarHeight;
				}
				return 0;
			},
			goBack: function() {
				uni.navigateBack();
			},
			getConfig() {
				this.isType = false;
				this.protocolTitle = '商户入驻协议';
				this.showProtocol = true;
				// 获取配置
				this.protocol = this.sys_intention_agree
			},
			/* 店铺类型说明 */
			getAgreement(type,name) {
				let that = this;
				that.protocolTitle = name;
				that.showProtocol = true;
				that.isType = true;
				getAgreementApi(type).then(res => {
					that.protocol = res.data[type]
				})
			},
			// 获取历史提交数据详情
			getGoodsDetails(id) {
				getGoodsDetails(id).then(res => {
					let resData = res.data
					Object.assign(this.merchantData, {
						enterprise_name: resData.mer_name,
						user_name: resData.name,
						phone: resData.phone,
						classification: resData.merchant_category_id,
						mer_type: resData.mer_type_id,
						circleId: resData.circle_id,
						businessId: resData.business_id
					});
					this.pics = resData.images
					this.mer_classification = this.getCategoryName(resData.merchant_category_id, this.array)
					this.mer_storeType = this.getStoreTypeName(resData.mer_type_id, this.storeTypeArr)
					const storeTypeIndex = this.storeTypeArr.findIndex(item => item.mer_type_id === resData.mer_type_id);
					if (storeTypeIndex !== -1) {
						this.index1 = storeTypeIndex;
					}
					
					if (resData.platform_category) {
						this.selectedCategories = Array.isArray(resData.platform_category) ? resData.platform_category : (typeof resData.platform_category === 'string' ? resData.platform_category.split(',').filter(item => item) : []);
						this.selectedCategoryNames = this.getCategoryNamesByIds(this.selectedCategories);
					}
					
					if (resData.mer_product_type) {
						this.selectedProductTypes = Array.isArray(resData.mer_product_type) ? resData.mer_product_type : (typeof resData.mer_product_type === 'string' ? resData.mer_product_type.split(',').filter(item => item) : []);
						this.selectedProductTypeNames = this.productTypeArr
							.filter(item => this.selectedProductTypes.includes(item.product_type.toString()))
							.map(item => item.type_name);
					}
				
					uni.hideLoading();
					this.updateMerchantIndex();
				})
			},
			
			async updateMerchantIndex() {
				if (this.merchantData.businessId) {
					try {
						const res = await getMerchantListForApply();
						const merchantList = res.data || [];
						const merchant = merchantList.find(item => item.circle_id === this.merchantData.businessId);
						if (merchant) {
							this.merchantName = merchant.name;
						}
					} catch (error) {
						console.error('获取商户信息失败:', error);
					}
				}
			},
			//获取商户分类名称
			getCategoryName(id, arr) {
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].merchant_category_id === id) {
						return arr[i]['category_name']
					}
				}
			},
			//获取店铺类型名称
			getStoreTypeName(id, arr) {
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].mer_type_id === id) {
						return arr[i]['type_name']
					}
				}
			},
			//根据三级分类ID获取分类名称
			getCategoryNamesByIds(ids) {
				let names = [];
				const findName = (data) => {
					for (let i = 0; i < data.length; i++) {
						const item = data[i];
						if (item.children && item.children.length > 0) {
							findName(item.children);
						} else if (ids.includes(item.value)) {
							names.push(item.name);
						}
					}
				};
				findName(this.categoryCascadeData);
				return names;
			},
			bindPickerChange: function(e) {
				this.index = e.target.value
				let idx = e.target.value
				this.merchantData.classification = this.array[idx]['merchant_category_id']
				this.mer_classification = this.array[idx]['category_name']
				this.validateBtn()
			},
			bindPickerChange1: function(e) {
				this.index1 = e.target.value
				let idx = e.target.value
				this.merchantData.mer_type = this.storeTypeArr[idx]['mer_type_id']
				this.mer_storeType = this.storeTypeArr[idx]['type_name']
				this.validateBtn()
			},
			// 商品类型选择
			handleProductTypeChange: function(e) {
				const selectedValues = e.detail.value;
				this.selectedProductTypes = selectedValues;
				// 更新选中的商品类型名称
				this.selectedProductTypeNames = this.productTypeArr
					.filter(item => selectedValues.includes(item.product_type.toString()))
					.map(item => item.type_name);
				// 更新商户数据
				this.merchantData.product_type = selectedValues.join(',');
				this.validateBtn();
			},
				// 删除选中的商品类型
			removeProductType: function(index) {
				const typeToRemove = this.selectedProductTypes[index];
				this.selectedProductTypes.splice(index, 1);
				this.selectedProductTypeNames.splice(index, 1);
				// 更新商户数据
				this.merchantData.product_type = this.selectedProductTypes.join(',');
				this.validateBtn();
			},
			// 显示商品类型选择弹窗
			showProductTypePopup: function() {
				this.productTypePopupVisible = true;
			},
			// 处理商品类型确认选择
			handleProductTypeConfirm: function(selectedValues) {
				this.selectedProductTypes = selectedValues;
				// 更新选中的商品类型名称
				this.selectedProductTypeNames = this.productTypeArr
					.filter(item => selectedValues.includes(item.product_type.toString()))
					.map(item => item.type_name);
				// 更新商户数据
				this.merchantData.product_type = selectedValues.join(',');
				this.validateBtn();
			},
			// 获取商户分类
			getClassfication: function() {
				return merClassifly()
					.then(res => {
						this.array = res.data
					})
					.catch(res => {
						this.$util.Tips({
							title: res
						});
					});
			},
			// 获取店铺类型
			getStoreType: function() {
				return getStoreTypeApi()
					.then(res => {
						this.storeTypeArr = res.data
					})
					.catch(res => {
						this.$util.Tips({
							title: res
						});
					});
			},
			// 获取商品分类列表
		getProductCategoryList: function() {
			return getCategoryList()
				.then(res => {	
					this.platformCategoryList = res.data.list;
					this.categoryCascadeData = this.transformCategoryData(res.data.list);
				})
				.catch(res => {
					this.$util.Tips({
						title: res
					});
				});
		},
		// 转换分类数据为 cascade 组件需要的格式
		transformCategoryData(data) {
			return data.map(item => ({
				name: item.cate_name,
				value: item.store_category_id,
				checkbox: false,
				children: item.children && item.children.length > 0 ? this.transformCategoryData(item.children) : []
			}));
		},
		// 图片预览
		// 获得相册 idx
		getPhotoClickIdx(e) {
			let _this = this;
			let idx = e.currentTarget.dataset.index;
			_this.imgPreview(_this.pics, idx);
		},
		// 图片预览
		imgPreview: function(list, idx) {
			// list：图片 url 数组
			if (list && list.length > 0) {
				uni.previewImage({
					current: list[idx], //  传 Number H5端出现不兼容
					urls: list
				});
			}
		},
		toggleTab(str) {
			this.$refs[str].show();
		},
		// 首页
		goHome() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		},
		again() {
			this.getcaptcha()
		},
		/**
		 * 上传文件
		 *
		 */
		uploadpic: function() {
			let that = this;
			that.$util.uploadImageOne('upload/certificate', function(res) {
				that.pics.push(res.data.path);
				that.$set(that, 'pics', that.pics);
			});
		},
			/**
			 * 删除图片
			 *
			 */
			DelPic: function(index) {
				let that = this,
					pic = this.pics[index];
				that.pics.splice(index, 1);
				that.$set(that, 'pics', that.pics);
			},
			getCode() {
				let that = this
				getCodeApi()
					.then(res => {
						that.keyCode = res.data.key;
					})
					.catch(res => {
						that.$util.Tips({
							title: res
						});
					});
			},
			async code(data) {
				let that = this;
				if (!that.merchantData.phone) return that.$util.Tips({
					title: '请填写手机号码'
				});
				if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.merchantData.phone)) return that.$util.Tips({
					title: '请输入正确的手机号码'
				});
				await verify({
						phone: that.merchantData.phone,
						// key: that.codeKey,
						// code: that.codeVal,
						type: 'intention',
					  captchaVerification: data.captchaVerification
					})
					.then(res => {
						that.$util.Tips({
							title: res.message
						});
						that.sendCode();
					})
					.catch(res => {
						that.$util.Tips({
							title: res
						});
						if (res.status == 402) {
							// that.getcaptcha();
						}
					});
			},
			getcaptcha() {
				let that = this
				getCaptcha().then(data => {
					that.codeUrl = data.data.captcha; //图片路径
					that.codeVal = data.data.code; //图片验证码
					that.codeKey = data.data.key //图片验证码key
				})
				that.isShowCode = true;
			},
			sendCode() {
				if (this.disabled) return;
				this.disabled = true;
				let n = 60;
				this.text = "剩余 " + n + "s";
				const run = setInterval(() => {
					n = n - 1;
					if (n < 0) {
						clearInterval(run);
					}
					this.text = "剩余 " + n + "s";
					if (this.text < "剩余 " + 0 + "s") {
						this.disabled = false;
						this.text = "重新获取";
					}
				}, 1000);
			},
			onConfirm(val) {
				this.region = val.checkArr[0] + '-' + val.checkArr[1] + '-' + val.checkArr[2];
			},
			ChangeIsAgree: function(e) {
				this.isAgree = !this.isAgree;
				this.validateBtn();
			},
			formSubmit: function(e) {
				let that = this;
				if (that.validateForm() && that.validate) {
		
					let requestData = {
						phone: that.merchantData.phone,
						mer_name: that.merchantData.enterprise_name,
						name: that.merchantData.user_name,
						merchant_category_id: that.merchantData.classification,
						platform_category: that.selectedCategories.length > 0 ? that.selectedCategories : [],
						mer_type_id: that.merchantData.mer_type,
						mer_product_type: that.selectedProductTypes.length > 0 ? that.selectedProductTypes : [],
						circle_id: that.merchantData.circleId,
						images: that.pics,
						business_id: that.merchantData.businessId,
					}
					that.validate = false;
					if (that.mer_i_id) {
						updateGoodsRecord(that.mer_i_id, requestData).then(res => {
							if (res.status == 200) {
								that.$util.Tips({
									title: '提交成功',
								});
								that.loading = true;
								that.timer = setTimeout(() => {
									that.successful = true;
									that.validate = true;
								}, 1000)
							}
						}).catch(res => {
							that.validate = true;
							that.$util.Tips({
								title: res
							});
						})
					} else {
						create(requestData).then(data => {
						if (data.status == 200) {
							that.$util.Tips({
								title: '提交成功',
							});
							that.loading = true;
								this.timer = setTimeout(() => {
									that.successful = true;
										that.validate = true;
								}, 1000)
							}

						}).catch(res => {
							that.validate = true;
							that.$util.Tips({
								title: res
							});
						})
					}
				}
			},
			validateBtn: function() {
				let that = this,
					value = that.merchantData;
			
				if (value.enterprise_name && value.user_name && value.phone && /^1(3|4|5|7|8|9|6)\d{9}$/i.test(value.phone) && that.isAgree && value.classification) {
					if (!that.isShowCode) {
						that.validate = true;
					} else {
						if (that.codeVal) {
							that.validate = true;
						} else {
							that.validate = false;
						}
					}
				}else{
					that.validate = false;
				}
			},
			validateForm: function() {
				let that = this,
					value = that.merchantData;
				if (!value.enterprise_name) return that.$util.Tips({
					title: '请输入企业名称'
				});
				if (!value.user_name) return that.$util.Tips({
					title: '请输入姓名'
				});
				if (!value.phone) return that.$util.Tips({
					title: '请输入手机号'
				});
				if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(value.phone)) return that.$util.Tips({
					title: '请输入正确的手机号码'
				});
				if (!value.classification) return that.$util.Tips({
					title: '请选择店铺分类'
				});
				if (!that.isAgree) return that.$util.Tips({
					title: '请勾选并同意入驻协议'
				});
				if (that.isShowCode && !that.codeVal) return that.$util.Tips({
					title: '请填写图片验证码'
				});
				that.validate = true;
				return true;
			},
			jumpToList() {
				uni.navigateTo({
					url: "/pages/store/applicationRecord/index"
				})
			},
      success(data) {
				this.$refs.verify.hide();
				this.code(data);
				this.pageStyle = 'overflow: visible;'; // 小程序
			},
			closeVerfiy() {
				this.pageStyle = 'overflow: visible;'; // 小程序
			},
			handleVerify() {
				if (!this.merchantData.phone) return this.$util.Tips({
					title: '请输入手机号'
				});
				if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(this.merchantData.phone)) return this.$util.Tips({
					title: '请输入正确的手机号码'
				});
				if (!this.isAgree) return this.$util.Tips({
					title: '请勾选并同意入驻协议'
				});
				this.$refs.verify.show();
				this.pageStyle = 'overflow: hidden;'; // 小程序
			}
		},
		// 滚动监听
		onPageScroll(e) {
			this.isFixed = e.scrollTop > 160;
		},
	}
</script>

<style scoped lang="scss">
	/deep/checkbox .uni-checkbox-input.uni-checkbox-input-checked,
	/deep/checkbox .wx-checkbox-input.wx-checkbox-input-checked {
	  border: 1px solid #E93323!important;
	  background-color: #E93323!important;
	  color: #fff!important;
		
	}
	/deep/.checkbox .uni-checkbox-input.uni-checkbox-input-checked,
	/deep/.checkbox .wx-checkbox-input.wx-checkbox-input-checked {
		border-radius: 100%;
	}
	.sys-head .bg{
		background: #E93323;
	}
	.item-name{
		width: 190rpx;
	}
	.uni-list-cell {
				position: relative;
				.icon-ic_rightarrow {
					font-size: 14px;
					color: #7a7a7a;
					position: absolute;
					right: 0;
					top: 7rpx;
				}
				.icon-guanbi2{
					right: 35px;
				}
			}
			
			
			
			
	.merchantBgCount{
		line-height: 0;
	}
	.merchantsSettled {
		background: linear-gradient( 180deg, #FE7015 0%, #EB3B26 100%);
		min-height: 100vh;
		padding-bottom: 70rpx;
	}
	.merchantsSettled .merchantBg {
		width: 750rpx;
		width: 100%;
	}
	.merchantsSettled .list {
		background-color: #fff;
		border-radius: 12px;
		padding: 10rpx 0 22px;
		margin: 0 15px;
	}
	.application-record {
		position: fixed;
		display: flex;
		align-items: center;
		top: 280rpx;
		right: 0;
		color: #fff;
		font-size: 24rpx;
		background-color: rgba(0, 0, 0, 0.15);
		padding: 8rpx 18rpx;
		border-radius: 20px 0px 0px 20px;
		margin-top: var(--kv-img-offset-y-size);
	}
	.merchantsSettled .list .item {
		padding: 50rpx 0 20rpx;
		position: relative;
		margin: 0 20px;
		&.no-border {
			border-bottom: none;
			padding-left: 0;
			padding-right: 0;
		}
		.item-title {
			color: #666666;
			font-size: 28rpx;
			display: block;
		}
		.item-desc {
			color: #B2B2B2;
			font-size: 22rpx;
			display: block;
			margin-top: 9rpx;
			line-height: 36rpx;
		}
	}
	.acea-row,.upload {
		display: -webkit-box;
		display: -moz-box;
		display: -webkit-flex;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-lines: multiple;
		-moz-box-lines: multiple;
		-o-box-lines: multiple;
		-webkit-flex-wrap: wrap;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
	}
	.upload {
		margin-top: 20rpx;
	}
	.merchantsSettled .list .item .pictrue {
		width: 130rpx;
		height: 130rpx;
		margin: 24rpx 22rpx 0 0;
		position: relative;
		font-size: 22rpx;
		color: #bbb;
		border-radius: 16rpx;
		&:nth-child(4n) {
			margin-right: 0;
		}
		&:nth-last-child(1) {
			border: 1rpx dashed #ccc;
			box-sizing: border-box;
			background: #f5f5f5;
		}
		uni-image,
		image {
			width: 100%;
			height: 100%;
			border-radius: 16rpx;
			img {
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-moz-user-select: none;
				display: block;
				position: absolute;
				top: 0;
				left: 0;
				opacity: 0;
				width: 100%;
				height: 100%;
			}
		}
		.icon-ic_camera1{
			font-size: 50rpx;
			margin-bottom: 10rpx;
		}
		.icon-ic_close2 {
			font-size: 36rpx;
			position: absolute;
			top: -10px;
			right: -10px;
		}
	}
	.uni-list-cell-db{
		position: relative;
	}
	.icon-icon_question{
		font-size: 28rpx;
		color: #D8D8D8;
		margin-left: 8rpx;
		position: relative;
		top: 2rpx;
	}
	.merchantsSettled .list .item .imageCode {
		position: absolute;
		top: 7px;
		right: 0;
	}
	.merchantsSettled .list .item .icon {
		font-size: 40rpx;
		color: #b4b1b4;
	}
	.merchantsSettled .list .item {
		input {
			width: 400rpx;
			font-size: 30rpx;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		
		.input-value {
			width: 400rpx;
			font-size: 30rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			min-height: 40rpx;
			flex-wrap: wrap;
			/*#ifndef MP*/
			position: relative;
			/*#endif*/
		}
		
		.selected-types {
			margin-right: 10rpx;
			.selected-text {
				display: block;
				width: 360rpx;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
		}
		
		.input-value .icon-ic_rightarrow {
			margin-left: 10rpx;
			flex-shrink: 0;
		}
	}
	.merchantsSettled .list .item .placeholder {
		color: #b2b2b2;
	}
	.merchantsSettled .default {
		padding: 0 30rpx;
		height: 90rpx;
		background-color: #fff;
		margin-top: 23rpx;
	}
	.merchantsSettled .default checkbox {
		margin-right: 15rpx;
	}
	.merchantsSettled .acea-row uni-image {
		width: 20px;
		height: 20px;
		display: block;
	}
	.merchantsSettled .list .item .codeIput {
		width: 125px;
	}
	.uni-input-input {
		display: block;
		height: 100%;
		background: none;
		color: inherit;
		opacity: 1;
		-webkit-text-fill-color: currentcolor;
		font: inherit;
		line-height: inherit;
		letter-spacing: inherit;
		text-align: inherit;
		text-indent: inherit;
		text-transform: inherit;
		text-shadow: inherit;
	}
	.merchantsSettled .list .item .code {
		position: absolute;
		width: 89px;
		line-height: 26px;
		border: 1px solid #E93323;
		border-radius: 200rpx;
		color: #E93323;
		text-align: center;
		bottom: 8px;
		right: 0;
		font-size: 23rpx;
	}
	.merchantsSettled .list .item .code.on {
		background-color: #bbb;
		color: #fff;
		border-color: #bbb;
	}
	.merchantsSettled .submitBtn {
		width: 588rpx;
		margin: 0 auto;
		height: 86rpx;
		border-radius: 50rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 28rpx;
		color: #fff;
		background: #bbbbbb;
		margin-top: 50rpx;
		pointer-events: none;
	}
	.merchantsSettled .submitBtn.on {
		background: #E93323;
		pointer-events: all;
	}
	uni-checkbox-group,
	.settleAgree {
		display: inline-block;
		font-size: 24rpx;
	}
	uni-checkbox-group {
		color: #999;
		font-size: 24rpx;
	}
	/deep/ .checkbox .uni-checkbox-input,
	/deep/ .checkbox .wx-checkbox-input{
	  border-radius: 100%;
		width: 32rpx;
		height: 32rpx;
	}
	.settleAgree {
		color: #E93323;
		margin-left: 6rpx;
	}
	.merchantsSettled uni-checkbox .uni-checkbox-wrapper {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #C3C3C3;
		border-radius: 15px;
	}
	.settledSuccessMain {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #fff;
	}
	.settledSuccessful {
		flex: 1;
		width: 100%;
		padding: 0 64rpx;
		height: auto;
		background: #fff;
		text-align: center;
	}
	.settledSuccessful .success-text{
		padding: 32rpx 26rpx;
		margin-top: 70px;
	}
	.settledSuccessful .image {
		width: 380rpx;
		height: 314rpx;
		margin-top: 132rpx;
	}
	.settledSuccessful .title {
		color: #333333;
		font-size: 32rpx;
		font-weight: bold;

	}
	.settledSuccessful .info {
		color: #A0A0A0;
		font-size: 26rpx;
		margin-top: 24rpx;
	}
	.settledSuccessful .goHome {
		margin: 120rpx auto 0;
		line-height: 86rpx;
		color: #282828;
		font-size: 28rpx;
		border: 1px solid #B4B4B4;
		border-radius: 200px;
	}
	/deep/ uni-checkbox .uni-checkbox-input {
		width: 30rpx;
		height: 30rpx;
		position: relative;
	}
	/deep/ uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked:before {
		font-size: 28rpx;
	}
	.loadingicon {
		height: 100vh;
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;
	}
	.icon-ic_rightarrow {
		font-size: 22rpx;
	}
	checkbox-group {
		display: inline-block;
		color: #999;
		font-size: 24rpx;
	}
	.setAgCount{
		/deep/ table{
			border:  1px solid #DDD;
			border-bottom: none;
			border-right: none;
		}
		/deep/ td, th {
			padding: 5rpx 10rpx;
			border-bottom: 1px solid #DDD;
			border-right:  1px solid #DDD;
		}
	}

	.input-placeholder {
		color: grey;
	}

	[data-required]::after {
		content: '*';
		color: #E93323;
		margin-left: 4rpx;
		font-weight: bold;
	}

	.navbar-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1;
	}

	.bg-image {
		--kv-img-height: 358rpx;
		width: 100%;
		height: var(--kv-img-height);
		display: block;
		margin-top: var(--kv-img-offset-y-size);
	}
	/* 选中分类名称显示样式 */
	.selected-categories {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
		margin-right: 10rpx;
		margin-bottom: 10rpx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		position: absolute;
		width: 400rpx;
		right: 30rpx;
		top: 0;
		
	}
	
	.category-tag {
		display: inline-flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		padding: 8rpx 16rpx;
		margin-right: 10rpx;
		font-size: 24rpx;
		color: #333;
		flex-shrink: 1;
		
		.icon-ic_close2 {
			margin-left: 8rpx;
			font-size: 20rpx;
			color: #999;
		
		}
	}
	
	</style>
