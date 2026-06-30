import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProfileHeader from '../../Components/Header/Header';
import ProfileFooter from '../../Components/Footer/Footer';
import './PatientProfile.css';

const chartData = {
    week: [
        { name: 'السبت', المزاج: 6 },
        { name: 'الأحد', المزاج: 4 },
        { name: 'الإثنين', المزاج: 7 },
        { name: 'الثلاثاء', المزاج: 5 },
        { name: 'الأربعاء', المزاج: 8 },
        { name: 'الخميس', المزاج: 7.4 },
        { name: 'الجمعة', المزاج: 9 },
    ],
    month: [
        { name: 'الأسبوع 1', المزاج: 5 },
        { name: 'الأسبوع 2', المزاج: 6.5 },
        { name: 'الأسبوع 3', المزاج: 7.4 },
        { name: 'الأسبوع 4', المزاج: 8.2 },
    ]
};

function PatientProfile() {
    const [activeFilter, setActiveFilter] = useState('week');

    return (
        <div className="patient-profile-page">
            <ProfileHeader />

            <main className="patient-profile-main">
                <div className="patient-profile-container">

                    {/* الهيدر الخاص ببيانات المريض الأساسية */}
                    <div className="patient-info-header">
                        <div className="patient-main-meta">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                                alt="بروفايل المريض"
                                className="patient-profile-img"
                            />
                            <div className="patient-text-meta">
                                <h3 className="patient-name">سارة أحمد</h3>
                                <div className="patient-sub-details">
                                    <span className="detail-item"><i className="fa-solid fa-cake-candles"></i> 24 سنة</span>
                                    <span className="detail-divider">|</span>
                                    <span className="detail-item"><i className="fa-solid fa-calendar-day"></i> بدأت العلاج منذ: 15 يناير 2026</span>
                                </div>
                            </div>
                        </div>
                        <div className="patient-action-zone">
                            <button className="start-session-btn">
                                <i className="fa-solid fa-play"></i> ابدأ الجلسة الآن
                            </button>
                        </div>
                    </div>

                    <div className="patient-profile-body-grid">

                        <div className="profile-sidebar-column">
                            <div className="clinical-status-box">
                                <h4>الحالة الإكلينيكية</h4>
                                <div className="diseases-tags">
                                    <span className="disease-tag">اضطراب القلق العام</span>
                                    <span className="disease-tag">نوبات هلع متكررة</span>
                                    <span className="disease-tag">أرق مزمن</span>
                                    <span className="disease-tag">إجهاد عملي حاد</span>
                                </div>
                            </div>

                            <div className="next-session-box">
                                <div className="next-session-header">
                                    <i className="fa-regular fa-calendar-check"></i>
                                    <h5>الجلسة القادمة</h5>
                                </div>
                                <div className="next-session-details">
                                    <p className="session-date-time">الأحد، 5 يوليو | 06:00 مساءً</p>
                                    <span className="session-duration">المدة: 50 دقيقة</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-main-column">
                            <div className="mood-evolution-box">
                                <div className="evolution-header">
                                    <h4>تطور الحالة المزاجية</h4>
                                    <div className="time-filter">
                                        <span
                                            className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('week')}
                                        >
                                            أسبوع
                                        </span>
                                        <span
                                            className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('month')}
                                        >
                                            شهر
                                        </span>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <ResponsiveContainer width="99%" aspect={2}>
                                        <LineChart data={chartData[activeFilter]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis domain={[1, 10]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickCount={5} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    direction: 'rtl'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="المزاج"
                                                stroke="var(--primary-color)"
                                                strokeWidth={3}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                                dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: 'var(--primary-color)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="patient-profile-footer-grid">

                        {/* عمود ملاحظات الجلسة الأخيرة */}
                        <div className="profile-notes-column">
                            <div className="last-session-notes-box">
                                <div className="notes-header">
                                    <h4>ملاحظات الجلسة الأخيرة</h4>
                                    <span className="notes-date">
                                        <i className="fa-regular fa-calendar"></i> 28 يونيو 2026
                                    </span>
                                </div>

                                <p className="notes-text">
                                    أظهرت سارة تحسناً ملحوظاً في إدارة نوبات القلق الصباحية. ناقشنا تقنية
                                    "التجذير 5-4-3-2-1" وأبدت استجابة جيدة. لا تزال تعاني من بعض الأرق
                                    المرتبط بضغط العمل، قمنا بتعديل خطة النوم لتشمل تمارين استرخاء عضلات تدريجي.
                                </p>

                                <div className="notes-actions">
                                    <button className="note-action-btn attachments-btn">
                                        <i className="fa-solid fa-paperclip"></i> المرفقات
                                    </button>
                                    <button className="note-action-btn edit-note-btn">
                                        <i className="fa-regular fa-pen-to-square"></i> تعديل الملاحظة
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* عمود سجل الجلسات السابقة */}
                        <div className="profile-last-sidebar-column">
                            <div className="session-history-box">
                                <h4>سجل الجلسات</h4>

                                <div className="sessions-list">
                                    <div className="session-history-item">
                                        <div className="session-meta-info">
                                            <span className="session-number">الجلسة #12</span>
                                            <span className="session-history-date">28 يونيو 2026</span>
                                        </div>
                                        <span className="session-mode badge-in-person">حضوري</span>
                                    </div>

                                    <div className="session-history-item">
                                        <div className="session-meta-info">
                                            <span className="session-number">الجلسة #11</span>
                                            <span className="session-history-date">21 يونيو 2026</span>
                                        </div>
                                        <span className="session-mode badge-online">أونلاين</span>
                                    </div>

                                    <div className="session-history-item">
                                        <div className="session-meta-info">
                                            <span className="session-number">الجلسة #10</span>
                                            <span className="session-history-date">14 يونيو 2026</span>
                                        </div>
                                        <span className="session-mode badge-in-person">حضوري</span>
                                    </div>
                                </div>

                                <div className="view-all-sessions-wrapper">
                                    <span className="view-all-link">عرض الكل</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <ProfileFooter />
        </div>
    );
}

export default PatientProfile;