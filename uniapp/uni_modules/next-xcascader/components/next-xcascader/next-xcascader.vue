<template>
	<view>
		<view class="input-block" @click="inputClick">
			<input
			v-model="_lable"
			:style="inputStyle"
			:placeholder="placeholder"
			placeholder-style="font-size: 30rpx;font-weight: none"
			disabled
		/>
			<text v-if="showArrow" class="iconfont icon-ic_rightarrow" :style="{ color: arrowColor }"></text>
		</view>
		<!-- 弹出层 -->
		<view :class="['next-scroll-popup', isShow ? 'next-scroll-open' : '', animation ? 'next-scroll-animation' : '']">
			<view class="next-scroll-box">
				<view class="next-scroll-top">
					<view class="next-scroll-top-left" @click="getResult('cancel')">取消</view>
					<view class="next-scroll-top-right" v-if="checkList.length == tabList.length"
						@click="getResult('confirm')">确定</view>
				</view>
				<scroll-view class="next-scroll-title" croll-x="true" :scroll-left="scrollViewWidth" scroll-with-animation>
					<view class="next-scroll-title-item-box" v-for="(i, e) in tabList" @click="checkTab(e)" :key="e">
						<view v-if="tabId >= e" :id="'next-' + e"
							:class="['next-scroll-title-item', tabId == e ? ' next-scroll-title-item-true' : '']">
							{{ checkList[e] ? checkList[e][labelKey] : i.title }}
							<text v-if="tabId > e" style="font-size: 12px;font-weight: bold;color: #E93323" class="icon">&#xe615;</text>
						</view>
					</view>
				</scroll-view>
				<scroll-view class="next-scroll-view_H" scroll-y="true">
					<view class="next-scroll-view-grid-box"
						v-if="checkBox && checkBox.length && checkBox[tabId] && checkBox[tabId].length">
						<view v-for="(item, index) in checkBox[tabId]" :key="index" @click="check(index)"
							:class="checkList && checkList[tabId] && checkList[tabId][labelKey] == item[labelKey] ? 'next-scroll-view-item-true' : 'next-scroll-view-item'">
							{{ item[labelKey] || '' }}
						</view>
					</view>
					<view class="next-scroll-view-noBox" v-else>
						<text style="font-size: 60px;color: #f9ae3d" class="icon">&#xe624;</text>
						<view class="text">暂无数据</view>
					</view>
				</scroll-view>
				<view v-show="safeArea" class="next-scroll-temp"></view>
			</view>
		</view>
		<!-- 遮罩层 -->
		<view v-show="isShow" class="next-scroll-mask" @click.stop="isMask ? close() : ''"></view>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: String,
				default: ''
			},
			//是否点击阴影关闭
			isMask: {
				type: Boolean,
				default: true,
			},
			//是否开启动画
			animation: {
				type: Boolean,
				default: true,
			},
			//是否开启安全条
			safeArea: {
				type: Boolean,
				default: true,
			},
			options: {
				type: Array,
				default: () => ([])
			},
			valueKey: {
				type: String,
				default: 'value'
			},
			labelKey: {
				type: String,
				default: 'label'
			},
			childrenKey: {
				type: String,
				default: 'children'
			},
			showArrow: {
				type: Boolean,
				default: true
			},
			arrowColor: {
				type: String,
				default: '#7a7a7a'
			},
			placeholder: {
				type: String,
				default: '请选择'
			},
			disabled: {
				type: Boolean,
				default: false
			},
			inputAlign:{
				type: String,
				default: 'right'
			},
			customRenderLabelFunc: {
				type: Function
			}
		},
		data() {
			return {
				isShow: false,
				checkBox: [],
				tabId: 0,
				checkList: [],
				checkListModel: [],
				id: 0,
				tabList: [{
						title: '请选择',
						id: 0
					}
				],
				scrollViewWidth: 0,
				elWidth: 0,
			};
		},
		created() {
			this.$watch(() => this.value, (val) => {
				let arr = [];
				(val || '').split(',').map((val, index) => {
					if(index === 0) {
						arr[0] = this.options.find(item => item[this.valueKey] === val) || {};
					} else {
						const children = arr[index - 1][this.childrenKey] || [];
						arr[index] = children.find(item => item[this.valueKey] === val) || {};
					}
				});
				this.checkListModel = arr;
			})
			
			// 监听options变化，重新初始化组件
			this.$watch(() => this.options, (newOptions) => {
				if (newOptions && newOptions.length > 0) {
					// 只有当弹窗打开时才重新初始化
					if (this.isShow) {
						this.init();
					}
				}
			}, { deep: true });
		},
		mounted() {
			console.log("----------插件挂载完毕------------");
		},
		computed: {
			_lable() {
				const label = (this.checkListModel || []).map(item => item[this.labelKey]).join('/');
				return this.customRenderLabelFunc && (typeof this.customRenderLabelFunc === 'function') ? this.customRenderLabelFunc(label) : label
			},
			_value() {
				return (this.checkListModel || []).map(item => item[this.valueKey]).join(',')
			},
			inputStyle() {
				const style = {
					'text-align': this.inputAlign
				};
				if (this.disabled) {
					style.color = '#c0c4cc';
				}
				return style;
			}
		},
		methods: {
			inputClick() {
				if(!this.disabled) {
					this.open()
				}
			},
			open() {
				this.isShow = true;
				this.init();
			},
			close() {
				this.isShow = false;
				this.$emit('close')
			},
			init() {
				this.id = 0;
				this.tabId = 0;
				this.checkBox = [];
				this.checkList = [];
				//初始化求出滚动的宽度
				let view = uni.createSelectorQuery().in(this).select(".next-scroll-title")
				view.boundingClientRect(rect => {
					this.scrollViewWidth = Math.round(rect.width)
				}).exec()
				this.getData();
			},
			async check(index) {
				this.$set(this.checkList, this.id, this.checkBox[this.id][index]);
				const children = this.checkBox[this.id][index][this.childrenKey];
				let n = 0;
				if(children && children.length) {
					n = this.id + 1;	
				} else {
					n = this.id;
				}
				
				let arr = [];
				for(let i=0; i<=n; i++) {
					arr.push({
						title: '请选择',
						id: i
					})
				}
				this.tabList = arr;
				
				if (this.id < this.tabList.length - 1) this.id = this.id + 1;
				await this.getData();
				let view = uni.createSelectorQuery().in(this).select('#next-' + this.tabId)
				view.boundingClientRect(rect => {
					this.elWidth = Math.round(rect.width);
				}).exec()
				setTimeout(() => {
					this.scrollViewWidth = this.scrollViewWidth + this.elWidth;
				});
				if (this.tabId < this.tabList.length - 1) this.tabId = this.tabId + 1;
				
			},
			checkTab(e) {
				if (e == this.id) return;
				this.id = e;
				this.tabId = e;
				this.checkList = this.checkList.splice(0, e);
			},
			getResult(event) {
				if (event == 'confirm') {
					if (this.checkList.length != this.tabList.length) return;
					let result = this.checkList;
					this.checkListModel = result;
					// #ifdef VUE2
						this.$emit('input', this._value)
					// #endif
					// #ifdef VUE3
						this.$emit('update:value', this._value)
					// #endif
					this.$emit('confirm', {
						value: result
					})
				}
				this.close();
			},
			//使用本地假数据进行加载
			async getData() {
				if (this.checkList.length === this.tabList.length) return;
				uni.showLoading({
					title: '加载中...'
				});
				let list = [];
				if (this.checkList.length) {
					var id = this.checkList[this.id - 1][this.valueKey]
					const item = this.checkBox[this.id - 1].find(item => {
						return item[this.valueKey] == id;
					});
					(item[this.childrenKey] ? item[this.childrenKey] : []).map(e => {
						list.push(e);
					});
					uni.hideLoading();
					this.$set(this.checkBox, this.id, list)
				} else {
					this.options.map(e => {
						list.push(e);
					});
					uni.hideLoading()
					this.$set(this.checkBox, this.id, list)
				}
			},
		},
	};
