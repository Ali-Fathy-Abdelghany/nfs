import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchTherapists,
  fetchPendingTherapists,
  approveTherapist,
  rejectTherapist,
} from '../../api/therapists';
import { getArticles, resetArticles, saveArticles } from '../../api/articles';
import { getApiErrorMessage } from '../../utils/apiError';

function genderLabel(g) {
  if (!g) return '—';
  const s = String(g).toLowerCase();
  if (s === '0' || s === 'male') return 'ذكر';
  if (s === '1' || s === 'female') return 'أنثى';
  return g;
}

function DoctorRequestModal({
  doc,
  onClose,
  onApprove,
  onReject,
  approving,
  rejecting,
  rejectReason,
  setRejectReason,
  showRejectForm,
  setShowRejectForm,
}) {
  if (!doc) return null;
  const quals = (doc.qualifications || '')
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-[28px] border border-[#E6E9E9] shadow-xl max-h-[90vh] overflow-y-auto text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#E6E9E9] px-5 py-4 flex items-center justify-between rounded-t-[28px]">
          <h3 className="text-base font-black text-[#181C1D]">تفاصيل طلب الانضمام</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F7FAFA] text-[#707978]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <img
              src={doc.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120'}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border border-[#E6E9E9]"
            />
            <div>
              <h4 className="text-lg font-black text-[#181C1D]">
                د. {doc.firstName} {doc.lastName}
              </h4>
              <p className="text-sm font-bold text-[#316764]">{doc.specialization || '—'}</p>
              <p className="text-[11px] text-[#707978] mt-1">
                تاريخ الطلب:{' '}
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('ar-EG') : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">البريد</p>
              <p className="font-bold text-[#181C1D] break-all">{doc.email || '—'}</p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">الهاتف</p>
              <p className="font-bold text-[#181C1D]">{doc.phone || '—'}</p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">الجنس</p>
              <p className="font-bold text-[#181C1D]">{genderLabel(doc.gender)}</p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">تاريخ الميلاد</p>
              <p className="font-bold text-[#181C1D]">
                {doc.dateOfBirth ? new Date(doc.dateOfBirth).toLocaleDateString('ar-EG') : '—'}
              </p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">الدولة / المحافظة</p>
              <p className="font-bold text-[#181C1D]">
                {[doc.country, doc.governorate].filter(Boolean).join(' — ') || '—'}
              </p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              <p className="text-[#707978] font-bold mb-0.5">سنوات الخبرة</p>
              <p className="font-bold text-[#181C1D]">{doc.experienceYears ?? '—'} سنة</p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3 col-span-2">
              <p className="text-[#707978] font-bold mb-0.5">سعر الجلسة</p>
              <p className="font-bold text-[#181C1D]">{doc.hourlyRate ?? '—'} ج.م</p>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-black text-[#181C1D] mb-1">النبذة المهنية</h5>
            <p className="text-xs text-[#707978] leading-relaxed bg-[#F7FAFA] border border-[#E6E9E9] rounded-xl p-3">
              {doc.bio || 'لا توجد نبذة مقدَّمة.'}
            </p>
          </div>

          <div>
            <h5 className="text-sm font-black text-[#181C1D] mb-2">المؤهلات / الشهادات / الإنجازات</h5>
            {quals.length === 0 ? (
              <p className="text-xs text-[#707978] bg-[#F7FAFA] border border-dashed border-[#E6E9E9] rounded-xl p-3">
                لم يُرفق مقدم الطلب مؤهلات أو شهادات بعد.
              </p>
            ) : (
              <ul className="space-y-2">
                {quals.map((q) => (
                  <li
                    key={q}
                    className="text-xs font-bold text-[#316764] bg-[#E6F0EF] border border-[#316764]/10 rounded-xl px-3 py-2 flex items-start gap-2"
                  >
                    <i className="fa-solid fa-certificate mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showRejectForm && (
            <div className="space-y-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <label className="text-xs font-bold text-red-800 block">سبب الرفض (اختياري)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="مثال: مستندات غير مكتملة / تخصص غير مطابق..."
                className="w-full text-xs border border-red-200 rounded-xl p-3 outline-none focus:border-red-400 bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onReject(doc.therapistId, rejectReason)}
                  disabled={rejecting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-3 rounded-xl disabled:opacity-60"
                >
                  {rejecting ? 'جاري الرفض...' : 'تأكيد الرفض'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="flex-1 border border-[#E6E9E9] text-[#707978] text-xs font-bold px-4 py-3 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {!doc.isVerified && doc.status !== 'Rejected' && !showRejectForm && (
              <>
                <button
                  onClick={() => onApprove(doc.therapistId)}
                  disabled={approving || rejecting}
                  className="flex-1 bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-4 py-3 rounded-xl transition disabled:opacity-60"
                >
                  {approving ? 'جاري الاعتماد...' : 'اعتماد الطبيب'}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={approving || rejecting}
                  className="flex-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold px-4 py-3 rounded-xl transition disabled:opacity-60"
                >
                  رفض الطلب
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="flex-1 border border-[#E6E9E9] bg-[#F7FAFA] text-[#707978] text-xs font-bold px-4 py-3 rounded-xl hover:border-[#316764]/30"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyArticleForm = {
  title: '',
  desc: '',
  badge: '',
  tag: '',
  img: '',
  link: '',
  isPublished: true,
};

function ArticleManager() {
  const toast = useToast();
  const [articles, setArticles] = useState(() => getArticles());
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyArticleForm);

  const persist = (nextArticles, message) => {
    const saved = saveArticles(nextArticles);
    setArticles(saved);
    if (message) toast.success(message);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.desc.trim() || !form.link.trim()) {
      toast.warning('العنوان والوصف والرابط مطلوبين');
      return;
    }

    if (editingId) {
      persist(
        articles.map((article) =>
          article.id === editingId ? { ...article, ...form, id: editingId } : article
        ),
        'تم تعديل المقال'
      );
    } else {
      persist(
        [
          {
            ...form,
            id: `article_${Date.now()}`,
            badge: form.badge || 'مقالة',
            tag: form.tag || 'الصحة_النفسية',
            img: form.img || 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500',
          },
          ...articles,
        ],
        'تمت إضافة المقال'
      );
    }

    setEditingId(null);
    setForm(emptyArticleForm);
  };

  const startEdit = (article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      desc: article.desc,
      badge: article.badge,
      tag: article.tag,
      img: article.img,
      link: article.link,
      isPublished: article.isPublished,
    });
  };

  const handleDelete = (articleId) => {
    persist(articles.filter((article) => article.id !== articleId), 'تم حذف المقال');
    if (editingId === articleId) {
      setEditingId(null);
      setForm(emptyArticleForm);
    }
  };

  const handleTogglePublish = (articleId) => {
    persist(
      articles.map((article) =>
        article.id === articleId ? { ...article, isPublished: !article.isPublished } : article
      ),
      'تم تحديث حالة النشر'
    );
  };

  const handleReset = () => {
    const defaults = resetArticles();
    setArticles(defaults);
    setEditingId(null);
    setForm(emptyArticleForm);
    toast.success('تمت إعادة المقالات الافتراضية');
  };

  return (
    <section className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-sm p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#181C1D]">إدارة المقالات</h2>
          <p className="text-xs text-[#707978] mt-1">
            أضف، عدّل، أخفِ أو احذف المقالات التي تظهر في مكتبة المصادر وصفحة كل المقالات.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] bg-[#F7FAFA] text-[#707978] hover:border-[#316764]/30"
        >
          إعادة الافتراضي
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F7FAFA] border border-[#E6E9E9] rounded-2xl p-4">
        <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="عنوان المقال" className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764]" />
        <input value={form.badge} onChange={(e) => handleChange('badge', e.target.value)} placeholder="التصنيف / الشارة" className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764]" />
        <input value={form.tag} onChange={(e) => handleChange('tag', e.target.value)} placeholder="الوسم بدون # مثال: تنظيم_القلق" className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764]" />
        <input value={form.link} onChange={(e) => handleChange('link', e.target.value)} placeholder="رابط المقال" className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764]" />
        <input value={form.img} onChange={(e) => handleChange('img', e.target.value)} placeholder="رابط الصورة" className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764] md:col-span-2" />
        <textarea value={form.desc} onChange={(e) => handleChange('desc', e.target.value)} placeholder="وصف مختصر" rows={3} className="text-xs rounded-xl border border-[#E6E9E9] bg-white px-3 py-3 outline-none focus:border-[#316764] md:col-span-2" />
        <label className="flex items-center gap-2 text-xs font-bold text-[#316764]">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} />
          منشور للمستخدمين
        </label>
        <div className="flex gap-2 justify-end">
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyArticleForm); }} className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] text-[#707978]">
              إلغاء
            </button>
          )}
          <button type="submit" className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#316764] text-white hover:bg-[#254f4d]">
            {editingId ? 'حفظ التعديل' : 'إضافة مقال'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="flex flex-col md:flex-row gap-4 md:items-center justify-between p-4 rounded-2xl border border-[#E6E9E9] bg-[#F7FAFA]">
            <div className="flex gap-3">
              <img src={article.img} alt="" className="w-16 h-16 rounded-2xl object-cover border border-[#E6E9E9]" />
              <div className="text-right">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-black text-[#181C1D]">{article.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${article.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {article.isPublished ? 'منشور' : 'مخفي'}
                  </span>
                </div>
                <p className="text-xs text-[#707978] line-clamp-2">{article.desc}</p>
                <p className="text-[10px] text-[#316764] font-bold mt-1">#{article.tag} · {article.badge}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button onClick={() => startEdit(article)} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-[#E6E9E9] text-[#316764]">
                تعديل
              </button>
              <button onClick={() => handleTogglePublish(article.id)} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-[#E6E9E9] text-[#707978]">
                {article.isPublished ? 'إخفاء' : 'نشر'}
              </button>
              <button onClick={() => handleDelete(article.id)} className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const toast = useToast();
  const [pending, setPending] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [actingKind, setActingKind] = useState(null);
  const [section, setSection] = useState('doctors');
  const [tab, setTab] = useState('pending');
  const [detailDoc, setDetailDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetchPendingTherapists(),
        fetchTherapists(),
      ]);
      setPending(pendingRes.data || []);
      setAllDoctors(allRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر تحميل بيانات الأطباء'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }
    load();
  }, [navigate]);

  const verified = useMemo(
    () => (allDoctors || []).filter((d) => d.isVerified),
    [allDoctors]
  );

  const rejected = useMemo(
    () => (allDoctors || []).filter((d) => String(d.status).toLowerCase() === 'rejected'),
    [allDoctors]
  );

  const handleApprove = async (therapistId) => {
    setActingId(therapistId);
    setActingKind('approve');
    try {
      await approveTherapist(therapistId);
      toast.success('تم اعتماد الطبيب بنجاح — سيتم إرسال بريد القبول إن توفّر SMTP');
      setDetailDoc(null);
      setShowRejectForm(false);
      setRejectReason('');
      await load();
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر اعتماد الطبيب'));
    } finally {
      setActingId(null);
      setActingKind(null);
    }
  };

  const handleReject = async (therapistId, reason) => {
    setActingId(therapistId);
    setActingKind('reject');
    try {
      await rejectTherapist(therapistId, reason);
      toast.success('تم رفض الطلب — سيتم إرسال بريد الرفض إن توفّر SMTP');
      setDetailDoc(null);
      setShowRejectForm(false);
      setRejectReason('');
      await load();
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر رفض الطلب'));
    } finally {
      setActingId(null);
      setActingKind(null);
    }
  };

  const openProfile = (doc, { edit = false } = {}) => {
    navigate('/doctor/profile', {
      state: {
        doctor: {
          therapistId: doc.therapistId,
          id: doc.therapistId,
          ...doc,
        },
        adminView: true,
        startEditing: edit,
      },
    });
  };

  const list = tab === 'pending' ? pending : tab === 'rejected' ? rejected : verified;

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-['Cairo',sans-serif]" dir="rtl">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 py-8 space-y-6 pb-24">
        <section className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-sm p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-[#2A5C58]">لوحة الإدارة</h1>
              <span className="text-[10px] font-bold text-[#316764] bg-[#E6F0EF] px-2 py-0.5 rounded-md border border-[#316764]/10">
                ADMIN
              </span>
            </div>
            <p className="text-sm text-[#707978]">
              مرحباً {user?.firstName || 'بالمسؤول'} — راجع طلبات الأطباء، اعتمد أو ارفض الطلبات، وعدّل بياناتهم عند الحاجة.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">طلبات معلّقة</p>
            <p className="text-2xl font-black text-[#316764]">{pending.length}</p>
          </div>
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">أطباء معتمدون</p>
            <p className="text-2xl font-black text-[#316764]">{verified.length}</p>
          </div>
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">مرفوضون</p>
            <p className="text-2xl font-black text-red-700">{rejected.length}</p>
          </div>
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">إجمالي الأطباء</p>
            <p className="text-2xl font-black text-[#316764]">{allDoctors.length}</p>
          </div>
        </section>

        <section className="bg-white rounded-[20px] border border-[#E6E9E9] p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setSection('doctors')}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition ${
              section === 'doctors' ? 'bg-[#316764] text-white' : 'bg-[#F7FAFA] text-[#707978]'
            }`}
          >
            إدارة الأطباء
          </button>
          <button
            onClick={() => setSection('articles')}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition ${
              section === 'articles' ? 'bg-[#316764] text-white' : 'bg-[#F7FAFA] text-[#707978]'
            }`}
          >
            إدارة المقالات
          </button>
        </section>

        {section === 'articles' && <ArticleManager />}

        {section === 'doctors' && (
        <section className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
            <h2 className="text-base font-black text-[#181C1D]">إدارة الأطباء</h2>
            <div className="flex flex-wrap bg-[#F7FAFA] p-0.5 rounded-xl border border-[#E6E9E9]">
              <button
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                  tab === 'pending' ? 'bg-white text-[#316764] shadow-sm' : 'text-[#707978]'
                }`}
                onClick={() => setTab('pending')}
              >
                بانتظار الموافقة ({pending.length})
              </button>
              <button
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                  tab === 'verified' ? 'bg-white text-[#316764] shadow-sm' : 'text-[#707978]'
                }`}
                onClick={() => setTab('verified')}
              >
                المعتمدون ({verified.length})
              </button>
              <button
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                  tab === 'rejected' ? 'bg-white text-red-700 shadow-sm' : 'text-[#707978]'
                }`}
                onClick={() => setTab('rejected')}
              >
                المرفوضون ({rejected.length})
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[#707978]">جاري التحميل...</p>
          ) : list.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#707978] bg-[#F7FAFA] rounded-2xl border border-dashed border-[#E6E9E9]">
              {tab === 'pending'
                ? 'لا توجد طلبات جديدة حالياً'
                : tab === 'rejected'
                  ? 'لا يوجد طلبات مرفوضة'
                  : 'لا يوجد أطباء معتمدون بعد'}
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((doc) => (
                <div
                  key={doc.therapistId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E6E9E9] bg-[#F7FAFA] hover:border-[#316764]/30 transition"
                >
                  <button
                    type="button"
                    className="flex items-start gap-3 text-right flex-1"
                    onClick={() => (tab === 'pending' ? setDetailDoc(doc) : openProfile(doc))}
                  >
                    <img
                      src={
                        doc.profileImageUrl ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120'
                      }
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E6E9E9]"
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-[#181C1D]">
                        د. {doc.firstName} {doc.lastName}
                      </h3>
                      <p className="text-xs text-[#316764] font-bold">{doc.specialization}</p>
                      <p className="text-[11px] text-[#707978] leading-relaxed max-w-xl line-clamp-2">
                        {doc.bio || 'لا توجد نبذة'}
                      </p>
                      {tab === 'rejected' && doc.rejectionReason && (
                        <p className="text-[11px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1 inline-block">
                          السبب: {doc.rejectionReason}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-[#707978]">
                        <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                          {doc.email}
                        </span>
                        <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                          خبرة {doc.experienceYears} سنة
                        </span>
                        {doc.rating > 0 && (
                          <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                            ★ {Number(doc.rating).toFixed(1)} ({doc.reviewCount || 0})
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {tab === 'pending' && (
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                          setDetailDoc(doc);
                        }}
                        className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#316764]/20 bg-white text-[#316764] hover:bg-[#E6F0EF] transition"
                      >
                        عرض التفاصيل
                      </button>
                    )}
                    <button
                      onClick={() => openProfile(doc)}
                      className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] bg-white text-[#707978] hover:border-[#316764]/30 transition"
                    >
                      الملف الشخصي
                    </button>
                    <button
                      onClick={() =>
                        navigate('/sessions', {
                          state: { adminDoctorId: doc.therapistId, adminView: true },
                        })
                      }
                      className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] bg-white text-[#707978] hover:border-[#316764]/30 transition"
                    >
                      الجلسات
                    </button>
                    <button
                      onClick={() => openProfile(doc, { edit: true })}
                      className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] bg-white text-[#316764] hover:bg-[#E6F0EF] transition"
                    >
                      تعديل
                    </button>
                    {doc.isVerified ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                        معتمد
                      </span>
                    ) : tab === 'rejected' ? (
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                        مرفوض
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(doc.therapistId)}
                          disabled={actingId === doc.therapistId}
                          className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
                        >
                          {actingId === doc.therapistId && actingKind === 'approve'
                            ? 'جاري الاعتماد...'
                            : 'اعتماد'}
                        </button>
                        <button
                          onClick={() => {
                            setDetailDoc(doc);
                            setShowRejectForm(true);
                          }}
                          disabled={actingId === doc.therapistId}
                          className="bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
                        >
                          رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}
      </main>

      <DoctorRequestModal
        doc={detailDoc}
        onClose={() => {
          setDetailDoc(null);
          setShowRejectForm(false);
          setRejectReason('');
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        approving={actingId === detailDoc?.therapistId && actingKind === 'approve'}
        rejecting={actingId === detailDoc?.therapistId && actingKind === 'reject'}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        showRejectForm={showRejectForm}
        setShowRejectForm={setShowRejectForm}
      />
    </div>
  );
}

export default AdminPage;
