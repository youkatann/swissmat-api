// api/send-order.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const data = req.body
    const carInfo = data.customBrand
      ? data.customText
      : `${data.brand || 'Unknown'} ${data.model || ''}`

    const { data: emailData, error } = await resend.emails.send({
      from: 'SwissMat <no-reply@swiss-mat.ch>',
      to: 'swissmat.info@gmail.com',
      subject: `Car Mat Order: ${carInfo}`,
      html: `
        <h2>New Car Mat Order</h2>
        <p><b>Make & Model:</b> ${carInfo}</p>
        <p><b>Base color:</b> ${data.baseColor}</p>
        <p><b>Edge color:</b> ${data.borderColor}</p>
        <p><b>Kit:</b> ${data.kit}</p>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Phone:</b> ${data.phone}</p>
        <p><b>Comment:</b> ${data.comment || '—'}</p>
      `,
    })

    if (error) return res.status(400).json({ error: error.message })

    res.status(200).json({ success: true, id: emailData.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
