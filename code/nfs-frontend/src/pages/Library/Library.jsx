import React, { useState } from 'react';
import ProfileHeader from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer'; 
import './Library.css';
import myImage from '../../assets/sara.png'; 

function Library() {
  
  const filters = ["الكل", "تأملات موجهة", "دروس مرئية", "مقالات علمية"];
  const [activeFilter, setActiveFilter] = useState("الكل");

  return (
    <div className="library-page">
      <ProfileHeader />

      <main className="library-main-content">
        <div className="library-container">
          
          
          <div className="library-hero-creative-zone">
            <div className="library-hero-text-side">
              <h1 className="library-main-huge-title">مكتبة المصادر</h1>
              <p className="library-hero-description">
                مساحتك الهادئة للاستكشاف. تصفح مجموعة مختارة من التأملات الموجهة، والدروس المرئية، والمقالات العلمية لتعزيز صحتك النفسية.
              </p>
            </div>

            <div className="library-hero-visual-side">
              <div className="tilted-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600" 
                  alt="جلسة هدوء العقل" 
                  className="tilted-hero-img"
                />
                <div className="floating-selected-session-box">
                  <span className="session-tag">جلسة اليوم المختارة:</span>
                  <h4 className="session-title">"هدوء العقل"</h4>
                </div>
              </div>
            </div>
          </div>

          
          <div className="library-content-filter-bar">
            {filters.map((filter, index) => (
              <button 
                key={index} 
                className={`library-filter-btn ${activeFilter === filter ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "الكل" && <i className="fa-solid fa-grid-2"></i>}
                {filter === "تأملات موجهة" && <i className="fa-solid fa-spa"></i>}
                {filter === "دروس مرئية" && <i className="fa-solid fa-circle-play"></i>}
                {filter === "مقالات علمية" && <i className="fa-solid fa-book-open"></i>}
                <span>{filter}</span>
              </button>
            ))}
          </div>

          

          
<div className="library-split-zone-two-columns">
  
  
  <div className="video-main-display-column">
    
    
    <div className="main-video-player-wrapper">
      <img 
        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800" 
        alt="أساسيات التنفس العميق للتوتر" 
        className="video-placeholder-cover"
      />
      
      <div className="video-play-overlay-btn">
        <i className="fa-solid fa-play"></i>
      </div>
    </div>

    
    <div className="video-meta-top-row">
      <span className="video-type-label">فيديو تعليمي</span>
      <span className="video-duration-badge">
        <i className="fa-regular fa-clock"></i> ١٥ دقيقة
      </span>
    </div>

    
    <div className="video-description-block">
      <h2 className="video-main-title">أساسيات التنفس العميق للتوتر</h2>
      <p className="video-main-text">
        تعرف على التقنيات العلمية للتحكم في استجابة جسدك للضغوطات اليومية من خلال تمارين التنفس البسيطة.
      </p>
    </div>

  </div>

  
  
<div className="left-side-display-column">
  
  
  <div className="suggested-meditation-card">
    
    
    <div className="meditation-card-text-content">
      <span className="meditation-badge-tag">تأمل مقترح</span>
      <h3 className="meditation-card-title">النوم العميق الهادئ</h3>
      <p className="meditation-card-p">
        جلسة تأمل صوتية لمساعدتك على الاسترخاء قبل النوم مباشرة.
      </p>
      <a href="#listen" className="meditation-listen-link">
        <span>استمع الآن</span>
        <i className="fa-solid fa-arrow-left font-arrow-icon"></i>
      </a>
    </div>

    
    <div className="meditation-card-visual-content">
      <div className="meditation-tilted-img-frame">
        <img 
          src={myImage}
          alt="النوم العميق الهادئ" 
          className="meditation-tilted-img"
        />
      </div>
    </div>

  </div>

  
  
<div className="two-equal-boxes-row">
  
  
  <div className="mini-article-card">
    <div className="mini-card-image-box">
      <img src="https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400" alt="قوة تدوين المشاعر" />
    </div>
    <div className="mini-card-body">
      <h4 className="mini-card-title">قوة تدوين المشاعر</h4>
      <p className="mini-card-description">لماذا ينصح الأطباء النفسيون بالكتابة اليومية لتخفيف القلق؟</p>
      <div className="mini-card-footer">
        <span className="mini-card-time">
          <i className="fa-regular fa-clock"></i> ٤ دقائق قراءة
        </span>
        <button className="save-icon-btn" title="حفظ المقال">
          <i className="fa-regular fa-bookmark"></i>
        </button>
      </div>
    </div>
  </div>

  
  <div className="mini-article-card">
    <div className="mini-card-image-box">
      <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400" alt="اليوجا كعلاج مكمل" />
    </div>
    <div className="mini-card-body">
      <h4 className="mini-card-title">اليوجا كعلاج مكمل</h4>
      <p className="mini-card-description">كيف تساعد الحركة الواعية في إعادة توازن الجهاز العصبي.</p>
      <div className="mini-card-footer">
        <span className="mini-card-time">
          <i className="fa-regular fa-clock"></i> ٦ دقائق قراءة
        </span>
        <button className="save-icon-btn" title="حفظ المقال">
          <i className="fa-regular fa-bookmark"></i>
        </button>
      </div>
    </div>
  </div>

</div>

</div>

</div>
          

<div className="library-recommended-articles-section">
  
  
  <div className="section-header-flex">
    <div className="header-titles">
      <h2 className="section-main-title">مقالات تهمك</h2>
      <p className="section-sub-title">تعمق في مواضيع الصحة النفسية مع خبرائنا</p>
    </div>
    <a href="#all-articles" className="view-all-link">
      <span>مشاهدة الكل</span>
      <i className="fa-solid fa-chevron-left"></i>
    </a>
  </div>

  
  <div className="three-articles-grid">
    
    
    <div className="recommended-article-card">
      <div className="rec-card-image-box">
        <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500" alt="متلازمة المحتال" />
      </div>
      <div className="rec-card-body">
        <span className="rec-card-badge">الوعي الذاتي</span>
        <h3 className="rec-card-title">كيف تتعامل مع "متلازمة المحتال" في العمل؟</h3>
        <p className="rec-card-description">نصائح عملية لاستعادة الثقة بالنفس والاعتراف بإنجازاتك الحقيقية.</p>
      </div>
    </div>

    
    <div className="recommended-article-card">
      <div className="rec-card-image-box">
        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500" alt="التوازن النفسي" />
      </div>
      <div className="rec-card-body">
        <span className="rec-card-badge">الوعي الذاتي</span>
        <h3 className="rec-card-title">ترتيب الأولويات وقول "لا" دون شعور بالذنب</h3>
        <p className="rec-card-description">خطوات بسيطة لحماية مساحتك النفسية وطاقتك اليومية من الاستنزاف.</p>
      </div>
    </div>

    
    <div className="recommended-article-card">
      <div className="rec-card-image-box">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500" alt="المرونة النفسية" />
      </div>
      <div className="rec-card-body">
        <span className="rec-card-badge">الوعي الذاتي</span>
        <h3 className="rec-card-title">بناء المرونة النفسية في مواجهة التغيرات المفاجئة</h3>
        <p className="rec-card-description">كيف تدرب عقلك على التكيف مع ظروف الحياة المتغيرة بمرونة وهدوء.</p>
      </div>
    </div>

  </div>

</div>
        </div>
      </main>

      <Footer activeTab="discover" />
    </div>
  );
}

export default Library;