import { registerPeer, unregisterPeer, forwardToPeers } from "../utils/ws";
import { consumeWsAuthToken } from "../utils/ws-auth";

export default defineWebSocketHandler({
  open(_peer) {},

  message(peer, message) {
    let data: Record<string, unknown>;
    try {
      data = message.json();
    } catch {
      return;
    }

    if (data.type === "auth" && typeof data.token === "string") {
      const userId = consumeWsAuthToken(data.token);
      if (!userId) {
        peer.close();
        return;
      }
      registerPeer(peer, userId);
      return;
    }

    if (typeof data.event !== "string") return;
    forwardToPeers(
      peer,
      JSON.stringify({ event: data.event, value: data.value }),
    );
  },

  close(peer) {
    unregisterPeer(peer);
  },
});