</script>

<style>
	@font-face {
		font-family: 'iconfont-cascader';
		src: url('https://at.alicdn.com/t/c/font_4110624_inol5z6r1x.ttf?t=1692936143981') format('truetype');
	}
	.icon {
		font-family: iconfont-cascader;
		font-size: 24rpx;
		font-style: normal;
		color: #7a7a7a;
	}
	/deep/ ::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
		display: none;
	}
</style>
<style lang="scss" scoped>
	.input-block {
	  display: flex;
	  align-items: center;
		justify-content: center;
		padding-right: 30rpx;
	  input {
	    flex: 1;
	    color: #333333;
			pointer-events: none;
	  }
		.iconfont {
			font-size: 28rpx;
			color: #7a7a7a;
			position: absolute;
			right: 0;
		}
	}
	.next-scroll-popup {
		width: 100%;
		position: fixed;
		left:0;
		bottom: -100%;
		z-index: 999;
	}

	.next-scroll-open {
		bottom: 0px !important;
	}

	.next-scroll-animation {
		transition: all 0.25s linear;
	}

	.next-scroll-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 998;
	}

	.next-scroll-box {
		position: absolute;
		bottom: 0;
		width: 100%;
		background: #ffff;
		border-radius: 24rpx 24rpx 0 0;
	}

	.next-scroll-temp {
		padding-bottom: env(safe-area-inset-bottom);
	}

	.next-scroll-top {
		height: 88rpx;
		line-height: 88rpx;
	}

	.next-scroll-top-left {
		float: left;
		padding-left: 24rpx;
		font-size: 28rpx;
	}

	.next-scroll-top-right {
		float: right;
		padding-right: 24rpx;
		color: #E93323;
		font-size: 28rpx;
	}

	.next-scroll-title {
		white-space: nowrap;
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #fafafa;
		text-align: left;
	}

	.next-scroll-view_H {
		white-space: nowrap;
		width: 100%;
		height: 400rpx;
		line-height: 100rpx;
		background-color: #ffffff;
	}

	.next-scroll-title-item {
		position: relative;
	}

	.next-scroll-title-item-box {
		display: inline-block;
		margin: 0 10rpx;
		font-size: 28rpx;
		color: #333333;
	}

	.next-scroll-title-item-true {
		font-size: 28rpx;
		font-weight: 700;
		color: #E93323;
	}

	.next-scroll-view-box {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 16rpx;
	}

	.next-scroll-view-grid-box {
		width: calc(100% - 20rpx);
		margin: 10rpx;
		padding-bottom: 10rpx;
	}

	.next-scroll-view-noBox {
		width: 100%;
		height: 400rpx;
		padding-top: 20px;
		text-align: center;

		image {
			width: 200rpx;
			height: 200rpx;
			margin-top: 32rpx;
		}

		.text {
			width: 100%;
			text-align: center;
			color: #888;
			font-size: 28rpx;
			margin-top: -40rpx;
		}
	}

	.next-scroll-view-item {
		padding: 0rpx 24rpx;
		text-align: left;
		border-radius: 6rpx;
		background: #f7f7f7;
		color: #333333;
		font-size: 28rpx;
		margin: 12rpx 4rpx;
		height: 66rpx;
		line-height: 66rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.next-scroll-view-item-true {
		padding: 0rpx 24rpx;
		text-align: left;
		border-radius: 6rpx;
		background-color: #E93323;
		color: #ffffff;
		font-size: 28rpx;
		margin: 12rpx 4rpx;
		height: 66rpx;
		line-height: 66rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>