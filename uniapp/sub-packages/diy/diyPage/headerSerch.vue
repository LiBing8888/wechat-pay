<template>
	<view>
		<view :style="[wrapStyle]" class="wrap-box" :class="{ 'is-first': isFirst, 'is-sticky': isSticky }">
			<view :style="[compStyle]" v-if="dataConfig" class="search-box">
				<!-- 标题 -->
				<navigator class="title full" :style="[titleStyle]" v-if="dataConfig.styleConfig.tabVal == 0" :url="dataConfig.linkConfig.value">{{
					dataConfig.titleConfig.value }}</navigator>
				<!-- 定位 -->
				<view class="title full" :style="[titleStyle]" v-else-if="dataConfig.styleConfig.tabVal == 1">
					<view style="display: inline-block;">
						<LocationSelector />
					</view>
				</view>

				<!-- 搜索 -->
				<template v-else-if="dataConfig.styleConfig.tabVal == 2">
					<template v-if="dataConfig.displaySearchStyleConfig.tabVal == 2">
						<image v-if="dataConfig.logoConfig.url" :src="dataConfig.logoConfig.url" class="logo mr10"
							mode="aspectFill" />
					</template>
					<view class="title limit mr10" :style="[titleStyle]" v-else>
						<navigator v-if="dataConfig.displaySearchStyleConfig.tabVal == 0" :url="dataConfig.linkConfig.value">
							{{ dataConfig.titleConfig.value }}
						</navigator>
						<template v-else>
							<LocationSelector />
						</template>
					</view>
					<view class="input-box" :style="[inputWrapperText, inputContentAlignStyle]" @click="handleSearch">
						<swiper class="hot-word-swiper" :indicator-dots="false" :autoplay="true"
						:interval="dataConfig.numConfig.val * 1000" :duration="500" :vertical="true" :circular="true"
						v-if="hotWordsText.length" @change="handleHotWordChange">
						<swiper-item v-for="(item, index) in hotWordsText" :key='index'>
								<view class="hot-word-item" :style="[inputHotWordsTextStyle, inputContentAlignStyle]">
									<text class="iconfont icon-ic_search" />
									{{ item.val }}
								</view>
							</swiper-item>
						</swiper>
						<template v-else>
							<text class="iconfont icon-ic_search" />
							<text :style="[inputTipTextStyle]">{{ inputTipText }}</text>
						</template>
					</view>
				</template>
			</view>
		</view>
		<!-- 固定时的占位元素 -->
		<view v-if="isSticky && this.dataConfig.fixedConfig.tabVal === 1" class="sticky-placeholder" :style="[compStyle]"></view>
	</view>
</template>

<script>
import { diyUtil } from "@/utils/diy.js";
import LocationSelector from '@/components/LocationSelector.vue';
import { usePageLifeCycle } from "@/hooks/usePageLifeCycle";

