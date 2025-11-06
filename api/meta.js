// api/meta.js
export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // --- Preflight (OPTIONS) ---
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { event_name, event_id, user_data, custom_data } = req.body

    if (!event_name || !user_data) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          action_source: 'website',
          user_data,
          custom_data,
        },
      ],
    }

    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const result = await fbRes.json()
    res.status(200).json(result)
  } catch (err) {
    console.error('CAPI error:', err)
    res.status(500).json({ error: 'CAPI failed', details: err.message })
  }
}
