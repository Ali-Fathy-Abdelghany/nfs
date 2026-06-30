import React, { useState } from 'react';
import ProfileHeader from '../../Components/Header/Header';
import ProfileFooter from '../../Components/Footer/Footer';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Sessions.css';

function Sessions() {
    const [activeDoctorId, setActiveDoctorId] = useState(null);

    const handleBookClick = (id) => {
        setActiveDoctorId(activeDoctorId === id ? null : id);
    };

    return (
        <div className="sessions-page">
            <ProfileHeader />

            <main className="doctor-work-main">
                <div className="doctor-work-container">

                    <Sidebar activeTab="sessions" />

                    <section className="content-area">
                        <div className="sessions-main-layout">

                            <div className="sessions-hero-section">
                                <div className="hero-text-side">
                                    <h2 className="hero-main-title">
                                        ابحث عن مساحتك الآمنة <br />
                                        <span>مع أفضل المختصين</span>
                                    </h2>
                                    <p className="hero-sub-text">
                                        نخبة من الأطباء النفسيين والمستشارين المعتمدين لمساعدتك في رحلة توازنك النفسي.
                                    </p>
                                </div>
                            </div>

                            {/* مساحة العمل المقسمة (الفلتر الجانبي + النتائج) */}
                            <div className="sessions-workspace-layout">

                                {/* الفلتر الجانبي والبحث المتقدم */}
                                <aside className="sessions-sidebar-filter">
                                    <h3 className="filter-main-title">بحث متقدم</h3>

                                    <div className="filter-search-box">
                                        <input type="text" placeholder="ابحث باسم المختص أو المريض..." className="search-input" />
                                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                    </div>

                                    <div className="filter-section">
                                        <span className="section-label">التخصص</span>
                                        <div className="filter-options-stack">
                                            <label className="radio-option">
                                                <input type="radio" name="specialty" defaultChecked />
                                                <span>الكل</span>
                                            </label>
                                            <label className="radio-option">
                                                <input type="radio" name="specialty" />
                                                <span>قلق</span>
                                            </label>
                                            <label className="radio-option">
                                                <input type="radio" name="specialty" />
                                                <span>اكتئاب</span>
                                            </label>
                                            <label className="radio-option">
                                                <input type="radio" name="specialty" />
                                                <span>علاقات</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="filter-section">
                                        <span className="section-label">نوع الجلسة</span>
                                        <div className="filter-options-stack">
                                            <label className="radio-option">
                                                <input type="radio" name="session-type" defaultChecked />
                                                <span>الكل</span>
                                            </label>
                                            <label className="radio-option">
                                                <input type="radio" name="session-type" />
                                                <span>حضوري</span>
                                            </label>
                                            <label className="radio-option">
                                                <input type="radio" name="session-type" />
                                                <span>أونلاين (فيديو)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="filter-quote-box">
                                        <p className="quote-text">"الصحة النفسية ليست وجهة، بل هي عملية مستمرة."</p>
                                    </div>

                                    <div className="filter-next-session">
                                        <span className="session-date-label">ميعاد الجلسة القادمة:</span>
                                        <span className="session-date-value">الخميس، 02 يوليو 2026 - 06:00 م</span>
                                    </div>

                                    <button className="join-session-btn">
                                        <i className="fa-solid fa-video"></i>
                                        <span>انضم للجلسة الآن</span>
                                    </button>
                                </aside>

                                <main className="sessions-content-results">
                                    <div className="doctors-wide-list">

                                        <div className={`doctor-result-card ${activeDoctorId === 1 ? 'expanded' : ''}`}>
                                            <div className="doctor-card-main-row">
                                                <div className="doc-avatar-info">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"
                                                        alt="د. أحمد مصطفي"
                                                        className="doc-avatar-img"
                                                    />
                                                    <div className="doc-text-meta">
                                                        <h4>د. أحمد مصطفي</h4>
                                                        <span className="doc-specialty">استشاري الطب النفسي وعلاج الإدمان</span>
                                                        <span className="doc-experience"><i className="fa-solid fa-briefcase"></i> خبرة 12 سنة</span>
                                                    </div>
                                                </div>

                                                <div className="doc-price-rating">
                                                    <div className="doc-rating">
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>4.9</span>
                                                    </div>
                                                    <div className="doc-price">
                                                        <span className="price-label">سعر الجلسة</span>
                                                        <span className="price-value">350 ج.م</span>
                                                    </div>
                                                </div>

                                                <div className="doc-action-area">
                                                    <button
                                                        className={`book-appointment-btn ${activeDoctorId === 1 ? 'btn-active' : ''}`}
                                                        onClick={() => handleBookClick(1)}
                                                    >
                                                        {activeDoctorId === 1 ? 'إلغاء الحجز' : 'حجز موعد'}
                                                    </button>
                                                </div>
                                            </div>

                                            {activeDoctorId === 1 && (
                                                <div className="booking-details-expanded-zone">

                                                    {/* اختيار التاريخ */}
                                                    <div className="booking-section">
                                                        <h5 className="booking-sub-title">
                                                            <i className="fa-regular fa-calendar-days"></i> اختر تاريخ الجلسة (متاح لمدة شهر من اليوم)
                                                        </h5>
                                                        <div className="booking-dates-carousel">
                                                            <button className="date-slot-btn active">
                                                                <span className="day-name">السبت</span>
                                                                <span className="day-number">04</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>

                                                            <button className="date-slot-btn">
                                                                <span className="day-name">الأحد</span>
                                                                <span className="day-number">05</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>

                                                            <button className="date-slot-btn unavailable" disabled>
                                                                <span className="day-name">الإثنين</span>
                                                                <span className="day-number">06</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>

                                                            <button className="date-slot-btn">
                                                                <span className="day-name">الثلاثاء</span>
                                                                <span className="day-number">07</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>

                                                            <button className="date-slot-btn unavailable" disabled>
                                                                <span className="day-name">الأربعاء</span>
                                                                <span className="day-number">08</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>

                                                            <button className="date-slot-btn">
                                                                <span className="day-name">الخميس</span>
                                                                <span className="day-number">09</span>
                                                                <span className="month-name">يوليو</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="booking-section">
                                                        <h5 className="booking-sub-title">
                                                            <i className="fa-regular fa-clock"></i> المواعيد المتاحة في هذا اليوم
                                                        </h5>
                                                        <div className="booking-time-grid">
                                                            <button className="time-slot-btn active">04:00 مساءً</button>
                                                            <button className="time-slot-btn">05:00 مساءً</button>
                                                            <button className="time-slot-btn">07:00 مساءً</button>
                                                            <button className="time-slot-btn">08:00 مساءً</button>
                                                        </div>
                                                    </div>

                                                    <div className="booking-confirm-wrapper">
                                                        <button className="confirm-booking-final-btn">
                                                            <i className="fa-solid fa-circle-check"></i>
                                                            <span>تأكيد الحجز والدفع</span>
                                                        </button>
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </main>

                            </div>

                        </div>
                    </section>

                </div>
            </main>

            <ProfileFooter activeTab="sessions" />
        </div>
    );
}

export default Sessions;