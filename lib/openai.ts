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
  dueDateFormatted,
  businessName,
  chaseNumber,
  lastChaseBehavior,
}: {
  customerName: string;
  amountDollars: number;
  dueDateFormatted: string;
  businessName: string;
  chaseNumber: number;
  lastChaseBehavior?: "opened" | "clicked" | null;
}): string {
  const urgency =
    chaseNumber === 1
      ? "Just a quick heads-up"
      : chaseNumber === 2
        ? "Following up"
        : "Touching base again";
  const behaviorLine =
    lastChaseBehavior === "opened"
      ? "Here's the pay link in case you need it."
      : lastChaseBehavior === "clicked"
        ? "If anything came up last time, no worries—here's the link again."
        : "";
  return `Hi ${customerName},

${urgency}—your invoice of $${amountDollars.toFixed(2)} was due on ${dueDateFormatted}.
${behaviorLine ? `\n${behaviorLine}\n` : ""}
Whenever you get a chance, we'd appreciate payment. If you've already paid, please ignore this.

Thank you,
${businessName}`;
}

export async function generateChaseMessage({
  customerName,
  amountDollars,
  dueDateFormatted,
  tone,
  businessName = "your business",
  chaseNumber = 1,
  lastChaseBehavior,
}: {
  customerName: string;
  amountDollars: number;
  dueDateFormatted: string;
  tone: "friendly" | "professional" | "firm";
  businessName?: string;
  chaseNumber?: number;
  /** "opened" = last chase was opened but not clicked; "clicked" = pay link was clicked */
  lastChaseBehavior?: "opened" | "clicked" | null;
}): Promise<string> {
  if (process.env.DEV_SKIP_OPENAI === "true") {
    return templateChaseMessage({
      customerName,
      amountDollars,
      dueDateFormatted,
      businessName,
      chaseNumber,
      lastChaseBehavior,
    });
  }

  const client = getOpenAI();

  const toneInstructions = {
    friendly:
      "Warm, casual, and understanding. Assume it's an oversight. Sound like a helpful human, not a collections agency.",
    professional:
      "Polite and clear. Professional but not stiff. Friendly without being informal.",
    firm:
      "Direct and clear about the amount due, but still respectful. No pressure tactics or guilt-tripping.",
  };

  const chaseContext =
    chaseNumber === 1
      ? "First reminder."
      : chaseNumber === 2
        ? "Second reminder."
        : `Reminder #${chaseNumber}.`;

  const behaviorContext =
    lastChaseBehavior === "opened"
      ? "They saw the last email but didn't click. Keep it brief."
      : lastChaseBehavior === "clicked"
        ? "They clicked but didn't pay. Brief follow-up."
        : "";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You generate friendly invoice reminder emails. ${toneInstructions[tone]}

Keep it concise: 3–5 sentences, 60–90 words. Brief but warm.

Rules:
- Greeting + amount + due date + polite ask. One short line of context is fine.
- Use the customer's name once.
- Do NOT include any link, URL, or placeholder. A Pay Now button is added automatically at the end.
- Sign off with the exact Business name provided.
- No lengthy paragraphs or excessive small talk.`,
      },
      {
        role: "user",
        content: `Generate an email for:
- Customer: ${customerName}
- Amount: $${amountDollars.toFixed(2)}
- Due date: ${dueDateFormatted}
- Tone: ${tone}
- Business: ${businessName}
- Chase context: ${chaseContext}
${behaviorContext ? `- Behavior insight: ${behaviorContext}` : ""}

Return ONLY the email body, no subject line.`,
      },
    ],
    max_tokens: 220,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }
  return content;
}
