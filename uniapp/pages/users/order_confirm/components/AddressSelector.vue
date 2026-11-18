<template>
  <view>
    <view class="allAddress boder-24" @click="handlePickerAddress">
      <view class='address acea-row row-between-wrapper'>
        <view class='addressCon' v-if="addressInfo">
          <view class='name'>{{ addressInfo.real_name }}
            <text class='phone'>{{ addressInfo.phone }}</text>
          </view>
          <view>
            <text class='default' v-if="addressInfo.is_default">[默认]</text>{{ addressInfo.province }}{{ addressInfo.city
            }}{{ addressInfo.district }}{{ addressInfo.street
              || '' }}{{ addressInfo.detail }}
          </view>
        </view>
        <navigator v-else :url="addAddressUrl" hover-class="none" class='addressCon'>
          <view class='setaddress'>设置收货地址</view>
        </navigator>
        <view class='iconfont icon-ic_rightarrow'></view>
      </view>
      <view class='line'>
        <image :src="`${domain}/static/images/line.jpg`"></image>
      </view>
    </view>

    <AddressWindow ref="addressWindow" autoLoad :address="addressWindowProps" :pagesUrl="addAddressUrl"
      @OnChangeAddress="handleAddressConfirm" @changeClose="handleCloseAddressWindow" />
  </view>
</template>

<script>
import { HTTP_REQUEST_URL } from '@/config/app';
import AddressWindow from "@/components/addressWindow";
import {
  getAddressDetail
} from '@/api/user.js';
import { mapState } from "vuex";

export default {
  name: 'AddressSelector',
  props: {
    cartId: String,
    addressId: {
      type: Number,
      default: 0
    },
    couponId: {
      type: Number,
      default: 0
    }
  },
  components: {
    AddressWindow
  },
  data() {
    return {
      addressInfo: null,
      addressWindowVisible: false,
      domain: HTTP_REQUEST_URL
    };
  },
  computed: {
    ...mapState({
      addressList: state => state.address.addressList
    }),
    addressWindowProps() {
      return {
        address: this.addressWindowVisible, // 弹窗是否可见
        addressId: this.addressId, // 当前选择的地址ID
      };
    },

    // 新增地址的链接
    addAddressUrl() {
      return `/pages/users/user_address/index?cartId=${this.cartId}&couponId=${this.couponId}`;
    }
  },
  watch: {
    addressId: {
      handler(addressId) {
        addressId && this.getAddressInfo();
      },
      immediate: true
    },
    addressList() {
      this.handleInitAddress();
    }
  },
  created() {
    this.handleLoadAddressList();
  },
  methods: {
    handleInitAddress() {
      // 如果没有 addressId，则需要选择默认地址
      const addressList = this.addressList;
      if (!this.addressId && addressList.length) {
        const defaultAddress = addressList.find(item => item.is_default) || addressList[0];
        this.$emit("update:addressId", defaultAddress.address_id);
      } else {
        this.$emit("loaded");
      }
    },
    // 加载地址列表
    async handleLoadAddressList() {
      try {
        await this.$store.dispatch('refreshAddressList', { force: true });
      } catch (error) {
        this.$util.Tips({
          title: error
        });
      }
    },
    // 获取收货地址详细信息
    async getAddressInfo() {
      let addressInfo = this.addressList.find(item => item.address_id === this.addressId);
      if (!addressInfo) {
        try {
          const res = await getAddressDetail(this.addressId);
          addressInfo = res.data;
        } catch (error) {
          this.$util.Tips({
            title: error
          });
        }
      }
      if (!addressInfo) return;
      this.addressInfo = addressInfo;
    },
    handleAddressConfirm(addressId) {
      this.$emit("update:addressId", addressId);
      this.handleCloseAddressWindow();
    },
    handleCloseAddressWindow() {
      this.addressWindowVisible = false;
    },
    handlePickerAddress() {
      if (this.addressList.length) {
        this.addressWindowVisible = true;
      } else {
        uni.navigateTo({
          url: this.addAddressUrl
        });
      }
    }
  }
}
</script>

<style scoped lang="scss">
.allAddress {
  width: 100%;
  background-color: #fff;
  position: relative;
}

.nav {
  width: 710rpx;
  margin: 0 auto;


  .item {
    width: 355rpx;


    &.on {
      position: relative;
      width: 250rpx;


      &::before {
        position: absolute;
        bottom: 0;
        content: "快递配送";
        font-size: 28rpx;
        display: block;
        height: 0;
        width: 336rpx;
        border-width: 0 20rpx 80rpx 0;
        border-style: none solid solid;
        border-color: transparent transparent #fff;
        z-index: 2;
        border-radius: 7rpx 30rpx 0 0;
        text-align: center;
        line-height: 80rpx;
      }
    }

    &:nth-of-type(2).on::before {
      content: '到店自提';
      border-width: 0 0 80rpx 20rpx;
      border-radius: 30rpx 7rpx 0 0;
    }

    &.on2 {
      position: relative;

      &::before {
        position: absolute;
        bottom: 0;
        content: '到店自提';
        font-size: 28rpx;
        display: block;
        height: 0;
        width: 400rpx;
        border-width: 0 0 60rpx 60rpx;
        border-style: none solid solid;
        border-color: transparent transparent #f7c1bd;
        border-radius: 40rpx 6rpx 0 0;
        text-align: center;
        line-height: 60rpx;
      }
    }

    &:nth-of-type(1).on2::before {
      content: "快递配送";
      border-width: 0 60rpx 60rpx 0;
      border-radius: 6rpx 40rpx 0 0;
    }
  }

}

.address {
  margin: 0 auto;
  padding: 28rpx 30rpx;
  box-sizing: border-box;

  .addressCon {
    width: 610rpx;
    font-size: 26rpx;
    color: #666;


    .name {
      font-size: 30rpx;
      color: #282828;
      font-weight: bold;
      margin-bottom: 10rpx;

      .phone {
        margin-left: 50rpx;
      }
    }

    .default {
      margin-right: 12rpx;
      color: var(--view-theme);
    }

    .setaddress {
      color: #333;
      font-size: 28rpx;
    }
  }

  .iconfont {
    font-size: 35rpx;
    color: #707070;
  }
}

.line {
  margin: 0 auto;
  position: absolute;
  left: 2%;
  bottom: 0;
  width: 96%;
  height: 3rpx;

  image {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
