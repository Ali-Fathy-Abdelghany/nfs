import React, { useState, useEffect, useRef, useMemo } from "react";
import { useChatHub } from "../hooks/useChatHub";
import { useAuth } from "../context/AuthContext";
import { fetchChatHistory, fetchChatRooms, createChatRoom, joinChatRoom, leaveChatRoom, mapRoomFromApi } from "../api/chat";
import { fetchUserProfile } from "../api/users";
import { userAvatarUrl } from "../utils/userAvatar";
import {
    Send,
    Search,
    Info,
    Smile,
    ShieldCheck,
    Sparkles,
    LogOut,
    PlusCircle,
    Plus,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";

function Chats() {
    const { user } = useAuth();
    const toast = useToast();
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputMsg, setInputMsg] = useState("");
    const [myAvatarUrl, setMyAvatarUrl] = useState(null);
    const [myDisplayName, setMyDisplayName] = useState("");

    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState({});

    const userId = user?.userId || user?.id;
    const { messages, connectionStatus, joinGroup, leaveGroup, sendMessage, setMessages } = useChatHub(userId);

    useEffect(() => {
        let cancelled = false;
        async function loadMe() {
            try {
                const res = await fetchUserProfile();
                if (cancelled) return;
                const p = res.data;
                const name = `${p?.firstName || user?.firstName || ""} ${p?.lastName || user?.lastName || ""}`.trim();
                setMyDisplayName(name || "أنت");
                setMyAvatarUrl(userAvatarUrl(userId, p?.profileImageUrl || user?.profileImageUrl, name));
            } catch {
                if (cancelled) return;
                const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
                setMyDisplayName(name || "أنت");
                setMyAvatarUrl(userAvatarUrl(userId, user?.profileImageUrl, name));
            }
        }
        if (userId) loadMe();
        return () => { cancelled = true; };
    }, [userId, user?.firstName, user?.lastName, user?.profileImageUrl]);

    const loadRooms = async () => {
        try {
            setRoomsLoading(true);
            const res = await fetchChatRooms();
            const mapped = (res.data || []).map(mapRoomFromApi);
            setRooms(mapped);
            if (mapped.length > 0) {
                setActiveRoomId((current) => current || mapped.find((r) => r.joined)?.id || mapped[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRoomsLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const toggleJoin = async (id) => {
        const room = rooms.find((r) => r.id === id);
        if (!room) return;
        try {
            const res = room.joined ? await leaveChatRoom(id) : await joinChatRoom(id);
            const updated = mapRoomFromApi(res.data);
            setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
            if (!room.joined) {
                setActiveRoomId(id);
                if (connectionStatus === "connected") joinGroup(id);
            } else if (connectionStatus === "connected") {
                leaveGroup(id);
            }
        } catch (err) {
            console.error(err);
            toast.error(getApiErrorMessage(err, "تعذر تحديث العضوية في المساحة"));
        }
    };

    const createNewGroup = async () => {
        const name = prompt("ما هو اسم المساحة الجديدة؟");
        if (!name?.trim()) return;
        const description = prompt("وصف المساحة (اختياري):") || "";
        try {
            const res = await createChatRoom({ name: name.trim(), description: description.trim() });
            const newRoom = mapRoomFromApi(res.data);
            setRooms((prev) => [newRoom, ...prev]);
            setActiveRoomId(newRoom.id);
            setConversations((prev) => ({ ...prev, [newRoom.id]: [] }));
            if (connectionStatus === "connected") joinGroup(newRoom.id);
            toast.success("تم إنشاء المساحة بنجاح");
        } catch (err) {
            console.error(err);
            toast.error(getApiErrorMessage(err, "تعذر إنشاء المساحة الجديدة. تأكد من تسجيل الدخول."));
        }
    };

    const myRooms = rooms.filter(r => r.joined && (searchQuery ? r.name.includes(searchQuery) : true));
    const discoverRooms = rooms.filter(r => !r.joined && (searchQuery ? r.name.includes(searchQuery) : true));
    const selectedRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

    /** Normalize REST / SignalR payloads (camelCase or PascalCase). */
    const readSender = (msg) => ({
        id: msg.id ?? msg.Id,
        senderId: msg.senderId ?? msg.SenderId,
        senderName: msg.senderName ?? msg.SenderName,
        senderAvatarUrl: msg.senderAvatarUrl ?? msg.SenderAvatarUrl,
        content: msg.content ?? msg.Content ?? msg.text,
        timestamp: msg.timestamp ?? msg.Timestamp,
        roomId: msg.roomId ?? msg.RoomId,
    });

    const mapHistoryMessage = (msg) => {
        const m = readSender(msg);
        const isMe = String(m.senderId) === String(userId);
        const name = isMe
            ? "أنت"
            : (m.senderName || "عضو");
        return {
            id: m.id,
            senderId: m.senderId,
            sender: isMe ? "me" : "other",
            senderName: name,
            // Seed by senderId so «عضو» labels never share one doodle.
            avatarUrl: userAvatarUrl(
                m.senderId,
                m.senderAvatarUrl || (isMe ? myAvatarUrl : null),
                m.senderName || name
            ),
            text: m.content,
            time: new Date(m.timestamp).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            roomId: m.roomId,
        };
    };

    useEffect(() => {
        if (!activeRoomId) return;
        fetchChatHistory(activeRoomId)
            .then((res) => {
                const history = (res.data || []).map(mapHistoryMessage);
                setConversations((prev) => ({ ...prev, [activeRoomId]: history }));
                setMessages([]);
            })
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoomId, userId, myAvatarUrl]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversations, activeRoomId, messages]);

    useEffect(() => {
        if (connectionStatus === "connected" && activeRoomId) {
            joinGroup(activeRoomId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectionStatus, activeRoomId]);

    const liveMessages = useMemo(() => {
        return messages
            .map(readSender)
            .filter((msg) => msg.roomId === activeRoomId)
            // Own messages are added optimistically; skip hub echoes for self.
            .filter((msg) => String(msg.senderId) !== String(userId))
            .map((msg) => {
                const name = msg.senderName || "عضو";
                return {
                    id: msg.id || `${msg.timestamp}-${msg.senderId}`,
                    senderId: msg.senderId,
                    sender: "other",
                    senderName: name,
                    avatarUrl: userAvatarUrl(msg.senderId, msg.senderAvatarUrl, msg.senderName || name),
                    text: msg.content,
                    time: new Date(msg.timestamp || Date.now()).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
            });
    }, [messages, activeRoomId, userId]);

    const activeMessages = [
        ...(conversations[activeRoomId] || []),
        ...liveMessages,
    ];

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!inputMsg.trim() || !activeRoomId) return;
        const text = inputMsg;
        setInputMsg("");
        const timestamp = new Date().toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const localId = `local-${Date.now()}`;
        const userMsg = {
            id: localId,
            senderId: userId,
            sender: "me",
            senderName: "أنت",
            avatarUrl: myAvatarUrl || userAvatarUrl(userId, user?.profileImageUrl, myDisplayName),
            text,
            time: timestamp,
        };
        setConversations((prev) => ({
            ...prev,
            [activeRoomId]: [...(prev[activeRoomId] || []), userMsg],
        }));
        if (connectionStatus === "connected") {
            sendMessage(activeRoomId, text);
        }
    };

    const renderAvatar = (avatarUrl, label) => (
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 overflow-hidden shrink-0 shadow-2xs">
            <img src={avatarUrl} alt={label || ""} className="w-full h-full object-cover" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-teal-100" dir="rtl">
            <Header activeTab="chat" />

            <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
                    
                    <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                        
                        <div className="relative bg-white rounded-xl border border-slate-200/60 p-1.5 flex items-center shadow-xs">
                            <Search size={18} className="text-slate-400 mr-3 shrink-0" />
                            <input
                                type="text"
                                placeholder="ابحث عن مساحة آمنة..."
                                className="w-full pr-2 pl-4 py-1.5 bg-transparent text-sm focus:outline-none placeholder-slate-400 text-right"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider text-right">مساحاتي</h3>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pl-1">
                                {roomsLoading && <p className="text-xs text-slate-400 text-center py-4">جاري تحميل المساحات...</p>}
                                {!roomsLoading && myRooms.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4">لا توجد مساحات منضم إليها</p>
                                )}
                                {myRooms.map(room => (
                                    <div 
                                        key={room.id} 
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                            activeRoomId === room.id 
                                                ? 'bg-teal-50/50 border-teal-200/80' 
                                                : 'hover:bg-slate-50/80 border-transparent'
                                        }`}
                                        onClick={() => setActiveRoomId(room.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">{room.avatar}</span>
                                            <div className="text-right">
                                                <h4 className={`font-bold text-sm ${activeRoomId === room.id ? 'text-teal-700' : 'text-slate-800'}`}>{room.name}</h4>
                                                <p className="text-[11px] text-slate-400">{room.membersCount} أعضاء نشطين</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleJoin(room.id); }} 
                                            className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider text-right">استكشف مساحات جديدة</h3>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pl-1">
                                {discoverRooms.map(room => (
                                    <div 
                                        key={room.id} 
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent"
                                        onClick={() => setActiveRoomId(room.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">{room.avatar}</span>
                                            <div className="text-right">
                                                <h4 className="font-bold text-slate-800 text-sm">{room.name}</h4>
                                                <p className="text-[11px] text-slate-400">{room.membersCount} عضو دعم</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleJoin(room.id); }} 
                                            className="text-teal-500 hover:text-teal-700 p-1 rounded-lg hover:bg-teal-50 transition"
                                        >
                                            <PlusCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        
                        <button 
                            className="w-full bg-teal-900 hover: bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold shadow-xs transition active:scale-[0.99] text-sm"
                            onClick={createNewGroup}
                        >
                            <Plus size={16} /> 
                            <span>إنشـاء مساحـة جديـدة</span>
                        </button>
                    </div>

                    <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden h-[580px] flex flex-col justify-between">
                            {selectedRoom ? (
                            selectedRoom.joined ? (
                                <>
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-2xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl">{selectedRoom.avatar}</span>
                                            <div className="text-right">
                                                <h4 className="font-bold text-slate-900 text-base leading-tight">{selectedRoom.name}</h4>
                                                <span className="text-[11px] text-teal-500 font-semibold">متصل الآن</span>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 p-1.5 hover:bg-slate-50 rounded-full transition">
                                            <Info size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/40 space-y-4">
                                        {activeMessages.map((msg) => {
                                            if (msg.isTip) {
                                                return (
                                                    <div key={msg.id} className="flex gap-2.5 items-center bg-indigo-50/60 border border-indigo-100/40 text-indigo-900 rounded-xl p-3 text-xs max-w-xl mx-auto my-1 shadow-2xs">
                                                        <div className="text-indigo-500 shrink-0"><Sparkles size={15} /></div>
                                                        <span className="leading-relaxed text-right">{msg.text}</span>
                                                    </div>
                                                );
                                            }

                                            const isMe = msg.sender === "me";
                                            return (
                                                <div key={msg.id} className={`flex gap-2.5 max-w-[80%] ${isMe ? "ml-auto" : "mr-auto flex-row-reverse"}`}>
                                                    {renderAvatar(msg.avatarUrl, msg.senderName)}

                                                    <div className="space-y-1">
                                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                                                            isMe 
                                                                ? " bg-[#316764]  text-white rounded-tr-none text-right" 
                                                                : "bg-white border border-slate-200/50 text-slate-800 rounded-tl-none text-right"
                                                        }`}>
                                                            <p>{msg.text}</p>
                                                        </div>
                                                        <span className={`block text-[10px] text-slate-400 px-1 ${isMe ? "text-left" : "text-right"}`}>
                                                            {msg.senderName} • {msg.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                                        <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 flex items-center justify-between focus-within:border-teal-500/40 focus-within:ring-2 focus-within:ring-teal-50 transition">
                                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                                                <Smile size={18} />
                                            </button>
                                            <input
                                                type="text"
                                                value={inputMsg}
                                                onChange={(e) => setInputMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                                placeholder="اكتب رسالتك هنا بكل صدق..."
                                                className="w-full bg-transparent text-sm py-1.5 focus:outline-none placeholder-slate-400 text-right pr-2"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSendMessage} 
                                            className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs transition active:scale-95"
                                        >
                                            <Send size={16} className="rotate-180 transform -translate-x-[0.5px]" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/20">
                                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-3 border border-teal-100">
                                        <PlusCircle size={22} />
                                    </div>
                                    <p className="text-slate-600 font-semibold mb-4 text-sm">أنت غير مشترك في هذه المساحة الآمنة حالياً.</p>
                                    <button 
                                        onClick={() => toggleJoin(selectedRoom.id)} 
                                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95"
                                    >
                                        انضم الآن للمحادثة
                                    </button>
                                </div>
                            )
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/20">
                                    <p className="text-slate-500 text-sm">لا توجد مساحات بعد. أنشئ مساحة جديدة للبدء.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 flex gap-3.5 items-center">
                            <div className="w-9 h-9 bg-white border border-emerald-100 text-teal-600 shadow-2xs rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-teal-950 text-xs mb-0.5">أمانك يهمنا</h3>
                                <p className="text-teal-800/80 text-[11px]">كل المحادثات مشفرة وتتم بخصوصية تامة بدون مشاركة بياناتك الحقيقية.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer activeTab="chat" />
        </div>
    );
}

export default Chats;
