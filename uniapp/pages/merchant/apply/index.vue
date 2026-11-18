<template>
  <BaseContainer :custom-class="wrapperClass">
    <view :style="[commonCssVars]" :class="{ 'custom-bg': !isDefaultBg }">
      <view class="navbar-wrapper">
        <BaseNavBar lightText />
      </view>
      <view />
      <image :src="backgroundSrc" class="bg-image" v-if="isDefaultBg" />
      <view v-else class="bg-image"></view>
      <view class="form-container">
        <view class="form-body">
          <view class="form-title">请填写以下信息</view>
          <BaseSystemForm v-if="formConfigReady" ref="form" :config="formConfig" />
          
          <view class="agree-wrapper">
            <radio :checked="agreeProtocol" @click="handleAgreeProtocol" />
            <text @click="handleAgreeProtocol">已阅读并同意</text>
            <text class="highlight" @click="handleShowProtocol">《商户入驻协议》</text>
          </view>
          <button class="submit-button flex-center" type="primary" :disabled="!agreeProtocol"
            @click="handleSubmit">提交申请</button>
        </view>
      </view>
      <navigator class="application-record flex-center fixed" hover-class="none" url="/pages/merchant/apply/records">
        申请记录
      </navigator>
    </view>

    <uni-popup ref="protocolPopup" type="center" v-if="protocol">
      <view class="protocol-popup-body flex">
        <view class="title">{{ protocol.title }}</view>
        <view class="flex-1 relative">
          <view class="absolute content">
            <scroll-view style="height: 100%;" scroll-y>
              <jyf-parser :html="protocol.business_entry_agree" ref="article" :tag-style="tagStyle"></jyf-parser>
            </scroll-view>
          </view>
        </view>
        <button class="close-btn flex-center" type="primary" @click="handleCloseProtocol">知道了</button>
      </view>
    </uni-popup>
  </BaseContainer>
</template>

<script>
import BaseContainer from "@/components/common/base_container.vue";
import BaseNavBar from "@/components/common/base_nav_bar.vue";
import BaseSystemForm from "@/components/common/base_system_form.vue";
import { HTTP_REQUEST_URL } from "@/config/app";
import parser from "@/components/jyf-parser/jyf-parser";
import { FormUtils } from "@/utils/form";
import { getMerchantApplicationProtocol } from "@/api/merchant";
import { submitAgentApplication, updateAgentApplication, getAgentApplicationInfo } from "@/api/circle";
import { configMap } from "@/utils";
import { getDefaultFormConfig } from "./config";
import { getSystemInfo } from "@/utils/device";
import { APPLY_TYPE } from "@/constants/apply";

