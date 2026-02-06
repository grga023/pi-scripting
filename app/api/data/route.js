let metricsStore = []; // in-memory store (resets on redeploy)

export async function POST(req) {
  const data = await req.json();

  if (!data || !data.timestamp) {
    return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
  }

  metricsStore.push(data);

  return new Response(JSON.stringify({ success: true }));
}

export async function GET() {
  return new Response(JSON.stringify(metricsStore));
}
