import { LEADS } from '../content'

/**
 * Sends a lead (order enquiry or review) using whichever channel is configured
 * in src/content.js → LEADS. Returns { ok, channel, message }.
 */
export async function sendLead(kind, data) {
  const payload = { kind, ...data, submittedAt: new Date().toISOString(), page: location.href }
  const text = toText(kind, data)

  if (LEADS.endpoint) {
    try {
      const res = await fetch(LEADS.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { ok: true, channel: 'endpoint' }
    } catch (e) {
      return { ok: false, channel: 'endpoint', message: 'We couldn’t send that just now. Please try again in a moment.' }
    }
  }
  if (LEADS.whatsapp) {
    window.open(`https://wa.me/${LEADS.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    return { ok: true, channel: 'whatsapp' }
  }
  if (LEADS.email) {
    const subject = kind === 'review' ? 'Tiffexx review' : 'Tiffexx order enquiry'
    location.href = `mailto:${LEADS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
    return { ok: true, channel: 'email' }
  }
  // Nothing configured yet — never pretend it was sent.
  console.warn('[Tiffexx] No lead channel configured. Set LEADS in src/content.js.', payload)
  return {
    ok: false,
    channel: 'none',
    message: 'Online ordering isn’t switched on yet — the site owner needs to connect it. Please check back soon.',
  }
}

function toText(kind, d) {
  if (kind === 'review') return `Tiffexx review\nName: ${d.name}\nArea: ${d.area || '-'}\n\n${d.text}`
  return [
    'Hi Tiffexx! I’d like a tiffin.',
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Area: ${d.area}`,
    `Locality: ${d.locality}`,
    `Meal: ${d.meal}`,
    `How often: ${d.frequency}`,
    d.notes ? `Notes: ${d.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
