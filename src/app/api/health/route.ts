// Railway health check for the web service (also handy for uptime monitors).
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ ok: true, service: 'soulforge-web', time: new Date().toISOString(), realm: process.env.NEXT_PUBLIC_GAME_SERVER_URL ? 'configured' : 'offline-demo' }, { headers: { 'Cache-Control': 'no-store' } });
}
