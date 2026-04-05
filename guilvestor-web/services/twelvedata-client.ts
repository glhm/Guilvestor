/**
 * Twelve Data client — price history.
 * Docs: https://twelvedata.com/docs
 * Free tier: 800 calls/day, 8 calls/min
 */

const BASE_URL = 'https://api.twelvedata.com';

function getApiKey(): string {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) throw new Error('TWELVEDATA_API_KEY not configured');
  return key;
}

async function fetchTwelve<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${getApiKey()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(`Twelve Data error: ${data.message}`);
  }

  return data;
}

// ── Types (raw Twelve Data responses) ──

export interface TwelveDataPrice {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TwelveDataTimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    type: string;
  };
  values: TwelveDataPrice[];
  status: string;
}

// ── Public API ──

/**
 * Get historical daily prices.
 * @param ticker - Stock symbol (e.g., "AAPL", "MC" for Euronext Paris)
 * @param outputsize - Number of data points (default 252 ≈ 1 year trading days)
 * @param exchange - Optional exchange for disambiguation (e.g., "Euronext" for EU tickers)
 */
export async function getTimeSeries(
  ticker: string,
  outputsize = 252,
  exchange?: string,
): Promise<TwelveDataTimeSeries> {
  let endpoint = `/time_series?symbol=${ticker}&interval=1day&outputsize=${outputsize}`;
  if (exchange) endpoint += `&exchange=${exchange}`;
  return fetchTwelve<TwelveDataTimeSeries>(endpoint);
}

/**
 * Get real-time or latest price.
 */
export async function getPrice(ticker: string): Promise<{ price: string }> {
  return fetchTwelve<{ price: string }>(`/price?symbol=${ticker}`);
}
