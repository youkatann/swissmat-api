// app/api/send-order/route.js
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// CORS-заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // у продакшні заміни '*' на 'https://swiss-mat.ch'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  // Відповідь на preflight-запит
  return NextResponse.json({}, { status: 200, headers: corsHeaders })
}

export async function POST(req) {
  try {
    const form = await req.json()

    // Валідація
    if (!form.email || !form.name || !form.privacy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    const carInfo = form.customBrand
      ? form.customText
      : `${form.brand} ${form.model}`

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
      console.error(error)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true, id: data.id },
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
