import { NextResponse } from 'next/server';
import { translateAlert } from '@/lib/llm';

// Mock data source in case external API fails or for demo
const MOCK_ALERTS = [
  "Line 1 Yonge-University: No service between St Clair and Union due to track maintenance.",
  "504 King: Severe delays due to a stalled streetcar at Spadina.",
  "Line 2 Bloor-Danforth: Signal problems at Kennedy. Expect longer travel times.",
  "501 Queen: Diverting via King due to construction."
];

export async function GET() {
  try {
    // 1. Fetch Raw Alerts
    // Real implementation would use GTFS-Realtime bindings or fetch RSS/JSON
    // Example:
    // const response = await fetch('https://external-api.com/ttc-alerts');
    // const rawAlerts = await response.json();

    // For this boilerplate, we'll simulate fetching data
    const rawAlerts = MOCK_ALERTS;

    // 2. Translate Alerts
    const posts = await Promise.all(
      rawAlerts.map(async (alert) => {
        const translation = await translateAlert(alert);
        return {
          id: Buffer.from(alert).toString('base64').substring(0, 10), // Simple ID generation
          original: alert,
          ...translation,
          timestamp: new Date().toISOString(),
          // Mock initial stats
          upvotes: Math.floor(Math.random() * 500) + 50,
          downvotes: Math.floor(Math.random() * 50),
          delayMinutes: Math.floor(Math.random() * 45) + 5
        };
      })
    );

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
