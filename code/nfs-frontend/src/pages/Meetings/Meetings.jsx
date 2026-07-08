import React from 'react';
import ProfileHeader from '../../Components/Header/Header';
import ProfileFooter from '../../Components/Footer/Footer';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Meetings.css';

function Meetings() {
    return (
        <div className="meetings-page">
            <ProfileHeader />

            <main className="doctor-work-main">
                <div className="doctor-work-container">


                    <section className="content-area">
                        <div className="meeting-workspace-layout">

                            <div className="meeting-video-column">

                                <div className="video-stream-box">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"
                                        alt="بث المريض"
                                        className="patient-video-live"
                                    />

                                    <span className="doctor-video-name">د. مريم</span>

                                    <div className="live-reaction-bubble streaming-animation">
                                        <span className="reaction-emoji">🙏</span>
                                        <span className="reaction-text">امتنان وشكر</span>
                                    </div>

                                    <div className="teams-reaction-picker">
                                        <span className="picker-label">عبّر عن شعورك الحالي:</span>
                                        <div className="reactions-buttons-row">
                                            <button className="reaction-trigger-btn" title="شكر وامتنان">
                                                <span className="btn-emoji">🙏</span>
                                                <span className="btn-text">امتنان</span>
                                            </button>
                                            <button className="reaction-trigger-btn" title="شعور بالراحة">
                                                <span className="btn-emoji">😌</span>
                                                <span className="btn-text">راحة</span>
                                            </button>
                                            <button className="reaction-trigger-btn" title="فخر وإنجاز">
                                                <span className="btn-emoji">⭐</span>
                                                <span className="btn-text">فخر</span>
                                            </button>
                                            <button className="reaction-trigger-btn" title="حزن أو ضيق">
                                                <span className="btn-emoji">😢</span>
                                                <span className="btn-text">ضيق</span>
                                            </button>
                                            <button className="reaction-trigger-btn" title="حب وتقبل">
                                                <span className="btn-emoji">🤍</span>
                                                <span className="btn-text">تقبل</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="video-controls-bar">
                                    <button className="control-btn toggle-mic" title="كتم الصوت">
                                        <i className="fa-solid fa-microphone"></i>
                                    </button>
                                    <button className="control-btn toggle-video" title="إيقاف الكاميرا">
                                        <i className="fa-solid fa-video"></i>
                                    </button>
                                    <button className="control-btn share-screen" title="مشاركة الشاشة">
                                        <i className="fa-solid fa-desktop"></i>
                                    </button>
                                    <button className="control-btn end-call-btn" title="إنهاء المكالمة">
                                        <i className="fa-solid fa-phone-slash"></i>
                                    </button>
                                </div>

                            </div>

                            <div className="meeting-sidebar-column">

                                <div className="doctor-camera-box">
                                    <img
                                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300"
                                        alt="كاميرا الطبيب"
                                        className="doctor-camera-preview"
                                    />
                                    <span className="camera-live-badge">أنت (بث مباشر)</span>
                                </div>

                                <div className="session-notes-box">
                                    <div className="notes-header">
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        <span>ملاحظات الجلسة الحالية</span>
                                    </div>
                                    <textarea
                                        className="session-notes-input"
                                        placeholder="اكتبي هنا الأعراض، التشخيص المبدئي، أو التوصيات العلاجية للمريض..."
                                    ></textarea>
                                    <button className="save-notes-btn">
                                        <i className="fa-solid fa-floppy-disk"></i>
                                        <span>حفظ الملاحظات</span>
                                    </button>
                                </div>

                            </div>

                        </div>
                    </section>

                </div>
            </main>

            <ProfileFooter activeTab="chats" />
        </div>
    );
}

export default Meetings;