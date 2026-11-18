<template>
  <view class="my-main">
    <view class="mp-header" id="home" :style="[mpHeaderStyle]">

      <view class="sys-head" :style="{ height: statusBarHeight + 'px' }" v-if="!special && !isSmallLink"></view>

      <!--全国/商圈-->
			<view v-if="searchBox == 2" class="location-set acea-row row-center-wrapper" :style="[locationSetStyle]">
				<view class="set-item acea-row row-center-wrapper" 
					v-for="(item,index) in locationSet" 
					:key="index" 
					:class="{'on' : locationVal==item.value}"
					@click="changeLocation(item)">
					{{item.label}}
			  </view>
			</view>
			<view class="serch-box">
        <!-- #ifdef MP -->
        <!-- 小程序：不显示全国/商圈切换时，logo和文字放在搜索框上面 -->
        <view v-if="searchBox != 2" class="serch-wrapper-vertical">
          <view class="top-content">
            <view class="title skeleton-rect" :style="[titleStyle]" v-if="searchBox == 1">{{ titleConfig }}</view>
            <view class="logo skeleton-rect" v-else-if="searchBox == 0 && logoUpImg">
              <image :src="logoUpImg" mode="heightFix" class="logo-img"></image>
            </view>
          </view>
          <view class="search-input">
            <template>
              <navigator v-if="hotWords.length" :url="'/pages/columnGoods/goods_search/index?searchVal=' + searchVal"
                :class="logoConfig ? 'input' : 'uninput'" hover-class="none" class="skeleton-rect" :style="[inputStyle]">
                <view class="swiperTxt">
                  <swiper :indicator-dots="false" autoplay :interval="interval" :duration="500" vertical="true"
                    circular="true" @change="textChange" class="swiper">
                    <block v-for="(item, index) in hotWords" :key="index">
                      <swiper-item catchtouchmove="catchTouchMove">
                        <view class="acea-row row-between-wrapper">
                          <view class="text acea-row row-between-wrapper">
                            <view class="newsTitle line1">{{ item.val }}</view>
                          </view>
                        </view>
                      </swiper-item>
                    </block>
                  </swiper>
                </view>
                <text class="iconfont icon-ic_search"></text>
              </navigator>
              <navigator v-else url="/pages/columnGoods/goods_search/index" hover-class="none" class="skeleton-rect input"
                :style="[inputStyle]">
                {{ dataConfig.inputConfig.value }}
                <text class="iconfont icon-ic_search"></text>
              </navigator>
            </template>
            <!--签到通知按钮-->
            <view class="button-set acea-row row-center-wrapper" :style="[buttonSetStyle]">
              <navigator v-if="checkboxInfo.indexOf(0) != -1" url="/pages/users/user_sgin/index" hover-class="none" class="iconfont icon-ic_calendar"></navigator>
              <navigator v-if="checkboxInfo.indexOf(1) != -1" url="/pages/chat/customer_list/index?type=0" hover-class="none" class="iconfont icon-ic_daipingjia1">
                <text v-if="userInfo.total_unread"></text>
              </navigator>
            </view>
          </view>
        </view>
        <!-- #endif -->
        
        <!-- 非小程序：保持原有水平布局 -->
        <view class="serch-wrapper flex" :class="[special ? 'on' : '', searchBox == 2 ? 'has-location-switch' : '']"
          v-if="searchBox == 2 || (searchBox != 2 && !isMp)">
          <view class="title skeleton-rect" :style="[titleStyle]" v-if="searchBox == 1">{{ titleConfig }}</view>
          <view class="logo skeleton-rect" v-else-if="searchBox == 0 && logoUpImg">
            <image :src="logoUpImg" mode="heightFix" class="logo-img"></image>
          </view>
          <view v-else-if="searchBox == 2 && locationVal==2" :style="[locationStyle]">
            <LocationSelector />
          </view>
					<view class="search-input">
						<template>
							<navigator v-if="hotWords.length" :url="'/pages/columnGoods/goods_search/index?searchVal=' + searchVal"
							  :class="logoConfig ? 'input' : 'uninput'" hover-class="none" class="skeleton-rect" :style="[inputStyle]">
							  <view class="swiperTxt">
							    <swiper :indicator-dots="false" autoplay :interval="interval" :duration="500" vertical="true"
							      circular="true" @change="textChange" class="swiper">
							      <block v-for="(item, index) in hotWords" :key="index">
							        <swiper-item catchtouchmove="catchTouchMove">
							          <view class="acea-row row-between-wrapper">
							            <view class="text acea-row row-between-wrapper">
							              <view class="newsTitle line1">{{ item.val }}</view>
							            </view>
							          </view>
							        </swiper-item>
							      </block>
							    </swiper>
							  </view>
							  <text class="iconfont icon-ic_search"></text>
							</navigator>
							<navigator v-else url="/pages/columnGoods/goods_search/index" hover-class="none" class="skeleton-rect input"
							  :style="[inputStyle]">
							  {{ dataConfig.inputConfig.value }}
							  <text class="iconfont icon-ic_search"></text>
							</navigator>
						</template>
						<!--签到通知按钮-->
						<view class="button-set acea-row row-center-wrapper" :style="[buttonSetStyle]">
							<navigator v-if="checkboxInfo.indexOf(0) != -1" url="/pages/users/user_sgin/index" hover-class="none" class="iconfont icon-ic_calendar"></navigator>
							<navigator v-if="checkboxInfo.indexOf(1) != -1" url="/pages/chat/customer_list/index?type=0" hover-class="none" class="iconfont icon-ic_daipingjia1">
								<text v-if="userInfo.total_unread"></text>
							</navigator>
						</view>
					</view>
          
          
        </view>
      </view>
    </view>
    <view :style="'height:' + headerHeight + 'px'" v-if="!special && searchShow"></view>
    <view v-if="!dataConfig.classConfig.tabVal" class="navTabBox tabNav">
      <view class="longTab" :style="{ width: `${mainWidth}px` }">
        <scroll-view scroll-x="true" scroll-with-animation :scroll-left="tabLeft" show-scrollbar="true" class="scroll-view">
          <view class="longItem" v-for="(item, index) in tabListConfig" :key="index"
            :class="{ click: index == tabClick }" :id="'id' + index" :data-index="index"
            @click="changeTab(item, index)">
            {{ item.text.val }}
          </view>
        </scroll-view>
      </view>
      <view class="category" @click="showCategory">
        <text class="iconfont icon-a-ic_Imageandtextsorting"
          :style="'color:' + (isLeaveTop ? txtColor : '#fff')"></text>
      </view>
    </view>
    <view v-if="isCategory" class="category_count">
      <view class="sys-head tui-skeleton" :style="{ height: statusBarHeight + 'px' }" v-if="!special"></view>
      <view class="fs-28">精选类目</view>
      <view class="cate_count grid-column-4 grid-gap-16rpx mt-32">
        <view class="category_item" :style="[index === tabClick ? classColor : '']" @click="changeTab(item, index)"
          v-for="(item, index) in tabListConfig" :key="index" :id="'ids' + index">
          {{ item.text.val }}
        </view>
      </view>
    </view>


    <view v-if="isCategory" class="mask" @click="isCategory = false"></view>
  </view>
