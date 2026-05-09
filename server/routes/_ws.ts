import { registerPeer, unregisterPeer, forwardToPeers } from '../utils/ws'

export default defineWebSocketHandler({
  open(_peer) {},

  message(peer, message) {
    let data: Record<string, unknown>
    try { data = message.json() } catch { return }

    if (data.type === 'auth' && typeof data.userId === 'string') {
      registerPeer(peer, data.userId)
      return
    }

    if (typeof data.event !== 'string') return
    forwardToPeers(peer, JSON.stringify({ event: data.event, value: data.value }))
  },

  close(peer) {
    unregisterPeer(peer)
  },
})