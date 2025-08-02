export async function introspectToken(token: string): Promise<boolean> {
  const response = await fetch('/api/introspect-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();
  return data.active === true;
}