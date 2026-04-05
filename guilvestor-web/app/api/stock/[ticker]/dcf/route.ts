import { NextRequest, NextResponse } from 'next/server';
import { calculateDCF } from '../../../../../services/calculations';
import { FMPAdapter } from '../../../../../services/fmp-adapter';
import type { ApiResponse, DCFResult, DCFInputs } from '../../../../../lib/types/fmp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
): Promise<NextResponse<ApiResponse<DCFResult>>> {
  try {
    const { ticker } = await params;

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: 'ticker is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate body inputs before any adapter calls
    if (body.currentFCF !== undefined && body.currentFCF < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input: currentFCF must be positive' },
        { status: 400 }
      );
    }

    const growthRate = body.growthRate ?? 0.10;
    const discountRate = body.discountRate ?? 0.10;
    const terminalMultiple = body.terminalMultiple ?? 15;
    const projectionYears = body.projectionYears ?? 10;

    if (growthRate < 0 || growthRate > 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid input: growthRate must be between 0 and 1' },
        { status: 400 }
      );
    }

    const fmpAdapter = new FMPAdapter();

    // Fetch stock data if needed fields are missing
    let currentFCF = body.currentFCF;
    let sharesOutstanding = body.sharesOutstanding;
    let currentPrice = body.currentPrice;

    if (!currentFCF) {
      const cashFlows = await fmpAdapter.getCashFlows?.(ticker, 1);
      if (cashFlows && cashFlows.length > 0) {
        currentFCF = cashFlows[0].freeCashFlow;
      }
    }

    if (!sharesOutstanding) {
      const incomeStatements = await fmpAdapter.getIncomeStatements?.(ticker, 1);
      if (incomeStatements && incomeStatements.length > 0) {
        sharesOutstanding = incomeStatements[0].weightedAverageSharesDiluted;
      }
    }

    if (!currentPrice) {
      const profile = await fmpAdapter.getProfile?.(ticker);
      if (profile) {
        currentPrice = profile.price;
      }
    }

    // Validate required fields after attempted fetches
    if (!currentFCF || !sharesOutstanding) {
      return NextResponse.json(
        { success: false, error: 'Unable to retrieve required financial data for DCF calculation' },
        { status: 400 }
      );
    }

    const dcfInputs: DCFInputs = {
      ticker,
      currentFCF,
      growthRate,
      discountRate,
      terminalMultiple,
      projectionYears,
      sharesOutstanding,
      currentPrice
    };

    const result = calculateDCF(dcfInputs);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calculating DCF:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
