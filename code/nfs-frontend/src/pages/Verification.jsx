import React, { useCallback, useEffect, useRef, useState } from 'react';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchTherapistByUserId, updateTherapist } from '../api/therapists';
import { getApiErrorMessage } from '../utils/apiError';
import { getStoredUser } from '../api/config';

const MAX_QUALIFICATIONS = 1000;

function joinQualificationParts(parts) {
  const text = parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join('، ');
  return text.length > MAX_QUALIFICATIONS ? text.slice(0, MAX_QUALIFICATIONS) : text;
}

const Verification = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth() || {};
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [therapist, setTherapist] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    specialization: '',
    graduationCert: '',
    specialtyCert: '',
  });
  const [idDoc, setIdDoc] = useState(null);
  const [gradDoc, setGradDoc] = useState(null);
  const [specDoc, setSpecDoc] = useState(null);

  const idInputRef = useRef(null);
  const gradInputRef = useRef(null);
  const specInputRef = useRef(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadTherapist = useCallback(async () => {
    const stored = getStoredUser();
    const userId = user?.userId ?? user?.id ?? stored?.userId ?? stored?.id;
    if (!userId) {
      toast.error('يجب تسجيل الدخول لإكمال التوثيق');
      navigate('/auth');
      return null;
    }

    try {
      const res = await fetchTherapistByUserId(userId);
      const data = res.data;
      if (!data) {
        toast.error('لم يتم العثور على ملف الممارس. أكمل التسجيل أولاً.');
        navigate('/doctor-signup');
        return null;
      }

      setTherapist(data);
      setForm((prev) => ({
        ...prev,
        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        specialization: data.specialization || '',
      }));

      // Keep therapistId in stored session without rewriting the auth token
      if (data.therapistId) {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          if (stored.therapistId !== data.therapistId) {
            localStorage.setItem(
              'user',
              JSON.stringify({ ...stored, therapistId: data.therapistId, userId: data.userId }),
            );
          }
        } catch {
          // ignore storage errors
        }
      }

      if (data.isVerified) {
        setStep(3);
      } else if (String(data.status).toLowerCase() === 'rejected') {
        setStep(3);
      }

      return data;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر تحميل بيانات التوثيق'));
      if (err?.response?.status === 404) {
        navigate('/doctor-signup');
      }
      return null;
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasSession =
        isAuthenticated ||
        !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));
      if (!hasSession) {
        toast.error('يجب تسجيل الدخول لإكمال التوثيق');
        navigate('/auth');
        return;
      }
      setLoading(true);
      await loadTherapist();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleStep1Next = async () => {
    if (!therapist?.therapistId) {
      toast.error('ملف الممارس غير جاهز بعد');
      return;
    }
    const fullName = form.fullName.trim();
    const specialization = form.specialization.trim();
    if (!fullName) {
      toast.warning('أدخل الاسم الكامل');
      return;
    }
    if (!specialization) {
      toast.warning('أدخل التخصص الدقيق');
      return;
    }

    const [firstName = '', ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    setSaving(true);
    try {
      await updateTherapist(therapist.therapistId, {
        firstName,
        lastName,
        phone: therapist.phone || null,
        specialization,
        bio: therapist.bio || '',
        experienceYears: therapist.experienceYears || 0,
        hourlyRate: therapist.hourlyRate || 0,
        qualifications: therapist.qualifications || '',
      });
      setTherapist((prev) =>
        prev
          ? {
              ...prev,
              firstName,
              lastName,
              specialization,
            }
          : prev,
      );
      toast.success('تم حفظ المعلومات الشخصية');
      setStep(2);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ المعلومات الشخصية'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!therapist?.therapistId) {
      toast.error('ملف الممارس غير جاهز بعد');
      return;
    }
    if (!idDoc && !gradDoc && !specDoc && !form.graduationCert.trim() && !form.specialtyCert.trim()) {
      toast.warning('أرفق وثيقة واحدة على الأقل أو أدخل وصف الشهادة');
      return;
    }

    const baseParts = (therapist.qualifications || '')
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const docParts = [
      form.graduationCert.trim() && `شهادة التخرج: ${form.graduationCert.trim()}`,
      form.specialtyCert.trim() && `التخصص الدقيق: ${form.specialtyCert.trim()}`,
      idDoc && `بطاقة مهنية: ${idDoc.name}`,
      gradDoc && `ملف شهادة التخرج: ${gradDoc.name}`,
      specDoc && `ملف التخصص: ${specDoc.name}`,
    ].filter(Boolean);

    // Prefer keeping license-like base quals, then append document notes
    const qualifications = joinQualificationParts([...baseParts, ...docParts]);

    setSaving(true);
    try {
      await updateTherapist(therapist.therapistId, {
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        phone: therapist.phone || null,
        specialization: therapist.specialization || form.specialization,
        bio: therapist.bio || '',
        experienceYears: therapist.experienceYears || 0,
        hourlyRate: therapist.hourlyRate || 0,
        qualifications,
      });
      setTherapist((prev) => (prev ? { ...prev, qualifications } : prev));
      toast.success('تم إرسال طلب المراجعة بنجاح');
      setStep(3);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إرسال طلب المراجعة'));
    } finally {
      setSaving(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const data = await loadTherapist();
      if (!data) return;
      if (data.isVerified) {
        toast.success('تم اعتماد حسابك — يمكنك الدخول للوحة التحكم');
      } else if (String(data.status).toLowerCase() === 'rejected') {
        toast.warning(data.rejectionReason
          ? `تم رفض الطلب: ${data.rejectionReason}`
          : 'تم رفض طلب الانضمام من الإدارة');
      } else {
        toast.info('طلبك ما زال قيد المراجعة من الإدارة');
      }
    } finally {
      setChecking(false);
    }
  };

  const onFilePicked = (setter) => (e) => {
    const file = e.target.files?.[0] || null;
    setter(file);
    if (file) toast.info(`تم اختيار: ${file.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans">
        <p className="text-[#2A5C58] font-bold">جاري تحميل صفحة التوثيق...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 md:p-16 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto mb-12 text-right">
        <h1 className="text-3xl font-bold text-[#2A5C58] mb-4">توثيق الممارس</h1>
        <p className="text-gray-500 mb-8">
          نحن نؤمن بأن الثقة هي أساس كل رحلة علاجية، ساعدنا في الحفاظ على أمان مجتمعنا.
        </p>

        <div className="flex items-center gap-4 mb-10 justify-end flex-wrap">
          <Step active={step === 3} number="3" label="المراجعة والتحقق" />
          <Step active={step === 2} number="2" label="تحميل الوثائق المهنية" />
          <Step active={step === 1} number="1" label="المعلومات الشخصية" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#E6F0EF] p-8 rounded-3xl border border-[#dce9e8]">
            <h3 className="font-bold text-[#2A5C58] mb-4">لماذا نوثق الممارسين؟</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              ضمان أعلى معايير الجودة العلمية والمهنية لمستخدمينا.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              حماية خصوصيتك وبياناتك المهنية من خلال أنظمة مشفرة بالكامل.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-bold text-[#2A5C58]">المعلومات الشخصية</h3>
              <Input
                placeholder="الاسم الكامل"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
              <Input
                placeholder="التخصص الدقيق"
                value={form.specialization}
                onChange={(e) => update('specialization', e.target.value)}
              />
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={saving}
                className="w-full py-4 bg-[#2A5C58] text-white rounded-full font-bold disabled:opacity-50 hover:bg-[#1f4a46] transition"
              >
                {saving ? 'جاري الحفظ...' : 'التالي'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-[#2A5C58]">بطاقة الهوية المهنية</h3>

              <input
                ref={idInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={onFilePicked(setIdDoc)}
              />
              <button
                type="button"
                onClick={() => idInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center hover:bg-gray-50 transition cursor-pointer"
              >
                <p className="text-gray-400">
                  {idDoc ? `تم اختيار: ${idDoc.name}` : 'اضغط للتحميل أو اسحب الملف هنا'}
                </p>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  ref={gradInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={onFilePicked(setGradDoc)}
                />
                <button
                  type="button"
                  onClick={() => gradInputRef.current?.click()}
                  className="p-4 border border-gray-200 rounded-2xl text-center text-sm hover:bg-gray-50 transition"
                >
                  {gradDoc ? gradDoc.name : 'شهادة التخرج +'}
                </button>

                <input
                  ref={specInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={onFilePicked(setSpecDoc)}
                />
                <button
                  type="button"
                  onClick={() => specInputRef.current?.click()}
                  className="p-4 border border-gray-200 rounded-2xl text-center text-sm hover:bg-gray-50 transition"
                >
                  {specDoc ? specDoc.name : 'التخصص الدقيق +'}
                </button>
              </div>

              <Input
                placeholder="وصف شهادة التخرج (اختياري)"
                value={form.graduationCert}
                onChange={(e) => update('graduationCert', e.target.value)}
              />
              <Input
                placeholder="وصف شهادة التخصص (اختياري)"
                value={form.specialtyCert}
                onChange={(e) => update('specialtyCert', e.target.value)}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={saving}
                  className="flex-1 py-4 border border-gray-200 text-[#2A5C58] rounded-full font-bold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  رجوع
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={saving}
                  className="flex-1 py-4 bg-[#2A5C58] text-white rounded-full font-bold disabled:opacity-50 hover:bg-[#1f4a46] transition"
                >
                  {saving ? 'جاري الإرسال...' : 'إرسال المراجعة'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#E6F0EF] rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
                {therapist?.isVerified
                  ? '✅'
                  : String(therapist?.status).toLowerCase() === 'rejected'
                    ? '❌'
                    : '⏳'}
              </div>
              <h2 className="text-3xl font-bold text-[#2A5C58] mb-4">
                {therapist?.isVerified
                  ? 'تم اعتماد حسابك'
                  : String(therapist?.status).toLowerCase() === 'rejected'
                    ? 'تم رفض الطلب'
                    : 'تم استلام طلبك بنجاح'}
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {therapist?.isVerified
                  ? 'يمكنك الآن الوصول إلى لوحة تحكم الطبيب وبدء استقبال المرضى.'
                  : String(therapist?.status).toLowerCase() === 'rejected'
                    ? (therapist?.rejectionReason
                      ? `السبب: ${therapist.rejectionReason}. يمكنك تحديث الوثائق وإعادة الإرسال.`
                      : 'رفضت الإدارة الطلب حالياً. يمكنك تحديث الوثائق وإعادة الإرسال.')
                    : 'نحن نقوم حالياً بمراجعة بياناتك... سيتم إشعارك فور اعتماد الحساب من قبل الإدارة.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!therapist?.isVerified && (
                  <>
                    <button
                      type="button"
                      onClick={handleCheckStatus}
                      disabled={checking}
                      className="px-8 py-4 border border-[#2A5C58] text-[#2A5C58] rounded-full font-bold hover:bg-[#E6F0EF] transition disabled:opacity-50"
                    >
                      {checking ? 'جاري التحقق...' : 'التحقق من حالة الطلب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-8 py-4 border border-gray-200 text-[#2A5C58] rounded-full font-bold hover:bg-gray-50 transition"
                    >
                      تحديث الوثائق
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    navigate(therapist?.isVerified ? '/doctor/dashboard' : '/auth')
                  }
                  className="px-10 py-4 bg-[#2A5C58] text-white rounded-full font-bold hover:bg-[#1f4a46] transition shadow-lg hover:shadow-xl"
                >
                  {therapist?.isVerified
                    ? 'الذهاب إلى لوحة التحكم'
                    : 'العودة إلى صفحة تسجيل الدخول'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, label, active }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-[#2A5C58]' : 'text-gray-400'}`}>
    <span className="text-sm font-medium">{label}</span>
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        active ? 'bg-[#2A5C58] text-white' : 'bg-gray-200'
      }`}
    >
      {number}
    </div>
  </div>
);

export default Verification;
