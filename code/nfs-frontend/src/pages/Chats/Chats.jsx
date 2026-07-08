import React, { useState } from 'react';
import ProfileHeader from '../../Components/Header/Header';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Chats.css';

function Chats() {
  
  const chatList = [
    { id: 1, name: "سارة أحمد", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", lastMsg: "شكراً جزيلاً دكتورة، التمارين ساعدتني جداً.", time: "١٠:٣٠ ص", unread: 2 },
    { id: 2, name: "محمد علي", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", lastMsg: "هل ممكن نغير موعد الجلسة القادمة؟", time: "أمس", unread: 0 },
    { id: 3, name: "ياسمين عمر", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", lastMsg: "أشعر بتحسن ملحوظ اليوم.", time: "قبل يومين", unread: 0 }
  ];

  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'patient', text: 'مرحباً دكتورة مريم، واجهت نوبة قلق خفيفة صباح اليوم أثناء العمل.', time: '٠٩:١٥ ص' },
    { id: 2, sender: 'doctor', text: 'أهلاً سارة. أتمنى أنكِ بخير الآن. هل قمتِ بتطبيق تمرين التنفس المربع 4-4 الذي تدربنا عليه؟', time: '٠٩:٤٥ ص' },
    { id: 3, sender: 'patient', text: 'نعم، قمت به فوراً وهدأت ضربات قلبي بشكل ملحوظ. شكراً جزيلاً دكتورة، التمارين ساعدتني جداً.', time: '١٠:٣٠ ص' }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'doctor',
      text: inputMsg,
      time: 'الآن'
    };

    setMessages([...messages, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="chats-page">
      <ProfileHeader />
      
      <main className="doctor-work-main">
        <div className="doctor-work-container">

          <section className="content-area">
          <div className="chats-wrapper">
  
  
  <div className="safe-spaces-header-zone">
    <div className="safe-spaces-title-block">
      <h2 className="safe-spaces-main-title">
        <i className="fa-solid fa-shield-heart"></i> مساحات آمنة
      </h2>
      <p className="safe-spaces-subtitle">
        تواصل بهوية مجهولة في مجتمعاتنا الداعمة. هنا، صوتك مسموع، وخصوصيتك هي الأولوية.
      </p>
    </div>
    
    
    <div className="online-counter-badge">
      <span className="pulse-dot"></span>
      <span className="online-count-text">٤٢  متصل الآن</span>
    </div>
  </div>

  
  
<div className="safe-spaces-content-layout">
  
  
  <div className="active-rooms-one-third-zone">
    
    
    <div className="active-rooms-box">
      <div className="rooms-box-header">
        <h3><i className="fa-solid fa-fire"></i> الغرف النشطة الآن</h3>
      </div>
      
      <div className="rooms-list">
        <div className="room-item card-active">
          <div className="room-meta-info">
            <h4 className="room-name">الدعم النفسي لمواجهة القلق</h4>
            <span className="room-members-count">
              <i className="fa-solid fa-users"></i> ١٢٤ عضو
            </span>
          </div>
          <i className="fa-solid fa-chevron-left arrow-icon"></i>
        </div>

        <div className="room-item">
          <div className="room-meta-info">
            <h4 className="room-name">تحديات الاحتراق الوظيفي</h4>
            <span className="room-members-count">
              <i className="fa-solid fa-users"></i> ٨٩ عضو
            </span>
          </div>
          <i className="fa-solid fa-chevron-left arrow-icon"></i>
        </div>

        <div className="room-item">
          <div className="room-meta-info">
            <h4 className="room-name">مساحة تفريغ المشاعر الحرة</h4>
            <span className="room-members-count">
              <i className="fa-solid fa-users"></i> ٢١٠ عضو
            </span>
          </div>
          <i className="fa-solid fa-chevron-left arrow-icon"></i>
        </div>
      </div>
    </div>

    
    <div className="create-private-space-box">
      <h4>هل تريد مساحة خاصة؟</h4>
      <p>أنشئ غرفتك الخاصة وادعُ أصدقاءك للحديث بهوية مجهولة.</p>
      <button className="create-space-btn">
        <i className="fa-solid fa-plus"></i>
        <span>إنشاء مساحة</span>
      </button>
    </div>

  </div>

  
  
<div className="room-chat-two-thirds-zone">
  <div className="safe-chat-container">
    
    
    <div className="safe-chat-header">
      <div className="room-info-block">
        <div className="room-avatar-icon">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <div>
          <h4 className="active-room-title">الدعم النفسي لمواجهة القلق</h4>
          <span className="active-room-status">غرفة عامة مجهولة الهوية</span>
        </div>
      </div>
    </div>

    
    <div className="safe-chat-messages-body">
      
      
      <div className="safe-msg-row">
        <div className="anon-avatar" style={{ backgroundColor: '#e67e22' }}>
          <i className="fa-solid fa-ghost"></i>
        </div>
        <div className="safe-msg-content">
          <div className="safe-msg-meta">
            <span className="anon-username">مستكشف مجهول</span>
            <span className="safe-msg-time">٠٨:١٤ م</span>
          </div>
          <div className="safe-msg-bubble">
            <p>بقالي فترة بحس بضربات قلب سريعة أول ما أدخل المكتب، هل حد مر بالتجربة دي؟</p>
          </div>
        </div>
      </div>

      
      <div className="safe-msg-row">
        <div className="anon-avatar" style={{ backgroundColor: '#9b59b6' }}>
          <i className="fa-solid fa-mask"></i>
        </div>
        <div className="safe-msg-content">
          <div className="safe-msg-meta">
            <span className="anon-username">طائر الليل</span>
            <span className="safe-msg-time">٠٨:١٦ م</span>
          </div>
          <div className="safe-msg-bubble">
            <p>جداً! ده غالباً قلق وظيفي. جرب تمرين التنفس المربع (٤ ثواني شهيق، ٤ كتم، ٤ زفير) بيفرق جداً في اللحظتها.</p>
          </div>
        </div>
      </div>

      
      <div className="safe-msg-row is-doctor-sender">
        <div className="safe-msg-content">
          <div className="safe-msg-meta">
            <span className="anon-username doctor-label">د. مريم (استشاري نفسي)</span>
            <span className="safe-msg-time">٠٨:٢٠ م</span>
          </div>
          <div className="safe-msg-bubble">
            <p>كلام سليم يا "طائر الليل". وأحب أضيف كمان: حاول تكتب الأفكار اللي بتجيلك أول ما تقعد على مكتبك؛ تفريغ الأفكار على الورق بيفقدها قوتها المرعبة.</p>
          </div>
        </div>
      </div>

    </div>

    
    <div className="safe-chat-input-footer">
      <input 
        type="text" 
        placeholder="اكتب رسالتك بهوية مجهولة..." 
        className="safe-chat-input-field"
      />
      <button className="safe-chat-send-btn">
        <i className="fa-solid fa-paper-plane"></i>
      </button>
    </div>

  </div>
</div>

</div>

</div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Chats;