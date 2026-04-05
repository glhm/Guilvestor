import { StockAnalysisPage } from "@/components/stock/stock-analysis-page"

export default async function Home({ 
  params 
}: { 
  params: Promise<{ ticker: string }> 
}) {
  const { ticker } = await params;
  
  return <StockAnalysisPage />
}
