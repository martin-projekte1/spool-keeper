type Handler = (event: string, value?: string) => void

export function useRealtimeUpdates(onEvent: Handler) {
  let ws: WebSocket | null = null
  let active = true
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  async function connect() {
    if (!active) return
    let token: string
    try {
      const result = await $fetch<{ token: string }>('/api/ws-auth')
      token = result.token
    } catch {
      if (active) reconnectTimeout = setTimeout(connect, 3_000)
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/_ws`
    ws = new WebSocket(url)
    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onEvent(data.event, data.value)
      } catch { /* ignore malformed messages */ }
    }

    ws.onclose = () => {
      if (active) reconnectTimeout = setTimeout(connect, 3_000)
    }
  }

  function send(data: object) {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
  }

  onMounted(connect)
  onUnmounted(() => {
    active = false
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    ws?.close()
  })

  return { send }
}
