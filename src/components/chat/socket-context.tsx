"use client";

import { createRealtimeSocket, usesPolling } from '@/lib/realtime-client';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type SocketContextValue = {
    getSocket: () => Socket | null;
    joinSession: (sessionId: string) => void;
};

const SocketContext = createContext<SocketContextValue>({
    getSocket: () => null,
    joinSession: () => {},
});

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const socket = createRealtimeSocket({
            path: "/api/socket/io",
            addTrailingSlash: false,
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            setReady(true);
        });

        socket.on("disconnect", () => {
            setReady(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const getSocket = () => socketRef.current;

    const joinSession = (sessionId: string) => {
        const s = socketRef.current;
        if (s?.connected) {
            s.emit("join-session", sessionId);
        }
    };

    return (
        <SocketContext.Provider value={{ getSocket, joinSession }}>
            {children}
        </SocketContext.Provider>
    );
}
