import util from '@/utils/util.js';
import { toLogin } from '@/libs/login.js';
import { getProductHot, getParmasList } from '@/api/store.js';

/**
 * 该 mixin 用于处理商品列表加购相关的逻辑
 * 具体使用方法可参考 pages/columnGoods/goods_list.vue 中的使用方式
 */

export default {
  data() {
    return {
			where: {
				cate_pid: '',
				order: '',
				price_on: '',
				price_off: '',
				brand_id: '',
				mer_type_id: '',
				keyword:'',
				is_trader: '',
				filter_params: '',
				page:1,
				limit:30
			},
			loading: false, //是否加载中
			loadend: false, //是否加载完毕
			loadTitle: '加载更多', //提示语
			parmasStatus: false,
      parmasList: [],
			hostProduct: [],
			hotScroll:false,
			hotPage:1,
			hotLimit:10,
			attr: {
				cartAttr: false,
				productAttr: [],
				productSelect: {}
			},
			attrValue: '', //已选属性
			attrTxt: '选择', //属性页面提示
    };
  },
  methods: {
    // 获取参数列表
    async getParmasList(){
    	let temp = []
    	getParmasList({
    		cate_pid:this.where.cate_pid,
    		keyword:this.where.keyword
    	})
    		.then(res => {
    			this.parmasStatus = true
    			temp = res.data.map(item => {
    				return {
    					...item,
    					check: false,
    					showValue: false,
    					parmasValue: []
    				}
    			})
    			this.parmasList = temp
    		})
    		.catch(res => {
    			this.$util.Tips({
    				title: res
    			});
    		});
    },
		/**
		 * 购物车数量加和数量减
		 *
		 */
		ChangeCartNum: function(changeValue) {
			//changeValue:是否 加|减
			//获取当前变动属性
			let productSelect = this.productValue[this.attrValue];
			//如果没有属性,赋值给商品默认库存
			if (productSelect === undefined && !this.attr.productAttr.length)
				productSelect = this.attr.productSelect;
			//无属性值即库存为0；不存在加减；
			if (productSelect === undefined) return;
			let stock = productSelect.stock || 0;
			let num = this.attr.productSelect;
			if (changeValue) {
				num.cart_num++;
				if (num.cart_num > stock) {
					this.$set(this.attr.productSelect, "cart_num", stock);
					this.$set(this, "cart_num", stock);
				}
				if(num.cart_num > this.onceCount && this.onceCount>0){
					this.$set(this.attr.productSelect, "cart_num", this.onceCount);
					this.$set(this, "cart_num", this.onceCount);
					return this.$util.Tips({
						title: "秒杀时间段内最多购买"+this.onceCount+"件！"
					});
				}
			} else {
				num.cart_num--;
				if (num.cart_num < 1) {
					this.$set(this.attr.productSelect, "cart_num", 1);
					this.$set(this, "cart_num", 1);
				}
			}
		},
		attrVal(val) {
			this.$set(this.attr.productAttr[val.indexw], 'index', this.attr.productAttr[val.indexw].attr_values[val.indexn]);
		},
		/**
		 * 属性变动赋值
		 *
		 */
		ChangeAttr: function(res) {
			let productSelect = this.productValue[res];
			if (productSelect && productSelect.stock > 0) {
				this.$set(this.attr.productSelect, "image", productSelect.image);
				this.$set(this.attr.productSelect, "price", productSelect.price);
				this.$set(this.attr.productSelect, "stock", productSelect.stock);
				this.$set(this.attr.productSelect, "unique", productSelect.unique);
				this.$set(this.attr.productSelect, "cart_num", 1);
				this.$set(this, "attrValue", res);
				this.$set(this, "attrTxt", "选择");
			} else {
				this.$set(this.attr.productSelect, "image", this.storeInfo.image);
				this.$set(this.attr.productSelect, "price", this.storeInfo.price);
				this.$set(this.attr.productSelect, "stock", 0);
				this.$set(this.attr.productSelect, "unique", "");
				this.$set(this.attr.productSelect, "cart_num", 0);
				this.$set(this, "attrValue", "");
				this.$set(this, "attrTxt", "选择");
			}
		},
		/**
		* 获取我的推荐
		*/
		get_host_product: function () {
		  let that = this;
			if(that.hotScroll) return
			that.hotScroll = true;
			that.loading = true;
			that.loadTitle = "加载更多";
			getProductHot(
				that.hotPage,that.hotLimit
			).then(res=>{
				that.hotPage++
				that.hotScroll = res.data.list.length < that.hotLimit;
				that.hostProduct =that.hostProduct.concat(res.data.list);
				that.loading = false;
				that.loadTitle = that.hotScroll ? "我也是有底线的" : '加载更多';
			})
		},
  }
}