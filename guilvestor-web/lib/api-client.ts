// Client API pour appeler les routes backend depuis le frontend
import type { CompleteStockData, DCFResult, DCFInputs, ChartDataPoint, ApiResponse } from './types/fmp';

const API_BASE = ''; // Routes API Next.js sont sur le même domaine

/**
 * Récupère les données complètes d'une action
 * GET /api/stock/{ticker}
 */
export async function fetchStockData(ticker: string): Promise<CompleteStockData> {
  const response = await fetch(`${API_BASE}/api/stock/${ticker}`);
  const data: ApiResponse<CompleteStockData> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch stock data');
  }
  
  return data.data;
}

/**
 * Calcule la valorisation DCF
 * POST /api/stock/{ticker}/dcf
 */
export async function calculateDCFValuation(
  ticker: string, 
  inputs: Omit<DCFInputs, 'ticker'>
): Promise<DCFResult> {
  const response = await fetch(`${API_BASE}/api/stock/${ticker}/dcf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(inputs)
  });
  
  const data: ApiResponse<DCFResult> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to calculate DCF');
  }
  
  return data.data;
}

/**
 * Récupère les données pour un graphique spécifique
 * GET /api/stock/{ticker}/chart?type={type}&period={period}
 */
export async function fetchChartData(
  ticker: string, 
  type: string, 
  period: '5y' | '10y' | 'all' = '5y'
): Promise<{ type: string; data: ChartDataPoint[] }> {
  const response = await fetch(
    `${API_BASE}/api/stock/${ticker}/chart?type=${type}&period=${period}`
  );
  
  const data: ApiResponse<{ type: string; data: ChartDataPoint[] }> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch chart data');
  }
  
  return data.data;
}

/**
 * Hook personnalisé pour récupérer les données d'une action
 * Usage: const { data, loading, error } = useStockData('AAPL');
 */
export function createStockDataHook() {
  return {
    fetch: fetchStockData,
    calculateDCF: calculateDCFValuation,
    fetchChart: fetchChartData
  };
}

// Export pour utilisation directe
export const apiClient = {
  fetchStockData,
  calculateDCFValuation,
  fetchChartData
};
