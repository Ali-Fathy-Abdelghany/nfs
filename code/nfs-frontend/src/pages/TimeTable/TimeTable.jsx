import React, { useState } from 'react';
import ProfileHeader from '../../Components/Header/Header';
import Sidebar from '../../Components/Sidebar/Sidebar'; 
import './TimeTable.css';

function TimeTable() {
  
  const [calendarView, setCalendarView] = useState('week');

  
  const weekDays = [
    { name: 'السبت', date: '04 يوليو' },
    { name: 'الأحد', date: '05 يوليو' },
    { name: 'الإثنين', date: '06 يوليو' },
    { name: 'الثلاثاء', date: '07 يوليو' },
    { name: 'الأربعاء', date: '08 يوليو' },
    { name: 'الخميس', date: '09 يوليو' }
  ];

  
  const calendarSessions = [
    { day: 'السبت', time: '04:00 م', patient: 'سارة أحمد', type: 'أونلاين' },
    { day: 'السبت', time: '07:30 م', patient: 'محمد علي', type: 'حضوري' },
    { day: 'الأحد', time: '05:00 م', patient: 'ياسمين عمر', type: 'أونلاين' },
    { day: 'الإثنين', time: '02:00 م', patient: 'أحمد خالد', type: 'حضوري' },
    { day: 'الثلاثاء', time: '06:00 م', patient: 'رانيا مصطفى', type: 'أونلاين' },
    { day: 'الخميس', time: '08:00 م', patient: 'عبدالله محمد', type: 'حضوري' }
  ];

  return (
    <div className="timetable-page">
      <ProfileHeader />
      
      <main className="doctor-work-main">
 <Sidebar activeTab="timetable" />

        <div className="doctor-work-container">
         

          <section className="content-area">
            <div className="timetable-wrapper">
              
              
              <div className="timetable-header-wrapper">
                <div className="doctor-welcome-meta">
                  <h2 className="welcome-doctor-title">مرحباً د. مريم خالد</h2>
                  <p className="today-sessions-count">
                    لديك <span className="highlight-count">3 جلسات</span> مجدولة اليوم.
                  </p>
                </div>
                <div className="timetable-quick-actions">
                  <button className="add-today-session-btn">
                    <i className="fa-solid fa-plus"></i>
                    <span>إضافة جلسة اليوم</span>
                  </button>
                </div>
              </div>

              
              <div className="timetable-content-layout">
                
                
                <div className="calendar-two-thirds-zone">
                  
                  
                  
<div className="calendar-control-bar">
  
  
  <div className="calendar-current-date-label">
    <i className="fa-regular fa-calendar"></i>
    <span>يوليو 2026</span>
  </div>

  
  <div className="calendar-view-switcher">
    <button 
      className={`view-btn ${calendarView === 'day' ? 'active' : ''}`}
      onClick={() => setCalendarView('day')}
    >
      يوم
    </button>
    <button 
      className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
      onClick={() => setCalendarView('week')}
    >
      أسبوع
    </button>
    <button 
      className={`view-btn ${calendarView === 'month' ? 'active' : ''}`}
      onClick={() => setCalendarView('month')}
    >
      شهر
    </button>
  </div>

</div>

                  
                  <div className="week-view-container">
                    {weekDays.map((dayItem, idx) => {
                      
                      const daySessions = calendarSessions.filter(s => s.day === dayItem.name);

                      return (
                        <div key={idx} className="calendar-day-column">
                          <div className="column-date-header">
                            <span className="day-title">{dayItem.name}</span>
                            <span className="day-numeric-date">{dayItem.date}</span>
                          </div>
                          
                          <div className="column-sessions-body">
                            {daySessions.length > 0 ? (
                              daySessions.map((session, sIdx) => (
                                <div key={sIdx} className={`calendar-session-card ${session.type === 'أونلاين' ? 'is-online' : 'is-person'}`}>
                                  <span className="session-card-time">{session.time}</span>
                                  <span className="session-card-patient">{session.patient}</span>
                                  <span className="session-card-type">{session.type}</span>
                                </div>
                              ))
                            ) : (
                              <div className="no-sessions-placeholder">لا يوجد جلسات</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                
                
<div className="sidebar-one-third-zone">
  
  
  <div className="agenda-box">
    
    
    <div className="agenda-header">
      <h3>
        <i className="fa-regular fa-clock"></i> أجندة اليوم
      </h3>
      <span className="agenda-count-badge">3 جلسات</span>
    </div>

    
    <div className="agenda-patients-list">
      
      <div className="agenda-patient-item">
        <div className="patient-agenda-meta">
          <span className="patient-agenda-name">سارة أحمد</span>
          <span className="patient-agenda-time">04:00 مساءً</span>
        </div>
        <div className="session-type-icon-wrapper online" title="جلسة أونلاين">
          <i className="fa-solid fa-video"></i>
        </div>
      </div>

      <div className="agenda-patient-item">
        <div className="patient-agenda-meta">
          <span className="patient-agenda-name">محمد علي</span>
          <span className="patient-agenda-time">07:30 مساءً</span>
        </div>
        <div className="session-type-icon-wrapper in-person" title="جلسة في العيادة">
          <i className="fa-solid fa-house-user"></i>
        </div>
      </div>

      <div className="agenda-patient-item">
        <div className="patient-agenda-meta">
          <span className="patient-agenda-name">ياسمين عمر</span>
          <span className="patient-agenda-time">09:00 مساءً</span>
        </div>
        <div className="session-type-icon-wrapper online" title="جلسة أونلاين">
          <i className="fa-solid fa-video"></i>
        </div>
      </div>

    </div>
  </div>

  
  
<div className="new-requests-box">
  
  
  <div className="requests-header">
    <h3>طلبات جديدة</h3>
  </div>

  
  <div className="request-item-card">
    
    
    <div className="request-patient-profile">
      <div className="request-avatar-wrapper">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" 
          alt="صورة المريض" 
          className="request-patient-img"
        />
      </div>
      <div className="request-patient-meta">
        <h4 className="request-patient-name">نهى محمود</h4>
        <span className="request-time-ago">منذ ساعتين</span>
      </div>
    </div>

    
    <div className="request-content-text">
      <p>يرغب في حجز أول جلسة استشارية للتعامل مع القلق الوظيفي.</p>
    </div>

    
    <div className="request-actions-row">
      <button className="request-btn accept-btn">قبول</button>
      <button className="request-btn reject-btn">رفض</button>
    </div>

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

export default TimeTable;