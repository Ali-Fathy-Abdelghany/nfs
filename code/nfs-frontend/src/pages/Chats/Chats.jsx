import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
} from "lucide-react";
import "./Chats.css";

const BASE_URL = "http://localhost:5148";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentUserId() {
    try {
        const token = localStorage.getItem("jwt");
        if (!token) return "guest";
        const payload = JSON.parse(atob(token.split(".")[1]));
        const val =
            payload.nameid ||
            payload.sub ||
            payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ||
            "guest";
        return String(val);
    } catch {
        return "guest";
    }
}

function nowArabicTime() {
    return new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getProfileValue(profile, keys, fallback = "") {
    if (!profile) return fallback;

    for (const key of keys) {
        const value = profile[key];
        if (value !== null && value !== undefined && String(value).trim() !== "") {
            return value;
        }
    }

    return fallback;
}

function buildCurrentUserDisplayName(profile) {
    const firstName = String(
        getProfileValue(profile, ["firstName", "FirstName"]),
    ).trim();
    const lastName = String(
        getProfileValue(profile, ["lastName", "LastName"]),
    ).trim();
    const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return (
        combinedName ||
        String(
            getProfileValue(profile, [
                "displayName",
                "DisplayName",
                "fullName",
                "FullName",
                "name",
                "Name",
            ]),
        ).trim() ||
        "أنت"
    );
}

function buildCurrentUserAvatarUrl(profile) {
    return String(
        getProfileValue(profile, [
            "profileImageUrl",
            "ProfileImageUrl",
            "imageUrl",
            "ImageUrl",
        ]),
    ).trim();
}

function getAvatarFallback(name) {
    const trimmedName = String(name || "").trim();
    if (!trimmedName) return "أ";

    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2);
    }

    return `${parts[0][0] || ""}${parts[1][0] || ""}`;
}

function serverMsgToLocal(msg, currentUserId, currentUserMeta) {
    const isMe = String(msg.senderId) === String(currentUserId);
    return {
        id: msg.id || Date.now() + Math.random(),
        sender: isMe ? "me" : "other",
        senderName: isMe
            ? currentUserMeta.displayName
            : msg.senderName || msg.senderId || "مجهول",
        avatar: isMe ? currentUserMeta.avatarText : msg.avatar || "🐨",
        avatarUrl: isMe ? currentUserMeta.avatarUrl : msg.avatarUrl || "",
        text: msg.content,
        time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : nowArabicTime(),
    };
}

