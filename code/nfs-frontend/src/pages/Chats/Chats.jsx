import React, { useState, useEffect, useRef } from "react";
import { useChatHub } from "../../hooks/useChatHub";
import {
    Send,
    Search,
    Settings,
    Bell,
    Info,
    Smile,
    ShieldCheck,
    Compass,
    Home,
    User,
    Activity,
    Sparkles,
    Plus,
} from "lucide-react";
import "./Chats.css";

function Chats() {
    const [activeRoomId, setActiveRoomId] = useState("room_1");
    const [searchQuery, setSearchQuery] = useState("");
    const [inputMsg, setInputMsg] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [navActiveTab, setNavActiveTab] = useState("اكتشف"); // Navigation items: 'الرئيسية', 'جلساتي', 'اكتشف', 'حسابي'

    const messagesEndRef = useRef(null);

    // List of rooms exactly matching Figma Design
    const roomsList = [
        {
            id: "room_1",
            name: "مساحة الهدوء",
            membersCount: 8,
            avatar: "🦊", // Fox avatar emoji
            description: "مساحة لمشاركة الدعم الهادئ والتفريغ عن الضغوط.",
        },
        {
            id: "room_2",
            name: "دعم القلق الصباحي",
            membersCount: 22,
            avatar: "🐨", // Koala avatar emoji
            description: "مساحة مخصصة للحديث عن نوبات وتحديات القلق الصباحي.",
        },
        {
            id: "room_3",
            name: "تأملات جماعية",
            membersCount: 15,
            avatar: "🐼", // Panda avatar emoji
            description: "جلسات تأمل جماعية للراحة النفسية والصفاء الذهني.",
        },
    ];

    // Conversation history exactly matching Figma Design screenshots
    const [conversations, setConversations] = useState({
        room_1: [
            {
                id: 1,
                sender: "other",
                senderName: "الأرنب الحكيم",
                avatar: "🐰",
                text: "أشعر ببعض الضغط اليوم، كيف تتعاملون مع تراكم المهام؟",
                time: "10:30 ص",
            },
            {
                id: 2,
                isTip: true,
                text: 'نصيحة "نفس" الذكية: جرب قاعدة الخمس دقائق، ابدأ بأصغر مهمة الآن.',
            },
            {
                id: 3,
                sender: "me",
                senderName: "أنت (الأسد الشجاع)",
                avatar: "🦁",
                text: "أهلاً بك! عادةً ما أبدأ بكتابة كل شيء في ورقة، هذا يساعدني على تصفية ذهني",
                time: "10:32 ص",
            },
            {
                id: 4,
                sender: "other",
                senderName: "الفيل الهادئ",
                avatar: "🐘",
                text: "أتفق معك يا صديقي، التنظيم الورقي يعطي شعوراً بالسيطرة.",
                time: "10:35 ص",
            },
        ],
        room_2: [
            {
                id: 10,
                sender: "other",
                senderName: "الباندا المسترخي",
                avatar: "🐼",
                text: "كل صباح أصحى بحس بضيق وتوتر بدون أي سبب واضح، هل ده طبيعي؟",
                time: "08:00 ص",
            },
            {
                id: 11,
                sender: "me",
                senderName: "أنت (الأسد الشجاع)",
                avatar: "🦁",
                text: "أهلاً بك، طبيعي جداً. جرب تاخد دقيقتين شهيق وزفير بطيء قبل ما تقوم من السرير.",
                time: "08:03 ص",
            },
            {
                id: 12,
                sender: "other",
                senderName: "السلحفاة الصبورة",
                avatar: "🐢",
                text: "فعلاً، التنفس الصباحي بيساعد جداً، وتجنب شرب القهوة فوراً كمان بيفرق.",
                time: "08:05 ص",
            },
        ],
        room_3: [
            {
                id: 20,
                sender: "other",
                senderName: "القطة اللطيفة",
                avatar: "🐱",
                text: "جلسة التنفس والتأمل الجماعي الصباحية اليوم كانت مريحة للأعصاب جداً.",
                time: "07:15 ص",
            },
            {
                id: 21,
                sender: "me",
                senderName: "أنت (الأسد الشجاع)",
                avatar: "🦁",
                text: "سعيد جداً إنها عجبتك، أنا كمان حسيت بهدوء ذهني كبير النهاردة.",
                time: "07:18 ص",
            },
        ],
    });

    // Auto scroll messages to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversations, activeRoomId, isTyping]);

    const userId = "placeholderUserId";
    const { connectionRef, connectionStatus, joinRoom, sendMessage, onReceiveMessage } = useChatHub(userId);

    const getFilteredRooms = () => {
        if (!searchQuery.trim()) return roomsList;
        return roomsList.filter((room) => room.name.includes(searchQuery));
    };

    const selectedRoom =
        roomsList.find((r) => r.id === activeRoomId) || roomsList[0];
    const activeMessages = conversations[activeRoomId] || [];

    // Send message
    const handleSendMessage = (e) => {
        e.preventDefault();
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

        // 1. Add locally
        setConversations((prev) => ({
            ...prev,
            [activeRoomId]: [...(prev[activeRoomId] || []), userMsg],
        }));

        // 2. Send via SignalR or trigger Mock Simulation
        if (connectionStatus === "connected" && connectionRef.current) {
            connectionRef.current
                .invoke("SendMessage", activeRoomId, "me", text)
                .catch((err) => {
                    console.error(err);
                    simulateMockReply(activeRoomId, text);
                });
        } else {
            simulateMockReply(activeRoomId, text);
        }
    };

    return (
        <div className="chats-page">
            {/* Exact Header Layout from Figma */}
            <header className="nafs-header">
                <div className="header-left">
                    <a href="#logo" className="logo">
                        نفس
                    </a>
                </div>

                <div className="header-center">
                    <div className="header-search-wrapper">
                        <Search size={16} className="search-icon-inside" />
                        <input
                            type="text"
                            placeholder="البحث في المساحات الآمنة..."
                            className="header-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="header-right">
                    <div
                        className="user-avatar-circle"
                        title="الملف الشخصي"
                    ></div>
                    <button className="header-btn" title="الإعدادات">
                        <Settings size={22} />
                    </button>
                    <button className="header-btn" title="الإشعارات">
                        <Bell size={22} />
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <main className="chats-main-content">
                {/* Title and Subtitle Block */}
                <div className="title-section-row">
                    <div className="title-section-right">
                        <h1>مساحات آمنة</h1>
                        <p>
                            تواصل بهوية مجهولة في مجتمعاتنا الداعمة. هنا، صوتك
                            مسموع، وخصوصيتك هي الأولوية.
                        </p>
                    </div>

                    <div className="online-status-pill">
                        <span className="dot"></span>
                        <span>1,240 متاح الآن</span>
                    </div>
                </div>

                {/* Layout Grid */}
                <div className="chats-grid-layout">
                    {/* Left Column: Chat Box & Security Info */}
                    <div className="chat-left-column">
                        {/* Chat Box Container */}
                        <div className="chat-window-card">
                            {/* Chat Box Header */}
                            <div className="chat-window-header">
                                <div className="chat-header-left">
                                    <button
                                        className="chat-header-info-btn"
                                        title="معلومات"
                                    >
                                        <Info size={20} />
                                    </button>
                                </div>

                                <div className="chat-header-right">
                                    <div className="chat-header-meta">
                                        <h4 className="chat-header-title">
                                            {selectedRoom.name}
                                        </h4>
                                        <span className="chat-header-status">
                                            متصل الآن
                                        </span>
                                    </div>
                                    <div className="chat-header-avatar">
                                        {selectedRoom.avatar}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages flow */}
                            <div className="chat-window-body">
                                {activeMessages.map((msg) => {
                                    if (msg.isTip) {
                                        return (
                                            <div
                                                key={msg.id}
                                                className="chat-inline-tip-box"
                                            >
                                                <div className="tip-stars">
                                                    <Sparkles size={16} />
                                                </div>
                                                <span>{msg.text}</span>
                                            </div>
                                        );
                                    }

                                    const isMe = msg.sender === "me";
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`chat-msg-row ${isMe ? "outgoing" : "incoming"}`}
                                        >
                                            <div className="chat-msg-avatar">
                                                {msg.avatar}
                                            </div>

                                            <div className="chat-msg-content">
                                                <div className="chat-msg-bubble">
                                                    <p>{msg.text}</p>
                                                </div>
                                                <span className="chat-msg-meta-sub">
                                                    {msg.senderName} •{" "}
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Simulated typing indicator */}
                                {isTyping && (
                                    <div className="chat-msg-row incoming">
                                        <div className="chat-msg-avatar">
                                            {selectedRoom.id === "room_1"
                                                ? "🐰"
                                                : selectedRoom.id === "room_2"
                                                  ? "🐢"
                                                  : "🐱"}
                                        </div>
                                        <div className="chat-msg-content">
                                            <div className="typing-bubble-dots">
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Footer Input */}
                            <div className="chat-window-footer">
                                <button
                                    onClick={handleSendMessage}
                                    className="send-action-circle-btn"
                                    title="إرسال"
                                >
                                    <Send
                                        size={18}
                                        style={{
                                            transform: "rotate(180deg)",
                                            marginRight: "2px",
                                        }}
                                    />
                                </button>

                                <div className="input-box-wrapper">
                                    <input
                                        type="text"
                                        value={inputMsg}
                                        onChange={(e) =>
                                            setInputMsg(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleSendMessage(e);
                                        }}
                                        placeholder="اكتب رسالتك هنا بكل صدق..."
                                        className="chat-footer-input"
                                    />
                                    <button
                                        className="smile-icon-btn"
                                        title="رموز تعبيرية"
                                    >
                                        <Smile size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Warning Card exactly matching Figma */}
                        <div className="security-warning-card">
                            <div className="security-card-badge">
                                <ShieldCheck size={26} />
                            </div>
                            <h3>أمانك يهمنا</h3>
                            <p>كل المحادثات مشفرة وتتم بخصوصية تامة.</p>
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Active rooms list & Create private space) */}
                    <div className="sidebar-right-column">
                        {/* Active Rooms Stack */}
                        <div className="active-rooms-panel">
                            <h3>الغرف النشطة</h3>

                            <div className="rooms-list-stack">
                                {getFilteredRooms().map((room) => {
                                    const isSelected = room.id === activeRoomId;
                                    return (
                                        <div
                                            key={room.id}
                                            className={`room-card-item ${isSelected ? "selected-active" : ""}`}
                                            onClick={() =>
                                                setActiveRoomId(room.id)
                                            }
                                        >
                                            <div className="room-card-info">
                                                <h4 className="room-card-title">
                                                    {room.name}
                                                </h4>
                                                <p className="room-card-subtitle">
                                                    {room.membersCount} أعضاء
                                                    نشطين
                                                </p>
                                            </div>
                                            <div className="room-card-avatar">
                                                {room.avatar}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Private Space Card matching Figma mockup */}
                        <div className="create-custom-space-card">
                            <h4>هل تريد مساحة خاصة؟</h4>
                            <p>
                                أنشئ غرفتك الخاصة وادعُ أصدقاءك للحديث بهوية
                                مجهولة.
                            </p>
                            <button className="create-space-btn">
                                إنشاء مساحة
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom Navigation Bar from Figma Screenshot */}
            <nav className="nafs-bottom-nav">
                <a
                    onClick={() => setNavActiveTab("حسابي")}
                    className={`nav-item-tab ${navActiveTab === "حسابي" ? "active-tab" : ""}`}
                >
                    <User size={22} />
                    <span>حسابي</span>
                </a>
                <a
                    onClick={() => setNavActiveTab("اكتشف")}
                    className={`nav-item-tab ${navActiveTab === "اكتشف" ? "active-tab" : ""}`}
                >
                    <Compass size={22} />
                    <span>اكتشف</span>
                </a>
                <a
                    onClick={() => setNavActiveTab("جلساتي")}
                    className={`nav-item-tab ${navActiveTab === "جلساتي" ? "active-tab" : ""}`}
                >
                    <Activity size={22} />
                    <span>جلساتي</span>
                </a>
                <a
                    onClick={() => setNavActiveTab("الرئيسية")}
                    className={`nav-item-tab ${navActiveTab === "الرئيسية" ? "active-tab" : ""}`}
                >
                    <Home size={22} />
                    <span>الرئيسية</span>
                </a>
            </nav>
        </div>
    );
}

export default Chats;
