import type { Peer } from 'crossws'

const userPeers = new Map<string, Set<Peer>>()
const peerUser = new WeakMap<Peer, string>()

export function registerPeer(peer: Peer, userId: string) {
  peerUser.set(peer, userId)
  if (!userPeers.has(userId)) userPeers.set(userId, new Set())
  userPeers.get(userId)!.add(peer)
}

export function unregisterPeer(peer: Peer) {
  const userId = peerUser.get(peer)
  if (userId) {
    const set = userPeers.get(userId)
    set?.delete(peer)
    if (set?.size === 0) userPeers.delete(userId)
    peerUser.delete(peer)
  }
}

export function forwardToPeers(fromPeer: Peer, msg: string) {
  const userId = peerUser.get(fromPeer)
  if (!userId) return
  for (const p of userPeers.get(userId) ?? []) {
    if (p !== fromPeer) p.send(msg)
  }
}

export function notifyUser(userId: string, event: string) {
  const peers = userPeers.get(userId)
  if (!peers?.size) return
  const msg = JSON.stringify({ event })
  for (const peer of peers) peer.send(msg)
}