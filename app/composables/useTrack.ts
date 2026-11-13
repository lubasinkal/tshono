// Umami custom events. No-ops until the script is configured, and never runs
// on the server. Keep payloads small: the dashboard only needs enough to
// segment by job and placement.
type Umami = {
  track: (event: string, data?: Record<string, string | number | boolean>) => void
}

export function track(event: string, data?: Record<string, string | number | boolean>) {
  if (import.meta.server) return
  ;(window as unknown as { umami?: Umami }).umami?.track(event, data)
}
