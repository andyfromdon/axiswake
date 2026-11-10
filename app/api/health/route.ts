export const dynamic = 'force-dynamic';
export function GET() { return Response.json({ status: 'ok', application: 'axis-nz', revision: process.env.APP_REVISION ?? 'development' }); }
