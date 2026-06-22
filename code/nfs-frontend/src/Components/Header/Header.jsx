// src/components/Header/Header.jsx
import { Bell, User } from 'lucide-react';
import './Header.css';

function Header() {
  return (
    <header className="main-header">
      <div className="header-logo">
        نفس
      </div>

      <div className="header-icons">
        <div className="icon-wrapper" title="الإشعارات">
          <Bell size={24} strokeWidth={1.5} /> 
        </div>
        <div className="icon-wrapper" title="الملف الشخصي">
          <User size={24} strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );
}

export default Header;