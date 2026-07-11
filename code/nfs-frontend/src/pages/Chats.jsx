import React, { useState, useEffect, useRef } from "react";
import { useChatHub } from "../hooks/useChatHub";
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

function Chats() {
    const [rooms, setRooms] = useState([
        {
            id: "room_1",
            name: "مساحة الهدوء",
            membersCount: 8,
            avatar: "🦊",
            description: "مساحة لمشاركة الدعم الهادئ والتفريغ عن الضغوط.",
            joined: true,
        },
        {
            id: "room_2",
            name: "دعم القلق الصباحي",
            membersCount: 22,
            avatar: "🐨",
            description: "مساحة مخصصة للحديث عن نوبات وتحديات القلق الصباحي.",
            joined: true,
        },
        {
            id: "room_3",
            name: "تأملات جماعية",
            membersCount: 15,
            avatar: "🐼",
            description: "جلسات تأمل جماعية للراحة النفسية والصفاء الذهني.",
            joined: false,
        },
    ]);

    const [activeRoomId, setActiveRoomId] = useState("room_1");
    const [searchQuery, setSearchQuery] = useState("");
    const [inputMsg, setInputMsg] = useState("");

    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState({
        room_1: [
            { id: 1, sender: "other", senderName: "الأرنب الحكيم", avatar: "🐰", text: "أشعر ببعض الضغط اليوم، كيف تتعاملون مع تراكم المهام؟", time: "10:30 ص" },
            { id: 2, isTip: true, text: 'نصيحة "نفس" الذكية: جرب قاعدة الخمس دقائق، ابدأ بأصغر مهمة الآن.' },
            { id: 3, sender: "me", senderName: "أنت (الأسد الشجاع)", avatar: "🦁", text: "أهلاً بك! عادةً ما أبدأ بكتابة كل شيء في ورقة، هذا يساعدني على تصفية ذهني", time: "10:32 ص" },
            { id: 4, sender: "other", senderName: "الفيل الهادئ", avatar: "🐘", text: "أتفق معك يا صديقي، التنظيم الورقي يعطي شعوراً بالسيطرة.", time: "10:35 ص" },
        ],
        room_2: [
            { id: 10, sender: "other", senderName: "الباندا المسترخي", avatar: "🐼", text: "كل صباح أصحى بحس بضيق وتوتر بدون أي سبب واضح، هل ده طبيعي؟", time: "08:00 ص" },
            { id: 11, sender: "me", senderName: "أنت (الأسد الشجاع)", avatar: "🦁", text: "أهلاً بك، طبيعي جداً. جرب تاخد دقيقتين شهيق وزفير بطيء قبل ما تقوم من السرير.", time: "08:03 ص" },
            { id: 12, sender: "other", senderName: "السلحفاة الصبورة", avatar: "🐢", text: "فعلاً، التنفس الصباحي بيساعد جداً، وتجنب شرب القهوة فوراً كمان بيفرق.", time: "08:05 ص" },
        ],
        room_3: [
            { id: 20, sender: "other", senderName: "القطة اللطيفة", avatar: "🐱", text: "جلسة التنفس والتأمل الجماعي الصباحية اليوم كانت مريحة للأعصاب جداً.", time: "07:15 ص" },
            { id: 21, sender: "me", senderName: "أنت (الأسد الشجاع)", avatar: "🦁", text: "سعيد جداً إنها عجبتك، أنا كمان حسيت بهدوء ذهني كبير النهاردة.", time: "07:18 ص" },
        ],
    });

    const toggleJoin = (id) => {
        setRooms(prevRooms => prevRooms.map(r => r.id === id ? { ...r, joined: !r.joined } : r));
    };

    const createNewGroup = () => {
        const name = prompt("ما هو اسم المساحة الجديدة؟");
        if (name) {
            const newRoom = { id: Date.now().toString(), name, membersCount: 1, avatar: "🌱", joined: true, description: "" };
            setRooms(prev => [...prev, newRoom]);
            setActiveRoomId(newRoom.id);
        }
    };

    const myRooms = rooms.filter(r => r.joined && (searchQuery ? r.name.includes(searchQuery) : true));
    const discoverRooms = rooms.filter(r => !r.joined && (searchQuery ? r.name.includes(searchQuery) : true));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversations, activeRoomId]);

    const userId = "placeholderUserId";
    const { messages, connectionRef, connectionStatus, joinGroup, sendMessage } = useChatHub(userId);

  // Join the active room when connection is ready
  useEffect(() => {
    if (connectionStatus === 'connected' && activeRoomId) {
      joinGroup(activeRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus, activeRoomId]);

  const activeMessages = messages.filter((msg) => msg.RoomId === activeRoomId || msg.roomId === activeRoomId);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;
    const text = inputMsg;
    setInputMsg("");
    const timestamp = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMsg = {
      id: Date.now(),
      sender: "me",
      senderName: "أنت (الأسد الشجاع)",
      avatar: "🦁",
      text: text,
      time: timestamp,
    };
    setConversations((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), userMsg],
    }));
    // Send via SignalR
    if (connectionStatus === "connected" && connectionRef.current) {
      sendMessage(activeRoomId, "أنت (الأسد الشجاع)", text);
    }
  };

// Duplicate block removed – using SignalR‑based activeMessages and handleSendMessage defined earlier

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-teal-100" dir="rtl">
            <Header activeTab="chat" />

            <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
                    
                    {/* العمود الأيمن (التحكم الجانبي والمساحات) */}
                    <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                        
                        {/* حقل البحث */}
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

                        {/* قائمة مساحاتي */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider text-right">مساحاتي</h3>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pl-1">
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

                        {/* استكشاف مساحات جديدة */}
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

                    {/* العمود الأيسر (نافذة الدردشة الكاملة) */}
                    <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden h-[580px] flex flex-col justify-between">
                            {selectedRoom?.joined ? (
                                <>
                                    {/* هيدر المحادثة */}
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

                                    {/* مسار تدفق الرسائل */}
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
                                                    
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-base shadow-2xs">
                                                        {msg.avatar}
                                                    </div>

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

                                    {/* شريط الإدخال السفلي */}
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
                            )}
                        </div>

                        {/* بطاقة التنبيه الأمني السفلي */}
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