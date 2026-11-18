<template>
  <!--收货人信息-->
  <view class="wrapper virtual_form bg-f boder-24">
    <form report-submit='true'>
      <view class='item acea-row row-between-wrapper'>
        <view>收货人姓名<text class="item-require">*</text></view>
        <view class='discount'>
          <input type="text" :value="contactInfo.real_name" placeholder="请填写收货人姓名" placeholder-class='placeholder'
            @input="handleContactInfoChange('real_name', $event)" />
        </view>
      </view>
      <view class='item acea-row row-between-wrapper'>
        <view>收货人电话<text class="item-require">*</text></view>
        <view class='discount'>
          <input type="number" :value="contactInfo.phone" placeholder="请填写收货人电话" placeholder-class='placeholder'
            @input="handleContactInfoChange('phone', $event)" />
        </view>
      </view>
    </form>
  </view>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SelfTakeContact",
  props: {
    contactInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapState({
      addressList: state => state.address.addressList
    })
  },
  created() {
    this.handleLoadAddressList();
  },
  methods: {
    // 加载地址列表，并设置默认联系人信息
    async handleLoadAddressList() {
      try {
        await this.$store.dispatch('refreshAddressList');
        if (this.addressList.length) {
					uni.removeStorageSync('selfTakeContactInfo');
          const defaultAddress = this.addressList.find(item => item.is_default) || this.addressList[0];	
					const payload = {
            real_name: defaultAddress.real_name,
            phone: defaultAddress.phone,
          };
          this.$emit("update:contactInfo", payload);
        }else {
					const payload = uni.getStorageSync('selfTakeContactInfo')
					this.$emit("update:contactInfo", payload);
				}
      } catch (error) {
        this.$util.Tips({
          title: error
        });
      }
    },
    handleContactInfoChange(field, event) {
      this.$emit("update:contactInfo", {
        ...this.contactInfo,
        [field]: event.detail.value
      });
    }
  }
}
</script>
<style lang="scss">
	.discount {
		text-align: right;
	}
</style>