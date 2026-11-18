<template>
  <view v-if="dataConfig.effectConfig.tabVal" class="page-foot-comp"
    :class="{ 'is-float': dataConfig.navConfig.tabVal === 1 }" :style="[compStyle]">
    <view class="nav-item" v-for="item of menuList" :key="item.link" :class="{ active: item.isActive }"
      @click="handleNavClick(item)">
      <template v-if="dataConfig.navStyleConfig.tabVal !== 1">
        <image class="nav-icon" :src="item.icon" mode="aspectFit" />
      </template>
      <view v-if="dataConfig.navStyleConfig.tabVal !== 2">{{ item.name }}</view>

      <view v-if="isCartLink(item.link) && cartNum" class="cart-count-dot">{{ cartNum > 99 ? 99 : cartNum }}</view>
    </view>
  </view>
</template>

<script>
import { diyUtil } from "@/utils/diy.js";
import { mapGetters } from "vuex";
import { mergeUrlQuery, parseUrl } from "@/utils/url";
import { TABBAR_PAGE_PATHS, MICRO_PAGE_PATH } from "@/constants/pages";

export default {
  name: "pageFoot",
  props: {
    dataConfig: Object
  },
  inject: {
    parentMerId: {
      default: 0
    },
    parentDiyId: {
      default: 0
    }
  },
  computed: {
    ...mapGetters(["cartNum"]),
    menuList() {
      const searchObject = {};

      if (this.parentMerId !== 0) {
        searchObject.id = this.parentMerId;
      }
      if (this.parentDiyId !== 0) {
        searchObject.diyId = this.parentDiyId;
      }

      // 判断链接是否是微页面链接
      const isMicroPageLink = link => link.startsWith(MICRO_PAGE_PATH);

      const processLink = link => {
        // 如果链接是微页面，则只需要追加商户 id
        if (isMicroPageLink(link) && this.parentMerId) {
          return mergeUrlQuery(link, {
            mer_id: this.parentMerId,
          });
        } else {
          // 追加收集的其他参数，包含商户 id 和 diy id
          return mergeUrlQuery(link, searchObject);
        }
      }

      const getIcon = (item, isActive) => {
        const icon = isActive ? item.imgList[0] : item.imgList[1];
        return Array.isArray(icon) ? icon[0] : icon;
      }

      const currentRoute = this.currentRoute;

      // 对于微页面链接，除了路径匹配外，还需要判断链接中的 id 参数是否与当前页面的 id 参数一致
      const isEqualMicroPageParams = query => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        return query?.id === currentPage?.options.id;
      }

      return this.dataConfig.menuList.map(item => {
        const { path, query } = parseUrl(item.link);

        // 如果是微页面链接，则需要同时满足路径匹配和 id 参数匹配；否则只需要路径匹配
        const isActive = isMicroPageLink(path) ? isEqualMicroPageParams(query) : currentRoute.startsWith(path);

        // 对链接进行处理，追加必要的参数
        const link = processLink(item.link);
        return {
          ...item,
          icon: getIcon(item, isActive),
          isActive,
          link
        };
      });
    },
    compStyle() {
      const {
        toneConfig,
        txtColor,
        activeTxtColor,
        bgColor,
        bgColor2,
        topConfig,
        bottomConfig,
        prConfig,
        mbConfig,
        fillet,
        navConfig
      } = this.dataConfig;

      const styles = {
        "--bg-color": bgColor.color[0].item,
        "--pd-top": topConfig.val + "px",
        "--pd-bottom": bottomConfig.val + "px"
      };



      if (navConfig.tabVal === 1) {
        // 悬浮 tabbar 样式
        Object.assign(styles, {
          "--bg-color": bgColor2.color[0].item,
          "--pd-inline": prConfig.val + "px",
          "--mr-bottom": mbConfig.val + "px",
          "--border-radius": diyUtil.buildBorderRadius(fillet),
        });
      }

      if (toneConfig.tabVal === 1) {
        styles["--text-color"] = txtColor.color[0].item;
        styles["--active-text-color"] = activeTxtColor.color[0].item;
      }


      return styles;
    },
  },
  data() {
    return {
      currentRoute: ""
    };
  },
  created() {
    // #ifdef MP
    // 微信小程序环境下 getCurrentPages 存在延迟，因此使用 onAppRouteDone 监听路由变化
    wx.onAppRouteDone(this.updateCurrentRoute);
    // #endif
  },
  beforeDestroy() {
    // #ifdef MP
    wx.offAppRouteDone(this.updateCurrentRoute);
    // #endif
  },
  mounted() {
    this.updateCurrentRoute();
    this.handleTabBarVisibility();
  },
  watch: {
    'dataConfig.effectConfig.tabVal': function(val) {
      this.handleTabBarVisibility();
    }
  },
  methods: {
    // 处理原生tabBar显隐
    handleTabBarVisibility() {
      // #ifdef MP
      // tabVal === 0 表示使用原生tabbar
      if (this.dataConfig.effectConfig.tabVal === 0) {
        // 使用原生tabbar，显示原生tabbar
        uni.showTabBar({
          animation: false
        });
      } else {
        // 自定义tabbar开启时，隐藏原生tabbar
        uni.hideTabBar({ 
          animation: false,
          fail: () => {} 
        });
      }
      // #endif
    },
    // 是否购物车页面链接
    isCartLink(link) {
      const cartPageLink = "/pages/order_addcart/order_addcart";
      return link.includes(cartPageLink);
    },
    // 更新当前路由信息
    updateCurrentRoute() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      this.currentRoute = "/" + currentPage.route;
    },
    // 处理导航点击事件
    handleNavClick(item) {
      if (item.isActive) return;

      // 默认使用 redirectTo 跳转
      let func = uni.redirectTo;
      const isTabbarPage = TABBAR_PAGE_PATHS.some(path => item.link.startsWith(path));
      const isMicroPage = item.link.startsWith(MICRO_PAGE_PATH);

      if (isTabbarPage) {
        // 如果是 tabbar 页面，则使用 switchTab 跳转
        func = uni.switchTab;
      } else if (isMicroPage) {
        // 如果是微页面，则使用 navigateTo 跳转
        func = uni.navigateTo;
      }

      func({
        url: item.link
      })
    }
  }
}
</script>

<style scoped lang="scss">
.page-foot-comp {
  position: fixed;
  left: var(--pd-inline, 0px);
  right: var(--pd-inline, 0px);
  bottom: calc(var(--mr-bottom, 0px));
  color: var(--text-color, #282828);
  background-color: var(--bg-color);
  padding-top: var(--pd-top);
  padding-bottom: calc(var(--pd-bottom) + var(--safe-area-inset-bottom));
  font-size: 20rpx;
  display: flex;
  border-radius: var(--border-radius, 0px);
  z-index: 900;

  &.is-float {
    backdrop-filter: blur(10px);
    padding-bottom: var(--pd-bottom, 0px);
    bottom: var(--mr-bottom, 0px);
    box-shadow: 0 0 2px 0px rgba(0, 0, 0, 0.1);
  }

  .nav-item {
    height: 100rpx;
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    position: relative;

    &.active {
      color: var(--active-text-color, #f62c2c);
    }

    .cart-count-dot {
      position: absolute;
      height: 16px;
      min-width: 16px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
      background-color: var(--view-theme);
      border-radius: 8px;
      top: 2px;
      left: 50%;
      transform: translateX(20%);
      color: #fff;
    }
  }

  .nav-icon {
    width: 46rpx;
    height: 46rpx;
    margin-bottom: 6rpx;
  }
}
</style>
