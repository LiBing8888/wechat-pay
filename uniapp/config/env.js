// 是否在 iframe 中
export const IS_IN_IFRAME = (()=>{
  // #ifdef WEB
  return window.self !== window.top;
  // #endif
  // #ifndef WEB
  return false;
  // #endif
})();