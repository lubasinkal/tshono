export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let nextId = 1

// Minimal toast queue (no dependency). Call toast.success()/error()/info()
// from any component or handler; <Toaster /> renders them top-right.
// useState must live inside the function — Nuxt forbids it at module scope.
export function useToast() {
  const toasts = useState<ToastItem[]>('app-toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  function push(message: string, type: ToastItem['type'] = 'info', duration = 3200) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message, type }]
    if (import.meta.client) setTimeout(() => dismiss(id), duration)
    return id
  }
  return {
    toasts,
    dismiss,
    push,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
    info: (message: string) => push(message, 'info'),
  }
}
