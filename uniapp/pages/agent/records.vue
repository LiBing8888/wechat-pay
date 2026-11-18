<template>
	<BaseContainer>
		<view class="nav-bar-wrapper sticky">
			<BaseNavBar title="申请记录" />
		</view>
		<view class="list-wrapper" v-if="list.length">
			<view class="record-item flex-y-center" v-for="item in list" :key="item.circle_agent_id">
				<navigator hover-class="none" class="item-left flex-1" :url="`/pages/agent/detail?id=${item.circle_agent_id}`">
					<view class="agent-info flex-y-center">
						<view class="agent-name line1">{{ item.name }}</view>
						<view class="agent-status flex-center" :class="'status-' + item.status">{{ item.status | statusText }}
						</view>
					</view>
					<view class="submit-time">提交时间：{{ item.create_time }}</view>
					<view class="reject-reason" v-if="item.status === RECORD_STATUS.Rejected">拒绝原因：{{ item.audit_reason }}</view>
				</navigator>
				<button class="btn flex-center" @click="handleRecordClick(item)">
					{{ item.status | btnText }}
				</button>
			</view>
		</view>
		<EmptyPage v-else-if="!loading" title="暂无记录" />
	</BaseContainer>
</template>

<script>
import BaseContainer from "@/components/common/base_container.vue";
import BaseNavBar from "@/components/common/base_nav_bar.vue";
import EmptyPage from "@/components/emptyPage.vue";
import { getAgentApplicationRecords, cancelAgentApplication } from "@/api/circle";
import { RECORD_STATUS } from "./config";
import { APPLY_TYPE } from "@/constants/apply";

const STATUS_TEXT = {
	[RECORD_STATUS.Pending]: "待审核",
	[RECORD_STATUS.Approved]: "审核通过",
	[RECORD_STATUS.Cancelled]: "已撤销",
	[RECORD_STATUS.Rejected]: "审核未通过",
};

const BTN_TEXT = {
	[RECORD_STATUS.Pending]: "撤销",
	[RECORD_STATUS.Approved]: "查看",
	[RECORD_STATUS.Cancelled]: "重新提交",
	[RECORD_STATUS.Rejected]: "重新提交",
};

export default {
	name: "agentApplicationRecords",
	components: {
		BaseContainer,
		BaseNavBar,
		EmptyPage
	},
	data() {
		return {
			RECORD_STATUS,
			list: [],
			total: 0,
			loading: false,
		}
	},
	onShow() {
		this.getAgentApplicationRecords();
	},
	filters: {
		statusText(status) {
			return STATUS_TEXT[status];
		},
		btnText(status) {
			return BTN_TEXT[status];
		},
	},
	methods: {
		handleRecordClick(record) {
			switch (record.status) {
				case RECORD_STATUS.Pending:
					this.handleCancelRecord(record);
					break;
				case RECORD_STATUS.Approved:
					uni.navigateTo({
						url: `/pages/agent/detail?id=${record.circle_agent_id}`
					});
					break;
				case RECORD_STATUS.Cancelled:
				case RECORD_STATUS.Rejected:
					// 重新提交申请
					uni.navigateTo({
						url: `/pages/agent/form?id=${record.circle_agent_id}`
					});
					break;
			}
		},
		async handleCancelRecord(record) {
			// 撤销申请
			const [err, { confirm }] = await uni.showModal({
				title: "提示",
				content: "确定撤销申请吗？",
			});
			if (err || !confirm) return;
			uni.showLoading({
				mask: true
			});
			try {
				const res = await cancelAgentApplication(record.circle_agent_id);
				uni.hideLoading();
				this.$util.Tips({
					title: res.message,
					icon: "success"
				});
				this.getAgentApplicationRecords();
			} catch (error) {
				uni.hideLoading();
				this.$util.Tips({
					title: error,
					icon: "none"
				});
			}
		},
		async getAgentApplicationRecords() {
			if (this.loading) return;
			this.loading = true;
			uni.showLoading({
				mask: true
			});
			try {
				const res = await getAgentApplicationRecords({ type: APPLY_TYPE.AGENT });
				this.list = res.data.list;
				this.total = res.data.total;
				uni.hideLoading();
			} catch (error) {
				uni.hideLoading();
				this.$util.Tips({
					title: error,
					icon: "none"
				});
			} finally {
				this.loading = false;
			}
		}
	}
}
</script>

<style scoped lang="scss">
.nav-bar-wrapper {
	top: 0;
}

.list-wrapper {
	padding: 24rpx 20rpx var(--safe-area-inset-bottom-default);

}

.record-item {
	padding: 32rpx;
	background-color: #fff;
	border-radius: 24rpx;

	&+.record-item {
		margin-top: 22rpx;
	}

	.item-left {
		overflow: hidden;
	}

	.agent-name {
		font-size: 30rpx;
		color: #333333;
		line-height: 42rpx;
	}

	.agent-status {
		height: 38rpx;
		padding-inline: 8rpx;
		border-radius: 8rpx;
		font-size: 22rpx;
		line-height: 30rpx;
		margin-left: 16rpx;
		flex-shrink: 0;

		&.status-0 {
			color: #007AFF;
			background-color: rgba($color: #007AFF, $alpha: 0.1);
		}

		&.status-1 {
			color: #00B42A;
			background-color: rgba($color: #00B42A, $alpha: 0.1);
		}

		&.status--2 {
			color: #666;
			background-color: rgba($color: #999999, $alpha: 0.1);
		}

		&.status--1 {
			color: #F53F3F;
			background-color: rgba($color: #F53F3F, $alpha: 0.1);
		}
	}

	.submit-time,
	.reject-reason {
		font-size: 24rpx;
		color: #999999;
		line-height: 28rpx;
		margin-top: 20rpx;
	}

	.btn {
		height: 56rpx;
		border-radius: 50rpx;
		border: 1px solid #CCCCCC;
		padding-inline: 24rpx;
		font-size: 24rpx;
		color: #333333;
		line-height: 34rpx;
		margin-left: 46rpx;
	}
}
</style>
