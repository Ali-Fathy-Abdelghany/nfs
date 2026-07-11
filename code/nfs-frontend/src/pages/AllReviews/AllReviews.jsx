import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header";
import './AllReviews.css';

const REVIEWS = [
  { stars: 5, text: '"د. سارة غيرت نظرتي للأمور تماماً. أسلوبها هادئ ومريح جداً، شعرت بأنني مسموع لأول مرة."', meta: 'مراجع مجهول • منذ أسبوعين' },
  { stars: 4, text: '"جلسات احترافية ومثمرة جداً. شكراً لك دكتورة على هذا الدعم."', meta: 'مراجع مجهول • منذ شهر' },
  { stars: 5, text: '"ساعدتني كثيراً في التعامل مع نوبات القلق. أنصح بها بشدة."', meta: 'مراجع مجهول • منذ شهر' },
  { stars: 5, text: '"بيئة آمنة وداعمة، وأسلوب علمي ممتاز في العلاج المعرفي السلوكي."', meta: 'مراجع مجهول • منذ شهرين' },
  { stars: 4, text: '"تحسّن ملحوظ في جودة نومي بعد بضع جلسات فقط."', meta: 'مراجع مجهول • منذ شهرين' },
  { stars: 5, text: '"استماع حقيقي وتعاطف كبير. أشعر أنني في أيدٍ أمينة."', meta: 'مراجع مجهول • منذ ٣ أشهر' },
];

function AllReviews() {
  const navigate = useNavigate();

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
              <p>تقييمات حقيقية من مراجعي د. سارة أحمد.</p>
            </div>
          </div>

          <div className="all-reviews-grid">
            {REVIEWS.map((r, i) => (
              <div className="all-review-card" key={i}>
                <div className="stars-row">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <i
                      key={idx}
                      className={`fa-solid fa-star custom-star-icon ${idx < r.stars ? 'filled' : 'empty'}`}
                    ></i>
                  ))}
                </div>
                <p className="all-review-text">{r.text}</p>
                <span className="all-review-meta">{r.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AllReviews;
