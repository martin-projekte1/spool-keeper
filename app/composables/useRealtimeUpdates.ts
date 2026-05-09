type Handler = (event: string, value?: string) => void

export function useRealtimeUpdates(onEvent: Handler) {
  const { user } = useUserSession()
  let ws: WebSocket | null = null
  let active = true
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  function connect() {
    if (!active) return
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/_ws`
    ws = new WebSocket(url)

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: 'auth', userId: user.value?.email }))
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