// CSV for spreadsheet screening. Only fields with a comma, quote or newline
// are quoted; doubled quotes escape quotes. Excel reads UTF-8 with a BOM.
const quote = (v: unknown) => {
  const s = v == null ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(quote).join(',')).join('\r\n')
}
