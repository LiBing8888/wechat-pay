<template>
	<BaseContainer>
		<BaseNavBar title="审核进度" />
		<template v-if="applicationInfo">
			<view class="card progress-detail" v-if="applicationInfo">
				<view class="progress-bar flex">
					<view class="progress-item flex-1" :class="{ checked: item.checked, cancelled: isCancelled }"
						:data-index="index" v-for="(item, index) of progressStatusList" :key="item.label">
						<view class="progress-item_icon flex-center">
							<view class="iconfont icon-ic_complete" v-if="item.checked"></view>
						</view>
						<view class="progress-item_label">{{ item.label }}</view>
						<view class="progress-item_time" v-if="item.time">{{ item.time }}</view>
					</view>
				</view>
				<view class="divider-line relative" />
				<image :src="statusImage" class="status-image" />
				<view class="status-text">{{ statusText }}</view>
				<view class="status-desc">{{ statusDesc }}</view>
				<button class="btn flex-center" v-for="(btn, index) of btnList" :key="btn.text" @click="handleBtnClick(index)">
					{{ btn.text }}
				</button>
			</view>

			<!-- 已通过 -->
			<view class="card login-info-card" v-if="isApproved">
				<view class="login-info-item flex justify-between">
					<view class="item-label">后台网址</view>
					<view class="item-value flex-1">{{ loginUrl }}</view>
					<button @click="handleCopyContent(loginUrl)" class="copy-btn flex-center">复制</button>
				</view>
				<view class="login-info-item flex justify-between">
					<view class="item-label">后台账号</view>
					<view class="item-value">{{ applicationInfo.phone }}</view>
				</view>
				<view class="login-info-item flex justify-between">
					<view class="item-label">登录密码</view>
					<view class="item-value flex items-center">
						000000
						<button @click="handleCopyContent('000000')" class="copy-btn flex-center">复制</button>
					</view>
				</view>
			</view>

			<!-- 审核失败 -->
			<view class="card fail-reason-card" v-if="isRejected">
				<view class="fail-reason-item">
					<view>拒绝原因</view>
					<view class="reject-reason">{{ applicationInfo.audit_reason }}</view>
				</view>
			</view>
		</template>
	</BaseContainer>
</template>

<script>
import BaseContainer from "@/components/common/base_container.vue";
import BaseNavBar from "@/components/common/base_nav_bar.vue";
import { getAgentApplicationInfo } from "@/api/circle";
import { RECORD_STATUS } from "./config";
import dayjs from "@/plugin/dayjs/dayjs.min.js";
import { HTTP_REQUEST_URL as domain } from "@/config/app";

const STATUS_IMAGE = {
	[RECORD_STATUS.Pending]: `${domain}/static/images/agent_status_pending.png`,
	[RECORD_STATUS.Approved]: `${domain}/static/images/agent_status_success.png`,
	[RECORD_STATUS.Rejected]: `${domain}/static/images/agent_status_failed.png`,
	[RECORD_STATUS.Cancelled]: `${domain}/static/images/agent_status_cancel.png`,
};

const STATUS_TEXT = {
	[RECORD_STATUS.Pending]: "正在审核",
	[RECORD_STATUS.Approved]: "审核通过",
	[RECORD_STATUS.Cancelled]: "已撤销",
	[RECORD_STATUS.Rejected]: "审核失败",
};

const STATUS_DESC = {
	[RECORD_STATUS.Pending]: "正在审核当中，请耐心等待",
	[RECORD_STATUS.Approved]: "恭喜您，审核通过",
	[RECORD_STATUS.Cancelled]: "当前审核已撤销，请重新提交审核",
	[RECORD_STATUS.Rejected]: "请按提示修改您所填写的信息",
};

export default {
	name: "agentApplicationDetail",
	components: {
		BaseContainer,
		BaseNavBar
	},
	data() {
		return {
			domain,
			RECORD_STATUS,
			applicationId: 0,
			applicationInfo: null,
			loginUrl: `${domain}/admin/agent-login`,
		}
	},
	onLoad(options) {
		this.applicationId = parseInt(options.id) || 0;
	},
	onShow() {
		this.handleGetAgentApplicationInfo();
	},
	computed: {
		progressStatusList() {
			const info = this.applicationInfo;
			if (!info) return [];
			return [
				{
					label: "提交成功",
					time: this.formatProgressTime(info.create_time),
					checked: true, // 图标是否为选中状态 
				},
				{
					label: "正在审核",
					checked: true,
				},
				{
					label: "审核结果",
					time: this.formatProgressTime(info.audit_time),
					checked: !!info.audit_time,
				}
			];
		},
		// 审核状态是否为正在审核
		isPending() {
			return this.applicationInfo?.status === RECORD_STATUS.Pending;
		},
		// 审核状态是否为审核通过
		isApproved() {
			return this.applicationInfo?.status === RECORD_STATUS.Approved;
		},
		// 审核状态是否为审核失败
		isRejected() {
			return this.applicationInfo?.status === RECORD_STATUS.Rejected;
		},
		// 审核状态是否为已撤销
		isCancelled() {
			return this.applicationInfo?.status === RECORD_STATUS.Cancelled;
		},
		// 审核状态图片
		statusImage() {
			return STATUS_IMAGE[this.applicationInfo?.status];
		},
		// 审核状态文本
		statusText() {
			return STATUS_TEXT[this.applicationInfo?.status];
		},
		// 审核状态描述
		statusDesc() {
			return STATUS_DESC[this.applicationInfo?.status];
		},
		btnList() {
			return [
				{
					text: "返回上一页",
					handler: this.handleBack,
					filter: () => this.isApproved || this.isPending
				},
				{
					text: "重新填写",
					handler: this.handleReSubmit,
					filter: () => this.isRejected
				},
				{
					text: "重新提交",
					handler: this.handleReSubmit,
					filter: () => this.isCancelled
				}
			]
				.filter(item => item.filter());
		}
	},
	methods: {
		handleBtnClick(index) {
			this.btnList[index].handler();
		},
		handleCopyContent(data) {
			uni.setClipboardData({
				data,
				success: () => {
					this.$util.Tips({
						title: "复制成功",
						icon: "success"
					});
				}
			});
		},
		handleReSubmit() {
			uni.navigateTo({
				url: `/pages/agent/form?id=${this.applicationId}`
			});
		},
		handleBack() {
			uni.navigateBack();
		},
		formatProgressTime(time) {
			if (!time) return "";
			return dayjs(time).format("YYYY/MM/DD HH:mm");
		},
		async handleGetAgentApplicationInfo() {
			uni.showLoading({
				mask: true
			});
			try {
				const res = await getAgentApplicationInfo(this.applicationId);
				uni.hideLoading();
				this.applicationInfo = res.data;
			} catch (error) {
				uni.hideLoading();
				this.$util.Tips({
					title: error,
					icon: "none"
				});
			}
		}
	}
}
</script>