export default {
	name: "headerSerch",
	components: {
		LocationSelector
	},
	props: {
		dataConfig: Object,
		index: {
			type: Number,
			default: 0
		},
		compCount: {
			type: Number,
			default: 0
		}
	},
	inject: ["parentDiyIdList"],
	computed: {
		isFirst() {
			return this.parentDiyIdList.length <= 1 && this.index === 0;
		},
		isSticky() {
			if (!this.dataConfig) return false;
			return this.dataConfig.fixedConfig.tabVal === 1 && this.isLeaveTop;
		},
		wrapStyle() {
			if (!this.dataConfig) return {};
			const { bottomBgColor, offsetYConfig } = this.dataConfig;
			return {
				"--z-index": diyUtil.calcZIndex(this.isSticky ? this.compCount : this.index),
				"--sticky-bg-color": bottomBgColor.color[0].item,
				marginTop: diyUtil.buildMarginTopOffset(undefined, offsetYConfig),
				backgroundColor: bottomBgColor.color[0].item
			};
		},
		compStyle() {
			if (!this.dataConfig) return {};
			const { moduleColor } = this.dataConfig;
			return {
				background: diyUtil.buildLinearColor(moduleColor),
				margin: `${this.dataConfig.topConfig.val}px ${this.dataConfig.prConfig.val}px ${this.dataConfig.bottomConfig.val}px ${this.dataConfig.prConfig.val}px`,
				borderRadius: diyUtil.buildBorderRadius(this.dataConfig.fillet),
				boxShadow: diyUtil.buildShadowStyle(this.dataConfig.shadowConfig),
			};
		},
		titleStyle() {
			if (!this.dataConfig) return {};
			const { textColor, fontSizeConfig, textPosition, textStyle } = this.dataConfig;

			return {
				fontSize: `${fontSizeConfig.val}px`,
				"--location-color": textColor.color[0].item,
				color: textColor.color[0].item,
				textAlign: textPosition.tabList[textPosition.tabVal].val,
				fontStyle: textStyle.tabVal === 1 ? 'italic' : 'normal',
				fontWeight: textStyle.tabVal === 2 ? 'bold' : 'normal',
			};
		},
		hotWordsText() {
			if (!this.dataConfig) return "";
			return this.dataConfig.hotWords.list;
		},
		inputTipText() {
			if (!this.dataConfig) return "";
			const { tipConfig, hotWords } = this.dataConfig;
			if (hotWords.list.length > 0 && hotWords.list[0].val) {
				return hotWords.list[0].val;
			}
			return tipConfig.value;
		},
		inputContentAlignStyle() {
			if (!this.dataConfig) return {};
			const { textPosition } = this.dataConfig;
			return {
				justifyContent: textPosition.tabList[textPosition.tabVal].val
			};
		},
		inputWrapperText() {
			if (!this.dataConfig) return {};
			const { searchBoxColor } = this.dataConfig;
			const style = {
				backgroundColor: searchBoxColor.color[0].item,
			};
			
			// #ifdef MP
			if (this.index === 0) {
				style.marginRight = "var(--menu-btn-width)";
			}
			// #endif

			return style;
		},
		inputTipTextStyle() {
			if (!this.dataConfig) return {};
			const { tipColor } = this.dataConfig;
			return {
				color: tipColor.color[0].item,
			};
		},
		inputHotWordsTextStyle() {
			if (!this.dataConfig) return {};
			const { hotWordsColor } = this.dataConfig;
			return {
				color: hotWordsColor.color[0].item,
			};
		},
	},
	data() {
		return {
			hotWordIndex: 0,
			isLeaveTop: false,
			componentOffsetTop: 0,
			isVisible: true
		}
	},
	created() {
		usePageLifeCycle.call(this, {
			onPageScroll: this.handlePageScroll
		});
	},
	mounted() {
		// 获取组件初始位置
		this.getComponentOffset();
	},
	methods: {
		handlePageScroll(event) {
			const scrollTop = event.scrollTop || 0;
			// 当滚动超过组件位置时，设置为已离开顶部
			this.isLeaveTop = scrollTop >= this.componentOffsetTop;
		},
		getComponentOffset() {
			// #ifdef H5
			const query = uni.createSelectorQuery();
			query.select('.wrap-box').boundingClientRect((rect) => {
				if (rect) {
					this.componentOffsetTop = rect.top || 0;
				}
			}).exec();
			// #endif
			// #ifdef MP
			// 小程序端可以通过系统信息估算
			this.componentOffsetTop = 80; // 默认值
			// #endif
		},
		handleSearch() {
			const searchVal = this.hotWordsText.length ? this.hotWordsText[this.hotWordIndex].val : this.inputTipText;
			uni.navigateTo({
				url: `/pages/columnGoods/goods_search/index?searchVal=${searchVal}`
			})
		},
		handleHotWordChange(e) {
			this.hotWordIndex = e.detail.current;
		}
	}
}
</script>

<style scoped lang="scss">
.wrap-box {
	display: block;
	z-index: var(--z-index);
	position: relative;

	&.is-sticky {
		position: fixed;
		/* #ifdef H5 */
		top: 0;
		/* #endif */
		/* #ifdef MP */
		top: 0;
		background-color: var(--sticky-bg-color, #ffffff) !important;
		padding-top: var(--safe-area-inset-top);
		/* #endif */
		left: 0;
		right: 0;
		z-index: 999;
		width: 100%;
		box-sizing: border-box;
	}

	&.is-first {
		padding-top: var(--safe-area-inset-top);
	}
}

/* 固定时的占位元素样式 */
.sticky-placeholder {
	height: 48px;
	visibility: hidden;
}

/* 移除父容器的 overflow 限制 */
:deep(.custom-container) {
	overflow: visible !important;
}

:deep(.diy-page-container) {
	overflow: visible !important;
}

.search-box {
	height: 48px;
	padding: 0 15px;
	display: flex;
	align-items: center;
	font-size: 15px;
	color: #333;



	.title {
		&.full {
			flex: 1;
		}

		&.limit {
			max-width: 100px;
			overflow: hidden;
			white-space: nowrap;
		}

		.iconfont {
			font-size: 13px;
		}
	}

	.logo {
		width: 62px;
		height: 22px;
	}

	.input-box {
		flex: 1;
		height: 30px;
		background: #F5F5F5;
		border-radius: 16px;
		display: flex;
		align-items: center;
		padding: 0 15px;

		/* #ifdef MP */
		.wrap-box.is-sticky & {
			margin-right: var(--menu-btn-width);
		}
		/* #endif */

		.iconfont {
			font-size: 13px;
			margin-right: 9px;
		}
	}
}

.hot-word-swiper {
	height: 100%;
	flex: 1;

	.hot-word-item {
		height: 100%;
		display: flex;
		align-items: center;
		font-size: 12px;
	}
}
.mr10 {
	margin-right:  10px;
}
</style>
