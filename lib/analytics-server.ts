/**
 * Server-side analytics – for webhooks, cron, API routes.
 * Sends events to Mixpanel via HTTP API (no browser).
 * Call from API routes and server code only.
 */

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const isEnabled = !!MIXPANEL_TOKEN;

export type ServerEventProps = Record<
  string,
  string | number | boolean | undefined | null
>;

/**
 * Track event from server (webhooks, cron, API).
 * Uses Mixpanel HTTP /track endpoint.
 */
export async function trackServer(
  distinctId: string,
  event: string,
  properties?: ServerEventProps
): Promise<void> {
  if (!isEnabled || !distinctId?.trim()) return;

  const payload = [
    {
      event,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: distinctId,
        time: Math.floor(Date.now() / 1000),
        $insert_id: `${distinctId}-${event}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...properties,
        source: "server",
        environment: process.env.NODE_ENV,
      },
    },
  ];

  try {
    const body = `data=${encodeURIComponent(JSON.stringify(payload))}`;
    await fetch("https://api.mixpanel.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    console.error("[analytics-server] track failed:", err);
  }
}

/**
 * Track revenue from server (e.g. invoice.paid webhook).
 * Uses Mixpanel $amount for automatic revenue attribution.
 */
export async function trackServerRevenue(
  distinctId: string,
  amountCents: number,
  props?: ServerEventProps
): Promise<void> {
  if (!isEnabled || !distinctId?.trim() || amountCents <= 0) return;

  const amountUsd = amountCents / 100;

  await trackServer(distinctId, "Revenue_Recovered", {
    $amount: amountUsd,
    amount_cents: amountCents,
    ...props,
  });
}
