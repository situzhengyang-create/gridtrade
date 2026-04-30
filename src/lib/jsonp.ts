
/**
 * Simple JSONP implementation for fetching data from sources without CORS
 */
export function jsonp<T>(url: string, callbackParam: string = 'cb'): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
    const separator = url.includes('?') ? '&' : '?';
    const script = document.createElement('script');
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP Request Timeout'));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}${separator}${callbackParam}=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP Request Failed'));
    };

    document.body.appendChild(script);
  });
}

/**
 * Specifically for Tencent which returns v_symbol = "data"
 */
export function fetchTencentQuote(symbol: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackName = `v_${symbol}`;
    const script = document.createElement('script');
    script.src = `https://qt.gtimg.cn/q=${symbol}`;
    script.charset = 'gbk';
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Tencent Quote Timeout'));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Note: we don't delete window[callbackName] immediately because Tencent code executes it as a variable assignment
    };

    // Since Tencent doesn't call a function but just assigns to a variable,
    // we have to poll or use the onload event.
    script.onload = () => {
      const data = (window as any)[callbackName];
      if (data) {
        resolve(data);
      } else {
        reject(new Error('Failed to parse Tencent quote'));
      }
      cleanup();
      // Remove from window after a short delay to be safe
      setTimeout(() => { delete (window as any)[callbackName]; }, 1000);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Tencent Quote Network Error'));
    };

    document.body.appendChild(script);
  });
}
