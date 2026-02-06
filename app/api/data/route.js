let dataStore = []; // temporary in-memory store

export async function POST(req) {
  const body = await req.json(); 
  // body should be { value: 10 } or { value: 42 }

  if (!body || typeof body.value !== "number") {
    return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
  }

  dataStore.push(body.value);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET() {
  return new Response(JSON.stringify(dataStore), { status: 200 });
}
