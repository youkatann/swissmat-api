// app/api/meta/route.js
import { NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // у продакшні заміни на 'https://swiss-mat.ch'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders })
}

export async function POST(req) {
  try {
    const { event_name, event_id, user_data, custom_data } = await req.json()

    if (!event_name || !user_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
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

    const r = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const j = await r.json()

    return NextResponse.json(j, { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error('CAPI error:', err)
    return NextResponse.json(
      { error: 'CAPI failed', details: err.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
