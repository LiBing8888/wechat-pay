<!-- 商品分类页面，水平方向滚动分类列表组件，包含图片和文字 -->
<template>
  <view class="horizontal-img-cate-list-wrapper" :class="{ 'collapsed': isCollapsed }">
    <view class="scroll-wrapper">
      <scroll-view class="horizontal-img-cate-list" scroll-x :scroll-into-view="scrollIntoViewId" scroll-with-animation>
        <view class="cate-item-list flex flex-no-wrap">
          <view class="cate-item line1" v-for="(item, index) of list" :key="item.store_category_id"
            :class="{ 'active': activeIndex === index }" @click="handleToggleCategory(index)"
            :id="`horizontal-category-${index}`">
            <view class="cate-item-img-box">
              <image :src="item.pic" mode="aspectFill" class="cate-item-img" />
            </view>
            <view class="cate-item-name flex-center line1">{{ item.cate_name }}</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="show-all-btn flex-center flex-col relative" @click="handleOpenPanel">
      <template v-if="!isCollapsed">
        <view>全</view>
        <view>部</view>
      </template>
      <image :src="`${domain}/static/images/all_pic.png`" mode="aspectFill" class="all-pic" />
    </view>

    <view class="all-category-wrapper fixed" v-if="allCategoryVisible" @click.self="handleClosePanel">
      <view class="all-category-content rd-b-32rpx">
        <TopSearch theme="light" />
        <view class="cate-item-list flex flex-wrap">
          <view class="cate-item line1" v-for="(item, index) of list" :key="item.store_category_id"
            :class="{ 'active': activeIndex === index }" @click="handleToggleCategoryOnPanel(index)"
            :id="`horizontal-category-${index}`">
            <view class="cate-item-img-box">
              <image :src="item.pic" mode="aspectFill" class="cate-item-img" />
            </view>
            <view class="cate-item-name flex-center line1">{{ item.cate_name }}</view>
          </view>
        </view>
        <view class="flex-center">
          <view class="close-btn flex-center text--w111-999 fs-24" @click="handleClosePanel">
            点击收起
            <view class="iconfont icon-ic_uparrow pl-4"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TopSearch from '@/components/goodsCate/top-search.vue';
import { HTTP_REQUEST_URL } from '@/config/app';
export default {
  name: "HorizontalImgCateList",
  components: {
    TopSearch
  },
  props: {
    isCollapsed: { // 是否折叠
      type: Boolean,
      default: false
    },
    list: Array, // 分类列表
    activeIndex: Number // 当前选中的分类索引
  },
  data() {
    return {
			domain:HTTP_REQUEST_URL,
      allCategoryVisible: false,
      scrollIntoViewId: ""
    }
  },
  methods: {
    handleToggleCategoryOnPanel(index) {
      this.handleClosePanel();
      this.$emit("toggle", index);
      this.scrollIntoViewId = `horizontal-category-${index}`;
    },
    handleClosePanel() {
      this.allCategoryVisible = false;
    },
    handleOpenPanel() {
      this.allCategoryVisible = true;
    },
    handleToggleCategory(index) {
      this.$emit("toggle", index);
    }
  }
}
</script>

<style scoped lang="scss">
.horizontal-img-cate-list-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #DDDDDD;
  --collapse-time: 0.2s; // 折叠动画时间

  &.collapsed {
    .scroll-wrapper .cate-item-img-box {
      padding-top: 0;
      padding-bottom: 0;
      margin-bottom: 0;
      border-color: transparent !important;
      height: 0 !important;
    }

    .show-all-btn {
      height: 80rpx;
    }
  }
}

.scroll-wrapper {
  flex: 1;
  overflow: hidden;
}

.cate-item-list {
  display: flex;
  gap: 8rpx;
  padding-inline: 20rpx;
}

.cate-item {
  width: 120rpx;
  flex-shrink: 0;

  .cate-item-img-box {
    overflow: hidden;
    transition: all var(--collapse-time) ease-in-out;

    width: 104rpx;
    margin: 0 auto 8rpx;
    height: 104rpx;
    border: 3rpx solid transparent;
    border-radius: 50%;
    padding: 6rpx;

    .cate-item-img {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      border-radius: 50%;
      display: block;
    }
  }

  .cate-item-name {
    width: 100%;
    height: 40rpx;
    border-radius: 22rpx;
    font-size: 24rpx;
    color: #333333;
    line-height: 34rpx;
  }

  &.active {
    .cate-item-img-box {
      border-color: var(--view-theme);
    }

    .cate-item-name {
      color: #fff;
      background-image: linear-gradient(to right, var(--view-theme) 0%, var(--view-assist) 100%);
    }
  }
}

.show-all-btn {
  width: 72rpx;
  height: 200rpx;
  transition: all var(--collapse-time) ease-in-out;
  background-color: #fff;
  font-size: 24rpx;
  color: #333333;
  line-height: 34rpx;

  .all-pic {
    width: 28rpx;
    height: 28rpx;
    margin-top: 8rpx;
  }

  &::before {
    content: '';
    position: absolute;
    width: 22rpx;
    height: 100%;
    top: 0;
    left: -11rpx;
    background: radial-gradient(59% 59% at 81% 49%, rgba(0, 0, 0, 0.082) 0%, rgba(0, 0, 0, 0) 100%);
  }
}

.all-category-wrapper {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .all-category-content {
    background-color: #fff;
  }

  .cate-item-list {
    padding: 24rpx 20rpx;
  }

  .close-btn {
    height: 80rpx;
  }
}
</style>
