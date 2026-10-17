"use client";
import { io, type ManagerOptions, type SocketOptions } from "socket.io-client";

export const usesPolling = process.env.NEXT_PUBLIC_GATEWAY_POLLING === "true";
export function createRealtimeSocket(options: Partial<ManagerOptions & SocketOptions>) {
  return io({ ...options, autoConnect: !usesPolling });
}