export default {
  name: "merchantApplicationForm",
  components: {
    BaseContainer,
    BaseNavBar,
    BaseSystemForm,
    "jyf-parser": parser
  },
  data() {
    return {
      defaultFormConfig: null,
      extendFormConfig: null,
      agreeProtocol: false,
      protocol: null,
      formConfigReady: false,
      formConfig: [],
      tagStyle: {
        img: 'width:100%;display:block;'
      },
      lastApplicationInfo: null, // 上次申请信息
      applicationId: 0 // 申请记录ID
    }
  },
  computed: {
    ...configMap({
      business_application_form: "",
      business_background_image: ""
    }),
    commonCssVars() {
      const vars = {
        '--kv-img-offset-y-size': `-${this.getImageOffsetSize()}px`
      };

      if (!this.isDefaultBg) {
        vars['--custom-bg-src'] = `url(${this.business_background_image})`;
      }

      return vars;
    },
    backgroundSrc() {
      return `${HTTP_REQUEST_URL}/static/images/merchantBg.png`;
    },
    isDefaultBg() {
      // 是否使用系统默认背景图片
      return !this.business_background_image;
    },
    wrapperClass() {
      const classList = [
        `mer-application-wrapper`
      ];

      if (this.isDefaultBg) {
        classList.push('is-default-bg');
      }

      return classList.join(" ");
    }
  },
  onLoad(options) {
    this.applicationId = parseInt(options.id) || 0;
    this.handleGetMerApplicationProtocol();

    this.init();
  },
  methods: {
    async init() {
      uni.showLoading({
        mask: true
      });
      try {
        const defaultFormConfig = await getDefaultFormConfig();
        this.defaultFormConfig = defaultFormConfig;
        console.log(this.defaultFormConfig)
        
        if (this.applicationId) {
          await this.handleGetMerApplicationInfo();
        }
        uni.hideLoading();
        this.handleInitForm();
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: "none"
        });

        return;
      }
    },
    getImageOffsetSize() {
      const { statusBarHeight } = getSystemInfo();
      const minSize = 44;
      if (statusBarHeight < minSize) {
        // 如果状态栏高度小于最小值，则需要将背景图片向上偏移，偏移量为最小值减去状态栏高度
        return minSize - statusBarHeight;
      }
      return 0;
    },
    handleInitForm() {
      if (this.formConfigReady) return;
      // 如果表单已经初始化，则拒绝初始化表单

      const extendFormRawConfig = this.business_application_form?.value;
      const formRawConfig = {
        ...this.defaultFormConfig,
        ...extendFormRawConfig,
      };

      // 设置平台分类最大选择数量
      const categoryNumberCount = this.$store.state.app.globalData.category_number_count;
      if (formRawConfig[6] && formRawConfig[6].type === 'platformCategory') {
        formRawConfig[6].maxCount = categoryNumberCount && parseInt(categoryNumberCount) > 0 ? parseInt(categoryNumberCount) : 0;
      }

      // 合并默认表单和扩展表单配置
      this.formConfig = FormUtils.processFormConfig(formRawConfig, this.lastApplicationInfo);
      // 生成表单配置
      this.formConfigReady = true;
    },
    async handleGetMerApplicationInfo() {
      // 获取上次申请信息
      try {
        const res = await getAgentApplicationInfo(this.applicationId);
        const defaultValues = res.data.extend;
        Object.values(this.defaultFormConfig).forEach(item => {
          const key = item.titleConfig?.value || item.label || item.key;
          if (key && res.data[item.key] !== null && res.data[item.key] !== undefined && res.data[item.key] !== "") {
            defaultValues[key] = res.data[item.key];
          }
        });
        this.lastApplicationInfo = defaultValues;

      } catch (error) {
        this.$util.Tips({
          title: error,
          icon: "none"
        });
      }
    },
    async handleGetMerApplicationProtocol() {
      // 获取商户入驻协议
      try {
        const res = await getMerchantApplicationProtocol();
        this.protocol = res.data;
      } catch (error) {
        this.$util.Tips({
          title: error,
          icon: "none"
        });
      }
    },
    handleCloseProtocol() {
      this.$refs.protocolPopup?.close();
    },
    handleShowProtocol() {
      this.$refs.protocolPopup?.open();
    },
    async handleSubmit() {
      const formData = this.$refs.form.getData();
      if (!formData) return;

      const extend = {};
      const payload = {};

      // 默认表单数据项 key 集合
      const defaultFormFields = new Set(
        Object.values(this.defaultFormConfig).map(item => item.key)
      );

      for (const [key, fieldInfo] of Object.entries(formData)) {
        if (defaultFormFields.has(key)) {
          // 如果该数据属于默认表单数据项，则将其添加到 payload 中
          payload[key] = fieldInfo.value;
        } else {
          // 否则将其添加到 extend 中
          extend[key] = fieldInfo.value;
        }
      }

      payload.extend = extend;
      payload.type = APPLY_TYPE.MERCHANT;

      uni.showLoading({
        title: "提交中...",
        mask: true
      });

      try {
        const task = this.applicationId ? updateAgentApplication(this.applicationId, payload) : submitAgentApplication(payload);
        const res = await task;
        uni.hideLoading();
        this.$util.Tips({
          title: res.message,
          icon: "success"
        });

        if (res.data?.circle_agent_id) {
          this.applicationId = res.data.circle_agent_id;
        }

        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/merchant/apply/detail?id=${this.applicationId}`
          });
        }, 1000);
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: "none"
        });
      }

    },
    handleAgreeProtocol() {
      this.agreeProtocol = !this.agreeProtocol;
    }
  }
}
</script>
<style lang="scss">
.mer-application-wrapper {
  --kv-img-height: 358rpx;
  display: flow-root;

  &.is-default-bg {
    background: linear-gradient(180deg, #FE7015 358rpx, #EB3B26 100%);
  }
}
</style>
<style scoped lang="scss">
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.bg-image {
  width: 100%;
  height: var(--kv-img-height);
  display: block;
  margin-top: var(--kv-img-offset-y-size);
}

.custom-bg {
  background: var(--custom-bg-src) repeat top center / contain fixed;
}

.form-container {
  --offset-y-size: 14rpx;
  padding: 0 20rpx var(--safe-area-inset-bottom-default);
  position: relative;
  margin-top: calc(var(--offset-y-size) * -1);
}

.form-title {
  font-weight: 500;
  font-size: 30rpx;
  color: #333333;
  line-height: 42rpx;
  margin-bottom: 30rpx;
}

.form-body {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx 40rpx;
}

.application-record {
  width: 124rpx;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.15);
  border-top-left-radius: 24rpx;
  border-bottom-left-radius: 24rpx;
  right: 0;
  top: 280rpx;
  font-size: 24rpx;
  color: #fff;
  line-height: 34rpx;
  margin-top: var(--kv-img-offset-y-size);
}

.agree-wrapper {
  color: #999999;
  line-height: 28rpx;
  margin-top: 20rpx;
  font-size: 24rpx;

  radio {
    transform: scale(0.8);
    transform-origin: left center;
    margin-right: 0;
  }

  ::v-deep .uni-radio-input,
  ::v-deep .wx-radio-input {
    margin-right: 8rpx;
  }

  .highlight {
    color: #E93323;
  }
}

.submit-button {
  margin-top: 40rpx;
  width: 100%;
  height: 88rpx;
  background-color: #E93323;
  border-radius: 50rpx;
  font-weight: 500;
  font-size: 28rpx;
  color: #FFFFFF;
  line-height: 40rpx;

  &[disabled] {
    background-color: rgba($color: #E93323, $alpha: 0.5);
  }
}

.protocol-popup-body {
  width: 600rpx;
  height: 946rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx 40rpx 32rpx;
  flex-flow: column nowrap;

  .title {
    font-weight: 500;
    font-size: 32rpx;
    color: #333333;
    line-height: 44rpx;
    text-align: center;
    margin-bottom: 24rpx;
  }

  .content {
    inset: 0;
    overflow: auto;
  }

  .close-btn {
    margin-top: 32rpx;
    width: 520rpx;
    height: 72rpx;
    background: #E93323;
    border-radius: 50rpx;
    font-weight: 500;
    font-size: 26rpx;
    color: #FFFFFF;
    line-height: 36rpx;
  }
}
</style>
