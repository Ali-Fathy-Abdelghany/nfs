import { Home, Flower, Compass, MessageSquare, User } from "lucide-react";
import "./Footer.css";

function Footer({ activeTab }) {
  return (
    <footer className="main-footer">
      <nav className="footer-nav">
        { }
        <div
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          title="الرئيسية"
        >
          <div className="icon-circle">
            <Home size={22} strokeWidth={activeTab === "home" ? 2 : 1.5} />
          </div>
          <span>الرئيسية</span>
        </div>

        { }
        <div
          className={`nav-item ${activeTab === "sessions" ? "active" : ""}`}
          title="جلساتي"
        >
          <div className="icon-circle">
            <Flower
              size={22}
              strokeWidth={activeTab === "sessions" ? 2 : 1.5}
            />
          </div>
          <span>جلساتي</span>
        </div>

        { }
        <div
          className={`nav-item ${activeTab === "discover" ? "active" : ""}`}
          title="اكتشف"
        >
          <div className="icon-circle">
            <Compass
              size={22}
              strokeWidth={activeTab === "discover" ? 2 : 1.5}
            />
          </div>
          <span>اكتشف</span>
        </div>

        { }
        <div
          className={`nav-item ${activeTab === "chats" ? "active" : ""}`}
          title="محادثات"
        >
          <div className="icon-circle">
            <MessageSquare
              size={22}
              strokeWidth={activeTab === "chats" ? 2 : 1.5}
            />
          </div>
          <span>محادثات</span>
        </div>

        { }
        <div
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          title="حسابي"
        >
          <div className="icon-circle">
            <User size={22} strokeWidth={activeTab === "profile" ? 2 : 1.5} />
          </div>
          <span>حسابي</span>
        </div>
      </nav>
    </footer>
  );
}

export default Footer;
