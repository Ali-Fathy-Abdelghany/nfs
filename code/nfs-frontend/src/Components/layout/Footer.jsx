import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, BookOpen, Compass, User } from "lucide-react";
import { useAuthGate } from "../../context/AuthGateContext";

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { requireAuth, isAuthenticated } = useAuthGate();

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === "/dashboard" || path === "/") return "home";
        if (path.includes("/about")) return "";
        if (path.includes("/doctor/chats")) return "chat";
        if (path.includes("/sessions")) return "sessions";
        if (path.includes("/doctor/library")) return "explore";
        if (path.includes("/profile-progress")) return "profile";
        return "";
    };

    const activeTab = getActiveTab();

    const goProtected = (path, copy) => {
        requireAuth(() => navigate(path), copy);
    };

    return (
        <nav
            dir="rtl"
            className="fixed bottom-0 left-0 w-full z-50 flex flex-row justify-around items-center px-4 pb-6 pt-3.5 bg-white/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-neutral-100"
        >
            <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${
              activeTab === "home"
                  ? "text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm"
                  : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30"
          }`}
            >
                <Home className="w-5 h-5" />
                <span className="text-[10px] mt-1">الرئيسية</span>
            </button>

            <button
                type="button"
                onClick={() =>
                    goProtected("/doctor/chats", {
                        title: "المحادثات لأعضاء نفس",
                        message: "سجّل الدخول عشان تدخل دوائر الدعم وتشارك بأمان.",
                    })
                }
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${
              activeTab === "chat"
                  ? "text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm"
                  : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30"
          }`}
            >
                <MessageCircle className="w-5 h-5" />
                <span className="text-[10px] mt-1">محادثات</span>
            </button>

            <button
                type="button"
                onClick={() =>
                    goProtected("/sessions", {
                        title: "جلساتك الخاصة",
                        message: "سجّل الدخول عشان تشوف مواعيدك وتدخل جلساتك المحجوزة.",
                    })
                }
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${
              activeTab === "sessions"
                  ? "text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm"
                  : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30"
          }`}
            >
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] mt-1">جلساتي</span>
            </button>

            <button
                type="button"
                onClick={() => navigate("/doctor/library")}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${
              activeTab === "explore"
                  ? "text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm"
                  : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30"
          }`}
            >
                <Compass className="w-5 h-5" />
                <span className="text-[10px] mt-1">اكتشف</span>
            </button>

            <button
                type="button"
                onClick={() =>
                    goProtected("/profile-progress", {
                        title: "حسابك بانتظارك",
                        message: "سجّل الدخول عشان تشوف تقدمك وإحصائيات رحلتك النفسية.",
                    })
                }
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${
              activeTab === "profile"
                  ? "text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm"
                  : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30"
          }`}
            >
                <User className="w-5 h-5" />
                <span className="text-[10px] mt-1">حسابي</span>
            </button>
        </nav>
    );
};

export default Footer;
