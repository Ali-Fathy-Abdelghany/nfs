import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import doctorImg from "../../assets/sara.png";
import "./DoctorProfile.css";
import ProfileFooter from "./ProfileFooter";
import { fetchTherapistById, fetchTherapistByUserId, updateTherapist, mapTherapistToProfile } from "../../api/therapists";
import { fetchTherapistReviews, fetchTherapistReviewSummary, createTherapistReview, deleteTherapistReview, formatReviewMeta, normalizeReview } from "../../api/reviews";
import { updateUserProfile } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";
import { ensurePatientRecord } from "../../api/patientHelpers";
import StarRating from "../../components/ui/StarRating";

function applyProfileWithSummary(therapistData, summaryData, fallbackImage) {
  const mapped = mapTherapistToProfile(therapistData, fallbackImage);
  const summaryAvg = Number(summaryData?.averageRating ?? summaryData?.AverageRating);
  const summaryCount = Number(summaryData?.reviewCount ?? summaryData?.ReviewCount);
  if (Number.isFinite(summaryAvg) && summaryAvg > 0) {
    mapped.ratingValue = Math.min(5, summaryAvg);
    mapped.rating = summaryAvg.toFixed(1);
  } else if (!(mapped.ratingValue > 0)) {
    mapped.ratingValue = 0;
    mapped.rating = '—';
  }
  if (Number.isFinite(summaryCount) && summaryCount >= 0) {
    mapped.reviewCount = summaryCount;
  }
  return mapped;
}

async function loadTherapistProfileBundle(therapistId, fallbackImage) {
  const [profileRes, reviewsRes, summaryRes] = await Promise.all([
    fetchTherapistById(therapistId),
    fetchTherapistReviews(therapistId, 4).catch(() => ({ data: [] })),
    fetchTherapistReviewSummary(therapistId).catch(() => null),
  ]);
  return {
    profile: applyProfileWithSummary(profileRes.data, summaryRes?.data, fallbackImage),
    reviews: (reviewsRes.data || []).map(normalizeReview),
  };
}

function DoctorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() || {};
  const toast = useToast();

  const currentUserRole = localStorage.getItem('userRole') || user?.userRole || 'user';
  const isAdmin = currentUserRole === 'admin' || location.state?.adminView;
  const isOwnProfile = currentUserRole === 'doctor' && !location.state?.adminView;
  const canEdit = isOwnProfile || isAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    specialty: '',
    availability: 'متاح للحجز',
    sessions: '—',
    rating: '—',
    ratingValue: 0,
    reviewCount: 0,
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

        const bundle = await loadTherapistProfileBundle(therapistId, doctorImg);
        if (cancelled) return;
        setProfile(bundle.profile);
        setReviews(bundle.reviews);
        if (location.state?.startEditing && (currentUserRole === 'admin' || currentUserRole === 'doctor')) {
          setIsEditing(true);
        }
      } catch (err) {
        console.error(err);
        toast.error(getApiErrorMessage(err, 'تعذر تحميل ملف المعالج'));
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

  const handleSubmitReview = async () => {
    if (!profile.therapistId || isOwnProfile) return;
    if (!reviewStars || reviewStars < 1) {
      toast.warning('اختر عدد النجوم للتقييم');
      return;
    }
    setSubmittingReview(true);
    try {
      const patientId = await ensurePatientRecord(user?.userId);
      await createTherapistReview(profile.therapistId, {
        patientId,
        userId: user?.userId,
        stars: reviewStars,
        comment: reviewComment.trim() || 'تقييم بدون تعليق',
        isAnonymous: true,
        authorName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'مراجع',
      });
      toast.success('تم تسجيل تقييمك بنجاح');
      setReviewComment('');
      setReviewStars(5);
      const bundle = await loadTherapistProfileBundle(profile.therapistId, doctorImg);
      setProfile(bundle.profile);
      setReviews(bundle.reviews);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إرسال التقييم'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit || !profile.therapistId) {
      setIsEditing(false);
      return;
    }
    try {
      const [firstName = '', ...rest] = (profile.name || '').replace(/^د\.\s*/, '').split(/\s+/);
      const lastName = rest.join(' ') || firstName;
      if (isOwnProfile) {
        await updateUserProfile({
          firstName,
          lastName,
        });
      }
      await updateTherapist(profile.therapistId, {
        firstName,
        lastName,
        specialization: profile.specialty,
        bio: profile.bio,
        experienceYears: profile.experienceYears || parseInt(String(profile.experience), 10) || 0,
        hourlyRate: Number(profile.hourlyRate) || 0,
        qualifications: (profile.specialties || []).join('، ') || profile.qualifications,
      });
      const bundle = await loadTherapistProfileBundle(profile.therapistId, doctorImg);
      setProfile(bundle.profile);
      setIsEditing(false);
      toast.success('تم حفظ التغييرات');
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التغييرات'));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isAdmin || !profile.therapistId) return;
    if (!window.confirm('هل تريد حذف هذا التقييم؟')) return;
    try {
      await deleteTherapistReview(profile.therapistId, reviewId);
      toast.success('تم حذف التقييم');
      const bundle = await loadTherapistProfileBundle(profile.therapistId, doctorImg);
      setProfile(bundle.profile);
      setReviews(bundle.reviews);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف التقييم'));
    }
  };

  const update = (key, value) => setProfile({ ...profile, [key]: value });

  return (
    <div className="doctor-profile-page" dir="rtl">
      <Header />

      <main className="profile-main-content">
        <div className="profile-container">
          {loading && <p className="text-sm text-gray-500 mb-4">جاري تحميل الملف الشخصي...</p>}

          {canEdit && (
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

              {!isOwnProfile && !isAdmin && (
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

                <div className="stat-box rating-stat-box">
                  <span className="stat-label">تقييم</span>
                  <StarRating
                    value={profile.ratingValue || profile.rating}
                    size={13}
                    showValue
                    aria-label={`متوسط التقييم ${profile.rating}`}
                  />
                  {profile.reviewCount > 0 && (
                    <span className="stat-review-count">({profile.reviewCount})</span>
                  )}
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
                  <span
                    className="see-all-btn"
                    onClick={() =>
                      navigate('/all-reviews', {
                        state: {
                          therapistId: profile.therapistId,
                          doctorName: profile.name,
                          adminView: isAdmin,
                        },
                      })
                    }
                  >
                    الكل ({profile.reviewCount || reviews.length || 0})
                  </span>
                </div>

                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p className="bio-text">لا توجد تقييمات بعد.</p>
                  ) : (
                    reviews.map((r) => (
                      <div className="review-card" key={r.id}>
                        <div className="stars-row">
                          <StarRating value={r.stars} size={12} aria-label={`${r.stars} نجوم`} />
                        </div>
                        {r.comment && r.comment !== 'تقييم بدون تعليق' ? (
                          <p className="review-text">"{r.comment}"</p>
                        ) : (
                          <p className="review-meta">تقييم بالنجوم فقط</p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="review-meta">
                            {r.authorDisplay} • {formatReviewMeta(r.createdAt)}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              className="text-[10px] font-bold text-rose-600 hover:underline"
                              onClick={() => handleDeleteReview(r.id)}
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!isOwnProfile && !isAdmin && currentUserRole !== 'admin' && (
                  <div className="review-form-card">
                    <h4 className="section-title review-form-title">قيّم المعالج</h4>
                    <p className="review-form-hint">اختر عدد النجوم (مطلوب). التعليق اختياري.</p>
                    <div className="review-stars-picker">
                      <StarRating
                        value={reviewStars}
                        size={22}
                        interactive
                        onChange={setReviewStars}
                        aria-label="اختر عدد النجوم"
                      />
                      <span className="review-stars-value">{reviewStars}/5</span>
                    </div>
                    <textarea
                      className="profile-edit-input bio-input"
                      placeholder="تعليق اختياري عن تجربتك..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                    <button
                      type="button"
                      className="review-submit-btn"
                      disabled={submittingReview}
                      onClick={handleSubmitReview}
                    >
                      {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
       {!isOwnProfile && !isAdmin && (
         <ProfileFooter
           doctor={profile}
           hourlyRate={profile.hourlyRate || 250}
         />
       )}
      
    </div>
  );
}

export default DoctorProfile;
