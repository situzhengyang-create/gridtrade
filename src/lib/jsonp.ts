
/**
 * Generic fetcher that uses our /api/proxy endpoint
 */
export async function proxiedFetch<T>(url: string): Promise<T> {
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Specifically for Tencent which returns v_symbol = "data"
 */
export async function fetchTencentQuote(symbol: string): Promise<string> {
  // Tencent's format: v_sh510500 = "..."
  // Proxy returns the JSON or text. 
  // Let's adapt it.
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(`https://qt.gtimg.cn/q=${symbol}`)}`);
  const text = await response.text();
  // We need to extract the content inside the quotes if the proxy returned it as text or something
  // If proxy returns `v_sh510500 = "..."`, we need the inside.
  return text;
}
