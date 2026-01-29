import { NextResponse } from "next/server";

/**
 * POST /api/newsletter
 * Reçoit l'email et le transmet au webhook n8n (variable N8N_NEWSLETTER_WEBHOOK_URL).
 * Si la variable n'est pas définie, retourne 200 quand même (formulaire utilisable sans n8n).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_NEWSLETTER_WEBHOOK_URL;

    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "airfryerdeal-footer",
          subscribedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        console.error("n8n webhook error:", res.status, await res.text());
        return NextResponse.json(
          { error: "Erreur lors de l'inscription" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Newsletter API error:", e);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