<style scoped lang="scss">
.card {
	width: 710rpx;
	background: #FFFFFF;
	border-radius: 24rpx;
	margin-inline: auto;

	&+.card {
		margin-top: 20rpx;
	}

	&.progress-detail {
		margin-top: 40rpx;
		padding-top: 60rpx;
		padding-bottom: 72rpx;
	}
}

.progress-item {
	text-align: center;
	--icon-size: 29rpx;

	&_icon {
		width: var(--icon-size);
		height: var(--icon-size);
		border-radius: 50%;
		margin-inline: auto;
		border: 1px solid #ccc;

		.iconfont {
			color: #fff;
			font-size: 20rpx;
		}
	}

	&.checked {
		.progress-item_icon {
			border: none;
			background: linear-gradient(90deg, var(--view-theme) 0%, var(--view-assist) 100%);
		}
	}

	&_label {
		font-size: 28rpx;
		color: #333333;
		line-height: 40rpx;
		margin-top: 20rpx;
		margin-bottom: 8rpx;
	}

	&_time {
		font-size: 22rpx;
		color: #999999;
		line-height: 30rpx;
	}

	--line-bg-color: #ddd;

	&[data-index="1"],
	&[data-index="2"] {
		position: relative;

		&::after {
			content: "";
			background-color: var(--line-bg-color);
			height: 1px;
			position: absolute;
			top: 14rpx;
			width: 176rpx;
			right: calc(50% + var(--icon-size));
		}
	}

	&.checked {
		--line-bg-color: var(--view-theme);
	}

	&.cancelled {
		&.checked {
			.progress-item_icon {
				background: #aaa;
			}

			--line-bg-color: #aaa;
		}
	}
}

.divider-line {
	margin: 62rpx 0 48rpx;
	border-top: 1px dashed #ddd;

	&::before,
	&::after {
		content: "";
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		position: absolute;
		background-color: #f5f5f5;
		top: -16rpx;
	}

	&::before {
		left: -16rpx;
	}

	&::after {
		right: -16rpx;
	}
}

.status-image {
	width: 172.13rpx;
	height: 154rpx;
	display: block;
	margin-inline: auto;
}

.status-text {
	font-size: 36rpx;
	color: #333333;
	line-height: 50rpx;
	margin: 32rpx auto 12rpx;
	text-align: center;
}

.status-desc {
	text-align: center;
	font-size: 26rpx;
	color: #999999;
	line-height: 36rpx;
	margin-bottom: 40rpx;
}

.btn {
	width: 502rpx;
	height: 88rpx;
	background: linear-gradient(90deg, var(--view-theme) 0%, var(--view-assist) 100%);
	border-radius: 50rpx;
	margin: 0 auto;
	font-weight: 500;
	font-size: 28rpx;
	color: #FFFFFF;
	line-height: 40rpx;

	&+.btn {
		margin-top: 24rpx;
		background: none;
		border-radius: 50rpx 50rpx 50rpx 50rpx;
		border: 1px solid rgba(233, 51, 35, 0.6);
		color: var(--view-theme);
	}
}

.fail-reason-card,
.login-info-card {
	padding: 40rpx 24rpx;
	font-size: 28rpx;
	color: #333333;
	line-height: 40rpx;
}

.login-info-item {
	&+.login-info-item {
		margin-top: 40rpx;
	}

	.item-label {
		margin-right: 20rpx;
		min-width: fit-content;
	}

	.item-value {
		word-break: break-all;
	}

	.copy-btn {
		flex-shrink: 0;
		width: 64rpx;
		height: 32rpx;
		background: #F5F5F5;
		border-radius: 200rpx;
		font-size: 20rpx;
		color: #333333;
		line-height: 28rpx;
		margin-left: 8rpx;
	}
}

.reject-reason {
	font-size: 26rpx;
	color: #666666;
	line-height: 36rpx;
	margin-top: 12rpx;
}
</style>
