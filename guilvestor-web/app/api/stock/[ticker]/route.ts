import { NextRequest, NextResponse } from 'next/server';
import { FMPAdapter } from '../../../../services/fmp-adapter';
import { GetStockAnalysisUseCase } from '../../../../services/use-cases/get-stock-analysis';
import type { ApiResponse, CompleteStockData } from '../../../../lib/types/fmp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
): Promise<NextResponse<ApiResponse<CompleteStockData>>> {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json({ success: false, error: 'ticker is required' }, { status: 400 });
  }

  try {
    const useCase = new GetStockAnalysisUseCase(new FMPAdapter());
    const data = await useCase.execute(ticker);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Stock not found')) {
      return NextResponse.json({ success: false, error: 'Stock not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('Premium')) {
      return NextResponse.json(
        { success: false, error: 'Premium subscription required for this data' },
        { status: 403 },
      );
    }
    console.error('[STOCK API ERROR]', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
