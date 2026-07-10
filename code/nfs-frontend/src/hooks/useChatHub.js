import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

const BASE_URL = "http://localhost:5148";

function getToken() {
    return localStorage.getItem("jwt") || "";
}

/**
 * useChatHub — manages a SignalR connection to /chatHub
 *
 * Returns:
 *   connectionStatus: "connecting" | "connected" | "disconnected"
 *   connectionRef: ref to the HubConnection instance
 *   joinRoom(roomId)
 *   leaveRoom(roomId)
 *   sendGroupMessage(roomId, message)
 *   sendPrivateMessage(receiverId, message)
 *   onGroupMessage(callback)   — register handler for ReceiveGroupMessage
 *   onPrivateMessage(callback) — register handler for ReceivePrivateMessage
 *   fetchRoomHistory(roomId)   — returns Promise<ChatMessage[]>
 *   fetchPrivateHistory(otherUserId) — returns Promise<ChatMessage[]>
 */
export function useChatHub() {
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const connectionRef = useRef(null);
    const groupHandlerRef = useRef(null);
    const privateHandlerRef = useRef(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${BASE_URL}/chatHub`, {
                accessTokenFactory: () => getToken(),
                skipNegotiation: false,
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connectionRef.current = connection;

        const token = getToken();
        console.log(
            `[ChatHub] Token found: ${token ? "YES (" + token.slice(0, 20) + "...)" : "NO — connection will be anonymous or rejected"}`
        );
        // Wire incoming message handlers through refs so callers can swap callbacks
        connection.on("ReceiveGroupMessage", (msg) => {
            if (groupHandlerRef.current) groupHandlerRef.current(msg);
        });

        connection.on("ReceivePrivateMessage", (msg) => {
            if (privateHandlerRef.current) privateHandlerRef.current(msg);
        });

        connection.onreconnecting(() => {
            console.log("[ChatHub] Reconnecting...");
            setConnectionStatus("connecting");
        });
        connection.onreconnected(() => {
            console.log("[ChatHub] Reconnected ✅");
            setConnectionStatus("connected");
        });
        connection.onclose((err) => {
            console.warn("[ChatHub] Connection closed", err ?? "");
            setConnectionStatus("disconnected");
        });

        setConnectionStatus("connecting");
        connection
            .start()
            .then(() => {
                console.log("[ChatHub] Connected to ", `${BASE_URL}/chatHub`, "✅");
                setConnectionStatus("connected");
            })
            .catch((err) => {
                console.error("[ChatHub] Connection FAILED:", err);
                console.info(
                    "[ChatHub] Tip: Make sure the backend is running on",
                    BASE_URL,
                    "and a valid JWT is in localStorage['jwt']"
                );
                setConnectionStatus("disconnected");
            });

        return () => {
            connection.stop();
        };
    }, []);

    const joinRoom = useCallback(async (roomId) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke("JoinGroup", roomId).catch(console.error);
        }
    }, []);

    const leaveRoom = useCallback(async (roomId) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke("LeaveGroup", roomId).catch(console.error);
        }
    }, []);

    const sendGroupMessage = useCallback(async (roomId, message) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current
                .invoke("SendMessageToGroup", roomId, message)
                .catch(console.error);
        }
    }, []);

    const sendPrivateMessage = useCallback(async (receiverId, message) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current
                .invoke("SendPrivateMessage", receiverId, message)
                .catch(console.error);
        }
    }, []);

    const onGroupMessage = useCallback((handler) => {
        groupHandlerRef.current = handler;
    }, []);

    const onPrivateMessage = useCallback((handler) => {
        privateHandlerRef.current = handler;
    }, []);

    const fetchRoomHistory = useCallback(async (roomId) => {
        try {
            const token = getToken();
            const res = await fetch(`${BASE_URL}/api/chat/history/${encodeURIComponent(roomId)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    const fetchPrivateHistory = useCallback(async (otherUserId) => {
        try {
            const token = getToken();
            const res = await fetch(`${BASE_URL}/api/chat/private/${encodeURIComponent(otherUserId)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    return {
        connectionStatus,
        connectionRef,
        joinRoom,
        leaveRoom,
        sendGroupMessage,
        sendPrivateMessage,
        onGroupMessage,
        onPrivateMessage,
        fetchRoomHistory,
        fetchPrivateHistory,
    };
}