function replacePendingMessage(list, incomingMsg) {
    const pendingIndex = [...list]
        .reverse()
        .findIndex(
            (item) =>
                item.status === "pending" &&
                item.sender === incomingMsg.sender &&
                item.text === incomingMsg.text,
        );

    if (pendingIndex === -1) {
        return [...list, incomingMsg];
    }

    const actualIndex = list.length - 1 - pendingIndex;
    const nextList = [...list];
    nextList[actualIndex] = {
        ...incomingMsg,
        status: undefined,
    };
    return nextList;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const roomsList = [
    {
        id: "room_1",
        name: "مساحة الهدوء",
        membersCount: 8,
        avatar: "🦊",
        description: "مساحة لمشاركة الدعم الهادئ والتفريغ عن الضغوط.",
    },
    {
        id: "room_2",
        name: "دعم القلق الصباحي",
        membersCount: 22,
        avatar: "🐨",
        description: "مساحة مخصصة للحديث عن نوبات وتحديات القلق الصباحي.",
    },
    {
        id: "room_3",
        name: "تأملات جماعية",
        membersCount: 15,
        avatar: "🐼",
        description: "جلسات تأمل جماعية للراحة النفسية والصفاء الذهني.",
    },
];

const MOCK_DM_CONTACTS = [
    {
        id: "2",
        name: "د. أحمد (Test Therapist)",
        avatar: "👨‍⚕️",
        role: "معالج نفسي",
        online: true,
    },
    {
        id: "1",
        name: "أحمد علي (Test Patient)",
        avatar: "🧑",
        role: "مريض",
        online: true,
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Chats() {
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    // "groups" | "dms"
    const [sidebarTab, setSidebarTab] = useState("groups");

    const [activeRoomId, setActiveRoomId] = useState("room_1");
    const [activeDmContact, setActiveDmContact] = useState(null);

    const [groupMessages, setGroupMessages] = useState({});
    const [dmMessages, setDmMessages] = useState({});

    const [searchQuery, setSearchQuery] = useState("");
    const [inputMsg, setInputMsg] = useState("");
    const [isTyping] = useState(false);
    const [navActiveTab, setNavActiveTab] = useState("اكتشف");

    const messagesEndRef = useRef(null);
    const prevRoomRef = useRef(null);

    const currentUserDisplayName = buildCurrentUserDisplayName(
        currentUserProfile,
    );
    const currentUserAvatarUrl = buildCurrentUserAvatarUrl(currentUserProfile);
    const currentUserAvatarText = getAvatarFallback(currentUserDisplayName);
    const currentUserId = currentUserProfile?.userId
        ? String(currentUserProfile.userId)
        : getCurrentUserId();
    const currentUserMeta = useMemo(
        () => ({
            displayName: currentUserDisplayName,
            avatarUrl: currentUserAvatarUrl,
            avatarText: currentUserAvatarText,
        }),
        [currentUserDisplayName, currentUserAvatarUrl, currentUserAvatarText],
    );

    const {
        connectionStatus,
        joinRoom,
        leaveRoom,
        sendGroupMessage,
        sendPrivateMessage,
        onGroupMessage,
        onPrivateMessage,
        fetchRoomHistory,
        fetchPrivateHistory,
    } = useChatHub();

    useEffect(() => {
        let isMounted = true;

        async function loadCurrentUserProfile() {
            try {
                const token = localStorage.getItem("jwt");
                if (!token) return;

                const response = await fetch(`${BASE_URL}/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) return;

                const profile = await response.json();
                if (isMounted) {
                    setCurrentUserProfile(profile);
                }
            } catch {
                // Keep the token-derived fallback if profile loading fails.
            }
        }

        loadCurrentUserProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    // ── Incoming SignalR messages ────────────────────────────────────────────

    onGroupMessage(
        useCallback(
            (msg) => {
                const roomId = msg.roomId || activeRoomId;
                const localMsg = serverMsgToLocal(
                    msg,
                    currentUserId,
                    currentUserMeta,
                );
                setGroupMessages((prev) => ({
                    ...prev,
                    [roomId]: replacePendingMessage(
                        prev[roomId] || [],
                        localMsg,
                    ),
                }));
            },
            [currentUserId, activeRoomId, currentUserMeta],
        ),
    );

    onPrivateMessage(
        useCallback(
            (msg) => {
                const contactId =
                    msg.senderId === currentUserId
                        ? msg.recipientId
                        : msg.senderId;
                const localMsg = serverMsgToLocal(
                    msg,
                    currentUserId,
                    currentUserMeta,
                );
                setDmMessages((prev) => ({
                    ...prev,
                    [contactId]: replacePendingMessage(
                        prev[contactId] || [],
                        localMsg,
                    ),
                }));
            },
            [currentUserId, currentUserMeta],
        ),
    );

    // ── Join/leave groups ────────────────────────────────────────────────────

    useEffect(() => {
        if (connectionStatus !== "connected") return;
        if (prevRoomRef.current && prevRoomRef.current !== activeRoomId) {
            leaveRoom(prevRoomRef.current);
        }
        joinRoom(activeRoomId);
        prevRoomRef.current = activeRoomId;
    }, [activeRoomId, connectionStatus, joinRoom, leaveRoom]);

    // ── Load history ─────────────────────────────────────────────────────────

    useEffect(() => {
        fetchRoomHistory(activeRoomId).then((msgs) => {
            if (msgs.length > 0) {
                setGroupMessages((prev) => ({
                    ...prev,
                    [activeRoomId]: msgs.map((m) =>
                        serverMsgToLocal(m, currentUserId, currentUserMeta),
                    ),
                }));
            }
        });
    }, [activeRoomId, currentUserId, currentUserMeta, fetchRoomHistory]);

    useEffect(() => {
        if (!activeDmContact) return;
        fetchPrivateHistory(activeDmContact.id).then((msgs) => {
            if (msgs.length > 0) {
                setDmMessages((prev) => ({
                    ...prev,
                    [activeDmContact.id]: msgs.map((m) =>
                        serverMsgToLocal(m, currentUserId, currentUserMeta),
                    ),
                }));
            }
        });
    }, [activeDmContact, currentUserId, currentUserMeta, fetchPrivateHistory]);

    // ── Auto scroll ──────────────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [groupMessages, dmMessages, activeRoomId, activeDmContact, isTyping]);

    // ── Derived values ───────────────────────────────────────────────────────

    const getFilteredRooms = () =>
        searchQuery.trim()
            ? roomsList.filter((r) => r.name.includes(searchQuery))
            : roomsList;

    const getFilteredContacts = () =>
        searchQuery.trim()
            ? MOCK_DM_CONTACTS.filter(
                  (c) =>
                      c.name.includes(searchQuery) ||
                      c.role.includes(searchQuery),
              )
            : MOCK_DM_CONTACTS;

    const selectedRoom =
        roomsList.find((r) => r.id === activeRoomId) || roomsList[0];

    const activeMessages =
        sidebarTab === "groups"
            ? groupMessages[activeRoomId] || []
            : activeDmContact
              ? dmMessages[activeDmContact.id] || []
              : [];

    const chatTitle =
        sidebarTab === "groups"
            ? selectedRoom.name
            : activeDmContact?.name || "اختر محادثة";

    const chatAvatar =
        sidebarTab === "groups"
            ? selectedRoom.avatar
            : activeDmContact?.avatar || "💬";

    // Real SignalR connection status shown in the chat header subtitle
    const signalrLabel =
        connectionStatus === "connected"
            ? "متصل بالخادم ✓"
            : connectionStatus === "connecting"
              ? "جاري الاتصال..."
              : "غير متصل بالخادم";

    const chatStatus =
        sidebarTab === "groups"
            ? signalrLabel
            : activeDmContact
              ? `${activeDmContact.online ? "متصل" : "غير متصل"} • ${signalrLabel}`
              : "";

    // ── Send message ─────────────────────────────────────────────────────────

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;
        if (sidebarTab === "dms" && !activeDmContact) return;

        const text = inputMsg.trim();
        setInputMsg("");

        const userMsg = {
            id: Date.now(),
            sender: "me",
            senderName: currentUserMeta.displayName,
            avatar: currentUserMeta.avatarText,
            avatarUrl: currentUserMeta.avatarUrl,
            text,
            time: nowArabicTime(),
            status: "pending",
        };

        if (sidebarTab === "groups") {
            setGroupMessages((prev) => ({
                ...prev,
                [activeRoomId]: [...(prev[activeRoomId] || []), userMsg],
            }));
            if (connectionStatus === "connected") {
                await sendGroupMessage(activeRoomId, text);
            }
        } else {
            setDmMessages((prev) => ({
                ...prev,
                [activeDmContact.id]: [
                    ...(prev[activeDmContact.id] || []),
                    userMsg,
                ],
            }));
            if (connectionStatus === "connected") {
                await sendPrivateMessage(activeDmContact.id, text);
            }
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="chats-page">
            {/* Header — unchanged */}
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
                        title={currentUserDisplayName}
                    >
                        {currentUserAvatarUrl ? (
                            <img
                                src={currentUserAvatarUrl}
                                alt={currentUserDisplayName}
                                className="user-avatar-image"
                            />
                        ) : (
                            <span className="user-avatar-fallback">
                                {currentUserAvatarText}
                            </span>
                        )}
                    </div>
                    <button className="header-btn" title="الإعدادات">
                        <Settings size={22} />
                    </button>
                    <button className="header-btn" title="الإشعارات">
                        <Bell size={22} />
                    </button>
                </div>
            </header>

            {/* Main — unchanged outer structure */}
            <main className="chats-main-content">
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

                <div className="chats-grid-layout">
                    {/* Left: Chat Window — unchanged */}
                    <div className="chat-left-column">
                        <div className="chat-window-card">
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
                                            {chatTitle}
                                        </h4>
                                        <span className="chat-header-status">
                                            {chatStatus}
                                        </span>
                                    </div>
                                    <div className="chat-header-avatar">
                                        {sidebarTab === "groups" ? (
                                            chatAvatar
                                        ) : activeDmContact?.avatarUrl ? (
                                            <img
                                                src={activeDmContact.avatarUrl}
                                                alt={activeDmContact.name}
                                                className="chat-header-avatar-image"
                                            />
                                        ) : (
                                            chatAvatar
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="chat-window-body">
                                {/* DM empty state */}
                                {sidebarTab === "dms" && !activeDmContact && (
                                    <div
                                        className="chat-inline-tip-box"
                                        style={{
                                            marginTop: "auto",
                                            marginBottom: "auto",
                                        }}
                                    >
                                        <div className="tip-stars">
                                            <Sparkles size={16} />
                                        </div>
                                        <span>
                                            اختر جهة اتصال من القائمة لبدء
                                            محادثة خاصة
                                        </span>
                                    </div>
                                )}

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
                                                {msg.avatarUrl ? (
                                                    <img
                                                        src={msg.avatarUrl}
                                                        alt={msg.senderName}
                                                        className="chat-msg-avatar-image"
                                                    />
                                                ) : (
                                                    msg.avatar
                                                )}
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

                                {isTyping && (
                                    <div className="chat-msg-row incoming">
                                        <div className="chat-msg-avatar">
                                            {sidebarTab === "groups" ? (
                                                selectedRoom.id === "room_1" ? (
                                                    "🐰"
                                                ) : selectedRoom.id ===
                                                  "room_2" ? (
                                                    "🐢"
                                                ) : (
                                                    "🐱"
                                                )
                                            ) : activeDmContact?.avatar ||
                                              "🐨"}
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

                        {/* Security card — unchanged */}
                        <div className="security-warning-card">
                            <div className="security-card-badge">
                                <ShieldCheck size={26} />
                            </div>
                            <h3>أمانك يهمنا</h3>
                            <p>كل المحادثات مشفرة وتتم بخصوصية تامة.</p>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="sidebar-right-column">
                        {/* ── Sidebar Tab Toggle (fits existing style) ── */}
                        <div className="sidebar-mode-toggle">
                            <button
                                className={`sidebar-mode-btn ${sidebarTab === "groups" ? "active" : ""}`}
                                onClick={() => {
                                    setSidebarTab("groups");
                                    setSearchQuery("");
                                }}
                            >
                                غرف جماعية
                            </button>
                            <button
                                className={`sidebar-mode-btn ${sidebarTab === "dms" ? "active" : ""}`}
                                onClick={() => {
                                    setSidebarTab("dms");
                                    setSearchQuery("");
                                }}
                            >
                                رسائل خاصة
                            </button>
                        </div>

                        {sidebarTab === "groups" ? (
                            <>
                                {/* Active Rooms — unchanged */}
                                <div className="active-rooms-panel">
                                    <h3>الغرف النشطة</h3>
                                    <div className="rooms-list-stack">
                                        {getFilteredRooms().map((room) => {
                                            const isSelected =
                                                room.id === activeRoomId;
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
                                                            {room.membersCount}{" "}
                                                            أعضاء نشطين
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

                                {/* Create space card — unchanged */}
                                <div className="create-custom-space-card">
                                    <h4>هل تريد مساحة خاصة؟</h4>
                                    <p>
                                        أنشئ غرفتك الخاصة وادعُ أصدقاءك للحديث
                                        بهوية مجهولة.
                                    </p>
                                    <button className="create-space-btn">
                                        إنشاء مساحة
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* DM contacts — same card style as rooms */
                            <div className="active-rooms-panel">
                                <h3>جهات الاتصال</h3>
                                <div className="rooms-list-stack">
                                    {getFilteredContacts().map((contact) => {
                                        const isSelected =
                                            activeDmContact?.id === contact.id;
                                        return (
                                            <div
                                                key={contact.id}
                                                className={`room-card-item ${isSelected ? "selected-active" : ""}`}
                                                onClick={() =>
                                                    setActiveDmContact(contact)
                                                }
                                            >
                                                  <div className="dm-card-avatar">
                                                      {contact.avatarUrl ? (
                                                          <img
                                                              src={contact.avatarUrl}
                                                              alt={contact.name}
                                                              className="dm-card-avatar-image"
                                                          />
                                                      ) : (
                                                          contact.avatar
                                                      )}
                                                  </div>
                                                <div className="room-card-info">
                                                    <h4 className="room-card-title">
                                                        {contact.name}
                                                    </h4>
                                                    <p className="room-card-subtitle">
                                                        {contact.role} •{" "}
                                                        <span
                                                            style={{
                                                            }}
                                                        >
                                                            {contact.online
                                                                ? "متصل"
                                                                : "غير متصل"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Nav — unchanged */}
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
