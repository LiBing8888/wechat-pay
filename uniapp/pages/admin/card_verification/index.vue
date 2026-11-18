<template>
	<view>
		<cardVerification :verifyCode="verify_code" :merId="mer_id" :isScan="isScan" @back="goBack" />
	</view>
</template>

<script>
	import cardVerification from '../components/cardVerification/index.vue';
	import { mapGetters } from "vuex";
	import { toLogin } from '@/libs/login.js';

	export default {
		components: {
			cardVerification
		},
		data() {
			return {
				verify_code: '',
				mer_id: '',
				isScan: 0,
			};
		},
		computed: mapGetters(['isLogin']),
		onLoad: function(options) {
			this.verify_code = options.cal_code;
			this.mer_id = options.mer_id;
			this.isScan = options.is_jump;
		},
		onShow: function() {
			if (!this.isLogin) {
				setTimeout(() => { toLogin(); }, 300);
			}
		},
		methods: {
			goBack() {
				uni.navigateTo({ url: '/pages/admin/business/index?is_sys=0' });
			}
		}
	}
</script>

<style scoped lang="scss">
	page {
		background: #F5F5F5;
	}
</style>
