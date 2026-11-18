<template>
	<view>
		<view class="pt-24 pr-20 pb-safe pl-20">
			<view class="rd-24rpx bg--w111-fff px-20 mb-20" v-for="(item, index) in attrsList" :key="index">
				<view class="listCon">
					<!-- <view class="item acea-row row-middle">
						<view class="name">商品图</view>
						<view class="pictrue">
							<image :src="item.image" mode="aspectFill"></image>
						</view>
					</view> -->
					<view class="h-102 fs-28 flex-y-center sku-item">
						<view class="w-114 text--w111-333 mr-40">规格名称</view>
						<view class="flex-1 text--w111-999">{{item.sku}}</view>
					</view>
					<view class="h-102 fs-28 flex-y-center sku-item">
						<view class="w-114 text--w111-333 mr-40">售价</view>
						<input type="digit" :disabled="administer" min='0' v-model="item.price"
							placeholder="请填写售价" placeholder-class="placeholder"
							class="fs-36 regular text--w111-333" />
					</view>
					<view class="h-102 fs-28 flex-y-center sku-item">
						<view class="w-114 text--w111-333 mr-40">成本价</view>
						<input type="digit" :disabled="administer" v-model="item.cost"
						placeholder="请填写成本价" placeholder-class="placeholder"
						class="fs-36 regular text--w111-333" />
					</view>
					<view class="h-102 fs-28 flex-y-center sku-item">
						<view class="w-114 text--w111-333 mr-40">原价</view>
						<input type="digit" :disabled="administer" v-model="item.ot_price"
						placeholder="请填写原价" placeholder-class="placeholder"
						class="fs-36 regular text--w111-333"/>
					</view>
					<view class="h-102 fs-28 flex-y-center sku-item">
						<view class="w-114 text--w111-333 mr-40">库存</view>
						<input type="number" :disabled="administer" v-model="item.stock"
						placeholder="请填写库存" placeholder-class="placeholder"
						class="fs-36 regular text--w111-333"/>
					</view>
				</view>
			</view>
			<view class="pb-safe">
				<view class="h-200"></view>
			</view>
		</view>
		<view class="fixed-lb w-full pb-safe bg--w111-fff z-100">
			<view class="h-112 flex-center px-24">
				<view class="w-full h-80 rd-40rpx bg-mer fs-28 text--w111-fff flex-center" @click="confirmSave">保存</view>
			</view>
		</view>
	</view>
</template>
<script>
import { getProductSkuApi, productEditAttrApi } from "@/api/product.js";
import { Modal } from '../../../libs/uniApi.js';
export default {
	name: "editProductSku",
	data(){
		return {
			administer: false,
			attrsList:[],
			product_id: 0,
			mer_id: 0
		}
	},
	onLoad(option) {
		this.product_id = option.id || "";
		this.mer_id = option.mer_id || "";
		this.getAttrsList();
	},
	methods:{
		getAttrsList(){
			getProductSkuApi(this.mer_id, this.product_id,).then(res=>{
				// let data = res.data;
				// data.forEach(item => {
				// 	item.checked = false;
				// })
				this.attrsList = res.data;
			}).catch(err=>{
				this.$util.Tips({
					title: err
				});
			})
		},
		confirmSave(){
			const data = {
			  attr_value: (this.attrsList || []).map(
			    ({ cost, price, ot_price, stock, unique, value_id }) => ({
			      cost, price, ot_price, stock, unique, value_id
			    })
			  )
			};
			productEditAttrApi(this.mer_id, this.product_id, data).then(res=>{
				Modal('提交成功', '点击确定，返回商品管理', {
					showCancel: false,
				}).then(() => {
					uni.redirectTo({
						url:'/pages/product/list/index?mer_id=' + this.mer_id
					})
				})
			}).catch(err=>{
				Toast(err);
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.w-114{
	width: 114rpx;
}
.h-102{
	height: 102rpx;
}
.sku-item ~ .sku-item {
    border-top: 1rpx solid #F1F1F1;
}
.bg-mer{
	background-color: $primary-admin;
}
.z-100{
	z-index: 100;
}
</style>
