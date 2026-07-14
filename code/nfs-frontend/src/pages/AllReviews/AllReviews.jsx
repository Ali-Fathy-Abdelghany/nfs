import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { fetchTherapistById } from '../../api/therapists';
import { fetchTherapistReviews, deleteTherapistReview, formatReviewMeta, normalizeReview } from '../../api/reviews';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import StarRating from '../../components/ui/StarRating';
import './AllReviews.css';

function AllReviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const isAdmin = (localStorage.getItem('userRole') || '') === 'admin' || location.state?.adminView;
  const therapistId =
    location.state?.therapistId ||
    location.state?.doctor?.therapistId ||
    location.state?.doctor?.id ||
    null;
  const [doctorName, setDoctorName] = useState(location.state?.doctorName || location.state?.doctor?.name || 'المعالج');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!therapistId) {
      setError('لم يتم تحديد المعالج.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [reviewsRes, therapistRes] = await Promise.all([
        fetchTherapistReviews(therapistId),
        fetchTherapistById(therapistId).catch(() => null),
      ]);
      setReviews((reviewsRes.data || []).map(normalizeReview));
      if (therapistRes?.data) {
        setDoctorName(`د. ${therapistRes.data.firstName} ${therapistRes.data.lastName}`);
      }
    } catch (err) {
      console.error(err);
      setError('تعذر تحميل التقييمات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [therapistId]);

  const handleDelete = async (reviewId) => {
    if (!isAdmin || !therapistId) return;
    if (!window.confirm('هل تريد حذف هذا التقييم؟')) return;
    try {
      await deleteTherapistReview(therapistId, reviewId);
      toast.success('تم حذف التقييم');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف التقييم'));
    }
  };

  return (
    <div className="all-reviews-page">
      <Header />

      <main className="all-reviews-main">
        <div className="all-reviews-container">
          <div className="all-reviews-header">
            <button className="all-reviews-back" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-right"></i>
              <span>رجوع</span>
            </button>
            <div className="all-reviews-titles">
              <h1>كل آراء المراجعين</h1>
              <p>تقييمات حقيقية من مراجعي {doctorName}.</p>
            </div>
          </div>

          {loading ? (
            <p className="all-review-meta">جاري تحميل التقييمات...</p>
          ) : error ? (
            <p className="all-review-meta">{error}</p>
          ) : reviews.length === 0 ? (
            <p className="all-review-meta">لا توجد تقييمات بعد لهذا المعالج.</p>
          ) : (
            <div className="all-reviews-grid">
              {reviews.map((r) => (
                <div className="all-review-card" key={r.id}>
                  <div className="stars-row">
                    <StarRating value={r.stars} size={14} aria-label={`${r.stars} نجوم`} />
                  </div>
                  <p className="all-review-text">"{r.comment}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span className="all-review-meta">
                      {r.authorDisplay} • {formatReviewMeta(r.createdAt)}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AllReviews;
