import { computed, onUnmounted, ref } from 'vue';
import { fetchScheme, tipForCode } from '@/api/pay';
import { needsOpenInBrowserGuide } from '@/utils/env';

/** 状态机见文档 §2.2；JUMPING 之后的 WAITING_RETURN / POLLING 由 PayResult 页承接 */
export type JumpState = 'IDLE' | 'FETCHING' | 'JUMPING' | 'NOT_LAUNCHED' | 'GUIDE';

const LAUNCH_DETECT_MS = 3000;
/** 剩余有效期少于该秒数时不再复用缓存，重新向后端要一条 */
const SAFE_REMAIN_SEC = 5;

interface CachedScheme { orderNo: string; openlink: string; expireAt: number }

export function usePayJump(onLaunched: (orderNo: string) => void) {
  const state = ref<JumpState>('IDLE');
  const tip = ref('');
  const loading = computed(() => state.value === 'FETCHING');

  let cached: CachedScheme | null = null;
  let detach: (() => void) | null = null;

  const remainSec = (s: CachedScheme) => s.expireAt - Math.floor(Date.now() / 1000);
  const usable = (s: CachedScheme | null, orderNo: string): s is CachedScheme =>
    !!s && s.orderNo === orderNo && remainSec(s) > SAFE_REMAIN_SEC;

  /**
   * §4.6：跳转要在用户手势的时效内完成。
   * 订单页加载后预取 Scheme（后端按订单幂等，同一单返回同一条），点击时即可同步跳转。
   */
  async function prepare(orderNo: string) {
    if (cached && usable(cached, orderNo)) return;
    try {
      const r = await fetchScheme(orderNo);
      cached = { orderNo, ...r };
    } catch {
      cached = null;   // 预取失败不打扰用户，点击时再兜底并给出文案
    }
  }

  function detectLaunched(orderNo: string) {
    const cleanup = () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      clearTimeout(timer);
      detach = null;
    };
    function onHide() {
      // 页面被隐藏 = 真的离开了浏览器，交给结果页轮询
      cleanup();
      onLaunched(orderNo);
    }
    const timer = setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      detach = null;
      if (state.value === 'JUMPING') {
        state.value = 'NOT_LAUNCHED';
        tip.value = '未跳转微信：请确认已安装微信并在弹框中选择"打开"，然后重试';
      }
    }, LAUNCH_DETECT_MS);

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    detach = cleanup;
  }

  /** §4.3：a 标签 click（Android Chrome 需要），iOS Safari 同样可用 */
  function launch(openlink: string, orderNo: string) {
    state.value = 'JUMPING';
    const a = document.createElement('a');
    a.href = openlink;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    detectLaunched(orderNo);
  }

  /** 绑定在"去支付"按钮的 click 上 */
  async function goPay(orderNo: string) {
    if (state.value === 'FETCHING') return;
    tip.value = '';

    if (needsOpenInBrowserGuide()) {
      state.value = 'GUIDE';
      return;
    }
    if (usable(cached, orderNo)) {
      launch(cached.openlink, orderNo);
      return;
    }

    state.value = 'FETCHING';
    try {
      const r = await fetchScheme(orderNo);
      cached = { orderNo, ...r };
      launch(r.openlink, orderNo);
    } catch (e: any) {
      cached = null;
      state.value = 'NOT_LAUNCHED';
      tip.value = tipForCode(e?.code);
    }
  }

  function reset() {
    detach?.();
    state.value = 'IDLE';
    tip.value = '';
  }

  onUnmounted(() => detach?.());

  return { state, tip, loading, prepare, goPay, reset };
}
