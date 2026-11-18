<template>
	<view class="easy-loadimage relative" :style="[boxStyle]" @click="handleImageClick" :class="[domId, mode]">

		<!-- 加载前和加载失败的占位图 -->
		<view class="load-placeholder absolute inset-0" v-if="placeholderVisible" :class="[status]"></view>

		<!-- #ifndef MP -->
		<image :src="imageSrc" :mode="mode" class="origin-image relative"
			@load="handleImageLoaded" @error="handleImageError" :style="[imgStyle]" :class="[status]" />

		<image class="border-image absolute inset-0" :src="borderSrc" v-if="borderImageVisible" mode="scaleToFill" />
		<!-- #endif -->

		<!-- #ifdef MP -->
		<!-- 小程序使用原生的懒加载功能 -->
		<image :src="imageSrc" :mode="mode" class="origin-image relative" @load="imgPlaceholder.handleImageLoaded"
			@error="imgPlaceholder.handleImageError" :style="[imgStyle]" lazy-load />

		<!-- 小程序环境下使用 view 承载边框图，边框图 src 使用 css 变量传递，默认不设置背景图 -->
		<!-- 在 wxs 中通过添加 .active 类名来设置背景图然后加载边框图 -->
		<view class="border-image absolute inset-0 hidden" v-if="!!borderSrc" />
		<!-- #endif -->


	</view>
</template>


<script>

const IMAGE_STATUS = {
	WAITING: 'waiting', // 等待加载
	LOADING: 'loading', // 加载中
	LOADED: 'loaded', // 加载完成
	ERROR: 'error', // 加载失败
};

export default {
	name: 'easyLoadimage',
	props: {
		imageSrc: {
			type: String,
			default: ""
		},
		borderSrc: {
			type: String,
			default: ""
		},
		mode: {
			type: String,
			default: "aspectFill"
		},
		width: {
			type: String,
			default: ''
		},
		height: {
			type: String,
			default: ''
		},
		borderRadius: {
			type: String,
			default: ''
		},
		threshold: {
			type: Number,
			default: 100
		},
		// 宽高比
		aspectRatio: {
			type: String,
			default: ""
		}
	},
	data() {
		return {
			domId: 'uid-' + this.generateUUID(),
			IMAGE_STATUS,
			status: this.imageSrc ? IMAGE_STATUS.WAITING : IMAGE_STATUS.ERROR,
		}
	},
	computed: {
		boxStyle() {
			const style = {};

			if (this.borderSrc) {
				style["--border-img-src"] = `url(${this.borderSrc})`;
			}

			if (this.width) {
				style.width = this.width;
			}

			if (this.height) {
				style.height = this.height;
			}

			if (this.borderRadius) {
				style.borderRadius = this.borderRadius;
			}

			if (this.aspectRatio) {
				style.aspectRatio = this.aspectRatio;
			}

			return style;
		},
		imgStyle() {
			return {
				borderRadius: this.borderRadius
			}
		},
		absoluteThreshold() {
			const thresholdPx = uni.upx2px(Math.abs(this.threshold));
			return this.threshold < 0 ? -thresholdPx : thresholdPx;
		},
		placeholderVisible() {
			const validStatus = [IMAGE_STATUS.WAITING, IMAGE_STATUS.LOADING, IMAGE_STATUS.ERROR];
			return validStatus.includes(this.status);
		},
		borderImageVisible() {
			const validStatus = [IMAGE_STATUS.LOADED, IMAGE_STATUS.LOADING];
			return this.borderSrc && validStatus.includes(this.status);
		}
	},
	// #ifndef MP
	mounted() {
		// 直接开始加载图片，不使用 IntersectionObserver
		if (this.imageSrc) {
			this.status = IMAGE_STATUS.LOADING;
		}
	},
	beforeDestroy() {
		this.destoryObserver();
	},
	// #endif
	methods: {
		destoryObserver() {
			this.imgObserver?.disconnect();
		},
		async initObserver() {
			if (!this.imageSrc) return;
			await this.$util.sleep(30);
			this.destoryObserver();
			const observer = uni.createIntersectionObserver(this, {
				nativeMode: true
			});
			observer
				.relativeToViewport({
					bottom: this.absoluteThreshold
				})
				.observe(`.${this.domId}`, (res) => {
					if (res.intersectionRatio <= 0) return;

					// 开始加载图片
					this.status = IMAGE_STATUS.LOADING;

					// 停止监听
					this.destoryObserver();
				});

			this.imgObserver = observer;
		},
		handleImageClick() {
			this.$emit('click');
		},
		generateUUID() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
				const r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		handleImageLoaded() {
			this.status = IMAGE_STATUS.LOADED;
		},
		handleImageError() {
			this.status = IMAGE_STATUS.ERROR;
		}
	}
}
</script>

<script module="imgPlaceholder" lang="wxs" src="./img-placeholder.wxs"></script>

<style scoped lang="scss">
@keyframes looming-gray {
	0% {
		background-color: #e3e3e3aa;
	}

	50% {
		background-color: #e3e3e3;
	}

	100% {
		background-color: #e3e3e3aa;
	}
}

.easy-loadimage {
	&.widthFix {
		.origin-image {
			height: 172px;
		}
	}
}

.load-placeholder {
	border-radius: 12rpx;
	background: url('~@/static/easyLoadimage/loading.png') no-repeat center / 60% #e3e3e3;

	&.waiting,
	&.loading {
		animation: looming-gray 1s infinite linear;
	}

	&.error {
		background: url('~@/static/easyLoadimage/loadfail.png') no-repeat center / 50% #f5f5f5;
	}

	&.hidden {
		display: none;
	}
}

.origin-image {
	display: block;
	width: 100%;
	height: 100%;
	transform: transition3d(0, 0, 0);
	will-change: transform;
	opacity: 0;
	transition: opacity .3s ease-in;

	&.loaded {
		opacity: 1;
	}
}

.border-image {
	width: auto;
	height: auto;

	&.active {
		background: var(--border-img-src) no-repeat center / 100% 100%;
	}

	&.hidden {
		display: none;
	}
}
</style>
