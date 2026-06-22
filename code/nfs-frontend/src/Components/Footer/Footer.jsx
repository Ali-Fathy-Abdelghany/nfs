// src/components/Footer/Footer.jsx
import { Home, Flower, Compass, MessageSquare, User } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <nav className="footer-nav">
        
        <div className="nav-item" title="الرئيسية">
          <div className="icon-circle">
            <Home size={22} strokeWidth={1.5} />
          </div>
          <span>الرئيسية</span>
        </div>

        <div className="nav-item" title="جلساتي">
          <div className="icon-circle">
            <Flower size={22} strokeWidth={1.5} />
          </div>
          <span>جلساتي</span>
        </div>

        <div className="nav-item" title="اكتشف">
          <div className="icon-circle">
            <Compass size={22} strokeWidth={1.5} />
          </div>
          <span>اكتشف</span>
        </div>

        <div className="nav-item" title="محادثات">
          <div className="icon-circle">
            <MessageSquare size={22} strokeWidth={1.5} />
          </div>
          <span>محادثات</span>
        </div>

        <div className="nav-item" title="حسابي">
          <div className="icon-circle">
            <User size={22} strokeWidth={1.5} />
          </div>
          <span>حسابي</span>
        </div>

      </nav>
    </footer>
  );
}

export default Footer;