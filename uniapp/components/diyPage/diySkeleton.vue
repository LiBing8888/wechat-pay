<template>
  <view class="skeleton">
    <!-- 顶部搜索栏 -->
    <view class="header">
      <view class="location shimmer"></view>
      <view class="search shimmer"></view>
    </view>

    <!-- 导航 tab -->
    <view class="tabs">
      <view class="tab shimmer" v-for="i of 4" :key="i"></view>
    </view>

    <!-- 轮播图 -->
    <view class="banner shimmer"></view>

    <!-- 宫格图标区域 -->
    <view class="grid-card">
      <view class="grid-item" v-for="i of 10" :key="i">
        <view class="icon shimmer"></view>
        <view class="text shimmer"></view>
      </view>
    </view>

    <!-- 公告栏 -->
    <view class="notice shimmer"></view>

    <!-- 排行榜卡片 -->
    <view class="rank">
      <view class="rank-title shimmer"></view>
      <view class="rank-card shimmer" v-for="i of 3" :key="i"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'diySkeleton'
}
</script>

<style scoped lang="scss">
.skeleton {
  padding: 10px;
  padding-top: var(--menu-btn-top);
}

/* shimmer 动画 */
.shimmer {
  background: linear-gradient(90deg,
      #eee 25%,
      #f5f5f5 37%,
      #eee 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

/* 顶部栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.location {
  width: 60px;
  margin-right: 20px;
  height: 30px;
  border-radius: 15px;
}

.search {
  flex: 1;
  height: 30px;
  border-radius: 15px;
  margin-right: calc(var(--menu-btn-width) + 10px);
}

/* tabs */
.tabs {
  display: flex;
  gap: 20px;
  margin: 10px 0;
}

.tab {
  width: 60px;
  height: 16px;
  border-radius: 10px;
}

/* banner */
.banner {
  width: 100%;
  height: 160px;
  border-radius: 14px;
  margin: 10px 0 20px;
}

/* 宫格图标 */
.grid-card {
  background: #fff;
  padding: 15px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px 10px;
  margin-bottom: 20px;
}

.grid-item {
  text-align: center;
}

.icon {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border-radius: 50%;
}

.text {
  width: 40px;
  height: 12px;
  margin: 6px auto 0;
  border-radius: 6px;
}

/* 公告栏 */
.notice {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  margin-bottom: 20px;
}

/* 排行榜 */
.rank-title {
  width: 100px;
  height: 18px;
  border-radius: 10px;
  margin: 0 0 15px 5px;
}

.rank-card {
  width: 100%;
  height: 110px;
  border-radius: 14px;
  margin-bottom: 15px;
}
</style>
