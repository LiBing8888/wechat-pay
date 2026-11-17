import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/order' },
    { path: '/order', name: 'order', component: () => import('@/views/OrderDetail.vue') },
    { path: '/pay-result', name: 'pay-result', component: () => import('@/views/PayResult.vue') },
  ],
});
