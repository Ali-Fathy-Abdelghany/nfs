import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import doctorImg from "../../assets/sara.png";
import "./DoctorProfile.css";
import ProfileFooter from "./ProfileFooter";
import { fetchTherapistById, fetchTherapistByUserId, updateTherapist, mapTherapistToProfile } from "../../api/therapists";
import { updateUserProfile } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";

function DoctorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() || {};
  const toast = useToast();

  const currentUserRole = localStorage.getItem('userRole') || user?.userRole || 'user';
  const isOwnProfile = currentUserRole === 'doctor';

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    specialty: '',
    availability: 'متاح للحجز',
    sessions: '—',
    rating: '—',
    experience: '—',
    bio: '',
    specialties: [],
    qualifications: '',
    image: doctorImg,
    hourlyRate: 250,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const stateId = location.state?.doctor?.therapistId || location.state?.doctor?.id;
        let therapistId = stateId;

        if (!therapistId && isOwnProfile) {
          therapistId = user?.therapistId;
          if (!therapistId && user?.userId) {
            const byUser = await fetchTherapistByUserId(user.userId);
            therapistId = byUser.data?.therapistId;
          }
        }

        if (!therapistId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const res = await fetchTherapistById(therapistId);
        if (!cancelled) setProfile(mapTherapistToProfile(res.data, doctorImg));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [location.state, user, isOwnProfile]);

  const qualificationItems = useMemo(() => {
    const raw = profile.qualifications || '';
    return raw
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, i) => ({
        title,
        subtitle: i === 0 ? 'مؤهل أساسي' : 'تأهيل إضافي',
        icon: i === 0 ? 'fa-graduation-cap' : 'fa-certificate',
      }));
  }, [profile.qualifications]);

  const handleSave = async () => {
    if (!isOwnProfile || !profile.therapistId) {
      setIsEditing(false);
      return;
    }
    try {
      const [firstName = '', ...rest] = (profile.name || '').replace(/^د\.\s*/, '').split(/\s+/);
      await updateUserProfile({
        firstName,
        lastName: rest.join(' ') || firstName,
      });
      await updateTherapist(profile.therapistId, {
        specialization: profile.specialty,
        bio: profile.bio,
        experienceYears: profile.experienceYears || parseInt(String(profile.experience), 10) || 0,
        hourlyRate: Number(profile.hourlyRate) || 0,
        qualifications: (profile.specialties || []).join('، '),
      });
      setIsEditing(false);
      toast.success('تم حفظ التغييرات');
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التغييرات'));
    }
  };

  const update = (key, value) => setProfile({ ...profile, [key]: value });

  return (
    <div className="doctor-profile-page" dir="rtl">
      <Header />

      <main className="profile-main-content">
        <div className="profile-container">
          {loading && <p className="text-sm text-gray-500 mb-4">جاري تحميل الملف الشخصي...</p>}

          {isOwnProfile && (
            <div className="profile-edit-toolbar">
              <button
                className={`profile-edit-toggle ${isEditing ? "saving" : ""}`}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                <i className={`fa-solid ${isEditing ? "fa-floppy-disk" : "fa-pen-to-square"}`}></i>
                {isEditing ? " حفظ التغييرات" : " تعديل الملف الشخصي"}
              </button>
            </div>
          )}

          <section className="doctor-main-card">
            <div className="doctor-image-container-right">
              <img src={profile.image || doctorImg} alt={profile.name} className="doctor-rect-avatar" />

              {!isOwnProfile && (
                <div className="compatibility-overlay-card">
                  <div className="compat-text-side">
                    <span className="compat-label">توافقنا</span>
                    <span className="compat-value">—</span>
                  </div>
                  <div className="compat-icon-side">
                    <div className="loading-stars-circle">
                      <span className="inner-star-ai">✨</span>
                      <i className="fa-solid fa-circle-notch loading-ring"></i>
                    </div>
                  </div>
                </div>
              )}
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
                  <span className="availability-badge">{profile.availability || 'متاح للحجز'}</span>
                )}

                {isEditing ? (
                  <input
                    className="profile-edit-input name-input"
                    value={profile.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                ) : (
                  <h2 className="doctor-name">{profile.name || 'المعالج'}</h2>
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
                  <span className="stat-value">{profile.sessions}</span>
                </div>

                <div className="stat-box">
                  <i className="fa-solid fa-star stat-icon"></i>
                  <span className="stat-label">تقييم</span>
                  <span className="stat-value">{profile.rating}</span>
                </div>

                <div className="stat-box">
                  <i className="fa-solid fa-briefcase stat-icon"></i>
                  <span className="stat-label">الخبرة</span>
                  {isEditing ? (
                    <input
                      className="profile-edit-input stat-input"
                      value={profile.experienceYears ?? ''}
                      onChange={(e) => update("experienceYears", Number(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  ) : (
                    <span className="stat-value">{profile.experience}</span>
                  )}
                </div>

                <div className="stat-box">
                  <i className="fa-solid fa-coins stat-icon"></i>
                  <span className="stat-label">سعر الجلسة</span>
                  {isEditing ? (
                    <input
                      className="profile-edit-input stat-input"
                      value={profile.hourlyRate ?? ''}
                      onChange={(e) => update("hourlyRate", Number(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  ) : (
                    <span className="stat-value">{profile.hourlyRate} ج.م</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="doctor-secondary-card">
            <div className="secondary-right-side">
              <div className="bio-section">
                <h3 className="section-title">حول {profile.name || 'المعالج'}</h3>
                {isEditing ? (
                  <textarea
                    className="profile-edit-input bio-input"
                    value={profile.bio}
                    onChange={(e) => update("bio", e.target.value)}
                  />
                ) : (
                  <p className="bio-text">{profile.bio || 'لا توجد نبذة بعد.'}</p>
                )}
              </div>

              <div className="specialties-section">
                <h3 className="section-title">مجالات الاختصاص</h3>
                {isEditing ? (
                  <textarea
                    className="profile-edit-input specialties-input"
                    value={(profile.specialties || []).join("، ")}
                    onChange={(e) =>
                      update(
                        "specialties",
                        e.target.value.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
                      )
                    }
                  />
                ) : (
                  <div className="specialties-tags">
                    {(profile.specialties || []).length === 0 && (
                      <span className="spec-tag">{profile.specialty || 'عام'}</span>
                    )}
                    {(profile.specialties || []).map((tag, i) => (
                      <span key={i} className="spec-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="qualifications-section">
                <h3 className="section-title">المؤهلات والخبرة</h3>
                {qualificationItems.length === 0 ? (
                  <p className="bio-text">لا توجد مؤهلات مسجّلة بعد.</p>
                ) : (
                  qualificationItems.map((item, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-icon-wrapper">
                        <i className={`fa-solid ${item.icon} timeline-icon-ai`}></i>
                      </div>
                      <div className="timeline-content">
                        <h4>{item.title}</h4>
                        <p>{item.subtitle}</p>
                      </div>
                    </div>
                  ))
                )}
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
                      "تجربة احترافية ومريحة. أسلوب المعالج ساعدني أشعر أنني مفهوم لأول مرة."
                    </p>
                    <span className="review-meta">مراجع مجهول • تقييم عام</span>
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
                      "جلسات منظمة ومثمرة. أنصح بها لمن يبحث عن دعم نفسي جاد."
                    </p>
                    <span className="review-meta">مراجع مجهول • تقييم عام</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
       {!isOwnProfile && (
         <ProfileFooter
           doctor={profile}
           hourlyRate={profile.hourlyRate || 250}
         />
       )}
      
    </div>
  );
}

export default DoctorProfile;
