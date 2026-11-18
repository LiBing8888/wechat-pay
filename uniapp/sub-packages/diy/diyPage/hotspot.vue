<template>
	<view :style="[hotspotWrapStyle]" class="relative hotspot-box">
		<view class="hotspot">
			<image :src="dataConfig.picStyle.url" mode="widthFix" class="image" :style="[imageRadius]"
				@load="handleImageLoad"></image>
			<view v-for="(item, index) in coverList" :key="item.number" :style="[item.style]" class="area"
				@click="goPage(item.link)"></view>
		</view>
	</view>
</template>

<script>
import { diyUtil } from '@/utils/diy.js';

export default {
	inject: ["parentMerId"],
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
			imageSize: null, // 图片尺寸
		}
	},
	computed: {
		coverList() {
			if (!this.imageSize) return [];
			const imageRatio = this.imageSize.width / this.imageSize.height;
			const imageWidthRenderSize = uni.upx2px(750) - this.dataConfig.prConfig.val * 2;
			const imageHeightRenderSize = imageWidthRenderSize / imageRatio;

			return this.dataConfig.picStyle.list.map(item => {
				let top = item.starY / item.nowImgHeight * 100;
				let left = item.starX / item.nowImgWidth * 100;
				top = top < 0 ? 0 : top;
				left = left < 0 ? 0 : left;

				const widthRatio = item.areaWidth / item.nowImgWidth;
				const heightRatio = item.areaHeight / item.nowImgHeight;

				return {
					...item,
					style: {
						top: `${top}%`,
						left: `${left}%`,
						width: `${widthRatio * imageWidthRenderSize}px`,
						height: `${heightRatio * imageHeightRenderSize}px`,
					}
				};
			});
		},
		imageRadius() {
			let borderRadius = `${this.dataConfig.fillet.val * 2}rpx`;
			if (this.dataConfig.fillet.type) {
				borderRadius =
					`${this.dataConfig.fillet.valList[0].val * 2}rpx ${this.dataConfig.fillet.valList[1].val * 2}rpx ${this.dataConfig.fillet.valList[3].val * 2}rpx ${this.dataConfig.fillet.valList[2].val * 2}rpx`;
			}
			return {
				'border-radius': borderRadius,
			};
		},
		hotspotWrapStyle() {
			return {
				'padding': `${this.dataConfig.topConfig.val * 2}rpx ${this.dataConfig.prConfig.val * 2}rpx ${this.dataConfig.bottomConfig.val * 2}rpx`,
				'margin-top': diyUtil.buildMarginTopOffset(this.dataConfig.mbConfig, this.dataConfig.offsetTopConfig),
				'--z-index': diyUtil.calcZIndex(this.index),
				'background': this.dataConfig.bottomBgColor.color[0].item,
				'box-shadow': diyUtil.buildShadowStyle(this.dataConfig.shadowConfig)
			};
		},
	},
	methods: {
		handleImageLoad(e) {
			this.imageSize = {
				width: e.detail.width,
				height: e.detail.height,
			};
		},
		goPage(link) {
			link = diyUtil.checkUrl(link, this.parentMerId);
			this.$util.JumpPath(link);
		},
	},
}
</script>

<style lang="scss" scoped>
.hotspot-box {
	z-index: var(--z-index);
}


.hotspot {
	position: relative;
	overflow: hidden;

	.image {
		display: block;
		width: 100%;
	}

	.area {
		position: absolute;

		// only debug
		// background-color: rgba(0, 0, 0, 0.5);
	}
}
</style>