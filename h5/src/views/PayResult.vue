<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePayResult } from '@/composables/usePayResult';

const route = useRoute();
const router = useRouter();
const orderNo = ref(String(route.query.orderNo || import.meta.env.VITE_DEMO_ORDER_NO || 'B202611170001'));

const { status, payTime, errmsg, notice, elapsedMs, stopped, refresh } = usePayResult(orderNo);

const headline = computed(() => {
  if (status.value === 'SUCCESS') return '支付成功';
  if (status.value === 'FAILED') return '支付失败';
  if (status.value === 'CLOSED') return '订单已关闭';
  return stopped.value ? '支付确认中' : '正在等待支付结果…';
});

const seconds = computed(() => Math.floor(elapsedMs.value / 1000));

const backToOrder = () => router.replace({ name: 'order', query: { orderNo: orderNo.value } });
</script>

<template>
  <div>
    <div class="card">
      <div class="status-hero">
        <div v-if="status === 'PAYING' && !stopped" class="spinner" />
        <div v-else class="icon">
          {{ status === 'SUCCESS' ? '✅' : status === 'PAYING' ? '⏳' : '❗' }}
        </div>
        <div class="text">{{ headline }}</div>
        <p class="muted" style="margin:8px 0 0">订单号 {{ orderNo }}</p>
        <p v-if="payTime" class="muted">支付时间 {{ payTime }}</p>
        <p v-if="errmsg" class="muted">{{ errmsg }}</p>
        <p v-if="status === 'PAYING' && !stopped" class="muted">已等待 {{ seconds }}s · 每 3s 自动查询</p>
      </div>

      <div v-if="notice" class="banner">{{ notice }}</div>

      <p v-if="status === 'PAYING' && !stopped" class="muted">
        请在小程序 / 微信中完成付款，支付成功后返回本页会自动刷新结果。
      </p>
    </div>

    <div class="card">
      <button v-if="status === 'PAYING'" class="btn ghost" @click="refresh()">刷新结果</button>
      <button v-if="status === 'CLOSED' || status === 'FAILED' || stopped" class="btn" @click="backToOrder">重新支付</button>
      <button v-else class="btn ghost" @click="backToOrder">返回订单</button>
    </div>
  </div>
</template>