</template>

<script>

import LocationSelector from '@/components/LocationSelector.vue';
import { diyUtil } from '@/utils/diy';
import { MICRO_PAGE_PATH } from "@/constants/pages";
import { selectCircleWithDiyTemplates, clearSelectedZoneWithDiyTemplates } from "@/utils/circle";
export default {
  name: "HomeCombTop",
  components: {
    LocationSelector
  },
  props: {
    dataConfig: Object,
    special: {
      type: Number,
      default: 0
    },
    isLeaveTop: {
      type: Boolean,
      default: false
    },
    tabActiveIndex: {
      type: Number,
      default: 0
    },
    compCount: {
      type: Number,
      default: 0
    }
  },
  data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				txtColor: '',
				tabClick: 0, //导航栏被点击
				mainWidth: 0,
				hotWordShow: false,
				isCategory: false,
				searchShow: false,
				searchVal: '',
				tabLeft: 0,
				locationSet: [
					{label: "全国", value: 1},
					{label: "商圈", value: 2}
				],
				locationVal: uni.getStorageSync('locationVal') || 2,
				isSmallLink: false,
				isMp: false,
			}
		},
  created() {
    var that = this;
    // 获取设备宽度
    uni.getSystemInfo({
      success(e) {
        that.mainWidth = e.windowWidth;
        // 判断是否是小程序
        /* #ifdef MP */
        that.isMp = true;
        /* #endif */
      }
    });

    that.hotWords.forEach((item) => {
      if (item.val) {
        this.hotWordShow = true;
      }
    });
    uni.setStorageSync('hotList', that.hotWords);
		// 判断链接是否是微页面链接
		const link = this.getCurrentPagePath();
		const isMicroPageLink = link => link.startsWith(MICRO_PAGE_PATH);
		that.isSmallLink = isMicroPageLink(link);
		
		// 如果默认选中商圈，自动获取推荐商圈并选择第一个
		if (this.locationVal == 2) {
			this.handleSelectFirstRecommendCircle();
		}
  },
  watch: {
    tabActiveIndex() {
      this.tabClick = this.tabActiveIndex;
    },
    dataConfig: {
      handler() {
        // 当 dataConfig 变化时，重新从本地存储中读取 locationVal
        this.locationVal = uni.getStorageSync('locationVal') || 2;
      },
      deep: true
    }
  },
  computed: {
		userInfo() {
			return (this.$store.state.user && this.$store.state.user.userInfo) || {};
		},
		classColor() {
			let color = this.dataConfig.classColor;
			return {
				background: `linear-gradient(90deg, ${color.color[0].item} 50%, ${color.color[1].item} 100%)`,
				color: '#fff'
			};
		},
    tabListConfig() {
      // 向配置项中添加默认首页，用来展示其他 DIY 组件
      let tabList = this.dataConfig.tabListConfig.list;
      return [
        {
          text: {
            val: "首页"
          }
        },
        ...tabList
      ];
    },
    inputStyle() {
      let style = {};
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal) {
        style.background = `#F5F5F5`;
        style.color = `#BBBBBB`;
      }
      return style;
    },
    titleStyle() {
      let style = {};
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal) {
        style.color = `#333`;
      }
      return style;
    },
    mpHeaderStyle() {
      let style = {};
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal) {
        style.background = `linear-gradient(90deg, #FFFFFF 50%, #FFFFFF 100%)`;
        style.position = `fixed`;
        style.zIndex = diyUtil.calcZIndex(this.compCount);
        this.searchShow = true;
      } else {
        this.searchShow = false;
      }
      return style;
    },
    logoUpImg() {
      let img = '';
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal && this.dataConfig.logoUpConfig && this.dataConfig.logoUpConfig.url) {
        img = this.dataConfig.logoUpConfig.url;
      } else {
        img = this.dataConfig.logoConfig.url;
      }
      return img;
    },
    locationStyle() {
      return {
        "--location-color": this.isLeaveTop ? "#333" : "#fff"
      };
    },
    locationSetStyle() {
      let style = {};
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal) {
        style.background = `rgba(0, 0, 0, 0.1)`;
      }
      return style;
    },
    buttonSetStyle() {
      let style = {};
      if (this.isLeaveTop && this.dataConfig.searchConfig.tabVal) {
        style.color = "#333";
      }
      return style;
    },
    headerHeight() {
      let baseHeight = this.statusBarHeight + 43;
      // 小程序中不显示全国/商圈切换时，垂直布局需要增加高度
      /* #ifdef MP */
      if (this.searchBox != 2) {
        baseHeight += 70; // 增加70rpx的高度（logo高度60rpx + 间距10rpx）
      }
      /* #endif */
      return baseHeight;
    },
    hotWords() {
      return this.dataConfig.hotWords.list.filter((item) => {
        return item.val;
      });
    },
    interval() {
      return this.dataConfig.numConfig.val * 1000 || 2500;
    },
    logoConfig() {
      return this.dataConfig.logoConfig.url;
    },
    titleConfig() {
      return this.dataConfig.titleConfig.value;
    },
    searchBox() {
      return this.dataConfig.searchBox.tabVal;
    },
    checkboxInfo() {
      return this.dataConfig.checkboxInfo?.type || [];
    },
  },
  methods: {
    textChange(e) {
      let { current, source } = e.detail;
      if (source === 'autoplay' || source === 'touch') {
        this.searchVal = this.hotWords[e.detail.current]['val'];
      }
    },
    /*跳转为页面*/
    changeTab(item, index) {
      if (this.tabClick == index) return;
      this.tabClick = index; //设置导航点击了哪一个
      this.isLeft = index * this.isWidth + 16; //设置下划线位置
      this.isCategory = false;
      this.$emit("change", index);
    },
    /**显示全部分类*/
    showCategory() {
      this.isCategory = true;
    },
		// 获取当前页面路径（不含参数）
		getCurrentPagePath() {
			const pages = getCurrentPages();
			if (pages.length === 0) return '';
			return '/' + pages[pages.length - 1].route;
		},
		changeLocation(item) {
			this.locationVal = item.value;
			// 保存选择状态到本地存储
			uni.setStorageSync('locationVal', item.value);
			if(item.value == 1){
				clearSelectedZoneWithDiyTemplates();
			} else if(item.value == 2) {
				this.handleSelectFirstRecommendCircle();
			}
			// 无论切换到全国还是商圈，都重新加载diy数据
			this.$emit('reloadDiyData');
		},
		async handleSelectFirstRecommendCircle() {
			try {
				await this.$store.dispatch("getRecommendCircles", this.$store.state.location.location);
				const recommendCircles = this.$store.state.circle.recommendCircles;
				if (recommendCircles && recommendCircles.length > 0) {
					const firstCircle = recommendCircles[0];
					const circleMap = this.$store.state.circle.circleMap;
					const circleInfo = circleMap[firstCircle.circleId];
					if (circleInfo) {
						selectCircleWithDiyTemplates(circleInfo);
					}
				}
			} catch (error) {
				console.error('获取推荐商圈失败:', error);
			}
		}
  }
}
</script>

