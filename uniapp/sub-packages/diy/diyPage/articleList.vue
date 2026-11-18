<template>
	<!-- 文章列表 -->
	<view :style="[articleWrapperStyle]" class="relative articleList-box" :class="wrapperClassList">
		<transition-group name="article-list" tag="view" class="article-list flex" v-if="articleList.length">
			<navigator :url='"/pages/news_details/index?id=" + item.article_id' hover-class="none" class="article-item"
				v-for="item of articleList" :key="item.article_id" :style="[articleItemStyle]">
				<view class="article-title line1" :style="[titleStyle]" v-if="isLargeLayout">{{ item.title }}</view>
				<image class="article-image" mode="aspectFill" :src="item.image_input" :style="[imgStyle]" />
				<view class="article-body">
					<view class="article-title line2" v-if="!isLargeLayout" :style="[titleStyle]">{{ item.title }}</view>
					<view class="article-info flex-between-center">
						<view class="article-publish-time" :style="[timeStyle]">{{ item.create_time }}</view>
						<view class="article-view-info flex" :style="[numberStyle]">
							<view class="iconfont icon-ic_Eyes" :style="[iconEyesStyle]" />
							{{ item.visit }}
						</view>
					</view>
				</view>
			</navigator>
		</transition-group>
	</view>
</template>

<script>
import {
	getArticleList
} from '@/api/api.js';
import dayjs from '@/plugin/dayjs/dayjs.min.js';
import { diyUtil } from '@/utils/diy';

export default {
	name: "articleList",
	props: {
		dataConfig: {
			type: Object,
			default: () => { }
		},
		index: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			articleList: [],
		}
	},
	computed: {
		isLargeLayout() {
			return this.dataConfig.styleConfig.tabVal === 0;
		},
		isColumnLayout() {
			return this.dataConfig.styleConfig.tabVal === 1;
		},
		isColumnDoubleLayout() {
			return this.dataConfig.styleConfig.tabVal === 2;
		},
		wrapperClassList() {
			if (this.isLargeLayout) return 'large-layout';
			if (this.isColumnLayout) return 'column-layout';
			if (this.isColumnDoubleLayout) return 'column-double-layout';
			return '';
		},
		imgStyle() {
			return {
				borderRadius: diyUtil.buildBorderRadius(this.dataConfig.filletImg),
			};
		},
		timeStyle() {
			return {
				'color': this.dataConfig.timeColor.color[0].item,
			};
		},
		iconEyesStyle() {
			return {
				'color': this.dataConfig.browseColor.color[0].item,
			};
		},
		iconLikeStyle() {
			return {
				'color': this.dataConfig.likeSuccessColor.color[0].item,
			};
		},
		numberStyle() {
			return {
				'color': this.dataConfig.statisticColor.color[0].item,
			};
		},
		articleItemStyle() {
			return {
				'box-shadow': diyUtil.buildShadowStyle(this.dataConfig.shadowConfig),
				'border-radius': diyUtil.buildBorderRadius(this.dataConfig.fillet),
				'background': diyUtil.buildLinearColor(this.dataConfig.bgColor),
			};
		},
		articleWrapperStyle() {
			return {
				'box-shadow': diyUtil.buildShadowStyle(this.dataConfig.compShadowConfig),
				'padding': `${this.dataConfig.topConfig.val * 2}rpx ${this.dataConfig.prConfig.val * 2}rpx ${this.dataConfig.bottomConfig.val * 2}rpx`,
				'margin-top': diyUtil.buildMarginTopOffset(this.dataConfig.mbConfig, this.dataConfig.offsetYConfig),
				'--z-index': diyUtil.calcZIndex(this.index),
				'background': this.dataConfig.bottomBgColor.color[0].item,
			};
		},
		titleStyle() {
			let styleObject = {
				'color': this.dataConfig.nameColor.color[0].item,
			};
			if (!this.dataConfig.nameConfig.tabVal) {
				styleObject['font-weight'] = 'bold';
			}
			return styleObject;
		}
	},
	watch: {
		dataConfig: {
			handler() {
				this.getCidArticle();
			},
			immediate: true
		}
	},
	methods: {
		getCidArticle() {
			const dayjsFormat = this.dataConfig.styleConfig.tabVal == 2 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
			getArticleList(this.dataConfig.selectConfig.activeValue || 0, {
				page: 1,
				limit: this.dataConfig.numConfig.val
			}).then(res => {
				res.data.list.forEach(item => {
					item.create_time = dayjs(item.create_time).format(dayjsFormat)
				})
				this.articleList = res.data.list;
			});
		},
	}
}
</script>

<style scoped lang="scss">
	.article-list-enter-active,
	.article-list-leave-active {
		transition: all 0.5s ease;
	}
	.article-list-enter,
	.article-list-leave-to {
		opacity: 0;
		transform: translateY(20rpx);
	}
	.article-list-move {
		transition: transform 0.5s ease;
	}
.article-view-info,
.article-publish-time {
	font-size: 24rpx;

	.iconfont {
		margin-right: 8rpx;
	}
}

.large-layout {
	.article-list {
		flex-direction: column;
		gap: 20rpx;
	}

	.article-item {
		padding: 32rpx 24rpx;
	}

	.article-image {
		width: 100%;
		height: 320rpx;
		display: block;
		margin-top: 24rpx;
		margin-bottom: 24rpx;
	}
}

.column-layout {
	.article-list {
		flex-direction: column;
		gap: 20rpx;
	}

	.article-item {
		padding: 20rpx;
		display: flex;
	}

	.article-image {
		width: 240rpx;
		height: 152rpx;
		flex-shrink: 0;
		margin-right: 24rpx;
	}

	.article-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
}

.column-double-layout {
	.article-list {
		flex-wrap: wrap;
		gap: 18rpx 20rpx;
	}

	.article-item {
		width: calc(50% - 10rpx);
	}

	.article-image {
		width: 100%;
		height: 216rpx;
		display: block;
	}

	.article-body {
		padding: 20rpx;
		padding-bottom: 18rpx;
	}

	.article-title {
		margin-bottom: 12rpx;
	}
}
</style>
