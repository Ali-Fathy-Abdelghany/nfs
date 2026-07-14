import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  askNfsAssistant,
  fetchNfsAssistantHistory,
  getNfsAssistantConversationId,
  getNfsAssistantUserId,
} from '../api/nfsAssistant';
import { useAuth } from '../context/AuthContext';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'أنا نفس، مساعدك الهادئ. احكي لي ما تشعر به الآن.',
};

function mapHistoryMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [welcomeMessage];
  return raw.map((message) => ({
    id: String(message.id || `${message.role}-${message.timestamp || Math.random()}`),
    role: message.role === 'assistant' || message.role === 'user' ? message.role : 'assistant',
    text: message.text || message.content || '',
  }));
}

export default function NfsAssistantWidget() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth() || {};
  const authUserId = isAuthenticated
    ? String(user?.userId ?? user?.id ?? getNfsAssistantUserId())
    : 'anonymous';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const fetchGenRef = useRef(0);

  const loadHistory = useCallback(async () => {
    const expectedUserId = String(authUserId);
    const gen = ++fetchGenRef.current;
    setHistoryLoading(true);
    setError('');
    try {
      const history = await fetchNfsAssistantHistory();
      if (gen !== fetchGenRef.current) return;
      // Drop the response if the logged-in user changed while fetching.
      const liveId = getNfsAssistantUserId();
      if (liveId !== expectedUserId && expectedUserId !== 'anonymous') return;
      setMessages(mapHistoryMessages(history.messages));
    } catch (err) {
      console.error(err);
      if (gen !== fetchGenRef.current) return;
      setMessages([welcomeMessage]);
    } finally {
      if (gen === fetchGenRef.current) setHistoryLoading(false);
    }
  }, [authUserId]);

  useEffect(() => {
    const openWidget = () => setIsOpen(true);
    window.addEventListener('open-nfs-assistant', openWidget);
    return () => window.removeEventListener('open-nfs-assistant', openWidget);
  }, []);

  // Fresh mount (via key=userId) or reopening → load THIS user's chat only.
  useEffect(() => {
    if (!isOpen) return undefined;
    requestAnimationFrame(() => inputRef.current?.focus());
    loadHistory();
    return () => {
      fetchGenRef.current += 1;
    };
  }, [isOpen, loadHistory]);

  const sendMessage = async (text = input) => {
    const messageText = text.trim();
    if (!messageText || isSending || historyLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: messageText },
    ]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const result = await askNfsAssistant(
        messageText,
        getNfsAssistantConversationId(authUserId)
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: result.reply || 'أنا هنا معك. هل يمكنك توضيح شعورك أكثر؟',
        },
      ]);
    } catch (err) {
      const errorMessage = err?.message || 'حدث خطأ أثناء الاتصال بمساعد نفس';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: `عذراً، لم أستطع الرد الآن.\n${errorMessage}`,
        },
      ]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const hiddenPaths = [
    '/login',
    '/auth',
    '/user-signup',
    '/doctor-signup',
    '/forgot-password',
    '/reset-password',
    '/select-role',
    '/verification',
  ];
  const shouldHide = hiddenPaths.some((path) => location.pathname.startsWith(path));
  if (shouldHide) return null;

  return (
    <div className="fixed left-5 bottom-6 z-[80]" dir="rtl">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-2xl">
          <div className="bg-gradient-to-l from-[#0F766E] to-[#83B9B5] text-white p-4 flex items-center justify-between">
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
              aria-label="إغلاق مساعد نفس"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-sm font-black">مساعد نفس</h3>
                <p className="text-[11px] text-white/80">
                  {historyLoading ? 'جاري تحميل محادثتك…' : 'NFS AI Assistant'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto bg-[#F7FAFA] p-4 space-y-3">
            {historyLoading && (
              <div className="flex items-center justify-center gap-2 py-10 text-xs font-bold text-[#0F766E]">
                <Loader2 className="w-4 h-4 animate-spin" />
                تحميل محادثة هذا الحساب…
              </div>
            )}
            {!historyLoading &&
              messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-6 text-right ${
                        isAssistant
                          ? 'bg-white border border-neutral-100 text-neutral-800'
                          : 'bg-[#0F766E] text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-neutral-100 bg-white p-3">
            {error && <p className="mb-2 text-[11px] font-bold text-rose-600 text-right">{error}</p>}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={!input.trim() || isSending || historyLoading}
                className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center disabled:opacity-50 transition"
                aria-label="إرسال الرسالة"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                disabled={historyLoading}
                placeholder={historyLoading ? 'جارٍ تحميل محادثتك…' : 'اكتب رسالتك...'}
                className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 text-right disabled:opacity-60"
              />
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-14 h-14 rounded-full bg-[#0F766E] text-white shadow-xl shadow-[#0F766E]/25 border border-white/40 flex items-center justify-center hover:bg-[#115E57] hover:scale-105 active:scale-95 transition-all"
        title="مساعد نفس الذكي"
        aria-label="مساعد نفس الذكي"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