<style scoped lang="scss">
.my-main {
  transition: background-color 0.5s ease;
}


.mp-header {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;

  &.on {
    position: relative;
  }

  .serch-box {
    /* #ifdef MP */
    /* 小程序中不固定高度，让内容决定高度 */
    height: auto;
    /* #endif */
    /* #ifndef MP */
    height: 43px;
    /* #endif */
  }

  .logo {
    height: 60rpx;
    margin-right: 20rpx;

    .logo-img {
      width: 100%;
      height: 100%;
    }
  }

  .serch-wrapper {
    align-items: center;
    /* #ifdef MP */
    padding: 0 220rpx 0 30rpx;
    /* #endif */
    /* #ifndef MP */
    padding: 0 24rpx;
    /* #endif */
    height: 100%;
    &.on {
      /* #ifdef MP */
      padding: 0 220rpx 0 30rpx;
      /* #endif */
      /* #ifndef MP */
      padding: 0 30rpx;
      /* #endif */
    }
    // 当显示全国/商圈切换时，搜索框更宽（右侧padding减小）
    &.has-location-switch {
      /* #ifdef MP */
      padding: 0 24rpx;
      /* #endif */
    }

    .title,
    .map {
      font-size: 28rpx;
      color: #fff;
      margin-right: 24rpx;
    }

    .map {
      .iconfont {
        font-size: 26rpx;
      }

      .icon-ic_location4 {
        margin-right: 12rpx;
      }
    }

    &.on {
      padding: 0 30rpx;
    }
		.search-input {
			flex: 1;
			display: flex;
			min-width: 0;
			.button-set {
				color: #FFFFFF;
				flex-shrink: 0;
				.iconfont {
					margin-left: 22rpx;
					position: relative;
				}
				.icon-ic_daipingjia1 text {
					display: block;
					width: 12rpx;
					height: 12rpx;
					border-radius: 100%;
					background: #E93323;
					position: absolute;
					top: 0;
					right: 0;
				}
			}
		}
    .input,
    .uninput {
      flex: 1;
      min-width: 0;
      position: relative;
      display: flex;
      align-items: center;
      height: 60rpx;
      padding: 0 32rpx;
      border-radius: 30rpx;
      background: rgba(255, 255, 255, 0.3);
      font-size: 24rpx;
      color: #ffffff;

      .iconfont {
        position: absolute;
        right: 25rpx;
        top: 13rpx;
      }
    }
  }
}
.location-set {

	margin: 14rpx 30rpx;
	width: 172rpx;
	height: 54rpx;
	background: rgba(255,255,255,0.3);
	border-radius: 140rpx;
	.set-item {
		width: 80rpx;
		height: 42rpx;
		color: #fff;
		border-radius: 100rpx;
		display: flex;
		font-size: 24rpx;
		cursor: pointer;
		line-height: 42rpx;
		&.on {
			color: #333;
			background: #fff;
		}
	}
}

