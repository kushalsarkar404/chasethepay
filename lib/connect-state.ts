import { createHmac, timingSafeEqual } from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 min

function getSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is required for Connect state");
  return secret;
}

/**
 * Create a signed state token for Stripe Connect OAuth.
 * Prevents attackers from linking their Stripe account to another user.
 */
export function signConnectState(userId: string): string {
  const exp = Date.now() + STATE_TTL_MS;
  const payload = `${userId}:${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return Buffer.from(payload, "utf8").toString("base64url") + "." + sig;
}

/**
 * Verify and decode the state token. Returns userId or null if invalid/expired.
 */
export function verifyConnectState(state: string): string | null {
  const parts = state.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const [userId, expStr] = payload.split(":");
  const exp = parseInt(expStr ?? "", 10);
  if (!userId || isNaN(exp) || Date.now() > exp) return null;

  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest();
  let receivedSig: Buffer;
  try {
    receivedSig = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (receivedSig.length !== expectedSig.length || !timingSafeEqual(receivedSig, expectedSig)) {
    return null;
  }

  return userId;
}
