import { NextResponse } from "next/server";
import { ENQUIRY } from "@/config/business";
import { cleanValues, deliveryAccepted, toDeliveryPayload, validate } from "@/lib/enquiry";

/**
 * Receives an enquiry from the form and delivers it to the studio.
 *
 * WHERE IT GOES. To the URL in the server environment variable named by ENQUIRY.destinationEnv
 * (ENQUIRY_WEBHOOK_URL), as a JSON POST. Anything that accepts a webhook works: Formspree, Make,
 * Zapier, n8n, a Google Apps Script, your own CRM. The URL is never sent to the browser. If
 * ENQUIRY_WEBHOOK_TOKEN is also set it is sent as a Bearer token. See README, "Receiving enquiries".
 *
 * HONESTY. It answers 200 only after the destination has accepted the enquiry (a 2xx that comes with a
 * web page or `{"ok": false}` is not acceptance: see deliveryAccepted). With no destination
 * configured it answers 503 `not_configured`, and the form then offers the visitor a ready-made
 * WhatsApp message instead of pretending anything was sent.
 *
 * It checks everything again here (the browser's checks are a convenience, not a defence), caps the
 * size of what it accepts, quietly drops submissions that fill the hidden honeypot field, and
 * slows down a single address that sends many.
 */

const MAX_BODY_BYTES = 12_000;
const DELIVERY_TIMEOUT_MS = 8_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

/** Recent submissions per address. Per server instance, so it is a speed bump, not a wall. */
const recent = new Map<string, number[]>();

function tooMany(address: string): boolean {
  const now = Date.now();
  const hits = (recent.get(address) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(address, hits);
  // Keep the table from growing without limit.
  if (recent.size > 2_000) for (const key of recent.keys()) recent.delete(key);
  return hits.length > MAX_PER_WINDOW;
}

const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

/** Only https destinations (or localhost, for trying it out), so an enquiry is never sent in the clear. */
function destinationUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (url.protocol === "http:" && local) ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(address)) return fail("rate_limited", 429);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return fail("too_large", 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fail("invalid", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid", 400);
  }

  // The honeypot: a field people never see, so only a script fills it. Looks like success to the script.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const values = cleanValues(body);
  const errors = validate(values);
  if (Object.keys(errors).length > 0) return fail("invalid", 400, { errors });

  const configured = process.env[ENQUIRY.destinationEnv];
  if (!configured) return fail("not_configured", 503);
  const destination = destinationUrl(configured);
  if (!destination) {
    console.error(`${ENQUIRY.destinationEnv} must be an https:// URL.`);
    return fail("not_configured", 503);
  }

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 300) : "";
  const payload = toDeliveryPayload(values, { pageUrl, receivedAt: new Date().toISOString() });
  const token = process.env.ENQUIRY_WEBHOOK_TOKEN;

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    const answer = (await response.text()).slice(0, 2_000);
    const accepted = deliveryAccepted({
      ok: response.ok,
      contentType: response.headers.get("content-type"),
      body: answer,
    });
    if (!accepted) {
      // The status only: never log what the visitor wrote.
      console.error(`Enquiry destination did not confirm (status ${response.status}).`);
      return fail("delivery_failed", 502);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Enquiry could not be delivered:", error instanceof Error ? error.name : "error");
    return fail("delivery_failed", 502);
  }
}

/** The form only ever posts; anything else is told so plainly. */
export function GET() {
  return fail("method_not_allowed", 405);
}
