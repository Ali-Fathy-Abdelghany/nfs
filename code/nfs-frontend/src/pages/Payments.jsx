import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Star, 
  Sparkles,
  PartyPopper,
  ArrowUpRight
} from 'lucide-react';
import { createPayment, confirmPayment, verifyPayment, isHostedCheckoutUrl } from '../api/payments';
import { fetchDoctorAvailability, fetchPatientAppointments } from '../api/appointments';
import { fetchTherapistById } from '../api/therapists';
import { useAuth } from '../context/AuthContext';
import { ensurePatientRecord } from '../api/patientHelpers';
import { useToast } from '../context/ToastContext';
import { getRoleHomePath } from '../api/config';
import BundleSlotPicker from '../components/booking/BundleSlotPicker';
import { doctorAvatarUrl } from '../utils/doctorAvatar';

const CHECKOUT_STATE_KEY = 'nafs_checkout_state';

/** Survives StrictMode remounts (refs reset); sessionStorage survives full remount. */
const toastedPaymentIds = new Set();

function paymentToastKey(paymentId) {
  return `nafs_pay_toast_${paymentId}`;
}

function payDoneKey(paymentId) {
  return `nafs_pay_done_${paymentId}`;
}

function savePayDone(paymentId, payload) {
  if (!paymentId) return;
  try {
    sessionStorage.setItem(payDoneKey(paymentId), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function loadPayDone(paymentId) {
  if (!paymentId) return null;
  try {
    const raw = sessionStorage.getItem(payDoneKey(paymentId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Claim once — returns true only for the first caller for this paymentId. */
function claimPaymentSuccessToast(paymentId) {
  if (!paymentId) return false;
  const key = paymentToastKey(paymentId);
  if (toastedPaymentIds.has(paymentId)) return false;
  try {
    if (sessionStorage.getItem(key) === '1') {
      toastedPaymentIds.add(paymentId);
      return false;
    }
    sessionStorage.setItem(key, '1');
  } catch {
    /* private mode — fall through with in-memory set only */
  }
  toastedPaymentIds.add(paymentId);
  return true;
}

function readPaymentAmount(payment) {
  if (!payment) return null;
  const raw = payment.amount ?? payment.Amount;
  if (raw == null || Number.isNaN(Number(raw))) return null;
  return Number(raw);
}

function readCheckoutSnapshot() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCheckoutSnapshot(payload) {
  try {
    sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function formatSlotDate(startTime) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatSlotTime(startTime) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function slotDurationLabel(slot) {
  if (!slot?.startTime || !slot?.endTime) return '50 دقيقة';
  const mins = Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / 60000);
  return `${mins > 0 ? mins : 50} دقيقة`;
}

function hasRealDoctorName(doctor) {
  const name = (doctor?.name || '').trim();
  return Boolean(name) && name !== 'معالج' && !name.includes('undefined');
}

function mapTherapistToDoctorData(t, prev = {}, slot = null) {
  const therapistId = t.therapistId ?? t.TherapistId ?? prev.therapistId ?? prev.id;
  const firstName = t.firstName ?? t.FirstName ?? '';
  const lastName = t.lastName ?? t.LastName ?? '';
  const fullName = `د. ${firstName} ${lastName}`.trim();
  const rate = Number(t.hourlyRate ?? t.HourlyRate ?? prev.hourlyRate) || 250;
  const ratingNum = Number(t.rating ?? t.Rating);
  const specialization = t.specialization ?? t.Specialization ?? prev.title ?? prev.specialty ?? '';
  const image =
    t.profileImageUrl ||
    t.ProfileImageUrl ||
    prev.avatar ||
    prev.image ||
    doctorAvatarUrl(therapistId);

  return {
    ...prev,
    id: therapistId,
    therapistId,
    name: firstName || lastName ? fullName : prev.name || 'معالج',
    title: specialization,
    specialty: specialization,
    rating: Number.isFinite(ratingNum) && ratingNum > 0
      ? ratingNum.toFixed(1)
      : prev.rating ?? '—',
    reviews: t.reviewCount ?? t.ReviewCount ?? prev.reviews ?? prev.reviewCount ?? 0,
    reviewCount: t.reviewCount ?? t.ReviewCount ?? prev.reviewCount ?? 0,
    hourlyRate: rate,
    avatar: image,
    image,
    bio: t.bio ?? t.Bio ?? prev.bio ?? '',
    date: prev.date || formatSlotDate(slot?.startTime) || '—',
    time: prev.time || formatSlotTime(slot?.startTime) || '—',
    duration: prev.duration || slotDurationLabel(slot),
  };
}

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth() || {};
  const toast = useToast();
  const successNotifiedRef = useRef(false);

  const savedCheckout = readCheckoutSnapshot();
  const initialDoctor =
    location.state?.doctorData ||
    savedCheckout?.doctorData ||
    null;
  const initialSlot = location.state?.slot || savedCheckout?.slot || null;
  const initialAppointmentId =
    location.state?.appointmentId || savedCheckout?.appointmentId || null;

  const [doctorInfo, setDoctorInfo] = useState(() =>
    initialDoctor
      ? mapTherapistToDoctorData(initialDoctor, initialDoctor, initialSlot)
      : {
          name: 'معالج',
          title: '',
          rating: '—',
          reviews: 0,
          date: formatSlotDate(initialSlot?.startTime) || '—',
          time: formatSlotTime(initialSlot?.startTime) || '—',
          duration: slotDurationLabel(initialSlot),
          avatar: doctorAvatarUrl(null),
          hourlyRate: 250,
        }
  );
  const [restoredSlot, setRestoredSlot] = useState(initialSlot);
  const [restoredAppointmentId, setRestoredAppointmentId] = useState(initialAppointmentId);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(
    () => location.state?.selectedPlan || savedCheckout?.selectedPlan || 'single'
  );

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [awaitingPaymob, setAwaitingPaymob] = useState(false);
  const [bundleSlots, setBundleSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [paidTotal, setPaidTotal] = useState(null);

  const sessionPrice = Number(doctorInfo?.hourlyRate) || 250;
  const durationLabel = doctorInfo?.duration || '50 دقيقة';
  const doctorId = doctorInfo?.therapistId || doctorInfo?.id || null;
  const primarySlotId = restoredSlot?.id || restoredSlot?.slotId || null;
  const bundleReady = selectedPlan !== 'monthly' || bundleSlots.length === 3;

  // Persist checkout context as soon as we have it (refresh / Paymob return).
  useEffect(() => {
    if (!doctorInfo && !restoredAppointmentId) return;
    writeCheckoutSnapshot({
      doctorData: doctorInfo,
      slot: restoredSlot,
      appointmentId: restoredAppointmentId,
      selectedPlan,
      hourlyRate: sessionPrice,
    });
  }, [doctorInfo, restoredSlot, restoredAppointmentId, selectedPlan, sessionPrice]);

  // Load therapist (+ appointment slot) from backend when nav state is incomplete.
  useEffect(() => {
    let cancelled = false;

    async function hydrateFromBackend() {
      let nextDoctorId = doctorId;
      let nextSlot = restoredSlot;
      let nextAppointmentId = restoredAppointmentId;

      // Resolve appointment → doctorId / slot times when finishing unpaid bookings.
      if ((!nextDoctorId || !nextSlot?.startTime) && nextAppointmentId && user) {
        try {
          let patientId = user.patientId;
          if (!patientId && (user.userId || user.id)) {
            patientId = await ensurePatientRecord(user.userId || user.id);
          }
          if (patientId) {
            const res = await fetchPatientAppointments(patientId);
            const appt = (res.data || []).find(
              (a) => Number(a.id || a.appointmentId) === Number(nextAppointmentId)
            );
            if (appt) {
              nextDoctorId = appt.doctorId || appt.therapistId || nextDoctorId;
              if (!nextSlot?.startTime && appt.scheduledStartTime) {
                nextSlot = {
                  id: appt.slotId,
                  slotId: appt.slotId,
                  startTime: appt.scheduledStartTime,
                  endTime: appt.scheduledEndTime || appt.scheduledStartTime,
                };
                if (!cancelled) setRestoredSlot(nextSlot);
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (!nextDoctorId) return;
      if (hasRealDoctorName(doctorInfo) && Number(doctorInfo.hourlyRate) > 0) {
        // Still refresh rates/avatar from API quietly when possible
      }

      setDoctorLoading(true);
      try {
        const res = await fetchTherapistById(nextDoctorId);
        if (cancelled || !res.data) return;
        setDoctorInfo((prev) => mapTherapistToDoctorData(res.data, prev, nextSlot));
      } catch (err) {
        console.error(err);
        if (!cancelled && !hasRealDoctorName(doctorInfo)) {
          toast.error('تعذر تحميل بيانات المعالج');
        }
      } finally {
        if (!cancelled) setDoctorLoading(false);
      }
    }

    hydrateFromBackend();
    return () => {
      cancelled = true;
    };
    // Intentionally once on mount / when ids change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, restoredAppointmentId, user?.patientId, user?.userId, user?.id]);

  useEffect(() => {
    if (selectedPlan !== 'monthly' || !doctorId) {
      setAvailableSlots([]);
      return undefined;
    }
    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const res = await fetchDoctorAvailability(doctorId);
        if (!cancelled) setAvailableSlots(res.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setAvailableSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [selectedPlan, doctorId]);

  useEffect(() => {
    if (selectedPlan !== 'monthly') setBundleSlots([]);
  }, [selectedPlan]);

  const originalBundlePrice = sessionPrice * 4;
  const offerBundlePrice = Math.round(sessionPrice * 3.2);

  const planDetails = {
    single: {
      price: sessionPrice,
      originalPrice: null,
      label: "جلسة استشارية",
      desc: `جلسة فردية لمدة ${durationLabel} مع اخصائي معتمد.`,
      invoiceLabel: 'سعر الجلسة',
    },
    monthly: {
      price: offerBundlePrice,
      originalPrice: originalBundlePrice,
      label: "4 جلسات شهرياً",
      desc: "متابعة مستمرة مع أولوية الحجز وجلسات طوارئ — وفّر مقارنة بشراء ٤ جلسات منفصلة.",
      invoiceLabel: 'باقة ٤ جلسات',
    },
  };

  const currentPrice = planDetails[selectedPlan].price;
  const total = currentPrice;
  const displayTotal = paidTotal != null ? paidTotal : total;

  // Restore booking UI state after Paymob redirect, verify once (retry once), then stop.
  useEffect(() => {
    let savedPlan = null;
    let savedTotal = null;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.selectedPlan) {
          savedPlan = saved.selectedPlan;
          setSelectedPlan(saved.selectedPlan);
        }
        if (Array.isArray(saved?.bundleSlots)) setBundleSlots(saved.bundleSlots);
        if (saved?.paidTotal != null) {
          savedTotal = Number(saved.paidTotal);
          setPaidTotal(savedTotal);
        } else if (saved?.selectedPlan === 'monthly' && saved?.hourlyRate) {
          savedTotal = Math.round(Number(saved.hourlyRate) * 3.2);
          setPaidTotal(savedTotal);
        } else if (saved?.selectedPlan === 'single' && saved?.hourlyRate) {
          savedTotal = Number(saved.hourlyRate);
          setPaidTotal(savedTotal);
        }
      }
    } catch {
      /* ignore */
    }

    const paymentId = searchParams.get('paymentId');
    const paidFlag = searchParams.get('paid');
    const txId = searchParams.get('tx');
    if (!paymentId) return undefined;

    let cancelled = false;
    const redirectSaysPaid = paidFlag === '1' || paidFlag === 'true';

    const applySuccessUi = (amountFromPayment, planHint) => {
      const done = loadPayDone(paymentId);
      const amount =
        amountFromPayment != null && !Number.isNaN(Number(amountFromPayment))
          ? Number(amountFromPayment)
          : done?.paidTotal != null
            ? Number(done.paidTotal)
            : savedTotal;
      if (amount != null && !Number.isNaN(Number(amount))) {
        setPaidTotal(Number(amount));
      }
      const plan = planHint || done?.selectedPlan || savedPlan;
      if (plan === 'single' || plan === 'monthly') {
        setSelectedPlan(plan);
      }
      setPaymentSuccess(true);
      successNotifiedRef.current = true;
      savePayDone(paymentId, {
        paidTotal: amount ?? done?.paidTotal ?? null,
        selectedPlan: plan || done?.selectedPlan || 'single',
      });
      try {
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
      } catch {
        /* ignore */
      }
      setSearchParams({}, { replace: true });
    };

    // Already confirmed on a prior mount (StrictMode / refresh) — restore UI, no second toast.
    if (toastedPaymentIds.has(paymentId) || sessionStorage.getItem(paymentToastKey(paymentId)) === '1') {
      applySuccessUi(savedTotal, savedPlan);
      return undefined;
    }

    const markSuccess = (amountFromPayment) => {
      if (cancelled) return;
      const shouldToast = claimPaymentSuccessToast(paymentId);
      applySuccessUi(amountFromPayment, savedPlan);
      if (shouldToast) {
        toast.success('تم تأكيد الدفع بنجاح');
      }
    };

    async function tryVerifyOnce() {
      const verifyRes = await verifyPayment(paymentId, txId ? { transactionId: txId } : {});
      return verifyRes.data;
    }

    async function syncAndPoll() {
      if (successNotifiedRef.current) return;
      setAwaitingPaymob(true);
      setPaying(true);
      setPaymentError('');
      try {
        let payment = null;
        try {
          payment = await tryVerifyOnce();
          if (String(payment?.status).toLowerCase() === 'paid') {
            markSuccess(readPaymentAmount(payment) ?? savedTotal);
            return;
          }
          if (String(payment?.status).toLowerCase() === 'failed') {
            setPaymentError('فشلت عملية الدفع. يمكنك المحاولة مرة أخرى.');
            toast.error('فشل الدفع');
            return;
          }
        } catch (err) {
          console.error(err);
        }

        if (redirectSaysPaid || txId) {
          await new Promise((r) => setTimeout(r, 1200));
          if (cancelled || successNotifiedRef.current) return;
          try {
            payment = await tryVerifyOnce();
            if (String(payment?.status).toLowerCase() === 'paid') {
              markSuccess(readPaymentAmount(payment) ?? savedTotal);
              return;
            }
            if (String(payment?.status).toLowerCase() === 'failed') {
              setPaymentError('فشلت عملية الدفع. يمكنك المحاولة مرة أخرى.');
              toast.error('فشل الدفع');
              return;
            }
          } catch (err) {
            console.error(err);
          }
        }

        if (!cancelled && !successNotifiedRef.current) {
          const status = payment?.status || 'Pending';
          setPaymentError(
            `حالة الدفع: ${status}. إن أتممت الدفع على Paymob، حدّث الصفحة أو أعد المحاولة بعد لحظات.`
          );
          toast.error('تعذر تأكيد الدفع تلقائياً');
        }
      } catch (err) {
        if (!cancelled) {
          setPaymentError(err.response?.data?.message || err.message || 'تعذر التحقق من حالة الدفع');
          toast.error('تعذر التحقق من حالة الدفع');
        }
      } finally {
        if (!cancelled) {
          setPaying(false);
          setAwaitingPaymob(false);
        }
      }
    }

    syncAndPoll();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameChange = (e) => {
    const value = e.target.value;
    const onlyLetters = value.replace(/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    setCardName(onlyLetters);
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || ''; 
    setCardNumber(formattedValue);
  };

  // منع الحروف في الـ CVV وتحديد الطول بـ 3 أرقام فقط
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const createCheckout = async () => {
    let patientId = user?.patientId;
    const userId = user?.userId || user?.id;
    if (!patientId && userId) {
      patientId = await ensurePatientRecord(userId);
    }
    if (!patientId) {
      throw new Error('يرجى تسجيل الدخول أولاً');
    }

    const doctorId = doctorInfo.therapistId || doctorInfo.id || null;
    const createRes = await createPayment({
      patientId,
      doctorId,
      appointmentId: restoredAppointmentId || location.state?.appointmentId || null,
      amount: total,
      currency: 'EGP',
      planType: selectedPlan,
      additionalSlotIds:
        selectedPlan === 'monthly' ? bundleSlots.map((s) => s.id) : undefined,
    });

    const payment = createRes.data;
    if (!payment?.id) throw new Error('لم يتم إنشاء عملية الدفع');
    return payment;
  };

  /** Primary path: create Paymob intention and redirect to unified checkout. */
  const handlePaymobCheckout = async () => {
    setPaymentError('');
    if (!bundleReady) {
      toast.warning('اختر ٣ مواعيد إضافية لإكمال الباقة الشهرية');
      return;
    }
    try {
      setPaying(true);
      const payment = await createCheckout();

      if (isHostedCheckoutUrl(payment.checkoutUrl)) {
        sessionStorage.setItem(
          CHECKOUT_STATE_KEY,
          JSON.stringify({
            selectedPlan,
            doctorData: doctorInfo,
            slot: restoredSlot,
            appointmentId: restoredAppointmentId || location.state?.appointmentId || null,
            bundleSlots,
            paymentId: payment.id,
            paidTotal: total,
            hourlyRate: sessionPrice,
          })
        );
        window.location.assign(payment.checkoutUrl);
        return;
      }

      // Fake gateway fallback (no Paymob keys): confirm locally without card fields.
      await confirmPayment(payment.id, {});
      setPaidTotal(total);
      setPaymentSuccess(true);
      successNotifiedRef.current = true;
      savePayDone(payment.id, { paidTotal: total, selectedPlan });
      if (claimPaymentSuccessToast(payment.id)) {
        toast.success('تم تأكيد الدفع (وضع تجريبي)');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'فشل الدفع، حاول مرة أخرى';
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  /** Legacy fake card form — only used when explicitly submitting the fallback form. */
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error("رجاءً أدخلي رقم بطاقة صحيح مكون من 16 رقماً");
      return;
    }
    if (cvv.length < 3) {
      toast.error("رجاءً أدخلي رمز CVV صحيح مكون من 3 أرقام");
      return;
    }
    if (!bundleReady) {
      toast.warning('اختر ٣ مواعيد إضافية لإكمال الباقة الشهرية');
      return;
    }

    try {
      setPaying(true);
      const payment = await createCheckout();

      if (isHostedCheckoutUrl(payment.checkoutUrl)) {
        sessionStorage.setItem(
          CHECKOUT_STATE_KEY,
          JSON.stringify({
            selectedPlan,
            doctorData: doctorInfo,
            slot: restoredSlot,
            appointmentId: restoredAppointmentId || location.state?.appointmentId || null,
            bundleSlots,
            paymentId: payment.id,
            paidTotal: total,
            hourlyRate: sessionPrice,
          })
        );
        window.location.assign(payment.checkoutUrl);
        return;
      }

      await confirmPayment(payment.id, {
        cardToken: cardNumber.replace(/\s/g, '').slice(-4),
      });

      setPaidTotal(total);
      setPaymentSuccess(true);
      successNotifiedRef.current = true;
      savePayDone(payment.id, { paidTotal: total, selectedPlan });
      if (claimPaymentSuccessToast(payment.id)) {
        toast.success('تم تأكيد الدفع بنجاح');
      }
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || err.message || 'فشل الدفع، حاول مرة أخرى');
    } finally {
      setPaying(false);
    }
  };

  // التوجيه لصفحة جلساتي عند تأكيد النجاح
  const handleGoToMySessions = () => {
    navigate('/sessions', {
      state: {
        bookedDoctor: doctorInfo,
        plan: planDetails[selectedPlan],
        slot: restoredSlot,
      },
    });
  };

  return (
    <div className="bg-[#F7FAFA] min-h-screen text-right font-sans antialiased pb-20 relative">
      
      {/* الهيدر العلوي */}
      <header className="bg-transparent py-10 px-6 md:px-16 flex justify-between items-center flex-row-reverse">
        <div
          className="flex flex-row-reverse items-center gap-2.5 cursor-pointer"
          onClick={() => {
            const homePath = getRoleHomePath(localStorage.getItem('userRole'), { isAuthenticated });
            navigate(homePath, homePath === '/dashboard' || homePath === '/doctor/dashboard'
              ? { state: { targetTab: 'home' } }
              : undefined);
          }}
          role="link"
          title="الرئيسية"
        >
          <img 
            src="/nafs_icon.png" 
            alt="Nafs Logo" 
            className="w-15 h-15 object-contain"
          />
          <span className="text-5xl font-black text-[#316764] tracking-tight">نفس</span>
        </div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 text-[#404847] hover:text-[#316764] hover:bg-[#316764]/5 transition-all rounded-full border border-neutral-200/60 bg-white shadow-sm"
          title="العودة للخلف"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-12 mt-4">
        
        {/* قسم العناوين */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex flex-row-reverse items-center justify-center gap-2.5 bg-[#316764]/5 px-5 py-2 rounded-full border border-[#316764]/10">
            <Sparkles className="w-15h-15 text-[#0D9488]" />
            <h1 className="text-8xl md:text-3xl font-black text-[#181C1D] tracking-tight">تأكيد اشتراكك</h1>
          </div>
          <p className="text-xs md:text-sm text-[#707978] max-w-lg mx-auto leading-relaxed font-medium">
            أدارك وقتك، تخير التوقيت المناسب، اختر الخطة المناسبة لك وأكمل عملية الدفع بأمان وسرية تامة.
          </p>
        </div>

        {/* توزيع الأعمدة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* العمود الأيسر: ملخص الحجز */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
            <div className="bg-[#F1F4F4] rounded-[32px] p-6 space-y-6 border border-[#BFC8C7]/20 shadow-sm">
              <h3 className="text-xs font-bold text-[#404847] text-center tracking-wide">ملخص الحجز</h3>
              
              {/* كارت الطبيب الديناميكي */}
              <div className="bg-white rounded-[24px] p-4 border border-[#BFC8C7]/10 shadow-sm flex flex-row-reverse items-center gap-4">
                <img src={doctorInfo.avatar} alt={doctorInfo.name} className="w-14 h-14 rounded-full object-cover border border-[#BFC8C7]/40" />
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-base font-bold text-[#181C1D]">
                    {doctorLoading && !hasRealDoctorName(doctorInfo) ? 'جاري تحميل المعالج…' : doctorInfo.name}
                  </h4>
                  <p className="text-xs text-[#707978] font-medium">{doctorInfo.title || '—'}</p>
                  <div className="flex flex-row-reverse items-center justify-end gap-1 text-[11px] font-bold text-amber-500 pt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-[#181C1D]">{doctorInfo.rating}</span>
                    <span className="text-[#707978]">({doctorInfo.reviews})</span>
                  </div>
                </div>
              </div>

              {/* تفاصيل الميعاد */}
              <div className="space-y-3 text-xs text-[#404847] px-2 font-medium">
                <div className="flex flex-row-reverse justify-between items-center">
                  <span className="text-[#707978]">التاريخ والوقت</span>
                  <div className="flex flex-row-reverse items-center gap-1 font-bold text-[#181C1D]">
                    <Calendar className="w-3.5 h-3.5 text-[#316764]" />
                    <span>{doctorInfo.date}</span>
                    <span className="mx-1 text-[#BFC8C7]">•</span>
                    <Clock className="w-3.5 h-3.5 text-[#316764]" />
                    <span>{doctorInfo.time}</span>
                  </div>
                </div>
                <div className="flex flex-row-reverse justify-between items-center">
                  <span className="text-[#707978]">مدة الجلسة</span>
                  <span className="font-bold text-[#181C1D]">{doctorInfo.duration}</span>
                </div>
              </div>

              {/* الفاتورة */}
              <div className="border-t border-[#BFC8C7]/30 pt-4 space-y-3 text-xs font-semibold px-2">
                <div className="flex flex-row-reverse justify-between items-center text-[#404847]">
                  <span className="text-[#707978]">{planDetails[selectedPlan].invoiceLabel}</span>
                  <span className="flex items-center gap-2">
                    {selectedPlan === 'monthly' && !paymentSuccess && (
                      <span className="text-[#BFC8C7] line-through font-medium">
                        {originalBundlePrice} ج.م
                      </span>
                    )}
                    <span className="font-bold text-[#181C1D]">{displayTotal} ج.م</span>
                  </span>
                </div>
                <div className="flex flex-row-reverse justify-between items-center text-[#404847]">
                  <span className="text-[#707978]">رسوم الخدمة</span>
                  <span>0.00 ج.م</span>
                </div>
                
                <div className="flex flex-row-reverse justify-between items-center text-xl font-bold text-[#181C1D] pt-4 border-t border-dashed border-[#BFC8C7]/60">
                  <span>{paymentSuccess ? 'المبلغ المدفوع' : 'المجموع'}</span>
                  <span className="text-[#316764] font-mono">{displayTotal} ج.م</span>
                </div>
              </div>

              {/* جملة التحفيز */}
              <div className="bg-white/90 border border-[#BFC8C7]/20 text-[#316764] p-4 rounded-[20px] text-[11px] font-bold text-center leading-relaxed shadow-sm">
                "أفضل استثمار هو الاستثمار في صحتك النفسية، نحن هنا لنرافقك في كل خطوة."
              </div>
            </div>

            {/* رسالة الأمان */}
            <div className="flex flex-row-reverse items-start gap-2 px-4 text-[11px] text-[#707978] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#316764] shrink-0 mt-0.5" />
              <p>اتصال آمن وسرية تامة لبياناتك وصحتك النفسية بالكامل. يمكنك إلغاء الحجز أو تعديل الموعد قبل 24 ساعة من موعد الجلسة المحددة.</p>
            </div>
          </div>

          {/* العمود الأيمن: التغيير الذكي المتناسق مع محتوى الصفحة */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {!paymentSuccess ? (
                // 1. واجهة إدخال بيانات الدفع الحالية
                <motion.div
                  key="payment-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* اختيار نوع الاشتراك */}
                  <div className="bg-white rounded-[32px] border border-[#F1F4F4] p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-[#707978]">اختر نوع الاشتراك</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* كارت: جلسة واحدة */}
                      <div 
                        onClick={() => setSelectedPlan('single')}
                        className={`p-5 rounded-[24px] border-2 text-right space-y-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === 'single' 
                          ? 'border-[#316764] bg-[#83B9B5]/10 shadow-sm' 
                          : 'border-neutral-100 hover:border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-row-reverse justify-between items-center">
                          <span className="text-[10px] bg-neutral-100 text-[#404847] font-bold px-2 py-0.5 rounded-md">جلسة واحدة</span>
                          {selectedPlan === 'single' && <CheckCircle2 className="w-4 h-4 text-[#316764]" />}
                        </div>
                        <h4 className="font-bold text-base text-[#181C1D]">{planDetails.single.label}</h4>
                        <p className="text-[11px] text-[#707978] font-medium leading-relaxed">{planDetails.single.desc}</p>
                        <div className="pt-2 text-base font-bold text-[#316764] font-mono">{planDetails.single.price} ج.م</div>
                      </div>

                      {/* كارت: باقة شهرية */}
                      <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-5 rounded-[24px] border-2 text-right space-y-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === 'monthly' 
                          ? 'border-[#316764] bg-[#83B9B5]/10 shadow-sm' 
                          : 'border-neutral-100 hover:border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-row-reverse justify-between items-center">
                          <span className="text-[10px] bg-[#83B9B5]/20 text-[#316764] font-bold px-2 py-0.5 rounded-md">الباقة الشهرية</span>
                          {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-[#316764]" />}
                        </div>
                        <h4 className="font-bold text-base text-[#181C1D]">{planDetails.monthly.label}</h4>
                        <p className="text-[11px] text-[#707978] font-medium leading-relaxed">{planDetails.monthly.desc}</p>
                        <div className="pt-2 flex items-baseline justify-end gap-2 flex-wrap">
                          <span className="text-sm text-[#BFC8C7] line-through font-mono">
                            {planDetails.monthly.originalPrice} ج.م
                          </span>
                          <span className="text-base font-bold text-[#316764] font-mono">
                            {planDetails.monthly.price} ج.م
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            وفر {planDetails.monthly.originalPrice - planDetails.monthly.price} ج.م
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedPlan === 'monthly' && (
                      <div className="pt-2 border-t border-[#F1F4F4]">
                        {slotsLoading ? (
                          <p className="text-xs text-[#707978]">جاري تحميل المواعيد المتاحة...</p>
                        ) : (
                          <BundleSlotPicker
                            slots={availableSlots}
                            needed={3}
                            selectedSlots={bundleSlots}
                            onChange={setBundleSlots}
                            excludedSlotIds={primarySlotId ? [primarySlotId] : []}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* دفع عبر Paymob (أو الوضع التجريبي إن لم تُضبط المفاتيح) */}
                  <div className="bg-white rounded-[32px] border border-[#F1F4F4] p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-[#181C1D] pb-1">إتمام الدفع بأمان</h3>
                    <p className="text-xs text-[#707978] leading-relaxed font-medium text-right">
                      سيتم تحويلك إلى صفحة الدفع الآمنة من Paymob لإدخال بيانات البطاقة. لا نحتفظ ببيانات بطاقتك على خوادمنا.
                    </p>

                    {awaitingPaymob && (
                      <p className="text-xs text-[#316764] font-bold text-center">جاري التحقق من نتيجة الدفع...</p>
                    )}
                    {paymentError && (
                      <p className="text-xs text-rose-600 font-bold text-center">{paymentError}</p>
                    )}

                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: paying ? 1 : 1.01, filter: "brightness(1.04)" }}
                        whileTap={{ scale: paying ? 1 : 0.99 }}
                        type="button"
                        onClick={handlePaymobCheckout}
                        disabled={paying || !bundleReady}
                        className="w-full bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white font-bold py-4 rounded-full shadow-lg shadow-[#316764]/20 transition-all text-sm tracking-wide cursor-pointer disabled:opacity-60"
                      >
                        {paying
                          ? 'جاري التحضير للدفع...'
                          : !bundleReady
                            ? 'اختر ٣ مواعيد إضافية أولاً'
                            : 'الدفع عبر Paymob'}
                      </motion.button>
                    </div>

                    <div className="flex justify-center items-center gap-6 pt-4 text-[10px] text-[#707978] font-bold border-t border-neutral-100">
                      <span>🔒 PCI-DSS</span>
                      <span>🛡️ HI-PAA COMPLIANT</span>
                      <span>⚡ SSL SECURE</span>
                    </div>
                  </div>

                  {/* نموذج البطاقة الاحتياطي (FakeGateway فقط عند غياب مفاتيح Paymob) */}
                  <details className="bg-white rounded-[32px] border border-[#F1F4F4] p-6 shadow-sm">
                    <summary className="text-xs font-bold text-[#707978] cursor-pointer text-right">
                      وضع تجريبي — إدخال بطاقة محلي (بدون Paymob)
                    </summary>
                    <form onSubmit={handleSubmitPayment} className="mt-5 space-y-5">
                      <h3 className="text-sm font-bold text-[#181C1D] pb-1">تفاصيل البطاقة البنكية</h3>
                      
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs font-bold text-[#404847]">اسم حامل البطاقة</label>
                        <input 
                          type="text" 
                          value={cardName}
                          onChange={handleNameChange}
                          placeholder="الاسم كما يظهر على البطاقة (حروف فقط)" 
                          className="w-full text-right text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] px-4 py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all text-[#181C1D] font-medium shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5 text-right relative">
                        <label className="text-xs font-bold text-[#404847]">رقم البطاقة</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength="19" 
                            placeholder="0000 0000 0000 0000" 
                            className="w-full text-left font-mono text-sm bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all tracking-widest text-[#181C1D] shadow-inner"
                          />
                          <CreditCard className="w-4 h-4 text-[#707978] absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-right">
                          <label className="text-xs font-bold text-[#404847]">تاريخ الانتهاء</label>
                          <input 
                            type="month" 
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full text-center font-mono text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] px-3 py-3 focus:outline-none focus:border-[#316764] focus:bg-white transition-all font-bold text-[#181C1D] shadow-inner cursor-pointer"
                          />
                        </div>
                        
                        <div className="space-y-1.5 text-right">
                          <label className="text-xs font-bold text-[#404847]">الرمز (CVV)</label>
                          <input 
                            type="text" 
                            value={cvv}
                            onChange={handleCvvChange}
                            placeholder="123" 
                            className="w-full text-center font-mono text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all font-bold text-[#181C1D] shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: paying ? 1 : 1.01, filter: "brightness(1.04)" }}
                          whileTap={{ scale: paying ? 1 : 0.99 }}
                          type="submit"
                          disabled={paying}
                          className="w-full bg-[#404847] text-white font-bold py-4 rounded-full transition-all text-sm tracking-wide cursor-pointer disabled:opacity-60"
                        >
                          {paying ? 'جاري تأكيد الدفع...' : 'تأكيد تجريبي'}
                        </motion.button>
                      </div>
                    </form>
                  </details>
                </motion.div>
              ) : (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="bg-white rounded-[32px] border-2 border-[#316764]/20 p-8 shadow-xl text-center space-y-6"
                >
                  <div className="mx-auto w-16 h-16 bg-[#316764]/10 rounded-full flex items-center justify-center text-[#316764] animate-bounce">
                    <PartyPopper className="w-8 h-8 text-[#0D9488]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#181C1D]">تم تأكيد الاشتراك بنجاح!</h2>
                    <p className="text-xs text-[#707978] leading-relaxed font-medium max-w-md mx-auto">
                      مبارك! قمنا بتأكيد حجز جلستك مع <span className="font-bold text-[#316764]">{doctorInfo.name}</span> وتأمين خطتك العلاجية بنجاح. يمكنك متابعة الموعد في أي وقت.
                    </p>
                  </div>

                  {/* مراجعة تفاصيل الحجز */}
                  <div className="bg-[#F7FAFA] rounded-2xl p-5 border border-[#BFC8C7]/20 text-right space-y-3 text-xs font-bold text-[#404847]">
                    <div className="flex flex-row-reverse justify-between items-center border-b border-neutral-200/50 pb-2.5">
                      <span className="text-[#707978]">نوع الاشتراك:</span>
                      <span className="text-[#316764]">{planDetails[selectedPlan].label}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center border-b border-neutral-200/50 pb-2.5">
                      <span className="text-[#707978]">المبلغ المدفوع:</span>
                      <span className="text-[#316764] font-mono text-sm">{displayTotal} ج.م</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-[#707978]">الموعد المثبت:</span>
                      <span>{doctorInfo.date} • {doctorInfo.time}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoToMySessions}
                      className="w-full bg-[#316764] hover:bg-[#254f4d] text-white font-bold py-4 rounded-full shadow-lg shadow-[#316764]/10 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer flex-row-reverse"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>الانتقال إلى جلساتي الآن</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}