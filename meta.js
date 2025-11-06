export async function POST(req) {
  try {
    const { event_name, event_id, user_data, custom_data } = await req.json();

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          action_source: "website",
          user_data,
          custom_data,
        },
      ],
    };

    const r = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const j = await r.json();
    return NextResponse.json(j);
  } catch (err) {
    console.error("CAPI error:", err);
    return NextResponse.json({ error: "CAPI failed" }, { status: 500 });
  }
}
