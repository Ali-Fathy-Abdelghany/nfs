import { getStoredUser } from './config';

const NFS_AI_BASE_URL = import.meta.env.VITE_NFS_AI_BASE_URL || 'http://localhost:5000';

export async function askNfsAssistant(message, conversationId) {
  const user = getStoredUser();
  const userId = String(user?.userId || user?.id || 'anonymous');
  const resolvedConversationId = conversationId || `nfs_${userId}`;

  const response = await fetch(`${NFS_AI_BASE_URL}/api/chat/talk-to-nafs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      userId,
      conversationId: resolvedConversationId,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.reply || data?.message || 'تعذر الاتصال بمساعد نفس');
  }

  return {
    reply: data?.reply || '',
    conversationId: data?.conversationId || resolvedConversationId,
  };
}

export async function fetchNfsAssistantHistory(conversationId) {
  const user = getStoredUser();
  const userId = String(user?.userId || user?.id || 'anonymous');
  const resolvedConversationId = conversationId || `nfs_${userId}`;
  const params = new URLSearchParams({
    userId,
    conversationId: resolvedConversationId,
  });

  const response = await fetch(`${NFS_AI_BASE_URL}/api/chat/history?${params.toString()}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'تعذر تحميل محادثة مساعد نفس');
  }

  return {
    conversationId: data?.conversationId || resolvedConversationId,
    messages: Array.isArray(data?.messages) ? data.messages : [],
  };
}
