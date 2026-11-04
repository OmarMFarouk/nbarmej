// مصدر الزيارة وبيانات الحملة (UTM وGCLID): تُحفظ عند الدخول وتُرسل مع الطلب، ويُسجَّل التحويل بعد نجاح الحفظ فقط
const KEY = 'nb_attr'
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']
const TTL = 90 * 24 * 3600 * 1000 // نافذة GCLID في Google Ads: 90 يومًا

const read = () => {
  try {
    const a = JSON.parse(localStorage[KEY] || 'null')
    return a && Date.now() - a.ts < TTL ? a : null
  } catch { return null }
}

// يُستدعى مرة عند تحميل الصفحة. زيارة بحملة جديدة تستبدل القديمة؛ الزيارة العادية لا تمسحها
export function captureAttribution() {
  try {
    const q = new URLSearchParams(location.search)
    const fresh = {}
    for (const k of KEYS) if (q.get(k)) fresh[k] = q.get(k).slice(0, 255)
    const old = read()
    if (!Object.keys(fresh).length && old) return
    let ref = ''
    try { ref = document.referrer && new URL(document.referrer).origin !== location.origin ? document.referrer : '' } catch {}
    const source = fresh.utm_source || (fresh.gclid ? 'google_ads' : ref ? new URL(ref).hostname : 'direct')
    if (!Object.keys(fresh).length && !ref && old) return
    localStorage[KEY] = JSON.stringify({ ...fresh, source, referrer: ref.slice(0, 500), landing_url: (location.origin + location.pathname + location.search).slice(0, 500), ts: Date.now() })
  } catch {}
}

export function getAttribution() {
  const a = read() || {}
  const { ts, ...rest } = a // eslint-disable-line no-unused-vars
  return rest
}

// حدث للـdataLayer (GTM): يربطه المسوّق بوسم تحويل Google Ads. لا يتكرر لنفس رقم الطلب ولو أُعيد تحميل الصفحة
export function trackRequest(orderNo) {
  try {
    const done = JSON.parse(sessionStorage.nb_conv || '[]')
    if (done.includes(orderNo)) return
    sessionStorage.nb_conv = JSON.stringify([...done, orderNo])
  } catch {}
  const a = getAttribution()
  ;(window.dataLayer = window.dataLayer || []).push({ event: 'quote_request_submitted', order_no: orderNo, transaction_id: orderNo, gclid: a.gclid || '', utm_source: a.utm_source || a.source || '', utm_campaign: a.utm_campaign || '' })
}
