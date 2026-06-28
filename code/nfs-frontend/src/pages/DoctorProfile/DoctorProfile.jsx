
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileFooter from './ProfileFooter';
import doctorImg from '../../assets/sara.png';
import './DoctorProfile.css';

function DoctorProfile() {
    return (
        <div className="doctor-profile-page">
            <ProfileHeader />

            { }
            <main className="profile-main-content">
                <div className="profile-container">

                    { }
                    <section className="doctor-main-card">

                        { }
                        <div className="doctor-image-container-right">
                            <img
                                src={doctorImg}
                                alt="د. سارة أحمد"
                                className="doctor-rect-avatar"
                            />

                            { }
                            <div className="compatibility-overlay-card">
                                { }
                                <div className="compat-text-side">
                                    <span className="compat-label">توافقنا</span>
                                    <span className="compat-value">96%</span>
                                </div>

                                { }
                                <div className="compat-icon-side">
                                    <div className="loading-stars-circle">
                                        <span className="inner-star-ai">✨</span>
                                        <i className="fa-solid fa-circle-notch loading-ring"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        { }
                        <div className="doctor-details-container-left">

                            { }
                            <div className="doctor-text-block">
                                <span className="availability-badge">متاح اليوم</span>
                                <h2 className="doctor-name">د. سارة أحمد</h2>
                                <p className="doctor-specialty">معالجة نفسية مختصة في العلاج السلوكي المعرفي</p>
                            </div>

                            { }
                            <div className="doctor-stats-container">

                                { }
                                <div className="stat-box">
                                    <i className="fa-solid fa-comment-dots stat-icon"></i>
                                    <span className="stat-label">جلسات</span>
                                    <span className="stat-value">+1,200</span>
                                </div>

                                { }
                                <div className="stat-box">
                                    <i className="fa-solid fa-star stat-icon"></i>
                                    <span className="stat-label">تقييم</span>
                                    <span className="stat-value">4.9</span>
                                </div>

                                { }
                                <div className="stat-box">
                                    <i className="fa-solid fa-briefcase stat-icon"></i>
                                    <span className="stat-label">الخبرة</span>
                                    <span className="stat-value">12 سنة</span>
                                </div>

                            </div>

                        </div>

                    </section>

                    { }
                    { }

                    { }
                    <section className="doctor-secondary-card">

                        { }
                        <div className="secondary-right-side">

                            { }
                            <div className="bio-section">
                                <h3 className="section-title">حول د. سارة</h3>
                                <p className="bio-text">
                                    أؤمن بأن الرحلة نحو الشفاء تبدأ من خلق مساحة آمنة ومقبولة تماماً. منهجي يعتمد على الدمج بين
                                    العلاج السلوكي المعرفي (CBT) والتعاطف الذاتي لمساعدتك على فهم أنماط تفكيرك وتحقيق
                                    التوازن النفسي الذي تطمح إليه. نحن لا نعالج المشاكل فحسب، بل نبني معاً أدوات صمود دائمة.
                                </p>
                            </div>

                            { }
                            <div className="specialties-section">
                                <h3 className="section-title">مجالات الاختصاص</h3>
                                <div className="specialties-tags">
                                    <span className="spec-tag">القلق والتوتر المزمن</span>
                                    <span className="spec-tag">العلاقات الزوجية</span>
                                    <span className="spec-tag">الاكتئاب</span>
                                    <span className="spec-tag">اضطرابات ما بعد الصدمة</span>
                                    <span className="spec-tag">تقدير الذات</span>
                                </div>
                            </div>

                            { }
                            { }
                            <div className="qualifications-section">
                                <h3 className="section-title">المؤهلات والخبرة</h3>

                                { }
                                <div className="timeline-item">
                                    <div className="timeline-icon-wrapper">
                                        <i className="fa-solid fa-graduation-cap timeline-icon-ai"></i>
                                    </div> { }
                                    <div className="timeline-content">
                                        <h4>دكتوراة في علم النفس العيادي</h4>
                                        <p>جامعة الملك سعود، الرياض 2012-2016</p>
                                    </div>
                                </div>

                                { }
                                <div className="timeline-item">
                                    <div className="timeline-icon-wrapper">
                                        <i className="fa-solid fa-certificate timeline-icon-ai"></i>
                                    </div> { }
                                    <div className="timeline-content">
                                        <h4>شهادة معتمدة في العلاج المعرفي (CBT)</h4>
                                        <p>الأكاديمية البريطانية للمعالجين النفسيين</p>
                                    </div>
                                </div>

                            </div>

                        </div> { }

                        { }


                        { }
                        <div className="secondary-left-side">

                            { }
                            <div className="reviews-section">
                                <div className="reviews-header">
                                    <h3 className="section-title">آراء المراجعين</h3>
                                    { }
                                    <span className="see-all-btn" onClick={() => console.log("فتح كل الآراء")}>
                                        الكل
                                    </span>
                                </div>

                                <div className="reviews-list">

                                    { }
                                    <div className="review-card">
                                        <div className="stars-row">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <i key={index} className="fa-solid fa-star custom-star-icon filled"></i>
                                            ))}
                                        </div>
                                        <p className="review-text">
                                            "د. سارة غيرت نظرتي للأمور تماماً. أسلوبها هادئ ومريح جداً، شعرت بأنني مسموع لأول مرة."
                                        </p>
                                        <span className="review-meta">مراجع مجهول • منذ أسبوعين</span>
                                    </div>

                                    { }
                                    <div className="review-card">
                                        <div className="stars-row">
                                            {Array.from({ length: 5 }).map((_, index) => {

                                                const isFilled = index < 4;
                                                return (
                                                    <i
                                                        key={index}
                                                        className={`fa-solid fa-star custom-star-icon ${isFilled ? 'filled' : 'empty'}`}
                                                    ></i>
                                                );
                                            })}
                                        </div>
                                        <p className="review-text">
                                            "جلسات احترافية ومثمرة جداً. شكراً لك دكتورة على هذا الدعم."
                                        </p>
                                        <span className="review-meta">مراجع مجهول • منذ شهر</span>
                                    </div>

                                </div>
                            </div>

                            { }
                            <div className="inquiry-card">
                                <h4>هل لديك استفسار؟</h4>
                                <p>يمكنك مراسلة د. سارة قبل الحجز للاستفسار عن نوع الجلسات.</p>
                                <button className="chat-doctor-btn">
                                    <i className="fa-regular fa-comment-dots"></i>
                                    مراسلة المعالجة
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


export default DoctorProfile;