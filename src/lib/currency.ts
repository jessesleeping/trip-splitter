/**
 * 汇率转换工具
 * 支持实时 API 和缓存机制
 */

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest';

// 汇率缓存（避免频繁请求）
const rateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 分钟缓存

/**
 * 从 API 获取实时汇率（带缓存）
 */
export async function fetchExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number | null> {
  const cacheKey = `${baseCurrency.toUpperCase()}_${targetCurrency.toUpperCase()}`;
  
  // 检查缓存
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rate;
  }
  
  try {
    const response = await fetch(`${EXCHANGE_RATE_API}/${baseCurrency.toUpperCase()}`);
    if (!response.ok) throw new Error('API 请求失败');
    
    const data = await response.json();
    const rate = data.rates?.[targetCurrency.toUpperCase()];
    
    if (!rate) throw new Error('不支持的币种');
    
    // 更新缓存
    rateCache.set(cacheKey, { rate, timestamp: Date.now() });
    
    return rate;
  } catch (error) {
    console.error('获取汇率失败:', error);
    // 返回缓存的旧数据（如果有）
    return cached?.rate || null;
  }
}

/**
 * 批量获取汇率
 */
export async function fetchExchangeRates(
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<Record<string, number>> {
  const rates: Record<string, number> = {};
  
  for (const currency of targetCurrencies) {
    const rate = await fetchExchangeRate(baseCurrency, currency);
    if (rate) {
      rates[currency] = rate;
    }
  }
  
  return rates;
}

/**
 * 自动获取并填充汇率（用于表单）
 */
export async function autoFillExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;
  
  const rate = await fetchExchangeRate(fromCurrency, toCurrency);
  return rate || 1;
}

/**
 * 货币转换
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }
  
  return Math.round(amount * exchangeRate * 100) / 100;
}

/**
 * 常见币种列表（按地区分类）
 */
export const COMMON_CURRENCIES = [
  // 亚洲
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'TWD', name: '新台币', symbol: 'NT$' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$' },
  { code: 'THB', name: '泰铢', symbol: '฿' },
  { code: 'AED', name: '阿联酋迪拉姆', symbol: 'د.إ' },
  { code: 'INR', name: '印度卢比', symbol: '₹' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM' },
  { code: 'IDR', name: '印度尼西亚盾', symbol: 'Rp' },
  { code: 'VND', name: '越南盾', symbol: '₫' },
  
  // 美洲
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'BRL', name: '巴西雷亚尔', symbol: 'R$' },
  { code: 'MXN', name: '墨西哥比索', symbol: '$' },
  
  // 欧洲
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'CHF', name: '瑞士法郎', symbol: 'Fr' },
  { code: 'SEK', name: '瑞典克朗', symbol: 'kr' },
  { code: 'NOK', name: '挪威克朗', symbol: 'kr' },
  { code: 'DKK', name: '丹麦克朗', symbol: 'kr' },
  
  // 大洋洲
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'NZD', name: '新西兰元', symbol: 'NZ$' },
  
  // 其他
  { code: 'ZAR', name: '南非兰特', symbol: 'R' },
  { code: 'RUB', name: '俄罗斯卢布', symbol: '₽' },
  { code: 'TRY', name: '土耳其里拉', symbol: '₺' },
];

/**
 * 获取币种符号
 */
export function getCurrencySymbol(currencyCode: string): string {
  return COMMON_CURRENCIES.find(c => c.code === currencyCode.toUpperCase())?.symbol || currencyCode;
}

/**
 * 格式化货币显示
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'CNY',
  locale: string = 'zh-CN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
