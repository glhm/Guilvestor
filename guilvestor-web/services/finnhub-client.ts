/**
 * Finnhub client — live quotes & company profile.
 * Docs: https://finnhub.io/docs/api
 * Free tier: 60 calls/min
 */

const BASE_URL = 'https://finnhub.io/api/v1';

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('FINNHUB_API_KEY not configured');
  return key;
}

async function fetchFinnhub<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${getApiKey()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// ── Types (raw Finnhub responses) ──

export interface FinnhubQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
  t: number;  // timestamp
}

export interface FinnhubProfile {
  country: string;
  currency: string;
  estimateCurrency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number; // in millions
  name: string;
  phone: string;
  shareOutstanding: number; // in millions
  ticker: string;
  weburl: string;
}

// ── Public API ──

export async function getQuote(ticker: string): Promise<FinnhubQuote> {
  return fetchFinnhub<FinnhubQuote>(`/quote?symbol=${ticker}`);
}

export async function getProfile(ticker: string): Promise<FinnhubProfile> {
  return fetchFinnhub<FinnhubProfile>(`/stock/profile2?symbol=${ticker}`);
}
