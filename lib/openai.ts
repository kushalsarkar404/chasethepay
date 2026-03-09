import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

function templateChaseMessage({
  customerName,
  amountDollars,
  daysOverdue,
  businessName,
}: {
  customerName: string;
  amountDollars: number;
  daysOverdue: number;
  businessName: string;
}): string {
  return `Hi ${customerName},

This is a friendly reminder that your invoice of $${amountDollars.toFixed(2)} is now ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue.

Please arrange payment at your earliest convenience. If you've already paid, please disregard this message.

Thank you,
${businessName}`;
}

export async function generateChaseMessage({
  customerName,
  amountDollars,
  daysOverdue,
  tone,
  businessName = "your business",
}: {
  customerName: string;
  amountDollars: number;
  daysOverdue: number;
  tone: "friendly" | "professional" | "firm";
  businessName?: string;
}): Promise<string> {
  if (process.env.DEV_SKIP_OPENAI === "true") {
    return templateChaseMessage({
      customerName,
      amountDollars,
      daysOverdue,
      businessName,
    });
  }

  const client = getOpenAI();

  const toneInstructions = {
    friendly:
      "Warm, casual, understanding. Assume it's an oversight. Include a payment link if applicable.",
    professional:
      "Polite but direct. Clear about the amount and due date. Professional tone.",
    firm: "Firm and direct. Emphasize the overdue status. Request immediate payment.",
  };

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You generate email reminders for overdue invoices. ${toneInstructions[tone]}
Rules:
- Keep the email concise (under 150 words)
- Use the customer's name
- State the amount clearly
- Mention days overdue
- End with a clear call to action (pay now)
- Sign off with the exact Business name provided (e.g. "Thank you,\\nAcme Inc")
- Do NOT use aggressive or threatening language
- Use HTML-friendly formatting (plain text, line breaks with \\n)`,
      },
      {
        role: "user",
        content: `Generate an email for:
- Customer: ${customerName}
- Amount: $${amountDollars.toFixed(2)}
- Days overdue: ${daysOverdue}
- Tone: ${tone}
- Business: ${businessName}

Return ONLY the email body, no subject line.`,
      },
    ],
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }
  return content;
}
