import { ImageResponse } from "next/og";

export const alt = "ChaseThePay — Automated Invoice Chasing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          ChaseThePay
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 36,
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          Let AI chase for you.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            color: "#6b7280",
          }}
        >
          Connect Stripe. Get paid without the awkward follow-ups.
        </div>
      </div>
    ),
    { ...size }
  );
}
