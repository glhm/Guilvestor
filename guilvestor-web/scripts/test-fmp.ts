// Script pour explorer l'API FMP et voir le format des données
// Usage: npx ts-node scripts/test-fmp.ts

const FMP_API_KEY = process.env.FMP_API_KEY || '5lJYlgzmXPv0mvk59OpZgYe9dZ9clh0I';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

const TICKER = 'FISV';

async function fetchFMP(endpoint: string) {
  const url = `${BASE_URL}${endpoint}?apikey=${FMP_API_KEY}`;
  console.log(`\n🔍 Fetching: ${url.replace(FMP_API_KEY, '***')}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function exploreFMP() {
  console.log('🚀 Exploration API FMP pour', TICKER);
  console.log('='.repeat(60));

  try {
    // 1. Company Profile
    console.log('\n📊 1. COMPANY PROFILE');
    const profile = await fetchFMP(`/profile/${TICKER}`);
    console.log('Structure:', JSON.stringify(profile[0], null, 2).substring(0, 1000) + '...');

    // 2. Income Statement (Annual)
    console.log('\n📈 2. INCOME STATEMENT (Annual)');
    const income = await fetchFMP(`/income-statement/${TICKER}?limit=10`);
    console.log('Nombre d\'années:', income.length);
    console.log('Structure première entrée:', JSON.stringify(income[0], null, 2).substring(0, 1500) + '...');

    // 3. Balance Sheet (Annual)
    console.log('\n💰 3. BALANCE SHEET (Annual)');
    const balance = await fetchFMP(`/balance-sheet-statement/${TICKER}?limit=10`);
    console.log('Nombre d\'années:', balance.length);
    console.log('Structure première entrée:', JSON.stringify(balance[0], null, 2).substring(0, 1500) + '...');

    // 4. Cash Flow (Annual)
    console.log('\n💵 4. CASH FLOW (Annual)');
    const cashflow = await fetchFMP(`/cash-flow-statement/${TICKER}?limit=10`);
    console.log('Nombre d\'années:', cashflow.length);
    console.log('Structure première entrée:', JSON.stringify(cashflow[0], null, 2).substring(0, 1500) + '...');

    // 5. Quote (prix actuel)
    console.log('\n📌 5. QUOTE (Prix actuel)');
    const quote = await fetchFMP(`/quote/${TICKER}`);
    console.log('Structure:', JSON.stringify(quote[0], null, 2));

    // 6. Shares Float
    console.log('\n🔢 6. SHARES FLOAT');
    const shares = await fetchFMP(`/shares_float/${TICKER}`);
    console.log('Structure:', JSON.stringify(shares[0], null, 2));

    // 7. Historical Price (pour charts)
    console.log('\n📉 7. HISTORICAL PRICE (5 dernières années)');
    const history = await fetchFMP(`/historical-price-full/${TICKER}?from=2019-01-01`);
    console.log('Nombre de jours:', history.historical?.length || 0);
    console.log('Structure première entrée:', JSON.stringify(history.historical?.[0], null, 2));

    console.log('\n✅ Exploration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

exploreFMP();
