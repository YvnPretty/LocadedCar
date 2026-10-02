import type { NetworkInterfaceInfo } from "node:os";

export function contactlessBaseUrl(requestUrl: string, configured: string | undefined, interfaces: NodeJS.Dict<NetworkInterfaceInfo[]>) {
  if (configured?.trim()) {
    try {
      const url = new URL(configured.trim());
      if (url.protocol === "http:" || url.protocol === "https:") return url.origin;
    } catch { /* Use the request or local network address if configuration is invalid. */ }
  }
  const url = new URL(requestUrl);
  if (["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(url.hostname)) {
    const entries = Object.entries(interfaces).filter(([name]) => !/^(lo|docker|veth|br-|virbr|tun|vbox)/i.test(name));
    entries.sort(([a], [b]) => Number(/^wl/i.test(b)) - Number(/^wl/i.test(a)));
    const address = entries.flatMap(([, addresses]) => addresses ?? []).find(info => info.family === "IPv4" && !info.internal && /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(info.address));
    if (address) url.hostname = address.address;
  }
  return url.origin;
}