// 小程序垂直布局样式
.serch-wrapper-vertical {
  padding: 0 30rpx;
  .top-content {
    padding-top: 10rpx;
    .title,
    .logo {
      font-size: 28rpx;
      color: #fff;
      margin-right: 24rpx;
    }
    .logo {
      height: 60rpx;
      margin-right: 20rpx;
      .logo-img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .search-input {
    flex: 1;
    display: flex;
    min-width: 0;
    padding-top: 20rpx;
    .button-set {
      color: #FFFFFF;
      flex-shrink: 0;
      .iconfont {
        margin-left: 22rpx;
        position: relative;
        font-size: 36rpx;
      }
      .icon-ic_daipingjia1 text {
        display: block;
        width: 12rpx;
        height: 12rpx;
        border-radius: 100%;
        background: #E93323;
        position: absolute;
        top: 0;
        right: 0;
      }
    }
  }
  .input,
  .uninput {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    height: 60rpx;
    padding: 0 32rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.3);
    font-size: 26rpx;
    color: #ffffff;
    .iconfont {
      position: absolute;
      right: 25rpx;
      top: 13rpx;
    }
  }
}
.navTabBox {
  color: #ffffff;
  padding: 0 57rpx 0 30rpx;
  // z-index: 99;
  position: relative;
  // position: fixed;
  left: 0;
  width: 100%;
  // padding-top: 5px;

  &.on {
    position: relative;
  }

  .scroll-view {
    /* #ifdef MP */
    width: 640rpx;
    /* #endif */
    /* #ifndef MP */
    width: 666rpx;
    /* #endif */
    height: 82rpx;
    white-space: nowrap;
  }

  .click {
    color: white;
  }

  .longTab {
    // height: 34px;

    .longItem {
      display: inline-block;
      text-align: center;
      font-size: 28rpx;
      color: #ffffff;
      max-width: 160rpx;
      margin-right: 30rpx;
      position: relative;
      font-weight: 400;
      line-height: 82rpx;

      &:last-child {
        margin-right: 0;
      }

      &.click {
        font-weight: 600;
        font-size: 30rpx;
        color: #ffffff;

        &::after {
          content: '';
          transition: .5s;
          width: 20rpx;
          height: 2px;
          background: #FFFFFF;
          position: absolute;
          bottom: 14rpx;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }

  .category {
    position: absolute;
    right: 10rpx;
    top: 50%;
    width: 57rpx;
    height: 45rpx;
    padding-left: 11rpx;
    line-height: 45rpx;
    z-index: 10;
    transform: translateY(-50%);

    .iconfont {
      font-size: 35rpx;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 2rpx;
      height: 28rpx;
      background: linear-gradient(135deg, #ffffff 0%, rgba(216, 216, 216, 0) 100%);
      transform: translateY(-50%);
    }
  }

  &.isFixed {
    z-index: 10;
    position: fixed;
    left: 0;
    width: 100%;
  }
}


.tabNav {
  // padding-top: 10rpx;
}


.category_count {
  width: 100%;
  background: #fff;
  padding: 32rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border-radius: 0 0 24rpx 24rpx;

  .cate_count {
    .category_item {
      padding: 0 20rpx;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      word-wrap: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      font-size: 24rpx;
    }
  }
}

.swiperTxt {
  width: 300rpx;
  height: 100%;
  line-height: 58rpx;
  overflow: hidden;
}

.swiperTxt .text {
  width: 480rpx;
}

.swiperTxt .text .label {
  font-size: 20rpx;
  color: #ff4c48;
  width: 64rpx;
  height: 30rpx;
  border-radius: 40rpx;
  text-align: center;
  line-height: 28rpx;
  border: 2rpx solid #ff4947;
}

.swiperTxt .text .newsTitle {
  width: 300rpx;
  font-size: 24rpx;
  // color: #fff;
}

.swiperTxt .swiper {
  height: 100%;
}


.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 22;
}
</style>
