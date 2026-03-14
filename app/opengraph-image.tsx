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
          background: "linear-gradient(180deg, #06080f 0%, #0a0e1a 50%, #06080f 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#e4e8f0",
            letterSpacing: "-0.02em",
          }}
        >
          ChaseThePay
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 36,
            color: "#10e898",
            fontWeight: 700,
          }}
        >
          Let AI chase for you.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            color: "rgba(228, 232, 240, 0.6)",
          }}
        >
          Connect Stripe. Get paid without the awkward follow-ups.
        </div>
      </div>
    ),
    { ...size }
  );
}
