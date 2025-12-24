import { net } from "electron";
import { EventEmitter } from "events";

/**
 * NetworkMonitor
 * ----------------
 * Emits online/offline events globally.
 */
class NetworkMonitor extends EventEmitter {
  private online = false;

  constructor() {
    super();
    this.check();
    setInterval(() => this.check(), 5000); // lightweight & safe
  }

  private async check() {
    const wasOnline = this.online;

    try {
      const request = net.request("https://www.google.com");
      request.on("response", () => {
        this.online = true;
        if (!wasOnline) this.emit("online");
      });
      request.on("error", () => {
        this.online = false;
        if (wasOnline) this.emit("offline");
      });
      request.end();
    } catch {
      this.online = false;
      if (wasOnline) this.emit("offline");
    }
  }

  isOnline() {
    return this.online;
  }
}

export const networkMonitor = new NetworkMonitor();
