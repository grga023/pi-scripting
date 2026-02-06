let metricsData = []; // in-memory storage

export async function POST(request) {
  try {
    const data = await request.json();
    metricsData.push(data);

    // Keep only last 100 entries
    if (metricsData.length > 100) metricsData.shift();

    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}

export async function GET() {
  return new Response(JSON.stringify(metricsData), { status: 200 });
}
