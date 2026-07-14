import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, UserRound } from 'lucide-react';
import Header from '../components/layout/Header';
import {
  askNfsAssistant,
  fetchNfsAssistantHistory,
  getNfsAssistantConversationId,
  getNfsAssistantUserId,
} from '../api/nfsAssistant';
import { useAuth } from '../context/AuthContext';

const quickPrompts = [
  'أشعر بتوتر شديد اليوم، ماذا أفعل؟',
  'ساعدني أرتب أفكاري قبل النوم',
  'أريد تمرين تنفس سريع',
  'كيف أتعامل مع نوبة قلق؟',
];

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'أنا نفس، مساعدك الهادئ. احكي لي ما تشعر به الآن، وسأحاول مساعدتك بخطوات بسيطة وآمنة.',
};

function mapHistoryMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [welcomeMessage];
  return raw.map((message) => ({
    id: String(message.id || `${message.role}-${message.timestamp || Math.random()}`),
    role: message.role === 'assistant' || message.role === 'user' ? message.role : 'assistant',
    text: message.text || message.content || '',
  }));
}

export default function NfsAssistant() {
  const { user, isAuthenticated } = useAuth() || {};
  const authUserId = isAuthenticated
    ? String(user?.userId ?? user?.id ?? getNfsAssistantUserId())
    : 'anonymous';

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(() =>
    getNfsAssistantConversationId(authUserId)
  );
  const inputRef = useRef(null);
  const fetchGenRef = useRef(0);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending && !historyLoading,
    [input, isSending, historyLoading]
  );

  const loadHistory = useCallback(async (userId) => {
    const gen = ++fetchGenRef.current;
    setHistoryLoading(true);
    try {
      const history = await fetchNfsAssistantHistory();
      if (gen !== fetchGenRef.current) return;
      setConversationId(history.conversationId || getNfsAssistantConversationId(userId));
      setMessages(mapHistoryMessages(history.messages));
    } catch (err) {
      console.error(err);
      if (gen !== fetchGenRef.current) return;
      setMessages([welcomeMessage]);
      setConversationId(getNfsAssistantConversationId(userId));
    } finally {
      if (gen === fetchGenRef.current) setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(authUserId);
    return () => {
      fetchGenRef.current += 1;
    };
  }, [authUserId, loadHistory]);

  const sendMessage = async (text = input) => {
    const messageText = text.trim();
    if (!messageText || isSending || historyLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const result = await askNfsAssistant(
        messageText,
        getNfsAssistantConversationId(authUserId)
      );
      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: result.reply || 'أنا هنا معك. هل يمكنك توضيح شعورك أكثر؟',
        },
      ]);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans" dir="rtl">
      <Header />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F766E] via-[#316764] to-[#83B9B5] text-white p-6 md:p-10 shadow-xl">
          <div className="absolute -left-16 -top-16 w-44 h-44 bg-white/10 rounded-full blur-sm" />
          <div className="absolute right-10 -bottom-20 w-56 h-56 bg-white/10 rounded-full blur-sm" />

          <div className="relative z-10 flex flex-col md:flex-row-reverse md:items-center justify-between gap-6">
            <div className="space-y-3 text-right">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                NFS AI Assistant
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">تحدث مع نفس</h1>
              <p className="text-sm md:text-base text-white/85 max-w-2xl leading-7">
                مساحة هادئة للتعبير عن مشاعرك، ترتيب أفكارك، والحصول على خطوات بسيطة تساعدك في لحظات القلق أو الضغط.
              </p>
            </div>

            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/15 rounded-3xl border border-white/25 flex items-center justify-center shrink-0">
              <Bot className="w-10 h-10 md:w-14 md:h-14" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col min-h-[620px]">
            <div className="p-4 md:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F0EF] text-[#0F766E] flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-neutral-900">نفس</h2>
                  <p className="text-xs text-neutral-500">
                    {historyLoading ? 'جاري مزامنة المحادثة…' : 'متصل بخدمة Gemini المحلية'}
                  </p>
                </div>
              </div>
              {(isSending || historyLoading) && (
                <div className="text-xs text-[#0F766E] font-bold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {historyLoading ? 'تحميل السجل…' : 'يكتب الآن...'}
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-white to-[#F7FAFA]">
              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isAssistant ? 'justify-start flex-row-reverse' : 'justify-start'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        isAssistant ? 'bg-[#E6F0EF] text-[#0F766E]' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-white border border-neutral-100 text-neutral-800 shadow-sm text-right'
                          : 'bg-[#0F766E] text-white text-right'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-100 bg-white">
              {error && <p className="mb-3 text-xs font-bold text-rose-600 text-right">{error}</p>}
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={!canSend}
                  className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center hover:bg-[#115E57] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="إرسال"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
                  placeholder={historyLoading ? 'جارٍ تحميل سجل محادثتك…' : 'اكتب ما تشعر به الآن...'}
                  className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 text-right disabled:opacity-60"
                />
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-5 text-right shadow-sm">
              <h3 className="text-lg font-black text-neutral-900 mb-2">اقتراحات سريعة</h3>
              <p className="text-xs text-neutral-500 leading-6 mb-4">
                اختر بداية مناسبة، ويمكنك تعديلها بعد الإرسال.
              </p>
              <div className="space-y-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isSending || historyLoading}
                    className="w-full text-right px-4 py-3 rounded-2xl bg-[#E6F0EF]/60 text-[#316764] text-xs font-bold hover:bg-[#E6F0EF] disabled:opacity-60 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-5 text-right">
              <h3 className="text-sm font-black text-amber-900 mb-2">تنبيه مهم</h3>
              <p className="text-xs text-amber-800 leading-6">
                مساعد نفس يقدم دعماً عاماً ولا يغني عن الطبيب أو الطوارئ. إذا كان هناك خطر على نفسك أو على شخص آخر،
                اطلب مساعدة طبية فوراً.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
