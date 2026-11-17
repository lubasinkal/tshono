// Smoke test for Neon Object Storage: upload, list, download, print.
// Run: bun run scripts/storage-smoke.ts <path-to-file>
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { Files } from 'files-sdk'
import { neon } from 'files-sdk/neon'

const bucket = 'uploads'
const source = process.argv[2]
if (!source) {
  console.error('usage: bun run scripts/storage-smoke.ts <file>')
  process.exit(2)
}

const body = await readFile(source)
const key = `smoke/${basename(source)}`
const files = new Files({ adapter: neon({ bucket }) })

const uploaded = await files.upload(key, body, { contentType: 'text/plain' })
console.log(`uploaded  ${key} (${body.byteLength} bytes, etag ${uploaded.etag ?? 'n/a'})`)

const { items } = await files.list({ prefix: 'smoke/' })
console.log(`listed    ${items.length} object(s) under smoke/`)
for (const item of items) console.log(`          ${item.key}  ${item.size} bytes`)

const got = await files.download(key)
const text = await got.text()
console.log('downloaded contents:')
console.log(text.trimEnd())
