const decode = value => decodeURIComponent(value);
const encode = value => encodeURIComponent(value);


// url 解析为 对象
export const parseUrl = url => {
  // #ifdef WEB
  const u = new URL(url, window.location.origin);
  return {
    path: u.pathname,
    query: Object.fromEntries(u.searchParams.entries())
  };
  // #endif

  // #ifndef WEB
  let query = {};
  const [path, queryStr = ""] = url.split("?");

  if (queryStr) {
    queryStr.split("&").forEach(item => {
      const [key, value] = item.split("=");
      if (key) {
        query[decode(key)] = decode(value ?? "");
      }
    });
  }

  return {
    path,
    query
  };
  // #endif
}

// 对象序列化为 query str
export const stringifyQuery = obj => {
  // #ifdef WEB
  return new URLSearchParams(obj).toString();
  // #endif
  // #ifndef WEB
  return Object.entries(obj)
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join("&");
  // #endif
};

// 合并 query 到 URL
export const mergeUrlQuery = (link, extraQuery = {}) => {
  const { path, query } = parseUrl(link);

  const combined = {
    ...query,
    ...extraQuery
  };

  const qs = stringifyQuery(combined);
  if (!qs) return path;
  return `${path}?${qs}`;
}