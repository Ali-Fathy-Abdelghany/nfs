import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header"; // تم استيراده هنا كـ Header
import { getPublishedArticles } from '../../api/articles';
import './AllArticles.css';

function AllArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(() => getPublishedArticles());

  useEffect(() => {
    const reload = () => setArticles(getPublishedArticles());
    window.addEventListener('nfs-articles-updated', reload);
    return () => window.removeEventListener('nfs-articles-updated', reload);
  }, []);

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
            {articles.map((a) => (
              <a className="all-article-card" key={a.id} href={a.link} target="_blank" rel="noreferrer">
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