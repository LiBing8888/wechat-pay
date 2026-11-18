<template>
	<view>
		<cardVerification
			:verifyCode="verify_code"
			:merId="mer_id"
			:orderData="orderData"
			:orderList="orderList"
			:readonly="true"
		/>
	</view>
</template>

<script>
	import { verifierOrder } from '@/api/admin.js';
	import { getOrderDetail } from '@/api/order.js';
	
	import { mapGetters } from "vuex";
	import { toLogin } from '@/libs/login.js';
	import cardVerification from '../components/cardVerification/index.vue';

	export default {
		components: {
			cardVerification
		},
		data() {
			return {
				order_id: '',
				mer_id: '',
				verify_code: "",
				orderData: {},
				orderList: []
			};
		},
		computed: mapGetters(['isLogin']),
		onLoad: function(options) {
			this.order_id = options.order_id;
			this.mer_id = options.mer_id;
			this.verify_code = options.cal_code
			
		},
		onShow: function() {
			if (this.isLogin == true) {
				this.getOrderData();
			} else {
				setTimeout(() => {
					toLogin();
				}, 300);
			}
		},
		methods: {
			getOrderData() {
				if (this.verify_code && this.mer_id) {
					verifierOrder(this.mer_id, this.verify_code)
						.then(res => {
							this.orderData = res.data;
							this.orderList = res.data.orderProduct || [];
						})
						.catch(res => {
							this.$util.Tips({ title: res });
						});
				} else if (this.order_id) {
					getOrderDetail(this.order_id)
						.then(res => {
							this.orderData = res.data;
							this.orderList = res.data.orderProduct || [];
						})
						.catch(res => {
							this.$util.Tips({ title: res });
						});
				}
			}
		}
	}
</script>
