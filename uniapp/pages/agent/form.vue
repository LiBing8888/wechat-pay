<template>
  <BaseContainer custom-class="agent-application-wrapper">
    <view :style="[commonCssVars]">
      <view class="navbar-wrapper">
        <BaseNavBar lightText />
      </view>
      <view />
      <image :src="backgroundSrc" class="bg-image" />
      <view class="form-container">
        <view class="form-body">
          <view class="form-title">请填写以下信息</view>
          <BaseSystemForm v-if="formConfigReady" ref="form" :config="formConfig" />
          <view class="agree-wrapper">
            <radio :checked="agreeProtocol" @click="handleAgreeProtocol" />
            <text @click="handleAgreeProtocol">已阅读并同意</text>
            <text class="highlight" @click="handleShowProtocol">《代理入驻协议》</text>
          </view>
          <button class="submit-button flex-center" type="primary" :disabled="!agreeProtocol"
            @click="handleSubmit">提交申请</button>
        </view>
      </view>
      <navigator class="application-record flex-center fixed" hover-class="none" url="/pages/agent/records">
        申请记录
      </navigator>
    </view>

    <uni-popup ref="protocolPopup" type="center" v-if="protocol">
      <view class="protocol-popup-body flex">
        <view class="title">{{ protocol.title }}</view>
        <view class="flex-1 relative">
          <view class="absolute content">
            <scroll-view style="height: 100%;" scroll-y>
              <jyf-parser :html="protocol.circle_entry_agree" ref="article" :tag-style="tagStyle"></jyf-parser>
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
import { getAgentApplicationProtocol, submitAgentApplication, updateAgentApplication, getAgentApplicationInfo } from "@/api/circle";
import { configMap } from "@/utils";
import { getDefaultFormConfig } from "./config";
import { getSystemInfo } from "@/utils/device";
import { APPLY_TYPE } from "@/constants/apply";

export default {
  name: "agentApplicationForm",
  components: {
    BaseContainer,
    BaseNavBar,
    BaseSystemForm,
    "jyf-parser": parser
  },
  data() {
    return {
      defaultFormConfig: getDefaultFormConfig(),
      extendFormConfig: null,
      agreeProtocol: false,
      protocol: null,
      formConfigReady: false,
      formConfig: [],
      tagStyle: {
        img: 'width:100%;display:block;'
      },
      lastApplicationInfo: null, // 上次申请信息
      applicationId: 0, // 申请记录ID
    }
  },
  computed: {
    ...configMap({
      agent_application_form: ""
    }),
    commonCssVars() {
      return {
        '--kv-img-offset-y-size': `-${this.getImageOffsetSize()}px`
      };
    },
    backgroundSrc() {
      return `${HTTP_REQUEST_URL}/static/images/agent_application_bg.png`;
    },
    formParams() {
      // 生成表单所需要的参数集合
      return [
        this.agent_application_form,
        this.applicationId,
        this.lastApplicationInfo,
      ];
    }
  },
  onLoad(options) {
    this.applicationId = parseInt(options.id) || 0;
    this.handleGetAgentApplicationProtocol();
    this.applicationId && this.handleGetAgentApplicationInfo();

    // 监听表单所需参数变化，初始化表单
    this.$watch(
      () => this.formParams,
      this.handleInitForm,
      {
        immediate: true,
        deep: true
      }
    );
  },
  methods: {
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

      const extendFormRawConfig = this.agent_application_form?.value;
      if (!extendFormRawConfig) return;
      // 如果表单配置不存在，则拒绝初始化表单

      if (this.applicationId && !this.lastApplicationInfo) return;
      // 如果申请记录ID存在，但上次申请信息不存在，则拒绝初始化表单

      const formRawConfig = {
        ...this.defaultFormConfig,
        ...extendFormRawConfig,
      };

      // 合并默认表单和扩展表单配置
      this.formConfig = FormUtils.processFormConfig(formRawConfig, this.lastApplicationInfo);
      // 生成表单配置
      this.formConfigReady = true;
    },
    async handleGetAgentApplicationInfo() {
      // 获取上次申请信息
      uni.showLoading({
        mask: true
      });
      try {
        const res = await getAgentApplicationInfo(this.applicationId);
        uni.hideLoading();
        const defaultValues = res.data.extend;
        Object.values(this.defaultFormConfig).forEach(item => {
          defaultValues[item.titleConfig.value] = res.data[item.key];
        });
        this.lastApplicationInfo = defaultValues;
      } catch (error) {
        uni.hideLoading();
        this.$util.Tips({
          title: error,
          icon: "none"
        });
      }
    },
    async handleGetAgentApplicationProtocol() {
      // 获取代理入驻协议
      try {
        const res = await getAgentApplicationProtocol();
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
      payload.type = APPLY_TYPE.AGENT;

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
            url: `/pages/agent/detail?id=${this.applicationId}`
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
.agent-application-wrapper {
  --kv-img-height: 358rpx;
  display: flow-root;
  background: linear-gradient(180deg, #FE7015 358rpx, #EB3B26 100%);
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
	backdrop-filter: blur(8px); // 添加背景模糊
	-webkit-backdrop-filter: blur(8px); // iOS兼容
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
