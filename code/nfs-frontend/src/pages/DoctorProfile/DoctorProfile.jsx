import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import doctorImg from "../../assets/sara.png";
import "./DoctorProfile.css";
import ProfileFooter from "./ProfileFooter"; 
function DoctorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
   
  // قراءة دور المستخدم الحالي ديناميكياً من الـ localStorage اللي تم حفظه عند تسجيل الدخول
  const currentUserRole = localStorage.getItem('userRole') || 'user';

  // استقبال داتا الطبيب الممررة من صفحة الـ Booking، أو استخدام الداتا الافتراضية كـ Fallback
  const doctorData = location.state?.doctor || {
    name: "د. سارة الأحمد",
    specialty: "معالجة نفسية مختصة في العلاج السلوكي المعرفي",
    availability: "متاح اليوم",
    sessions: "+1,200",
    rating: "4.9",
    experience: "12 سنة",
    bio: "أؤمن بأن الرحلة نحو الشفاء تبدأ من خلق مساحة آمنة ومقبولة تماماً. منهجي يعتمد على الدمج بين العلاج السلوكي المعرفي (CBT) والتعاطف الذاتي لمساعدتك على فهم أنماط تفكيرك وتحقيق التوازن النفسي الذي تطمح إليه. نحن لا نعالج المشاكل فحسب، بل نبني معاً أدوات صمود دائمة.",
    specialties: [
      "القلق والتوتر المزمن",
      "العلاقات الزوجية",
      "الاكتئاب",
      "اضطرابات ما بعد الصدمة",
      "تقدير الذات",
    ],
    image: doctorImg
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(doctorData);

  const update = (key, value) => setProfile({ ...profile, [key]: value });

  return (
    <div className="doctor-profile-page" dir="rtl">
      {/* الـ Header الموحد للموقع من الـ layout */}
      <Header />

      <main className="profile-main-content">
        <div className="profile-container">

          {/* التحكم في ظهور شريط التعديل: يظهر فقط إذا كان الحساب الحالي لطبيب */}
          {currentUserRole === 'doctor' && (
            <div className="profile-edit-toolbar">
              <button
                className={`profile-edit-toggle ${isEditing ? "saving" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <i className={`fa-solid ${isEditing ? "fa-floppy-disk" : "fa-pen-to-square"}`}></i>
                {isEditing ? " حفظ التغييرات" : " تعديل الملف الشخصي"}
              </button>
            </div>
          )}

          <section className="doctor-main-card">
            <div className="doctor-image-container-right">
              {/* عرض صورة الطبيب الديناميكية أو الافتراضية */}
              <img src={profile.image || doctorImg} alt={profile.name} className="doctor-rect-avatar" />

              <div className="compatibility-overlay-card">
                <div className="compat-text-side">
                  <span className="compat-label">توافقنا</span>
                  <span className="compat-value">96%</span>
                </div>
                <div className="compat-icon-side">
                  <div className="loading-stars-circle">
                    <span className="inner-star-ai">✨</span>
                    <i className="fa-solid fa-circle-notch loading-ring"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="doctor-details-container-left">
              <div className="doctor-text-block">
                {isEditing ? (
                  <input
                    className="profile-edit-input badge-input"
                    value={profile.availability}
                    onChange={(e) => update("availability", e.target.value)}
                  />
                ) : (
                  <span className="availability-badge">{profile.availability}</span>
                )}

                {isEditing ? (
                  <input
                    className="profile-edit-input name-input"
                    value={profile.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                ) : (
                  <h2 className="doctor-name">{profile.name}</h2>
                )}

                {isEditing ? (
                  <textarea
                    className="profile-edit-input specialty-input"
                    value={profile.specialty}
                    onChange={(e) => update("specialty", e.target.value)}
                  />
                ) : (
                  <p className="doctor-specialty">{profile.specialty}</p>
                )}
              </div>

              <div className="doctor-stats-container">
                <div className="stat-box">
                  <i className="fa-solid fa-comment-dots stat-icon"></i>
                  <span className="stat-label">جلسات</span>
                  {isEditing ? (
                    <input
                      className="profile-edit-input stat-input"
                      value={profile.sessions}
                      onChange={(e) => update("sessions", e.target.value)}
                    />
                  ) : (
                    <span className="stat-value">{profile.sessions}</span>
                  )}
                </div>

                <div className="stat-box">
                  <i className="fa-solid fa-star stat-icon"></i>
                  <span className="stat-label">تقييم</span>
                  {isEditing ? (
                    <input
                      className="profile-edit-input stat-input"
                      value={profile.rating}
                      onChange={(e) => update("rating", e.target.value)}
                    />
                  ) : (
                    <span className="stat-value">{profile.rating}</span>
                  )}
                </div>

                <div className="stat-box">
                  <i className="fa-solid fa-briefcase stat-icon"></i>
                  <span className="stat-label">الخبرة</span>
                  {isEditing ? (
                    <input
                      className="profile-edit-input stat-input"
                      value={profile.experience}
                      onChange={(e) => update("experience", e.target.value)}
                    />
                  ) : (
                    <span className="stat-value">{profile.experience}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="doctor-secondary-card">
            <div className="secondary-right-side">
              <div className="bio-section">
                <h3 className="section-title">حول {profile.name}</h3>
                {isEditing ? (
                  <textarea
                    className="profile-edit-input bio-input"
                    value={profile.bio}
                    onChange={(e) => update("bio", e.target.value)}
                  />
                ) : (
                  <p className="bio-text">{profile.bio}</p>
                )}
              </div>

              <div className="specialties-section">
                <h3 className="section-title">مجالات الاختصاص</h3>
                {isEditing ? (
                  <textarea
                    className="profile-edit-input specialties-input"
                    value={profile.specialties.join("، ")}
                    onChange={(e) =>
                      update(
                        "specialties",
                        e.target.value.split("،").map((s) => s.trim())
                      )
                    }
                  />
                ) : (
                  <div className="specialties-tags">
                    {profile.specialties.map((tag, i) => (
                      <span key={i} className="spec-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="qualifications-section">
                <h3 className="section-title">المؤهلات والخبرة</h3>
                <div className="timeline-item">
                  <div className="timeline-icon-wrapper">
                    <i className="fa-solid fa-graduation-cap timeline-icon-ai"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>دكتوراة في علم النفس العيادي</h4>
                    <p>جامعة الملك سعود، الرياض 2012-2016</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon-wrapper">
                    <i className="fa-solid fa-certificate timeline-icon-ai"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>شهادة معتمدة في العلاج المعرفي (CBT)</h4>
                    <p>الأكاديمية البريطانية للمعالجين النفسيين</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="secondary-left-side">
              <div className="reviews-section">
                <div className="reviews-header">
                  <h3 className="section-title">آراء المراجعين</h3>
                  <span className="see-all-btn" onClick={() => navigate('/all-reviews')}>الكل</span>
                </div>

                <div className="reviews-list">
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

                  <div className="review-card">
                    <div className="stars-row">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const isFilled = index < 4;
                        return (
                          <i
                            key={index}
                            className={`fa-solid fa-star custom-star-icon ${isFilled ? "filled" : "empty"}`}
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
            </div>
          </section>
        </div>
      </main>
       {currentUserRole === 'user' && <ProfileFooter />}
      
    </div>
  );
}

export default DoctorProfile;