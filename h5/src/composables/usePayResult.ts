import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { queryPayResult, tipForCode, type PayStatus } from '@/api/pay';

const POLL_INTERVAL_MS = 3000;

/** 停止轮询的状态：CLOSED 不会再变化，直接给"重新支付"入口（§4.5） */
const SETTLED: PayStatus[] = ['SUCCESS', 'FAILED', 'CLOSED'];

/**
 * 回流轮询（文档 §4.5）
 * - 常态 3s 轮询
 * - 切回浏览器 / 窗口聚焦时立即查一次
 * - 达到 maxMs 仍未终态 → 停止并提示去订单列表查看
 * - 终态只认后端返回，前端不自行判定成功
 */
export function usePayResult(orderNoRef: Ref<string>, maxMs = 15 * 60 * 1000) {
  const status = ref<PayStatus>('PAYING');
  const payTime = ref('');
  const errmsg = ref('');
  const notice = ref('');
  const elapsedMs = ref(0);
  const stopped = ref(false);

  let timer: number | undefined;
  let startedAt = 0;
  let inFlight = false;

  const settled = () => SETTLED.indexOf(status.value) >= 0;

  function stop(reason?: string) {
    if (timer) { clearInterval(timer); timer = undefined; }
    stopped.value = true;
    if (reason) notice.value = reason;
  }

  async function poll(source: 'POLL' | 'MANUAL' | 'RESUME' = 'POLL') {
    if (inFlight || settled()) return;
    elapsedMs.value = Date.now() - startedAt;
    if (elapsedMs.value > maxMs) {
      stop('支付确认中，请稍后在订单列表查看结果');
      return;
    }
    inFlight = true;
    try {
      const r = await queryPayResult(orderNoRef.value, source);
      status.value = r.status;
      payTime.value = r.payTime || '';
      errmsg.value = r.errmsg || '';
      notice.value = '';
      if (settled()) stop();
    } catch (e: any) {
      // 单次查询失败不打断轮询，只在结果页给一句提示
      notice.value = tipForCode(e?.code);
    } finally {
      inFlight = false;
      elapsedMs.value = Date.now() - startedAt;
    }
  }

  /** §4.6：手动"刷新结果"按钮，兜底 visibilitychange 失效的机型 */
  const refresh = () => poll('MANUAL');

  function onVisibility() {
    if (document.visibilityState === 'visible') poll('RESUME');
  }

  function start() {
    startedAt = Date.now();
    stopped.value = false;
    notice.value = '';
    if (!timer) timer = window.setInterval(() => poll('POLL'), POLL_INTERVAL_MS);
    poll('POLL');
  }

  onMounted(() => {
    start();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', onVisibility);
  });

  return { status, payTime, errmsg, notice, elapsedMs, stopped, refresh };
}
