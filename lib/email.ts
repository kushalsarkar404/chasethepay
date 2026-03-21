import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!resend) {
    resend = new Resend(key);
  }
  return resend;
}

export async function sendChaseEmail({
  to,
  subject,
  body,
  from,
  replyTo,
  isHtml = false,
  tags,
}: {
  to: string;
  subject: string;
  body: string;
  from: string;
  replyTo?: string;
  isHtml?: boolean;
  tags?: { name: string; value: string }[];
}) {
  const client = getResend();
  const html = isHtml ? body : body.replace(/\n/g, "<br>");
  const { data, error } = await client.emails.send({
    from,
    to,
    replyTo: replyTo ?? undefined,
    subject,
    html,
    tags: tags ?? undefined,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
