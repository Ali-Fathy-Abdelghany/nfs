import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header"; // تم استيراده هنا كـ Header
import './AllArticles.css';

const ARTICLES = [
  { title: 'كيف تتعامل مع "متلازمة المحتال" في العمل؟', desc: 'نصائح عملية لاستعادة الثقة بالنفس والاعتراف بإنجازاتك الحقيقية.', badge: 'الوعي الذاتي', img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500', link: 'https://www.verywellmind.com/imposter-syndrome-and-social-anxiety-disorder-4156469' },
  { title: 'ترتيب الأولويات وقول "لا" دون شعور بالذنب', desc: 'خطوات بسيطة لحماية مساحتك النفسية وطاقتك اليومية من الاستنزاف.', badge: 'الوعي الذاتي', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500', link: 'https://www.verywellmind.com/how-to-set-boundaries-5208591' },
  { title: 'بناء المرونة النفسية في مواجهة التغيرات المفاجئة', desc: 'كيف تدرب عقلك على التكيف مع ظروف الحياة المتغيرة بمرونة وهدوء.', badge: 'الوعي الذاتي', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500', link: 'https://www.verywellmind.com/what-is-resilience-2795059' },
  { title: 'قوة تدوين المشاعر', desc: 'لماذا ينصح الأطباء النفسيون بالكتابة اليومية لتخفيف القلق؟', badge: 'أدوات عملية', img: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=500', link: 'https://www.verywellmind.com/the-benefits-of-journaling-for-stress-management-3144611' },
  { title: 'اليوجا كعلاج مكمل للصحة النفسية', desc: 'كيف تساعد الحركة الواعية في إعادة توازن الجهاز العصبي.', badge: 'الجسد والعقل', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', link: 'https://www.verywellmind.com/the-benefits-of-yoga-for-mental-health-5323375' },
  { title: 'إدارة القلق المزمن في الحياة اليومية', desc: 'استراتيجيات معرفية سلوكية للتعامل مع المخاوف المستمرة.', badge: 'القلق', img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&sat=-30', link: 'https://www.verywellmind.com/generalized-anxiety-disorder-4157247' },
  { title: 'فهم الاكتئاب وطرق التعافي منه', desc: 'دليل شامل لأعراض الاكتئاب وخيارات العلاج المتاحة.', badge: 'الاكتئاب', img: 'https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=500', link: 'https://www.verywellmind.com/depression-4157261' },
  { title: 'تحسين جودة النوم لصحة نفسية أفضل', desc: 'عادات بسيطة تساعدك على نوم عميق ومريح كل ليلة.', badge: 'النوم', img: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=500', link: 'https://www.verywellmind.com/how-sleep-affects-mental-health-4783067' },
  { title: 'بناء علاقات صحية وحدود واضحة', desc: 'كيف تتواصل بفعالية وتحافظ على علاقات متوازنة.', badge: 'العلاقات', img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500', link: 'https://www.verywellmind.com/what-makes-a-healthy-relationship-4174165' },
];

function AllArticles() {
  const navigate = useNavigate();

  return (
    <div className="all-articles-page" id="all-articles">
      {/* تم التعديل هنا ليصبح الكومبوننت الصحيح المستورد بالأعلى */}
      <Header /> 

      <main className="all-articles-main">
        <div className="all-articles-container">
          <div className="all-articles-header">
            <button className="all-articles-back" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-right"></i>
              <span>رجوع</span>
            </button>
            <div className="all-articles-titles">
              <h1>كل المقالات</h1>
              <p>مجموعة كاملة من المقالات العلمية في الصحة النفسية.</p>
            </div>
          </div>

          <div className="all-articles-grid">
            {ARTICLES.map((a, i) => (
              <a className="all-article-card" key={i} href={a.link} target="_blank" rel="noreferrer">
                <div className="all-article-img">
                  <img src={a.img} alt={a.title} />
                </div>
                <div className="all-article-body">
                  <span className="all-article-badge">{a.badge}</span>
                  <h3 className="all-article-title">{a.title}</h3>
                  <p className="all-article-desc">{a.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AllArticles;