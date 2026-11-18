<template>
  <view class="instructions">
    <view class="agreement-count">
      <view class="setAgCount">
        <view class="title">{{ agrementTtile }}</view>
        <view class="agBox">
          <view class="content">
            <jyf-parser :html="protocol" ref="article" :tag-style="tagStyle"></jyf-parser>
          </view>
        </view>
      </view>
      <text class="icon iconfont icon-ic_close1" @click="$emit('update:showProtocol', false)"></text>
    </view>
  </view>
</template>

<script>
export default {
  name: "ProtocolPreview",
  props: {
    showProtocol: Boolean,
    agrementTtile: String,
    protocol: String
  },
  data() {
    return {
      tagStyle: {
        img: 'width:100%;display:block;',
        video: 'width:100%;'
      },
    }
  }
};
</script>

<style scoped lang="scss"></style>
