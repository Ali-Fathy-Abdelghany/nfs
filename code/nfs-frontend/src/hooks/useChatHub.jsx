import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState, useEffect, useRef } from 'react';

// Hook to manage SignalR connection for chat functionality.
// It establishes a Hub connection, joins groups (rooms), receives messages, and provides a sendMessage function.
export function useChatHub(userId) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected'
  const connectionRef = useRef(null);

  // Helper to get JWT token from localStorage for authentication.
  const getAccessToken = () => localStorage.getItem('accessToken');

  // Initialize and start the SignalR connection.
  const startConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const connection = new HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API_URL ?? ''}/chatHub`, {
          accessTokenFactory: getAccessToken,
          // Include the user identifier as a query param if needed.
          // The .NET hub uses JWT to identify the user.
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Store reference for later use.
      connectionRef.current = connection;

      // Receive group messages from the server.
      connection.on('ReceiveGroupMessage', (chatMessage) => {
        setMessages((prev) => [...prev, chatMessage]);
      });

      // Receive private messages.
      connection.on('ReceivePrivateMessage', (chatMessage) => {
        setMessages((prev) => [...prev, chatMessage]);
      });

      await connection.start();
      setConnectionStatus('connected');
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      setConnectionStatus('disconnected');
    }
  };

  // Join a chat group (room).
  const joinGroup = async (groupId) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('JoinGroup', groupId);
      } catch (e) {
        console.error('Error joining group', e);
      }
    }
  };

  // Leave a chat group (room).
  const leaveGroup = async (groupId) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('LeaveGroup', groupId);
      } catch (e) {
        console.error('Error leaving group', e);
      }
    }
  };

  // Send a message to the currently active group.
  const sendMessage = async (groupId, sender, message) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('SendMessageToGroup', groupId, message);
        // Optimistically add the message to the UI as "me".
        const localMsg = {
          id: Date.now(),
          sender: 'me',
          senderName: sender,
          avatar: '🦁', // placeholder avatar
          text: message,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, localMsg]);
      } catch (e) {
        console.error('Send message error', e);
      }
    }
  };

  // Effect: start connection once on mount.
  useEffect(() => {
    startConnection();
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log('SignalR connection stopped');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect: re‑join the appropriate group when userId or connection changes.
  // The consuming component can call joinGroup/leaveGroup as needed.
  useEffect(() => {
    if (userId && connectionStatus === 'connected') {
      // Optionally inform server of the user identifier.
      // No explicit call needed; JWT contains it.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, connectionStatus]);

  return {
    messages,
    connectionRef,
    connectionStatus,
    joinGroup,
    leaveGroup,
    sendMessage
  };
}