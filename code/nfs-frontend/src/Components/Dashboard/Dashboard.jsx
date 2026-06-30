import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {

    const today = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    const [hoveredItem, setHoveredItem] = useState(null);


    const patients = [
        { id: 1, name: "سارة أحمد", time: "04:00 م", type: "online", typeText: "أونلاين", icon: "fa-video", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
        { id: 2, name: "محمد علي", time: "05:30 م", type: "clinic", typeText: "في العيادة", icon: "fa-house-medical", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        { id: 3, name: "ياسمين ممدوح", time: "07:00 م", type: "online", typeText: "أونلاين", icon: "fa-video", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
    ];

    return (
        <div className="dashboard-wrapper">
            { }
            <div className="dashboard-header-zone">
                <h3 className="welcome-text">أهلاً د. مريم أحمد</h3>
                <p className="date-text">{today} | <span className="sessions-count">الجلسات المتاحة اليوم: 6 جلسات</span></p>
            </div>

            { }
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="card-content">
                        <span className="card-title">إجمالي المرضى</span>
                        <div className="card-value-wrapper">
                            <span className="card-value">128 مريض</span>
                            <span className="card-badge positive">+12%</span>
                        </div>
                    </div>
                    <div className="card-icon"><i className="fa-solid fa-user-injured"></i></div>
                </div>

                <div className="stat-card">
                    <div className="card-content">
                        <span className="card-title">ساعات العمل هذا الأسبوع</span>
                        <span className="card-value">32 ساعة</span>
                    </div>
                    <div className="card-icon"><i className="fa-regular fa-clock"></i></div>
                </div>

                <div className="stat-card">
                    <div className="card-content">
                        <span className="card-title">متوسط درجة المزاج للمرضى</span>
                        <span className="card-value">7.4/10</span>
                    </div>
                    <div className="card-icon"><i className="fa-regular fa-face-smile"></i></div>
                </div>
            </div>

            { }
            <div className="dashboard-two-columns">

                <div className="timeline-section">
                    <div className="section-header">
                        <h4>الجدول الزمني اليوم</h4>
                        <a href="#view-all" className="view-all-link">عرض الكل</a>
                    </div>

                    <div className="timeline-container">
                        <div className="vertical-line"></div>

                        { }
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                className="timeline-item"
                                onMouseEnter={() => setHoveredItem(patient.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                { }
                                <div className="timeline-dot-wrapper">
                                    <div className={`timeline-dot ${hoveredItem === patient.id ? 'active' : ''}`}></div>
                                </div>

                                { }
                                <div className={`patient-card ${hoveredItem === patient.id ? 'active' : ''}`}>
                                    <img src={patient.img} alt={patient.name} className="patient-img" />
                                    <div className="patient-info">
                                        <h5>{patient.name}</h5>
                                        <span className="session-time"><i className="fa-regular fa-clock"></i> {patient.time}</span>
                                    </div>
                                    <div className={`session-type ${patient.type}`}>
                                        <i className={`fa-solid ${patient.icon}`}></i>
                                        <span>{patient.typeText}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                { }
                <div className="requests-section">
                    <div className="requests-header">
                        <h4>طلبات الحجز الجديدة</h4>
                    </div>

                    <div className="requests-container">

                        { }
                        <div className="request-box">
                            <div className="request-user-info">
                                <div className="request-icon-wrapper user-icon">
                                    <i className="fa-solid fa-user-plus"></i>
                                </div>
                                <div className="request-details">
                                    <h5>ندى أحمد</h5>
                                    <span className="request-type">طلب استشارة أولية</span>
                                </div>
                            </div>
                            <p className="request-note">
                                "أعاني من قلق مستمر منذ أسبوعين وأحتاج للمساعدة في إدارة التوتر العملي."
                            </p>
                            <div className="request-actions">
                                <button className="action-btn accept-btn">قبول</button>
                                <button className="action-btn reject-btn">رفض</button>
                            </div>
                        </div>

                        { }
                        <div className="request-box">
                            <div className="request-user-info">
                                <div className="request-icon-wrapper calendar-icon">
                                    <i className="fa-regular fa-calendar-check"></i>
                                </div>
                                <div className="request-details">
                                    <h5>خالد محمود</h5>
                                    <span className="request-type">طلب إعادة حجز</span>
                                </div>
                            </div>
                            <div className="request-actions no-margin">
                                <button className="action-btn accept-btn">قبول</button>
                                <button className="action-btn reject-btn">رفض</button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            { }
            <div className="recent-activity-section">
                <div className="activity-header">
                    <h4>نشاط المرضى الأخير</h4>
                    <div className="activity-filter">
                        <span className="filter-option active">تحديثات المزاج</span>
                        <span className="filter-option">مذكرات</span>
                    </div>
                </div>

                <div className="activity-list">

                    { }
                    <div className="activity-item">
                        <div className="activity-icon-side mood-sad">
                            <i className="fa-regular fa-face-frown"></i>
                        </div>
                        <div className="activity-content-side">
                            <div className="activity-user-meta">
                                <h5>منى أحمد</h5>
                                <span className="activity-time">منذ ساعتين</span>
                            </div>
                            <p className="activity-text">
                                قامت بتحديث مزاجها: <span className="mood-quote font-sad">"أشعر بالإرهاق الشديد اليوم"</span>
                            </p>
                        </div>
                    </div>

                    { }
                    <div className="activity-item">
                        <div className="activity-icon-side note-shared">
                            <i className="fa-regular fa-sticky-note"></i>
                        </div>
                        <div className="activity-content-side">
                            <div className="activity-user-meta">
                                <h5>أحمد محمد</h5>
                                <span className="activity-time">منذ 4 ساعات</span>
                            </div>
                            <p className="activity-text">
                                شارك مذكرة جديدة: <span className="mood-quote font-note">"تحدي الأفكار السلبية في العمل"</span>
                            </p>
                        </div>
                    </div>

                    { }
                    <div className="activity-item">
                        <div className="activity-icon-side mood-happy">
                            <i className="fa-regular fa-face-smile-beam"></i>
                        </div>
                        <div className="activity-content-side">
                            <div className="activity-user-meta">
                                <h5>رنا خالد</h5>
                                <span className="activity-time">منذ 6 ساعات</span>
                            </div>
                            <p className="activity-text">
                                قامت بتحديث مزاجها: <span className="mood-quote font-happy">"يوم هادئ ومنتج"</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;