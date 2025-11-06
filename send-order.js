// app/api/send-order/route.js
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const form = await req.json()

    // Простенька валідація
    if (!form.email || !form.name || !form.privacy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      html: body
      // можна додати react: <EmailTemplate {...} /> замість html
    })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
