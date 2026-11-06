import { Resvg, initWasm } from '@resvg/resvg-wasm'

const W = 1200
const H = 630
const ACCENT = '#51c8fc'
const BG = '#080b13'
const TEXT = '#f9f9f9'
const MUTED = '#9aa3b2'
const FAINT = '#5b6678'
const LINE = '#1b2432'

// Space Mono advance width is 0.6em (monospace).
const CW = 0.6

let ready: Promise<{ regular: Uint8Array; bold: Uint8Array }> | null = null

async function loadAssets() {
  if (!ready) {
    ready = (async () => {
      const assets = useStorage('assets')
      const [wasm, regular, bold] = await Promise.all([
        assets.getItemRaw('server:resvg.wasm'),
        assets.getItemRaw('server:fonts/SpaceMono-Regular.ttf'),
        assets.getItemRaw('server:fonts/SpaceMono-Bold.ttf'),
      ])
      await initWasm(wasm as Uint8Array)
      return { regular: regular as Uint8Array, bold: bold as Uint8Array }
    })()
  }
  return ready
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function truncate(s: string, maxChars: number): string {
  const t = s.trim()
  return t.length > maxChars ? t.slice(0, Math.max(1, maxChars - 1)).trimEnd() + '…' : t
}

// Word-wrap into at most maxLines, truncating the final line with an ellipsis.
function wrap(s: string, maxChars: number, maxLines: number): string[] {
  const words = s.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w
    if (candidate.length <= maxChars) {
      cur = candidate
      continue
    }
    if (cur) {
      lines.push(cur)
      cur = w
    } else {
      lines.push(w.slice(0, Math.max(1, maxChars - 1)) + '…')
      return lines
    }
    if (lines.length >= maxLines) return lines
  }
  if (cur) lines.push(cur)
  return lines.slice(0, maxLines)
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const title = String(q.title ?? 'Role')
  const company = String(q.company ?? 'Hiring firm')
  const sector = String(q.sector ?? 'General')
  const location = String(q.location ?? 'Botswana')
  const blurb = String(q.blurb ?? '')
  const label = String(q.label ?? 'JOB')
  const sub = String(q.sub ?? '')

  const { regular, bold } = await loadAssets()

  const titleLines = wrap(title, 30, 2)
  const blurbLines = blurb ? wrap(blurb, 54, 2) : []
  const meta = truncate(sub || `${company} · ${location} · ${sector}`, 54)

  const brandW = Math.round('tshono'.length * 44 * CW)
  const dotCx = 80 + brandW + 18

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="80" y="80" font-family="Space Mono" font-weight="700" font-size="44" fill="${TEXT}">tshono</text>
<circle cx="${dotCx}" cy="62" r="9" fill="${ACCENT}"/>
<text x="1120" y="80" text-anchor="end" font-family="Space Mono" font-weight="400" font-size="26" letter-spacing="4" fill="${FAINT}">${esc(label)}</text>
${titleLines.map((l, i) => `<text x="80" y="${210 + i * 72}" font-family="Space Mono" font-weight="700" font-size="56" fill="${TEXT}">${esc(l)}</text>`).join('\n')}
<text x="80" y="352" font-family="Space Mono" font-weight="400" font-size="30" fill="${MUTED}">${esc(meta)}</text>
<line x1="80" y1="392" x2="1120" y2="392" stroke="${LINE}" stroke-width="2"/>
${blurbLines.map((l, i) => `<text x="80" y="${446 + i * 42}" font-family="Space Mono" font-weight="400" font-size="30" fill="${MUTED}">${esc(l)}</text>`).join('\n')}
<circle cx="92" cy="586" r="7" fill="${ACCENT}"/>
<text x="112" y="593" font-family="Space Mono" font-weight="400" font-size="26" fill="${FAINT}">tshono · every opportunity in botswana</text>
</svg>`

  const resvg = new Resvg(svg, {
    font: { fontBuffers: [regular, bold], loadSystemFonts: false, defaultFontFamily: 'Space Mono' },
  })
  const png = resvg.render().asPng()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  return png
})
