/** 环境与 UA 检测（文档 §4.2） */
export const isWeChatBrowser = (): boolean => /MicroMessenger/i.test(navigator.userAgent);

/** 企业微信同样会拦 scheme，需与微信内置浏览器同等处理 */
export const isWeComBrowser = (): boolean => /wxwork/i.test(navigator.userAgent);

export const isIOS = (): boolean => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** 需要走"请在浏览器中打开"蒙层的环境 */
export const needsOpenInBrowserGuide = (): boolean => isWeChatBrowser() || isWeComBrowser();
