const STORAGE_KEY = 'nfs_articles';

export const DEFAULT_ARTICLES = [
  {
    id: 'impostor',
    title: 'كيف تتعامل مع "متلازمة المحتال" في العمل؟',
    desc: 'نصائح عملية لاستعادة الثقة بالنفس والاعتراف بإنجازاتك الحقيقية.',
    badge: 'الوعي الذاتي',
    tag: 'الاحتراق_الوظيفي',
    img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500',
    link: 'https://www.verywellmind.com/imposter-syndrome-and-social-anxiety-disorder-4156469',
    isPublished: true,
  },
  {
    id: 'boundaries',
    title: 'ترتيب الأولويات وقول "لا" دون شعور بالذنب',
    desc: 'خطوات بسيطة لحماية مساحتك النفسية وطاقتك اليومية من الاستنزاف.',
    badge: 'التوازن النفسي',
    tag: 'تنظيم_القلق',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500',
    link: 'https://www.verywellmind.com/how-to-set-boundaries-5208591',
    isPublished: true,
  },
  {
    id: 'resilience',
    title: 'بناء المرونة النفسية في مواجهة التغيرات المفاجئة',
    desc: 'كيف تدرب عقلك على التكيف مع ظروف الحياة المتغيرة بمرونة وهدوء.',
    badge: 'المرونة النفسية',
    tag: 'المرونة_النفسية',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500',
    link: 'https://www.verywellmind.com/what-is-resilience-2795059',
    isPublished: true,
  },
  {
    id: 'journaling',
    title: 'قوة تدوين المشاعر',
    desc: 'لماذا ينصح الأطباء النفسيون بالكتابة اليومية لتخفيف القلق؟',
    badge: 'أدوات عملية',
    tag: 'تمارين_التنفس',
    img: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=500',
    link: 'https://www.verywellmind.com/the-benefits-of-journaling-for-stress-management-3144611',
    isPublished: true,
  },
  {
    id: 'yoga',
    title: 'اليوجا كعلاج مكمل للصحة النفسية',
    desc: 'كيف تساعد الحركة الواعية في إعادة توازن الجهاز العصبي.',
    badge: 'الجسد والعقل',
    tag: 'تمارين_التنفس',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
    link: 'https://www.verywellmind.com/the-benefits-of-yoga-for-mental-health-5323375',
    isPublished: true,
  },
  {
    id: 'anxiety',
    title: 'إدارة القلق المزمن في الحياة اليومية',
    desc: 'استراتيجيات معرفية سلوكية للتعامل مع المخاوف المستمرة.',
    badge: 'القلق',
    tag: 'تنظيم_القلق',
    img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&sat=-30',
    link: 'https://www.verywellmind.com/generalized-anxiety-disorder-4157247',
    isPublished: true,
  },
  {
    id: 'depression',
    title: 'فهم الاكتئاب وطرق التعافي منه',
    desc: 'دليل شامل لأعراض الاكتئاب وخيارات العلاج المتاحة.',
    badge: 'الاكتئاب',
    tag: 'الاكتئاب',
    img: 'https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=500',
    link: 'https://www.verywellmind.com/depression-4157261',
    isPublished: true,
  },
  {
    id: 'sleep',
    title: 'تحسين جودة النوم لصحة نفسية أفضل',
    desc: 'عادات بسيطة تساعدك على نوم عميق ومريح كل ليلة.',
    badge: 'النوم',
    tag: 'النوم',
    img: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=500',
    link: 'https://www.verywellmind.com/how-sleep-affects-mental-health-4783067',
    isPublished: true,
  },
  {
    id: 'relationships',
    title: 'بناء علاقات صحية وحدود واضحة',
    desc: 'كيف تتواصل بفعالية وتحافظ على علاقات متوازنة.',
    badge: 'العلاقات',
    tag: 'العلاقات',
    img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500',
    link: 'https://www.verywellmind.com/what-makes-a-healthy-relationship-4174165',
    isPublished: true,
  },
];

function normalizeArticle(article) {
  return {
    id: article.id || `article_${Date.now()}`,
    title: article.title?.trim() || '',
    desc: article.desc?.trim() || '',
    badge: article.badge?.trim() || 'مقالة',
    tag: article.tag?.trim() || 'الصحة_النفسية',
    img: article.img?.trim() || 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500',
    link: article.link?.trim() || '#',
    isPublished: article.isPublished !== false,
  };
}

export function getArticles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved)) return saved.map(normalizeArticle);
  } catch {
    // Fall back to defaults when local data is corrupted.
  }
  return DEFAULT_ARTICLES;
}

export function getPublishedArticles() {
  return getArticles().filter((article) => article.isPublished);
}

export function saveArticles(articles) {
  const normalized = articles.map(normalizeArticle);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('nfs-articles-updated'));
  return normalized;
}

export function resetArticles() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('nfs-articles-updated'));
  return DEFAULT_ARTICLES;
}
