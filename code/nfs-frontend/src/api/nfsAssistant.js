import { getStoredUser } from './config';

const NFS_AI_BASE_URL = import.meta.env.VITE_NFS_AI_BASE_URL || 'http://localhost:5000';

/** Stable per-user conversation id — never reuse another account's id. */
export function getNfsAssistantUserId() {
  const user = getStoredUser();
  const id = user?.userId ?? user?.id ?? user?.UserId ?? null;
  if (id == null || id === '') return 'anonymous';
  return String(id);
}

export function getNfsAssistantConversationId(userId = getNfsAssistantUserId()) {
  return `nfs_${userId}`;
}

export async function askNfsAssistant(message, conversationId) {
  const userId = getNfsAssistantUserId();
  // Always scope to the logged-in user; ignore stale ids from another session.
  const resolvedConversationId = getNfsAssistantConversationId(userId);

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
    userId,
  };
}

export async function fetchNfsAssistantHistory(conversationId) {
  const userId = getNfsAssistantUserId();
  const resolvedConversationId = getNfsAssistantConversationId(userId);
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
    userId,
    messages: Array.isArray(data?.messages) ? data.messages : [],
  };
}
