import type { 
  FMPProfile, 
  FMPQuote, 
  FMPIncomeStatement, 
  FMPBalanceSheet, 
  FMPCashFlow,
  FMPError 
} from '../lib/types/fmp';

const BASE_URL = 'https://financialmodelingprep.com/stable';

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error('FMP_API_KEY not configured');
  }
  return apiKey;
}

async function fetchFMP<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Vérifier les erreurs de type "Premium"
  if (data && typeof data === 'object' && 'Error Message' in data) {
    const errorMsg = data['Error Message'] as string;
    if (errorMsg.includes('Premium') || errorMsg.includes('subscription')) {
      throw new Error('Premium subscription required for this data');
    }
    throw new Error(`FMP API error: ${errorMsg}`);
  }
  
  return data;
}

export async function getStockProfile(ticker: string): Promise<FMPProfile> {
  const data = await fetchFMP<FMPProfile[]>(`/profile?symbol=${ticker}`);
  
  if (!data || data.length === 0) {
    throw new Error(`Stock not found: ${ticker}`);
  }
  
  return data[0];
}

export async function getStockQuote(ticker: string): Promise<FMPQuote | null> {
  const data = await fetchFMP<FMPQuote[]>(`/quote?symbol=${ticker}`);
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return data[0];
}

export async function getIncomeStatements(ticker: string, limit: number = 10): Promise<FMPIncomeStatement[]> {
  const data = await fetchFMP<FMPIncomeStatement[]>(`/income-statement?symbol=${ticker}&limit=${limit}`);
  return data || [];
}

export async function getBalanceSheets(ticker: string, limit: number = 10): Promise<FMPBalanceSheet[]> {
  const data = await fetchFMP<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${ticker}&limit=${limit}`);
  return data || [];
}

export async function getCashFlows(ticker: string, limit: number = 10): Promise<FMPCashFlow[]> {
  const data = await fetchFMP<FMPCashFlow[]>(`/cash-flow-statement?symbol=${ticker}&limit=${limit}`);
  return data || [];
}

export async function getHistoricalPrices(ticker: string, fromDate?: string): Promise<any[]> {
  const from = fromDate || new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await fetchFMP<{ historical: any[] }>(`/historical-price-eod/light?symbol=${ticker}&from=${from}`);
  return data?.historical || [];
}

// Classe FMPClient pour une utilisation orientée objet
export class FMPClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getApiKey();
    this.baseUrl = BASE_URL;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object' && 'Error Message' in data) {
      const errorMsg = data['Error Message'] as string;
      if (errorMsg.includes('Premium') || errorMsg.includes('subscription')) {
        throw new Error('Premium subscription required for this data');
      }
      throw new Error(`FMP API error: ${errorMsg}`);
    }
    
    return data;
  }

  async getProfile(ticker: string): Promise<FMPProfile> {
    const data = await this.fetch<FMPProfile[]>(`/profile?symbol=${ticker}`);
    if (!data || data.length === 0) {
      throw new Error(`Stock not found: ${ticker}`);
    }
    return data[0];
  }

  async getQuote(ticker: string): Promise<FMPQuote | null> {
    const data = await this.fetch<FMPQuote[]>(`/quote?symbol=${ticker}`);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }

  async getIncomeStatements(ticker: string, limit: number = 10): Promise<FMPIncomeStatement[]> {
    const data = await this.fetch<FMPIncomeStatement[]>(`/income-statement?symbol=${ticker}&limit=${limit}`);
    return data || [];
  }

  async getBalanceSheets(ticker: string, limit: number = 10): Promise<FMPBalanceSheet[]> {
    const data = await this.fetch<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${ticker}&limit=${limit}`);
    return data || [];
  }

  async getCashFlows(ticker: string, limit: number = 10): Promise<FMPCashFlow[]> {
    const data = await this.fetch<FMPCashFlow[]>(`/cash-flow-statement?symbol=${ticker}&limit=${limit}`);
    return data || [];
  }
}
