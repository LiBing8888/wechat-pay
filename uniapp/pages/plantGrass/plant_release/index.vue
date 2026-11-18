<template>
	<view :style="viewColor">
		<form @submit="formSubmit" report-submit='true'>
			<view class="release_content">
				<view>
					<view class="release_item">
						<view class="photo_count">
							<view class="input_photo acea-row row-middle">
								<block v-if="tabLength == 2 || tabLength == 3">
									<view class="pictrue" v-if="formData.video_link">
										<image class="video-bg" mode="widthFix" :src="`${domain}/static/images/video_bg.png`"></image>
										<view class="videoHover" @click="videoshow">
											<view>
												<text class="iconfont icon-ic_right2"></text>
											</view>
										</view>
										<text class="video-text">点击可预览视频</text>
										<view class="close_btn" @click="deleteLink"><text class="iconfont icon-ic_close"></text></view>
									</view>
									<view v-else-if="!formData.video_link&&formData.image.length<=1" class="pictrue acea-row row-center-wrapper row-column add" @click="uploadVideo">
										<view><text class='iconfont icon-icon_video'></text></view>
										<view class="text">添加视频</view>
									</view>
									<block v-if="(tabLength == 3 && formData.video_link) || tabLength==2">
										<view v-if="formData.image.length < 1" class="pictrue acea-row row-center-wrapper row-column add" @click.stop="clk(1)">
											<view><text class='iconfont icon-fengmian'></text></view>
											<view class="text">添加图片</view>
										</view>
									</block>
								</block>
								<view class="pictrue" v-for="(item, index) in formData.image" :key="index">
									<image :src="item"></image>
									<text class="cover_text" v-if="index == 0">封面</text>
									<view class="close_btn" @click="DelPic(index)"><text class="iconfont icon-ic_close"></text></view>
								</view>
								<!--图文或者图文加视频-->
								<block v-if="(tabLength == 1 && !formData.video_link) || (tabLength == 3 && !formData.video_link)">
									<view v-if="formData.image.length < 9" class="pictrue acea-row row-center-wrapper row-column add" @click.stop="clk(9)">
										<view><text class='iconfont icon-ic_camera1'></text></view>
										<view class="text">添加图片</view>
									</view>
								</block>
							</view>
						</view>
						<view class="textarea">
							<textarea maxlength="-1" placeholder='分享使用体验和心得，获得更多点赞和关注哦~' name="comment" placeholder-class='placeholder' v-model="formData.content"></textarea>
						</view>
					</view>
					<view class="release_item">
						<view class='item acea-row row-between-wrapper'>
							<view class='name'><text class="iconfont icon-icon_Link"></text>添加宝贝({{productList.length}})</view>
							<view class="select">
								<view class="select_count" @click.stop="addProduct">
									<text v-if="productList.length == 0" class="text">选择商品</text>
									<view v-else class="text">
										<image class="image" v-for="(item,index) in productList" :key="index" :src="item.image || (item.spu && item.spu.image)"></image>
									</view>
									<text class="iconfont icon-ic_rightarrow"></text>
								</view>
							</view>
						</view>
						<view class='item acea-row row-between-wrapper'>
							<view class='name'><text class="iconfont icon-icon_talk_2-2"></text>参与话题</view>
							<view class="select">
								<view class="select_count" @click="addTopic">
									<text v-if="!topicName.topic_name"class="text">选择话题</text>
									<view v-else class="text_name" @click.stop="deleteTopic">
										<text class="iconfont icon-ic_talk_2"></text>
										<text class="title">{{topicName.topic_name}}</text>
										<text class="iconfont icon-ic_close"></text>
									</view>
									<text class="iconfont icon-ic_rightarrow"></text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<button class="release_btn button" form-type="submit">发布</button>
			</view>
		</form>
		<!--视频预览弹窗-->
		<view v-if="showVideo" class="video-count">
			<!--#ifndef APP-PLUS-->
			<video id="myVideo" class="videoLink" autoplay loop :src="formData.video_link"></video>
			<!--#endif-->
			<!--#ifdef APP-PLUS-->
				<view v-html="videoHtml"></view>
			<!--#endif-->
		</view>
		<view class='mask' catchtouchmove="true" :hidden='showVideo==false' @click.stop="showVideo=false"></view>
		<avatar @upload="doUpload" @getName="getImgName" quality="1" ref="avatar" selWidth="250upx" selHeight="250upx"></avatar>
		<!-- 提到的宝贝弹窗 -->
		<uni-popup ref="associated" type="bottom">
			<associated @close="close" @getProduct="getProduct" :checkedObj="productList"></associated>
		</uni-popup>
		<!-- 话题弹窗 -->
		<uni-popup ref="participateTopic" type="bottom">
			<participate-topic @close="close" @getTopic="getTopic"></participate-topic>
		</uni-popup>
		<!-- 绑定手机号 -->
		<bindmobile ref="bindmobile" :isCommuity="true"></bindmobile>
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
	import { mapGetters } from "vuex";
	import avatar from "../components/yq-avatar/yq-avatar.vue";
	import associated from '../components/associated.vue';
	import participateTopic from '../components/participateTopic.vue';
	import bindmobile from '../components/bindmobile.vue';
	import {TOKENNAME, HTTP_REQUEST_URL} from '@/config/app.js';
	import { toLogin } from '@/libs/login.js';
	import {createPlantApi, updatePlantApi, plantDetailApi, orderAssociatePlantApi} from "@/api/community";
	import { getUserInfo,imgToBase } from '@/api/user.js';
	import { setStorage, getStorage } from '../../../libs/uniApi.js';
	import { configMap } from '@/utils';
	import store from '@/store';
	export default {
		components: {
			avatar,
			associated,
			participateTopic,
			bindmobile,
		},
		data() {
			return {
				formData: {
					image: [],
					content: "",
					topic_id: "",
					spu_id: [],
					video_link: ''
				},
				imageSrc: '',
				productList: [],
				topicName: {},
				isUpload: true,
				showCd: false,
				id: "",
				order_id: "",
				imgName: "",
				upload_max: 50,
				domain: HTTP_REQUEST_URL,
				uploadUrl: `${HTTP_REQUEST_URL}/api/upload/video`,
				tabList: [
					{name: '图文', value: 1, icon: 'icon-tuwen'},
					{name: '视频', value: 2, icon: 'icon-shipin'},
				],
				tabActive: 1,
				tabLength: 3,
				isPlay: false,
				videoContext: "",
				video_link: "",
				showVideo: false,
				videoplay: false,
				videoContext: '',
				getContent: true,

			};
		},
		computed: {
			...mapGetters(['isLogin', 'viewColor', 'uid']),
			...configMap({community_app_switch: [],community_auth:0}),
			videoHtml: function() {
					return `<video autoplay loop muted controls="controls" width="100%" height="500rpx"><source src="${this.formData.video_link}" type="video/mp4"></video>`;
				}
		},
		watch:{},
		mounted() {
			// #ifndef APP-PLUS
			this.videoContext = uni.createVideoContext('myVideo', this);
			// #endif
		},
		onLoad(options) {
			this.id = options.id;
			this.order_id = options.order_id;
			const [firstSwitch] = this.community_app_switch;
			const switchLen = this.community_app_switch.length;
			this.tabLength = (switchLen === 0 || (switchLen === 1 && firstSwitch == 1)) ? 1 : (switchLen === 1 && firstSwitch == 2) ? 2 : 3;  //1图文2视频3图文加视频

			if (!this.isLogin) {
			  toLogin();
			  return;
			}	
			// 有 id 时获取详情后直接返回（有 order_id 时额外处理）
			if (this.id) {
			  this.getDetail();
			  if (this.order_id) this.getOrderGoods();
			  return;
			}	
			// 无 id 时：从缓存恢复表单数据
			const cachedVideo = getStorage('video_link');
			const cachedImages = getStorage('imageArr') || [];
			const cachedContent = getStorage('plantContent') || '';		
			// 视频链接恢复
			if (this.tabLength === 2 || this.tabLength === 3) {
			  this.formData.video_link = cachedVideo || '';
			}	
			// 图片恢复（区分 tabLength === 2 时只取第一张）
			if (this.tabLength === 2) {
			  this.formData.image = cachedImages.length > 0 ? [cachedImages[0]] : [];
			} else {
			  this.formData.image = cachedImages;
			}		
			this.formData.content = cachedContent;
			if (this.order_id) {
			  this.getOrderGoods();
			}
			this.videoContext = uni.createVideoContext("myvideo", this);
		},
		methods: {
			/*获取图文详情*/
			getDetail(){
				let that = this
				plantDetailApi(that.id).then(res => {
					that.formData = res.data
					that.productList = res.data.relevance || []
					that.topicName = res.data.topic || {}
				}).catch(err => {
					return that.$util.Tips({
						title: err
					});
				})
			},
			/*获取关联订单商品*/
			getOrderGoods(){
				let that = this
				orderAssociatePlantApi(that.order_id).then(res => {
					that.productList = res.data || []
					that.formData.spu_id = res.data.map(val => val.spu_id)
				}).catch(err => {
					return that.$util.Tips({
						title: err
					});
				})
			},
			/*删除话题*/
			deleteTopic(){
				this.formData.topic = {}
				this.topicName = {}
			},
			deleteLink(){
				this.formData.video_link = ""
				this.showVideo = false;
				setStorage('video_link', "");
			},
			clk(count) {
				const uploadConfig = { url: 'upload/image', count };
				this.$util.uploadImageOne(uploadConfig, (res) => {
					const isSingleImage = count === 1;
					if (isSingleImage) {
						this.formData.image = [res.data.path];
					} else {
						const newImages = res.map(item => item);
						this.formData.image = [...this.formData.image, ...newImages].slice(0, 9);
					}
					setStorage('imageArr', this.formData.image);
				});
			},
			doUpload(rsp) {
				const uploadConfig = {
				url: `${HTTP_REQUEST_URL}/api/upload/image/field`,
				filePath,
				name: 'field',
				formData: { filename: filePath, name: this.imgName },
				header: {
					// #ifdef MP
					"Content-Type": "multipart/form-data",
					// #endif
					[TOKENNAME]: `Bearer ${store.state.app.token}`
				},
				success: (uploadFileRes) => {
					const { data: { path } } = JSON.parse(uploadFileRes.data);
					if (path) {
						this.formData.image.push(path);
						uni.hideLoading();
					}
				}
			};
			
			uni.uploadFile(uploadConfig);
			},
			// 上传视频
			uploadVideo() {
			  uni.chooseVideo({
			    sourceType: ['camera', 'album'],
			    success: async (res) => {
			      const fileSizeMB = Math.ceil(res.size / 1024 / 1024);			      
			      // 文件大小校验
			      if (fileSizeMB > this.upload_max) {
			        uni.showModal({
			          title: '提示',
			          content: `视频超出限制${this.upload_max}MB`
			        });
			        return;
			      }      
			      // 显示加载提示
			      uni.showLoading({ title: '视频上传中', mask: true });    
			      // 执行上传
			      this.performVideoUpload(res.tempFilePath);
			    },
			    fail: (err) => {
			      this.$util.Tips({ title: err.errMsg || '选择视频失败' });
			    }
			  });
			},
			// 执行视频上传
			performVideoUpload(filePath) {
			  const uploadTask = uni.uploadFile({
			    url: this.uploadUrl,
			    filePath,
			    name: 'file',
			    formData: { user: 'test' },
			    header: {
			      // #ifdef MP
			      'Content-Type': 'multipart/form-data',
			      // #endif
			      [TOKENNAME]: `Bearer ${store.state.app.token}`
			    },
			    success: (uploadFileRes) => {
			      try {
			        const { data: { src } } = JSON.parse(uploadFileRes.data);
			        if (src) {
			          this.formData.video_link = src;
			          setStorage('video_link', src);
								// 获取视频第一帧为封面图，只兼容h5
								// #ifdef H5
								// this.getVideoCover(src);
								// #endif
			        }							
			      } catch (error) {
			        console.error('解析上传响应失败:', error);
			        this.$util.Tips({ title: '上传失败，请重试' });
			      }
			    },
			    fail: (err) => {
			      console.error('上传失败:', err);
			      this.$util.Tips({ title: err.errMsg || '上传失败，请重试' });
			    },
			    complete: () => {
			      uni.hideLoading();
			    }
			  });
			},
			// #ifdef H5
			// 获取视频封面（H5端）
			async getVideoCover(videoUrl) {
				return new Promise((resolve, reject) => {
					let video = document.createElement("video");
					video.crossOrigin = 'anonymous'; //处理跨域
					video.src = videoUrl;
					video.width = 400;
					video.height = 240;
					video.preload = 'auto';
					
					// 使用canplay事件替代loadeddata，兼容性更好
					video.addEventListener('canplay', function onCanPlay() {
						video.removeEventListener('canplay', onCanPlay);
						uni.showLoading({
							title: '加载中...',
						});
						let canvas = document.createElement("canvas");
						let width = video.videoWidth || video.width;
						let height = video.videoHeight || video.height;
						canvas.width = width;
						canvas.height = height;
						canvas.getContext("2d").drawImage(video, 0, 0, width, height);
						let dataURL = canvas.toDataURL('image/png');
						uni.hideLoading();
						resolve(dataURL);
					});
					
					// 监听错误
					video.addEventListener('error', function onError(e) {
						video.removeEventListener('error', onError);
						console.error('视频加载失败:', e);
						reject(e);
					});
					
					// 设置超时
					setTimeout(() => {
						reject(new Error('视频加载超时'));
					}, 10000);
					
					// 触发加载
					video.load();
				}).then(async (dataURL) => {
					// let { data } = await uploadBase64Api({base64Url: dataURL});
					// let coverURL = data.url;
					// 这里可以继续处理封面图
				}).catch((error) => {
					console.error('获取视频封面失败:', error);
				});
			},
			// #endif
			
			getImgName(name){
				this.imgName = name
			},
			/**删除图片*/
			DelPic: function(index) {
				let that = this
				that.formData.image.splice(index, 1);
				setStorage('imageArr', that.formData.image);
			},
			/*添加宝贝*/
			addProduct(){
				this.$refs.associated.open();
			},
			/*添加话题*/
			addTopic(){
				this.$refs.participateTopic.open();
			},
			close(){
				this.$refs.associated.close();
				this.$refs.participateTopic.close();
			},
			/*查看视频*/
			videoshow() {
				this.showVideo = true
				this.videoContext = uni.createVideoContext('myVideo', this);
				this.$nextTick(()=>{
					this.videoContext.play();
				})
			},
			screenChange(e) {
				let fullScreen = e.detail.fullScreen; //值true为进入全屏，false为退出全屏
				if (!fullScreen) {
					this.videoplay = false
				}
			},
			/*获取选中的宝贝*/
			getProduct(data){
				this.productList = data;
				this.formData.spu_id = data.map(val => val.spu_id)
				this.$refs.associated.close();
			},
			/*获取选中的话题*/
			getTopic(item){
				// 更新话题信息
				this.topicName = item.topic_id ? item : {};
				this.formData.topic_id = item.topic_id;
				this.$refs.participateTopic?.close();
			},
			/**
			 * 提交数据
			 */
			formSubmit: function(e) {
			 const needAuth = this.community_auth !== 0;
				if (!needAuth) {
					this.submitData();
					return;
				} 
				getUserInfo()
					.then(res => {
						const hasPhone = !!res.data?.phone;
						hasPhone ? this.submitData() : this.$refs.bindmobile?.open();
					})
			},
			submitData() {
			  if (!this.isLogin) {
			    toLogin();
			    return;
			  }
			  const value = this.formData;
			  const validationError = this.validateForm(value);
			  if (validationError) {
			    return this.$util.Tips({ title: validationError });
			  }
			  this.tabActive = value.video_link ? 2 : 1;
			  if (this.id && value.relevance?.length) {
			    value.spu_id = value.relevance.map(val => 
			      val.spu?.spu_id ?? val.spu_id
			    );
			  }
			  value.order_id = this.order_id;
			  value.is_type = this.tabActive;
				uni.showLoading({ title: '保存中', mask: true });
			  const savePromise = this.id 
			    ? updatePlantApi(this.id, value)
			    : createPlantApi(value);	
			  savePromise
			    .then(res => this.handleSaveSuccess(res))
			    .catch(err => this.handleSaveError(err));
			},		
			// 表单校验
			validateForm(value) {
			  if (!value.image?.length) return '请添加图片';
			  if (!value.content) return '请分享使用心得和体会';
			  if (this.tabLength === 2 && !value.video_link) return '请添加话题视频';
			  return null;
			},		
			// 保存成功处理
			handleSaveSuccess(res) {
			  uni.hideLoading();
			  this.$util.Tips({
			    title: res.message || res.messge,
			    icon: 'success'
			  });  
			  // 清空缓存
			  setStorage('video_link', '');
			  setStorage('imageArr', []);
			  setStorage('plantContent', '');
			  this.getContent = false;	  
			  // 跳转页面
			  this.redirectAfterSave(res.data.community_id);
			},	
			// 保存失败处理
			handleSaveError(err) {
			  uni.hideLoading();
			  this.$util.Tips({
			    title: err.message || err.errMsg || '保存失败，请重试'
			  });
			},			
			// 根据类型跳转
			redirectAfterSave(communityId) {
			  const isVideoMode = this.tabActive === 2;	  
			  if (isVideoMode) {
			    // 视频模式跳转
			    const isApp = typeof navigator !== 'undefined' && navigator.product === 'uni-app';
			    const videoPagePath = isApp
			      ? '/pages/short_video/appSwiper/index'
			      : '/pages/short_video/nvueSwiper/index';
			    
			    uni.redirectTo({
			      url: `${videoPagePath}?id=${communityId}&user=1&uid=${this.uid}`
			    });
			  } else {
			    // 图文模式跳转
			    uni.redirectTo({
			      url: `/pages/plantGrass/plant_detail/index?id=${communityId}&type=${this.tabActive}`
			    });
			  }
			}
		},
		onUnload() {
			if(this.formData.content && this.getContent)setStorage('plantContent', this.formData.content);
		}
	}
