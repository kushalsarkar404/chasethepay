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
      ? "First reminder. Keep it light and friendly."
      : chaseNumber === 2
        ? "Second reminder. Gentle follow-up—life gets busy."
        : `Reminder #${chaseNumber}. Stay polite and understanding. They may be dealing with other things.`;

  const behaviorContext =
    lastChaseBehavior === "opened"
      ? "They saw our last email but didn't click. No pressure—just offer the link again in a helpful way."
      : lastChaseBehavior === "clicked"
        ? "They clicked the pay link last time but didn't finish. Something may have come up. Offer the link again helpfully."
        : "";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You generate friendly invoice reminder emails. ${toneInstructions[tone]}
Rules:
- Keep it short and natural (under 150 words)
- Use the customer's name
- State the amount and due date clearly
- Sound like a normal person, not a debt collector—no guilt, pressure, or stern language
- Offer the pay link in a helpful way, never demanding
- Sign off with the exact Business name provided (e.g. "Thank you,\\nAcme Inc")
- Use plain text with \\n for line breaks
- Even on later reminders, stay kind and understanding—life happens`,
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
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }
  return content;
}
