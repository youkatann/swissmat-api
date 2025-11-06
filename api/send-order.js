// app/api/send-order/route.js
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ---- CORS конфіг ----
const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? 'https://swiss-mat.ch'
    : '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  Vary: 'Origin', // щоб уникнути кешування різних origin
}

// ---- OPTIONS ----
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // без тіла
    headers: corsHeaders,
  })
}

// ---- POST ----
export async function POST(req) {
  try {
    const form = await req.json()

    // Проста валідація
    if (!form.email || !form.name || !form.privacy) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const carInfo = form.customBrand
      ? form.customText
      : `${form.brand || 'Unknown'} ${form.model || ''}`

    const subject = `Car Mat Order: ${carInfo}`
    const body = `
      <h2>New Car Mat Order</h2>
      <p><strong>Make & Model:</strong> ${carInfo}</p>
      <p><strong>Base color:</strong> ${form.baseColor}</p>
      <p><strong>Edge color:</strong> ${form.borderColor}</p>
      <p><strong>Kit:</strong> ${form.kit}</p>
      <p><strong>Name:</strong> ${form.name}</p>
      <p><strong>Email:</strong> ${form.email}</p>
      <p><strong>Phone:</strong> ${form.phone}</p>
      <p><strong>Comment:</strong> ${form.comment || '—'}</p>
    `

    const { data, error } = await resend.emails.send({
      from: 'SwissMat <no-reply@swiss-mat.ch>',
      to: ['swissmat.info@gmail.com'],
      subject,
      html: body,
    })

    if (error) {
      console.error('Resend error:', error)
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    return new NextResponse(
      JSON.stringify({ success: true, id: data?.id || null }),
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    console.error('Send-order exception:', err)
    return new NextResponse(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
}
