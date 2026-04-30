/**
 * Generates an East Money (东方财富) quote page URL for a given stock symbol.
 */
export function getEastMoneyUrl(symbol: string): string {
  if (!symbol) return '';
  
  const cleanSymbol = symbol.replace(/SH|SZ/i, '').trim().toUpperCase();
  
  // A-Shares logic
  if (cleanSymbol.length === 6) {
    // SH: 60xxxx (Main), 68xxxx (Star), 51xxxx (ETF), 58xxxx (ETF), 900xxx (B-share)
    if (cleanSymbol.startsWith('6') || cleanSymbol.startsWith('5') || cleanSymbol.startsWith('68') || cleanSymbol.startsWith('11') || cleanSymbol.startsWith('51') || cleanSymbol.startsWith('58')) {
      return `https://quote.eastmoney.com/sh${cleanSymbol}.html`;
    }
    // SZ: 00xxxx (Main), 30xxxx (ChiNext), 15xxxx (ETF), 12xxxx (Convertible), 200xxx (B-share)
    return `https://quote.eastmoney.com/sz${cleanSymbol}.html`;
  }
  
  // HK Stocks: Usually 5 digits
  if (cleanSymbol.length === 5) {
    return `https://quote.eastmoney.com/hk/${cleanSymbol}.html`;
  }
  
  // Fallback: Search
  return `https://so.eastmoney.com/web/s?keyword=${cleanSymbol}`;
}

/**
 * Generates an East Money (东方财富) App native scheme URL.
 * Used for deep linking to the app on mobile devices.
 */
export function getEastMoneyAppScheme(symbol: string): string {
  if (!symbol) return '';
  const cleanSymbol = symbol.replace(/SH|SZ/i, '').trim().toUpperCase();
  
  if (cleanSymbol.length === 6) {
    // SH: 1, SZ: 0
    let market = '1';
    if (cleanSymbol.startsWith('0') || cleanSymbol.startsWith('3') || cleanSymbol.startsWith('1')) {
      market = '0';
    }
    // Schema: eastmoney://nw/quote?secid={market}.{code}
    return `eastmoney://nw/quote?secid=${market}.${cleanSymbol}`;
  }
  
  if (cleanSymbol.length === 5) {
    return `eastmoney://nw/quote?secid=116.${cleanSymbol}`;
  }
  
  return `eastmoney://nw/search?keyword=${cleanSymbol}`;
}
