import React from 'react';
import ProfileHeader from '../../Components/Header/Header';
import ProfileFooter from '../../Components/Footer/Footer';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Patients.css';

function Patients() {
    return (
        <div className="patients-page">
            <ProfileHeader />

            <main className="doctor-work-main">
                <div className="doctor-work-container">

                    <Sidebar activeTab="patients" />

                    {/* منطقة المحتوى الأساسية */}
                    <section className="content-area">
                        <div className="patients-content-wrapper">

                            <div className="patients-stats-grid">

                                {/* كارت إجمالي المرضى */}
                                <div className="stat-card-box">
                                    <div className="stat-card-info">
                                        <span className="stat-card-title">إجمالي المرضى</span>
                                        <h3 className="stat-card-number">142</h3>
                                    </div>
                                    <div className="stat-card-icon icon-patients">
                                        <i className="fa-solid fa-user-group"></i>
                                    </div>
                                </div>

                                {/* كارت جلسات اليوم */}
                                <div className="stat-card-box">
                                    <div className="stat-card-info">
                                        <span className="stat-card-title">جلسات اليوم</span>
                                        <h3 className="stat-card-number">8</h3>
                                    </div>
                                    <div className="stat-card-icon icon-sessions">
                                        <i className="fa-solid fa-calendar-check"></i>
                                    </div>
                                </div>

                                {/* كارت متوسط التقييم */}
                                <div className="stat-card-box">
                                    <div className="stat-card-info">
                                        <span className="stat-card-title">متوسط التقييم</span>
                                        <h3 className="stat-card-number">4.8</h3>
                                    </div>
                                    <div className="stat-card-icon icon-rating">
                                        <i className="fa-solid fa-star"></i>
                                    </div>
                                </div>

                            </div>

                            <div className="patients-filter-bar">

                                <div className="filter-status-group">
                                    <button className="filter-status-btn active">الكل</button>
                                    <button className="filter-status-btn">نشط</button>
                                    <button className="filter-status-btn">في إجازة</button>
                                    <button className="filter-status-btn">مكتمل</button>
                                </div>

                                <div className="filter-sort-group">
                                    <label htmlFor="sort-select" className="sort-label">ترتيب حسب:</label>
                                    <div className="sort-select-wrapper">
                                        <select id="sort-select" className="sort-dropdown">
                                            <option value="latest">الأحدث انضماماً</option>
                                            <option value="name">الاسم (أبجدي)</option>
                                            <option value="sessions">عدد الجلسات</option>
                                        </select>
                                        <i className="fa-solid fa-chevron-down sort-caret"></i>
                                    </div>
                                </div>

                            </div>

                            <div className="patients-cards-list">

                                <div className="patient-wide-card">
                                    <div className="patient-card-main-info">
                                        <div className="patient-avatar-wrapper">
                                            <img
                                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                                                alt="سارة أحمد"
                                                className="patient-avatar-img"
                                            />
                                        </div>
                                        <div className="patient-text-details">
                                            <h4>سارة أحمد</h4>
                                            <div className="patient-badges-row">
                                                <span className="patient-condition-badge">اضطراب قلق حاد</span>
                                                <span className="patient-status-text text-active">· نشط</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="patient-card-dates">
                                        <div className="date-group">
                                            <span className="date-label">الجلسة الأخيرة</span>
                                            <span className="date-value">28 يونيو 2026</span>
                                        </div>
                                        <div className="date-group">
                                            <span className="date-label">الجلسة القادمة</span>
                                            <span className="date-value upcoming">05 يوليو 2026</span>
                                        </div>
                                    </div>

                                    <div className="patient-card-emoji-mood">
                                        <span className="mood-emoji" title="تحسن ملحوظ">😊</span>
                                    </div>
                                </div>

                                <div className="patient-wide-card">
                                    <div className="patient-card-main-info">
                                        <div className="patient-avatar-wrapper">
                                            <img
                                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                                                alt="محمد علي"
                                                className="patient-avatar-img"
                                            />
                                        </div>
                                        <div className="patient-text-details">
                                            <h4>محمد علي</h4>
                                            <div className="patient-badges-row">
                                                <span className="patient-condition-badge">نوبات هلع</span>
                                                <span className="patient-status-text text-active">· نشط</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="patient-card-dates">
                                        <div className="date-group">
                                            <span className="date-label">الجلسة الأخيرة</span>
                                            <span className="date-value">25 يونيو 2026</span>
                                        </div>
                                        <div className="date-group">
                                            <span className="date-label">الجلسة القادمة</span>
                                            <span className="date-value upcoming">02 يوليو 2026</span>
                                        </div>
                                    </div>

                                    <div className="patient-card-emoji-mood">
                                        <span className="mood-emoji" title="مجهد / قلق">😟</span>
                                    </div>
                                </div>

                                <div className="patient-wide-card">
                                    <div className="patient-card-main-info">
                                        <div className="patient-avatar-wrapper">
                                            <img
                                                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                                                alt="رانيا مصطفى"
                                                className="patient-avatar-img"
                                            />
                                        </div>
                                        <div className="patient-text-details">
                                            <h4>رانيا مصطفى</h4>
                                            <div className="patient-badges-row">
                                                <span className="patient-condition-badge">اكتئاب موسمي</span>
                                                <span className="patient-status-text text-vacation">· في إجازة</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="patient-card-dates">
                                        <div className="date-group">
                                            <span className="date-label">الجلسة الأخيرة</span>
                                            <span className="date-value">18 يونيو 2026</span>
                                        </div>
                                        <div className="date-group">
                                            <span className="date-label">الجلسة القادمة</span>
                                            <span className="date-value leave-status">في إجازة</span>
                                        </div>
                                    </div>

                                    <div className="patient-card-emoji-mood">
                                        <span className="mood-emoji" title="مستقر">😐</span>
                                    </div>
                                </div>

                                <div className="patient-wide-card">
                                    <div className="patient-card-main-info">
                                        <div className="patient-avatar-wrapper">
                                            <img
                                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                                                alt="أحمد خالد"
                                                className="patient-avatar-img"
                                            />
                                        </div>
                                        <div className="patient-text-details">
                                            <h4>أحمد خالد</h4>
                                            <div className="patient-badges-row">
                                                <span className="patient-condition-badge">اضطراب النوم والأرق</span>
                                                <span className="patient-status-text text-completed">· مكتمل</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="patient-card-dates">
                                        <div className="date-group">
                                            <span className="date-label">الجلسة الأخيرة</span>
                                            <span className="date-value">12 يونيو 2026</span>
                                        </div>
                                        <div className="date-group">
                                            <span className="date-label">الجلسة القادمة</span>
                                            <span className="date-value completed-status">تم الاستكمال</span>
                                        </div>
                                    </div>

                                    <div className="patient-card-emoji-mood">
                                        <span className="mood-emoji" title="تعافي تام">😁</span>
                                    </div>
                                </div>

                                <div className="patient-wide-card">
                                    <div className="patient-card-main-info">
                                        <div className="patient-avatar-wrapper">
                                            <img
                                                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
                                                alt="ياسمين عمر"
                                                className="patient-avatar-img"
                                            />
                                        </div>
                                        <div className="patient-text-details">
                                            <h4>ياسمين عمر</h4>
                                            <div className="patient-badges-row">
                                                <span className="patient-condition-badge">إدارة ضغوط العمل</span>
                                                <span className="patient-status-text text-active">· نشط</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="patient-card-dates">
                                        <div className="date-group">
                                            <span className="date-label">الجلسة الأخيرة</span>
                                            <span className="date-value">29 يونيو 2026</span>
                                        </div>
                                        <div className="date-group">
                                            <span className="date-label">الجلسة القادمة</span>
                                            <span className="date-value upcoming">06 يوليو 2026</span>
                                        </div>
                                    </div>

                                    <div className="patient-card-emoji-mood">
                                        <span className="mood-emoji" title="متحمس / إيجابي">✨😎</span>
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div className="patients-pagination-wrapper">
                            <div className="pagination-container">

                                <button className="pagination-arrow-btn" disabled title="الصفحة السابقة">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>

                                <button className="pagination-number-btn active">1</button>
                                <button className="pagination-number-btn">2</button>
                                <button className="pagination-number-btn">3</button>
                                <button className="pagination-number-btn">4</button>
                                <span className="pagination-ellipsis">...</span>
                                <button className="pagination-number-btn">8</button>

                                <button className="pagination-arrow-btn" title="الصفحة التالية">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>

                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <ProfileFooter />
        </div>
    );
}

export default Patients;