</script>

<style lang="scss" scoped>
	page{
		background: #F5F5F5;
	}
	.crop_btn{
		line-height: 90rpx;
		height: 90rpx;
		height: calc(90rpx+ constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
		height: calc(90rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
	}
	.container{
		position: fixed;
		top: 0;
		left: 0;
		z-index: 20;
		width: 750rpx;
		height:100vh;
	}
	.release_content{
		margin: 20rpx 20rpx 0;
		.release_tab{
			border-radius: 16rpx 16rpx 0 0;
			border-bottom: 1rpx solid #E4E4E4;
			background: #fff;
			align-items: center;
			justify-content: center;
			height: 86rpx;
			.tab_item{
				margin: 0 40rpx;
				font-size: 32rpx;
				color: #999;
				position: relative;
				line-height: 86rpx;
				cursor: pointer;
				&.on{
					color: #E93323;
					&::after{
						content: "";
						display: inline-block;
						width: 100%;
						height: 3rpx;
						background: #E93323;
						position: absolute;
						bottom: 2rpx;
						left: 0;
					}
				}
				.iconfont{
					margin-right: 10rpx;
					font-size: 32rpx;
				}
			}
		}
		.release_item{
			background: #ffffff;
			padding: 0 24rpx;
			margin-bottom: 20rpx;
			border-radius: 24rpx;
		}
		.photo_count{
			padding: 24rpx 0;
		}
	}
  /deep/.input_photo uni-image,/deep/.input_photo image{
		width: 202rpx;
		height: 202rpx;
		border-radius: 16rpx!important;
	}
	.input_photo .pictrue{
		width: 202rpx;
		height: 202rpx;
		border-radius: 16rpx!important;
		margin-right: 20rpx;
		position: relative;
		overflow: hidden;
		&:nth-child(3n){
			margin-right: 0;
		}
		.close_btn{
			width: 30rpx;
			height: 30rpx;
			background: rgba(0,0,0,.6);
			border-radius: 0 14rpx 0 24rpx;
			position: absolute;
			top: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10;
			.iconfont{
				color: #ffffff;
				font-size: 20rpx;
			}
		}
		.cover_text{
			display: flex;
			width: 58rpx;
			height: 29rpx;
			background: #E93323;
			border-radius: 16rpx 0 16rpx 0;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 10;
			align-items: center;
			justify-content: center;
			font-size: 18rpx;
			color: #fff;
		}
	}
	/deep/.loading-img{
		width: 180rpx;
		height: 180rpx;
		border-radius: 12rpx;
	}
	.input_photo .pictrue{
		margin-bottom: 20rpx;
		.videoHover{
			width: 204rpx;
			height: 204rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			top: 0;
			left: 0;
			>view{
				width: 50rpx;
				height: 50rpx;
				background: #000000;
				border-radius: 50rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				.iconfont{
					color: #ffffff;
					font-size: 32rpx;
				}
			}
		}
		.video-text{
			display: block;
			width: 180rpx;
			text-align: center;
			color: #ffffff;
			font-size: 18rpx;
			z-index: 13;
			position: absolute;
			bottom: 20rpx;
		}
		video{
			width: 180rpx;
			height: 180rpx;
			border-radius: 12rpx;
		}
	}
	.input_photo .add{
		background: #f6f6f6;
		color: #999999;
		.iconfont{
			font-size: 54rpx;
		}
		.text{
			margin-top: 20rpx;
			font-size: 27rpx;
		}
	}
	.textarea textarea {
		font-size: 28rpx;
		padding-bottom: 38rpx;
		width: 100%;
		box-sizing: border-box;
		height: 400rpx;
		overflow: hidden;
	}
	.textarea .placeholder {
		color: #999999;
	}
	.release_item .item{
		height: 106rpx;
		border-bottom: 1rpx solid #eee;
		position: relative;
		font-size: 30rpx;
		&:last-child{
			border-bottom: none;
		}
		.name{
			color: #282828;
			.iconfont {
				margin-right: 10rpx;
				font-size: 30rpx;
			}
		}
		.select{
			color: #cccccc;
			.select_count{
				display: flex;
				align-items: center;
			}
			.icon-ic_rightarrow{
				color: #999999;
			}
			.text{
				margin-right: 15rpx;
				display: flex;
				align-items: center;
				.image,image,uni-image{
					width: 60rpx;
					height: 60rpx;
					margin-right: 5rpx;
					border-radius: 6rpx;
				}
			}
			.iconfont{
				font-size: 24rpx;
			}
			.text_name{
				color: var(--view-theme);
				padding: 10rpx 20rpx;
				background: var(--view-minorColor);
				border-radius: 100rpx;
				font-size: 24rpx;
				margin-right: 10rpx;
				display: flex;
				align-items: center;
				.icon-ic_talk_2{
					color: var(--view-theme);
					font-size: 22rpx;
				}
				.title{
					margin: 0 10rpx;
				}
			}
		}
	}
	.button{
		width: 710rpx;
		height: 86rpx;
		line-height: 86rpx;
		color: #ffffff;
		text-align: center;
		font-size: 28rpx;
		background: var(--view-theme);
		border-radius: 50rpx;
	}
	.release_btn{
		margin: 0 auto;
		position: fixed;
		bottom: 40rpx;
		left: 0;
		z-index: 80;
		left: 20rpx;
	}
	.video-count{
		position: fixed;
		width: 600rpx;
		height: 500rpx;
		top: 50%;
		left: 50%;
		margin-left: -300rpx;
		margin-top: -250rpx;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		.videoLink{
			width: 600rpx;
			height: 500rpx;
		}
	}
	.mask{
		z-index: 80;
	}
</style>
