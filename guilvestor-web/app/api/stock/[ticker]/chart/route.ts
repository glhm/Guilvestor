import { NextRequest, NextResponse } from 'next/server';
import { FMPAdapter } from '../../../../../services/fmp-adapter';
import type { ApiResponse, ChartDataPoint } from '../../../../../lib/types/fmp';

const adapter = new FMPAdapter();

type ChartType = 'revenue' | 'fcf' | 'fcf-per-share' | 'roic' | 'gross-margin' | 'fcf-margin' | 'shares' | 'dividends' | 'cash-debt';
type Period = '5y' | '10y' | 'all';

const VALID_CHART_TYPES: ChartType[] = ['revenue', 'fcf', 'fcf-per-share', 'roic', 'gross-margin', 'fcf-margin', 'shares', 'dividends', 'cash-debt'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
): Promise<NextResponse<ApiResponse<{ type: string; data: ChartDataPoint[] }>>> {
  try {
    const { ticker } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ChartType;
    const period = (searchParams.get('period') || '5y') as Period;

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: 'ticker is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'type is required' },
        { status: 400 }
      );
    }

    if (!VALID_CHART_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid chart type. Valid types: ${VALID_CHART_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine limit based on period
    const limit = period === '5y' ? 5 : period === '10y' ? 10 : 20;

    let chartData: ChartDataPoint[] = [];

    switch (type) {
      case 'revenue': {
        const items = await adapter.getIncomeStatements(ticker, limit);
        chartData = items
          .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
          .map(item => ({ year: item.fiscalYear, value: item.revenue / 1_000_000_000 }));
        break;
      }

      case 'fcf': {
        const items = await adapter.getCashFlows(ticker, limit);
        chartData = items
          .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
          .map(item => ({
            year: item.fiscalYear,
            value: item.freeCashFlow / 1_000_000_000,
            value2: item.stockBasedCompensation / 1_000_000_000,
          }));
        break;
      }

      case 'fcf-per-share': {
        const [cfs, incomes] = await Promise.all([
          adapter.getCashFlows(ticker, limit),
          adapter.getIncomeStatements(ticker, limit),
        ]);
        const sortedCF = cfs.sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear));
        const sortedIncome = incomes.sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear));
        chartData = sortedCF.map((cf, i) => ({
          year: cf.fiscalYear,
          value: cf.freeCashFlow / (sortedIncome[i]?.weightedAverageSharesDiluted || 1),
        }));
        break;
      }

      case 'shares': {
        const items = await adapter.getIncomeStatements(ticker, limit);
        chartData = items
          .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
          .map(item => ({ year: item.fiscalYear, value: item.weightedAverageSharesDiluted / 1_000_000 }));
        break;
      }

      case 'cash-debt': {
        const items = await adapter.getBalanceSheets(ticker, limit);
        chartData = items
          .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
          .map(item => ({
            year: item.fiscalYear,
            value: item.cashAndCashEquivalents / 1_000_000_000,
            value2: item.totalDebt / 1_000_000_000,
          }));
        break;
      }

      case 'dividends': {
        const items = await adapter.getCashFlows(ticker, limit);
        chartData = items
          .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
          .map(item => ({
            year: item.fiscalYear,
            value: item.dividendsPaid ? Math.abs(item.dividendsPaid) / 1_000_000_000 : 0,
          }));
        break;
      }

      // TODO: Implement other chart types
      case 'roic':
      case 'gross-margin':
      case 'fcf-margin':
        chartData = []; // Placeholder
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        data: chartData
      }
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
