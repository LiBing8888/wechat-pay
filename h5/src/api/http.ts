/**
 * 统一请求封装：解包 { code, message, data }，业务失败以 ApiError 抛出。
 * 错误码契约见文档 §6.4。
 */
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export interface ApiResult<T> {
  code: string;
  message?: string;
  data: T;
}

export class ApiError extends Error {
  code: string;
  httpStatus: number;

  constructor(code: string, message: string, httpStatus = 0) {
    super(message || code);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch (e) {
    throw new ApiError('NETWORK_ERROR', '网络异常，请检查网络后重试');
  }

  const text = await res.text();
  let body: ApiResult<T> | null = null;
  try { body = text ? (JSON.parse(text) as ApiResult<T>) : null; } catch { body = null; }

  if (!body) {
    throw new ApiError('CHANNEL_ERROR', `响应解析失败 (HTTP ${res.status})`, res.status);
  }
  if (res.status === 401) {
    throw new ApiError(body.code || 'UNAUTHORIZED', body.message || '登录态失效', res.status);
  }
  if (!res.ok || body.code !== 'SUCCESS') {
    throw new ApiError(body.code || `HTTP_${res.status}`, body.message || '请求失败', res.status);
  }
  return body.data;
}

export const post = <T>(path: string, data?: unknown): Promise<T> =>
  call<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  });

export const get = <T>(path: string, params?: Record<string, string | number>): Promise<T> => {
  const qs = params
    ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  return call<T>(path + qs, { method: 'GET' });
};
