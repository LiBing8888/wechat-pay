
/**
 * 该 mixin 用于处理支付逻辑
 * 具体使用方法可参考 pages/annex/vip_center/index.vue中的使用方式
 */

export default {
  data() {
    return {

    };
  },
  methods: {
    // 调用支付
    callPay(res) {
    	let that = this;
    	let status = res.data.status,
    		orderId = res.data.result.order_id,
    		callback_key = res.data.result.pay_key,
    		jsConfig = res.data.result.config,
    		currentRoute = that.$page?.route || '/pages/index/index',
    		goPages = currentRoute.startsWith('/') ? currentRoute : '/' + currentRoute
    	switch (status) {
    		case 'ORDER_EXIST':
    		case 'EXTEND_ORDER':
    		case 'PAY_ERROR':
    		case 'error':
    			uni.hideLoading();
    			that.payClose();
    			return that.$util.Tips({
    				title: res.message
    			});
    			break;
    		case 'success':
    			uni.hideLoading();
    			that.payClose();
    			return that.$util.Tips({
    				title: res.message,
    				icon: 'success'
    			});
    			break;
    		case 'alipay':
    		case "alipayQr":
    			uni.hideLoading();
    			that.payClose();
    			uni.navigateTo({
    				url: '/pages/order_pay_back/index?keyCode='+callback_key,
    			})
    			return;
    			break;
    			// #ifndef MP
    		case "wechat":
    		case "weixin":
    		case "weixinApp":
    			jsConfig.timeStamp = jsConfig.timestamp;
    			// #ifndef APP-PLUS
    			this.$wechat.pay(jsConfig).then(res => {
    				uni.hideLoading();
    				that.payClose();
    				return that.$util.Tips({
    					title: res.message,
    					icon: 'success'
    				}, {
    					tab: 4,
    					url: goPages
    				});
    			}).catch(res => {
    				uni.hideLoading();
    				that.payClose();
    				if (res.errMsg == 'chooseWXPay:cancel') return that.$util.Tips({
    					title: '取消支付'
    				}, {
    					tab: 5,
    					url: goPages + '&status=0'
    				});
    			})
    			// #endif
    			// #ifdef APP-PLUS
    			let mp_pay_name=''
    			if(uni.requestOrderPayment){
    				mp_pay_name='requestOrderPayment'
    			}else{
    				mp_pay_name='requestPayment'
    			}
    			uni[mp_pay_name]({
    				provider: 'wxpay',
    				orderInfo: jsConfig,
    				success: (e) => {
    					uni.hideLoading();
    					that.payClose();
    					let pageRoute = that.$page?.route || '/pages/index/index';
    					let url = pageRoute.startsWith('/') ? pageRoute : '/' + pageRoute
    					return that.$util.Tips({
    						title: '支付成功',
    						icon: 'success'
    					}, {
    						tab: 4,
    						url: url
    					});
    				},
    				fail: (e) => {
    					uni.hideLoading();
    					that.payClose();
    					uni.showModal({
    						content: "支付失败",
    						showCancel: false,
    						success: function(res) {}
    					})
    				},
    				complete: () => {
    					uni.hideLoading();
    				},
    			});
    			// #endif
    			break;
    			// #endif
    			// #ifdef MP
    		case "routine":
    			jsConfig.timeStamp = jsConfig.timestamp;
    			let mp_pay_name=''
    			if(uni.requestOrderPayment){
    				mp_pay_name='requestOrderPayment'
    			}else{
    				mp_pay_name='requestPayment'
    			}
    			uni[mp_pay_name]({
    				...jsConfig,
    				success: function(res) {
    					uni.hideLoading();
    					that.payClose();
    					return that.$util.Tips({
    						title: '支付成功',
    						icon: 'success'
    					}, {
    						tab: 5,
    						url: goPages
    					});
    				},
    				fail: function(e) {
    					uni.hideLoading();
    					that.payClose();
    					return that.$util.Tips({
    						title: '取消支付'
    					});
    				},
    			})
    			break;
    			// #endif
    		case "balance":
    			uni.hideLoading();
    			that.payClose();
    			//余额不足
    			return that.$util.Tips({
    				title: res.message
    			}, {
    				tab: 5,
    				url: goPages
    			});
    			break;
    			// #ifdef H5
    		case 'h5':
    			let host = window.location.protocol + "//" + window.location.host;
    			let url = `${host}/pages/annex/vip_paid/index`
    			let eUrl = encodeURIComponent(url)
    			let jsurl = jsConfig.mweb_url || jsConfig.h5_url
    			let locations = `${jsurl}&redirect_url=${eUrl}`
    			setTimeout(() => {
    				location.href = locations;
    			}, 100);
    			break;
    			// #endif
    			// #ifdef APP-PLUS
    		case 'alipayApp':
    			uni.requestPayment({
    				provider: 'alipay',
    				orderInfo: jsConfig,
    				success: (e) => {
    					uni.hideLoading();
    					that.payClose();
    					return that.$util.Tips({
    						title: '支付成功',
    						icon: 'success'
    					}, {
    						tab: 5,
    						url: goPages
    					});
    				},
    				fail: (e) => {
    					uni.hideLoading();
    					uni.showModal({
    						content: "支付失败",
    						showCancel: false,
    						success: function(res) {}
    					})
    				},
    				complete: () => {
    					uni.hideLoading();
    				},
    			});
    			break;
    			// #endif
    	}
    },
		onChangeFun: function(e) {
			let opt = e;
			let action = opt.action || null;
			let value = opt.value != undefined ? opt.value : null;
			action && this[action] && this[action](value);
		},
  }
}