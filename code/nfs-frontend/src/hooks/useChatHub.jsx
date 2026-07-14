import { API_BASE_URL } from '../api/config';

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState, useEffect, useRef } from 'react';

export function useChatHub(userId) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const connectionRef = useRef(null);

  const getAccessToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  const startConnection = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      setConnectionStatus('connecting');
      const connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/chatHub`, {
          accessTokenFactory: getAccessToken,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      connection.on('ReceiveGroupMessage', (chatMessage) => {
        setMessages((prev) => [...prev, chatMessage]);
      });

      connection.on('ReceivePrivateMessage', (chatMessage) => {
        setMessages((prev) => [...prev, chatMessage]);
      });

      await connection.start();
      setConnectionStatus('connected');
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      setConnectionStatus('disconnected');
    }
  };

  const joinGroup = async (groupId) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('JoinGroup', groupId);
      } catch (e) {
        console.error('Error joining group', e);
      }
    }
  };

  const leaveGroup = async (groupId) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('LeaveGroup', groupId);
      } catch (e) {
        console.error('Error leaving group', e);
      }
    }
  };

  const sendMessage = async (groupId, message) => {
    if (connectionRef.current && connectionStatus === 'connected') {
      try {
        await connectionRef.current.invoke('SendMessageToGroup', groupId, message);
      } catch (e) {
        console.error('Send message error', e);
      }
    }
  };

  useEffect(() => {
    startConnection();
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    messages,
    connectionRef,
    connectionStatus,
    joinGroup,
    leaveGroup,
    sendMessage,
    setMessages,
  };
}
