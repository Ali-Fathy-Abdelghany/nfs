import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';
import { createAssessment } from '../../api/assessments';
import { useAuth } from '../../context/AuthContext';
import { ensurePatientRecord } from '../../api/patientHelpers';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';

const questionsData = [
  {
    id: 1,
    title: "اختر نوع الجلسة المناسب لك",
    subtitle: "نحن هنا لدعمك في رحلتك نحو الصحة النفسية. اختر المسار الذي يمنحك الراحة والنمو.",
    showFooter: true, 
    type: "grid",
    cards: [
      { value: "فردي", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, cardTitle: "جلسة فردية", cardDesc: "جلسة خاصة وجهاً لوجه مع معالج مختص تركز بالكامل على احتياجاتك الشخصية ونموك." },
      { value: "جماعي", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, cardTitle: "جلسة جماعية", cardDesc: "تواصل مع الآخرين الذين يشاركونك تجارب مشابهة في بيئة آمنة ومدعومة من قبل الخبراء." },
      { value: "أزواج", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, cardTitle: "جلسة أزواج", cardDesc: "تعزيز الروابط وتطوير أدوات تواصل صحية لشريكين يسعيان لتحسين جودة علاقتهما." }
    ]
  },
  {
    id: 2,
    title: "ما الذي ترغب في التركيز عليه اليوم؟",
    subtitle: "سيساعدنا هذا في اختيار المعالج الأنسب لاحتياجاتك الخاصة.",
    showFooter: false,
    type: "grid",
    infoBox: "هل تعلم؟ تخصيص هدفك يساعدنا على مطابقتك مع مختص ذو خبرة في مجالك المحدد بنسبة دقة تصل إلى 95%.",
    cards: [
      { value: "قلق", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, cardTitle: "قلق وتوتر", cardDesc: "إدارة المخاوف المستمرة والضغوطات اليومية." },
      { value: "اكتئاب", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path><path d="M8 15s1.5-2 4-2 4 2 4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>, cardTitle: "اكتئاب وحزن", cardDesc: "التعامل مع تقلبات المزاج وفقدان الشغف." },
      { value: "علاقات", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>, cardTitle: "علاقات عاطفية/أسرية", cardDesc: "تحسين جودة تواصلك مع المحيطين بك." },
      { value: "النوم", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>, cardTitle: "اضطرابات النوم", cardDesc: "مواجهة الأرق وتحسين جودة الراحة اليومية." },
      { value: "اخرى", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>, cardTitle: "مواضيع أخرى", cardDesc: "أي تحديات نفسية أو أهداف شخصية أخرى." }
    ]
  },
  {
    id: 3,
    title: "إلى أي مدى شعرت بالانزعاج من هذه المشاعر خلال الأسبوعين الماضيين؟",
    subtitle: "يساعدنا هذا السؤال في فهم وتيرة مشاعرك لتقديم الدعم الأنسب لك في \"الواحة الآمنة\".",
    showFooter: false,
    type: "scale", 
    infoBox: "تذكر أن هذه المشاعر مؤقتة، والاعتراف بها هو الخطوة الأولى نحو التوازن.",
    cards: [
      { value: "أبداً", cardTitle: "أبداً" },
      { value: "عدة أيام", cardTitle: "عدة أيام" },
      { value: "أكثر من نصف الأيام", cardTitle: "أكثر من نصف الأيام" },
      { value: "كل يوم تقريباً", cardTitle: "كل يوم تقريباً" }
    ]
  },
  {
    id: 4,
    title: "إلى أي مدى أثرت هذه المشاعر على حياتك اليومية؟",
    subtitle: "فكر في عملك، دراستك، أو علاقاتك الشخصية خلال الأسبوعين الماضيين.",
    showFooter: false,
    type: "grid",
    hasMirrorBox: true,
    infoBox: "صدقك مع نفسك هو أول خطوة نحو التعافي. نحن هنا لنفهم رحلتك بدقة ونقدم لك الدعم المناسب.",
    cards: [
      { value: "لا يوجد", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>, cardTitle: "لا يوجد تأثير", cardDesc: "تمارس حياتك اليومية وأنشطتك المعتادة بكل سلاسة وطبيعية." },
      { value: "طفيف", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>, cardTitle: "تأثير طفيف", cardDesc: "تشعر ببعض التغييرات العابرة لكنها لا تعطلك عن أداء واجباتك." },
      { value: "متوسط", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, cardTitle: "تأثير متوسط", cardDesc: "تجد صعوبة أو تحتاج جهداً إضافياً لإتمام المهام والتواصل الاجتماعي." },
      { value: "كبير", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line></svg>, cardTitle: "تأثير كبير", cardDesc: "تأثرت إنتاجيتك وعلاقاتك بشكل ملحوظ وتجد عبئاً في روتينك." },
      { value: "حاد", iconSvg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, cardTitle: "تأثير حاد", cardDesc: "تعطّل شبه كامل في مجريات حياتك اليومية وتواجه صعوبة شديدة في الاستمرار." }
    ]
  },
  {
    id: 5,
    title: "كيف تقيم جودة نومك الأسبوع الماضي؟",
    subtitle: "النوم الجيد هو ركيزة التوازن النفسي الأساسية.",
    showFooter: false,
    type: "sleep-split",
    cards: [
      { label: "1", desc: "ضعيف", value: "1" },
      { label: "2", desc: "", value: "2" },
      { label: "3", desc: "متوسط", value: "3" },
      { label: "4", desc: "", value: "4" },
      { label: "5", desc: "ممتاز", value: "5" }
    ]
  }
];

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const totalSteps = questionsData.length; 
  const currentQuestion = questionsData[currentStep];
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleOptionSelect = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      setSubmitting(true);
      let patientId = user?.patientId;
      const userId = user?.userId || user?.id;
      if (!patientId && userId) {
        patientId = await ensurePatientRecord(userId);
      }
      if (!patientId) {
        navigate('/login');
        return;
      }

      const labeledAnswers = questionsData.map((q) => ({
        questionId: q.id,
        question: q.title,
        answer: answers[q.id] ?? null,
      }));

      await createAssessment({
        patientId,
        title: 'تقييم أولي - الواحة الآمنة',
        answersJson: JSON.stringify({
          completedAt: new Date().toISOString(),
          answers,
          labeledAnswers,
        }),
        score: Object.keys(answers).length,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر حفظ التقييم، حاول مرة أخرى'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="quiz-container">
      
      <div className="quiz-progress-header">
        <div className="progress-info-row">
          <span className="current-step-text">السؤال {currentStep + 1} من {totalSteps}</span>
          <span className="remaining-text">متبقي {totalSteps - (currentStep + 1)} أسئلة</span>
        </div>
        <div className="quiz-progress-bar-bg">
          <div 
            className="quiz-progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="quiz-card-content">
        
        {currentQuestion.type === "sleep-split" ? (
          <div className="quiz-sleep-split-layout">
            
            <div className="sleep-quiz-interactive-side">
              <div className="quiz-header-text-wrapper unique-right-align">
                <h2 className="quiz-question-title">{currentQuestion.title}</h2>
                <p className="quiz-question-subtitle">{currentQuestion.subtitle}</p>
              </div>

              <div className="sleep-rating-row-wrapper">
                {currentQuestion.cards.map((card, index) => {
                  const isSelected = answers[currentQuestion.id] === card.value;
                  return (
                    <div 
                      key={index} 
                      className={`sleep-rating-node-box ${isSelected ? 'active' : ''}`}
                      onClick={() => handleOptionSelect(currentQuestion.id, card.value)}
                    >
                      <div className="rating-number-bubble">{card.label}</div>
                      {card.desc && <span className="rating-desc-label">{card.desc}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sleep-quiz-art-side">
              <div className="sleep-illustration-card">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="sleeping-avatar-svg">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(15, 118, 110, 0.08)" stroke="#0f766e" strokeWidth="1.5"></path>
                  <path d="M2 22h20"></path>
                  <path d="M6 18H4v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3H8"></path>
                  <circle cx="8" cy="9" r="2"></circle>
                  <path d="M17 4h3l-3 3h3" strokeWidth="1" opacity="0.8"></path>
                  <path d="M14 7h2l-2 2h2" strokeWidth="1" opacity="0.6"></path>
                </svg>
                <span className="sleeping-art-subtext">أحلام سعيدة، واحة آمنة...</span>
              </div>
            </div>

          </div>
        ) : (
          <>
            <div className="quiz-header-text-wrapper">
              <h2 className="quiz-question-title">{currentQuestion.title}</h2>
              <p className="quiz-question-subtitle">{currentQuestion.subtitle}</p>
            </div>

            {currentQuestion.type === "grid" ? (
              <div className="session-types-grid">
                {currentQuestion.cards.map((card, index) => {
                  const isSelected = answers[currentQuestion.id] === card.value;
                  return (
                    <div 
                      key={index}
                      className={`session-type-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleOptionSelect(currentQuestion.id, card.value)}
                    >
                      <div className="session-card-icon-wrapper">
                        {card.iconSvg}
                      </div>
                      <h4 className="session-card-title">{card.cardTitle}</h4>
                      <p className="session-card-desc">{card.cardDesc}</p>
                      <button className="select-session-inside-btn">
                        {isSelected ? 'تم الاختيار' : 'اختيار هذا المسار'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="quiz-scale-timeline-container">
                <div className="timeline-connecting-line"></div>
                <div className="timeline-steps-wrapper">
                  {currentQuestion.cards.map((card, index) => {
                    const isSelected = answers[currentQuestion.id] === card.value;
                    return (
                      <div 
                        key={index}
                        className={`timeline-step-node ${isSelected ? 'active' : ''}`}
                        onClick={() => handleOptionSelect(currentQuestion.id, card.value)}
                      >
                        <div className="node-circle">
                          <span className="node-inner-dot"></span>
                        </div>
                        <span className="node-label-text">{card.cardTitle}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {currentQuestion.hasMirrorBox ? (
          <div className="quiz-mirror-gradient-box">
            <div className="mirror-box-text-content">
              <span className="mirror-box-tag">ملاحظة داعمة 🌿</span>
              <p className="mirror-box-text">{currentQuestion.infoBox}</p>
            </div>
            <div className="mirror-box-image-wrapper">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mirror-svg-art">
                <circle cx="12" cy="8" r="6" fill="rgba(15, 118, 110, 0.05)"></circle>
                <path d="M12 14v7M9 21h6"></path>
                <path d="M12 5a3 3 0 0 0-3 3" strokeDasharray="2 2"></path>
              </svg>
            </div>
          </div>
        ) : (
          currentQuestion.infoBox && (
            <div className="quiz-info-gradient-box">
              <div className="info-box-icon">💡</div>
              <p className="info-box-text">{currentQuestion.infoBox}</p>
            </div>
          )
        )}

        {currentQuestion.showFooter && (
          <div className="not-sure-footer-wrapper">
            <span className="not-sure-text">غير متأكد؟</span>
            <a href="#coordinator" className="coordinator-link">تحدث مع منسق الحالة</a>
          </div>
        )}
      </div>

      <div className="quiz-navigation-footer">
        <button 
          className="quiz-nav-btn prev-btn" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          السابق
        </button>
        
        <button 
          className="quiz-nav-btn next-btn" 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]} 
        >
          {currentStep === totalSteps - 1 ? (submitting ? 'جاري الإرسال...' : 'إنهاء وإرسال') : 'التالي'}
        </button>
      </div>

    </div>
  );
};

export default QuizPage;