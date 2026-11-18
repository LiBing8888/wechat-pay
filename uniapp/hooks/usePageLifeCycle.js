import { LIFECYCLE_EVENTS_SET } from '@/constants/life-cycle';

const isDev = process.env.NODE_ENV !== "production";

/**
 * 为组件注入页面级别的声明周期事件
 * 在组件中使用该 hooks 时，需要保证引用组件的最外层页面中声明了对应的声明周期
 * 否则 hooks 不会被触发
 * 页面中声明空的声明周期方法即可，如：onPageScroll() {}
 * @param {*} hooks 
 * @returns {void}
 * 
 * example:
 * usePageLifeCycle.call(this, {
 *  onShow() {
 *    console.log("onShow");
 *  },
 *  onHide() {
 *    console.log("onHide");
 *  },
 *  onPageScroll(e) {
 *    console.log("onPageScroll", e);
 *  }
 * });
 * 
 * 
 */
export function usePageLifeCycle(hooks = {}) {
  const vm = this;
  if (!vm || !vm.$root) {
    const tips = '[usePageLifeCycle] must be called with component instance via .call(this)';
    if (isDev) {
      throw new Error(tips);
    } else {
      console.error(tips);
      return;
    }
  }

  const hookList = Object.entries(hooks);

  // 为组件注入页面级别的声明周期事件
  for (const [name, handler] of hookList) {
    if (!LIFECYCLE_EVENTS_SET.has(name)) {
      const tips = `[usePageLifeCycle] Invalid event name: ${name}`;
      if (isDev) {
        throw new Error(tips);
      } else {
        console.error(tips);
        continue;
      }
    }
    vm.$root.$on(`hook:${name}`, handler);
  }
  // 在组件销毁时，移除页面级别的声明周期事件
  vm.$once('hook:beforeDestroy', () => {
    for (const [name, handler] of hookList) {
      vm.$root.$off(`hook:${name}`, handler);
    }
  });
}