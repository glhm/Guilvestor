export default function Home({ params }: { params: { ticker: string } }) {
  const { ticker } = params;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Guilvestor</h1>
        <p className="text-muted-foreground">
          Analyse financière pour {ticker.toUpperCase()}
        </p>
      </div>
    </main>
  );
}
