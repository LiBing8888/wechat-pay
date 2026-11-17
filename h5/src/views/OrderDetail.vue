<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchOrderDetail, type OrderDetail as Order } from '@/api/pay';
import { usePayJump } from '@/composables/usePayJump';

const route = useRoute();
const router = useRouter();

const orderNo = String(route.query.orderNo || import.meta.env.VITE_DEMO_ORDER_NO || 'B202611170001');
const order = ref<Order | null>(null);
const loadError = ref('');

// 拉起成功（页面被隐藏）→ 交给结果页轮询，回流即可看到终态
const { state, tip, loading, prepare, goPay, reset } = usePayJump((no) => {
  router.replace({ name: 'pay-result', query: { orderNo: no } });
});

const payable = computed(() => !order.value || order.value.status === 'PAYING');

onMounted(async () => {
  try {
    order.value = await fetchOrderDetail(orderNo);
  } catch (e: any) {
    loadError.value = e?.message || '订单加载失败';
  }
  // §4.6：预取 Scheme，点击时同步跳转，避免手势时效过期
  await prepare(orderNo);
});
</script>

<template>
  <div>
    <div v-if="state === 'GUIDE'" class="mask">
      <div class="tip">① 点右上角 <b>⋯</b></div>
      <div class="tip">② 选 <b>在浏览器中打开</b></div>
      <div class="tip">③ 再回来完成支付</div>
      <button class="btn ghost close" @click="reset()">我知道了</button>
    </div>

    <div v-if="tip" class="banner">{{ tip }}</div>
    <div v-if="loadError" class="banner">{{ loadError }}</div>

    <div class="card">
      <h2 class="title">订单信息</h2>
      <div class="row"><span class="muted">商品</span><span>{{ order?.body || '—' }}</span></div>
      <div class="row"><span class="muted">订单号</span><span>{{ orderNo }}</span></div>
      <div class="row"><span class="muted">商户流水号</span><span>{{ order?.reqsn || '—' }}</span></div>
      <div class="row">
        <span class="muted">状态</span>
        <span>{{ order?.status === 'SUCCESS' ? '已支付' : order?.status === 'CLOSED' ? '已关闭' : order?.status === 'FAILED' ? '支付失败' : '待支付' }}</span>
      </div>
      <div class="row"><span class="amount">￥{{ order?.amountText || '—' }}</span></div>
    </div>

    <div class="card">
      <button class="btn" :disabled="loading || !payable" @click="goPay(orderNo)">
        {{ loading ? '正在准备支付…' : state === 'JUMPING' ? '正在打开微信…' : payable ? '去支付' : '该订单不可支付' }}
      </button>
      <p class="muted" style="margin:12px 0 0">
        点击后将唤起微信小程序完成付款，支付完成后请返回本页查看结果。
      </p>
    </div>
  </div>
</template>
