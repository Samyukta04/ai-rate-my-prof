export async function POST(request) {
  const { email, password } = await request.json();

  // Replace this with your real user validation logic
  if (email === 'user@example.com' && password === 'password') {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), { status: 401 });
  }
}