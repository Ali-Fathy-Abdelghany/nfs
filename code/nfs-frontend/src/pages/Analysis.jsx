import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { fetchPatientsByDoctor } from '../api/patients';
import { fetchDoctorAppointments } from '../api/appointments';
import { fetchTherapistByUserId } from '../api/therapists';
import { fetchTherapistReviewSummary } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#316764', '#83B9B5', '#a6cec5', '#DB778D', '#C4A574', '#6B8F9E'];

const CONDITION_BUCKETS = [
  { key: 'قلق', match: /قلق|anxiety|panic|رعب/i },
  { key: 'اكتئاب', match: /اكتئاب|depress|حزن|يأس/i },
  { key: 'توتر', match: /توتر|stress|ضغط/i },
  { key: 'علاقات', match: /علاق|زواج|أسرة|family|couple/i },
  { key: 'أخرى', match: null },
];

function normalizeStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'confirmed' || s === 'مؤكدة') return 'confirmed';
  if (s === 'completed' || s === 'منتهية' || s === 'complete') return 'completed';
  if (s === 'cancelled' || s === 'canceled' || s === 'ملغاة') return 'cancelled';
  if (s === 'pending' || s === 'بانتظار الدفع') return 'pending';
  return s || 'other';
}

function isHeld(appt) {
  const st = normalizeStatus(appt.status);
  if (st === 'completed') return true;
  if (st === 'confirmed' && appt.scheduledStartTime) {
    return new Date(appt.scheduledStartTime).getTime() < Date.now();
  }
  return Boolean(appt.actualEndTime || appt.actualStartTime);
}

function weekLabel(date) {
  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}

function buildWeeklySeries(appointments, days = 28) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const buckets = [];
  for (let i = 0; i < 4; i += 1) {
    const from = new Date(start);
    from.setDate(start.getDate() + i * 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 7);
    buckets.push({
      name: `أ${i + 1}`,
      label: weekLabel(from),
      from,
      to,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
    });
  }

  appointments.forEach((a) => {
    const t = new Date(a.scheduledStartTime || a.createdAt);
    if (Number.isNaN(t.getTime()) || t < start) return;
    const bucket = buckets.find((b) => t >= b.from && t < b.to);
    if (!bucket) return;
    const st = normalizeStatus(a.status);
    if (st === 'confirmed') bucket.confirmed += 1;
    else if (st === 'completed') bucket.completed += 1;
    else if (st === 'cancelled') bucket.cancelled += 1;
    else if (st === 'pending') bucket.pending += 1;
  });

  return buckets.map((b) => ({
    name: b.name,
    label: b.label,
    منعقدة: b.confirmed + b.completed,
    ملغاة: b.cancelled,
    معلقة: b.pending,
  }));
}

function buildConditionDistribution(patients) {
  const counts = Object.fromEntries(CONDITION_BUCKETS.map((c) => [c.key, 0]));
  patients.forEach((p) => {
    const text = `${p.medicalHistory || ''} ${p.notes || ''}`.trim();
    if (!text) {
      counts['أخرى'] += 1;
      return;
    }
    const hit = CONDITION_BUCKETS.find((c) => c.match && c.match.test(text));
    counts[hit ? hit.key : 'أخرى'] += 1;
  });
  const total = patients.length || 1;
  return CONDITION_BUCKETS.map((c) => ({
    name: c.key,
    value: counts[c.key],
    pct: Math.round((counts[c.key] / total) * 100),
  })).filter((c) => c.value > 0);
}

function StatSkeleton() {
  return <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />;
}

function Analysis() {
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [rating, setRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [rangeLabel] = useState('آخر 30 يوم');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        let doctorId = user?.therapistId;
        if (!doctorId && user?.userId) {
          const t = await fetchTherapistByUserId(user.userId);
          doctorId = t.data?.therapistId;
        }
        if (!doctorId) {
          if (!cancelled) {
            setPatients([]);
            setAppointments([]);
          }
          return;
        }

        const [patientsRes, apptsRes, summaryRes] = await Promise.all([
          fetchPatientsByDoctor(doctorId),
          fetchDoctorAppointments(doctorId),
          fetchTherapistReviewSummary(doctorId).catch(() => null),
        ]);

        if (cancelled) return;

        setPatients(patientsRes.data || []);
        setAppointments(apptsRes.data || []);

        const summary = summaryRes?.data;
        if (summary) {
          const avg = Number(summary.averageRating ?? summary.AverageRating);
          setRating(Number.isFinite(avg) && avg > 0 ? avg : null);
          setReviewCount(Number(summary.totalReviews ?? summary.TotalReviews ?? 0) || 0);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setPatients([]);
          setAppointments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.therapistId, user?.userId]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const recent = appointments.filter((a) => {
      const t = new Date(a.scheduledStartTime || a.createdAt).getTime();
      return Number.isFinite(t) && t >= thirtyDaysAgo;
    });

    const held = appointments.filter(isHeld);
    const heldRecent = recent.filter(isHeld);
    const confirmed = appointments.filter((a) => normalizeStatus(a.status) === 'confirmed');
    const cancelled = appointments.filter((a) => normalizeStatus(a.status) === 'cancelled');
    const pending = appointments.filter((a) => normalizeStatus(a.status) === 'pending');
    const upcoming = confirmed.filter(
      (a) => a.scheduledStartTime && new Date(a.scheduledStartTime).getTime() > now
    );

    const uniquePatients = new Set(
      appointments.map((a) => a.patientId).filter(Boolean)
    ).size;

    const attendedOrHeld = held.length + upcoming.length;
    const denom = attendedOrHeld + cancelled.length || 1;
    const commitmentPct = Math.round((attendedOrHeld / denom) * 100);

    const online = appointments.filter((a) => (a.type || 'أونلاين').includes('أونلاين')).length;
    const offline = Math.max(0, appointments.length - online);

    return {
      patientCount: patients.length || uniquePatients,
      sessionsHeld: held.length,
      sessionsHeldRecent: heldRecent.length,
      upcomingCount: upcoming.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      commitmentPct,
      online,
      offline,
      totalAppointments: appointments.length,
    };
  }, [appointments, patients]);

  const weeklyTrend = useMemo(() => buildWeeklySeries(appointments, 28), [appointments]);
  const conditions = useMemo(() => buildConditionDistribution(patients), [patients]);

  const sessionMix = useMemo(() => {
    const total = metrics.online + metrics.offline || 1;
    return [
      {
        label: 'جلسات أونلاين',
        pct: Math.round((metrics.online / total) * 100),
        count: metrics.online,
        color: '#316764',
      },
      {
        label: 'جلسات حضوري / أخرى',
        pct: Math.round((metrics.offline / total) * 100),
        count: metrics.offline,
        color: '#83B9B5',
      },
    ];
  }, [metrics.online, metrics.offline]);

  const statusBars = useMemo(() => {
    const total = metrics.totalAppointments || 1;
    return [
      {
        name: 'الالتزام (مؤكد/منعقد)',
        value: metrics.commitmentPct,
        hint: `${metrics.commitmentPct}% من إجمالي الحجوزات`,
      },
      {
        name: 'جلسات مكتملة / منعقدة',
        value: Math.round((metrics.sessionsHeld / total) * 100),
        hint: `${metrics.sessionsHeld} جلسة`,
      },
      {
        name: 'بانتظار الدفع',
        value: Math.round((metrics.pendingCount / total) * 100),
        hint: `${metrics.pendingCount} موعد`,
      },
    ];
  }, [metrics]);

  const recentActivity = useMemo(() => {
    return [...appointments]
      .sort(
        (a, b) =>
          new Date(b.scheduledStartTime || b.createdAt) -
          new Date(a.scheduledStartTime || a.createdAt)
      )
      .slice(0, 5)
      .map((a) => {
        const st = normalizeStatus(a.status);
        const statusAr =
          st === 'confirmed'
            ? 'مؤكدة'
            : st === 'completed'
              ? 'منتهية'
              : st === 'cancelled'
                ? 'ملغاة'
                : st === 'pending'
                  ? 'بانتظار الدفع'
                  : a.status || '—';
        return {
          id: a.id,
          name: a.patientName || 'مريض',
          when: a.scheduledStartTime
            ? new Date(a.scheduledStartTime).toLocaleString('ar-EG', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—',
          status: statusAr,
          type: a.type || 'أونلاين',
        };
      });
  }, [appointments]);

  const sparkHeights = useMemo(() => {
    const vals = weeklyTrend.map((w) => w.منعقدة || 0);
    const max = Math.max(...vals, 1);
    return vals.map((v) => Math.max(18, Math.round((v / max) * 100)));
  }, [weeklyTrend]);

  return (
    <div
      className="min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col justify-between font-['Cairo',sans-serif]"
      style={{ direction: 'rtl' }}
    >
      <Header />

      <main className="w-full flex-1 flex flex-col lg:flex-row gap-8 max-w-[1240px] mx-auto px-4 py-10">
        <Sidebar activeTab="analysis" />

        <div className="flex-1 w-full space-y-8 text-right pb-16">
          <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#181C1D] tracking-tight">تحليلات العيادة</h1>
              <p className="text-xs md:text-sm text-[#707978] font-medium">
                ملخص واقعي من مرضاك ومواعيدك وتقييماتك على المنصة.
              </p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] text-[#707978] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
              <i className="fa-regular fa-calendar-days text-[#316764]"></i>
              <span>{rangeLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 flex items-center justify-between hover:shadow-xs transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707978] block">مرضاي</span>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <h2 className="text-3xl font-black text-[#181C1D]">{metrics.patientCount}</h2>
                )}
                <p className="text-[11px] text-[#707978]">مرضى لديهم مواعيد معك</p>
              </div>
              <div className="w-12 h-11 bg-[#F7FAFA] border border-[#E6E9E9] text-[#316764] rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-user-group"></i>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 flex items-center justify-between hover:shadow-xs transition-all group">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707978] block">جلسات منعقدة</span>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-[#181C1D]">{metrics.sessionsHeld}</h2>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                      {metrics.sessionsHeldRecent} آخر ٣٠ يوم
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-1 h-12 pb-1 shrink-0">
                {sparkHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-xs ${i === sparkHeights.length - 1 ? 'bg-[#316764]' : 'bg-slate-200'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 flex items-center justify-between hover:shadow-xs transition-all">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707978] block">مؤشر الالتزام</span>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-[#181C1D]">{metrics.commitmentPct}%</h2>
                    <span className="text-[10px] font-bold text-[#316764] bg-[#F7FAFA] px-1.5 py-0.5 rounded-md border border-[#E6E9E9]">
                      {metrics.upcomingCount} قادم
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-[#707978]">مؤكد/منعقد مقابل الملغى</p>
              </div>
              <div className="w-12 h-11 bg-[#F7FAFA] border border-[#E6E9E9] text-[#316764] rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 flex items-center justify-between hover:shadow-xs transition-all">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#707978] block">تقييم المرضى</span>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-3xl font-black text-[#181C1D]">
                      {rating != null ? rating.toFixed(1) : '—'}
                    </h2>
                    <span className="text-xs text-[#707978] font-bold">/ 5</span>
                  </div>
                )}
                <p className="text-[11px] text-[#707978] font-medium">
                  {reviewCount > 0
                    ? `بناءً على ${reviewCount} تقييم`
                    : 'لا توجد تقييمات بعد'}
                </p>
              </div>
              <div className="w-12 h-11 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                <i className="fa-regular fa-star"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#181C1D]">نشاط المواعيد الأسبوعي</h3>
                <p className="text-xs text-[#707978] font-medium">
                  من بيانات حجوزاتك خلال آخر ٤ أسابيع — منعقدة، معلّقة، وملغاة.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold shrink-0 bg-[#F7FAFA] px-3 py-1.5 rounded-xl border border-[#E6E9E9]/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#316764]"></span>
                  <span className="text-[#707978]">منعقدة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C4A574]"></span>
                  <span className="text-[#707978]">معلّقة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#db778d]"></span>
                  <span className="text-[#707978]">ملغاة</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80 pt-2">
              {loading ? (
                <div className="h-full rounded-2xl bg-[#F7FAFA] animate-pulse" />
              ) : appointments.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[#707978]">
                  لا توجد مواعيد بعد لعرض الاتجاهات
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F4F4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#707978"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#707978"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: '#316764', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E6E9E9',
                        borderRadius: '14px',
                        fontSize: '12px',
                        direction: 'rtl',
                        fontFamily: 'Cairo',
                        boxShadow: '0 12px 32px -4px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="منعقدة"
                      stroke="#316764"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#316764' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="معلقة"
                      stroke="#C4A574"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#C4A574' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ملغاة"
                      stroke="#db778d"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#db778d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 flex flex-col space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#181C1D]">توزيع حالات المرضى</h3>
                <p className="text-xs text-[#707978] font-medium">
                  من حقل التاريخ الطبي / الملاحظات لمرضاك (كلمات مفتاحية).
                </p>
              </div>

              {loading ? (
                <div className="h-44 rounded-2xl bg-[#F7FAFA] animate-pulse" />
              ) : conditions.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-sm text-[#707978]">
                  أضف ملاحظات طبية للمرضى لترى التوزيع
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full sm:w-1/2 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={conditions}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={66}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {conditions.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            fontFamily: 'Cairo',
                            borderRadius: '12px',
                            direction: 'rtl',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2.5 text-right font-bold text-xs">
                    {conditions.map((c, i) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between bg-[#F7FAFA] p-3 rounded-xl border border-[#E6E9E9]/50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-[#181C1D]">{c.name}</span>
                        </div>
                        <span className="text-[#316764] text-sm">
                          {c.pct}% · {c.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 space-y-6 flex flex-col">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#181C1D]">مؤشرات الأداء من الحجوزات</h3>
                <p className="text-xs text-[#707978] font-medium">نسب محسوبة من حالة المواعيد الفعلية.</p>
              </div>

              <div className="space-y-5 flex-1 flex flex-col justify-center">
                {statusBars.map((bar) => (
                  <div key={bar.name} className="space-y-2 text-right">
                    <div className="flex justify-between items-center text-xs font-bold gap-2">
                      <span className="text-[#181C1D] font-black">{bar.name}</span>
                      <span className="text-[11px] text-[#707978]">{bar.hint}</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="h-full bg-[#316764] rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, bar.value))}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 space-y-2">
                  <span className="text-xs font-black text-[#181C1D]">نوع الجلسات</span>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex">
                    {sessionMix.map((s) =>
                      s.pct > 0 ? (
                        <div
                          key={s.label}
                          className="h-full"
                          style={{ width: `${s.pct}%`, background: s.color }}
                          title={`${s.label}: ${s.count}`}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] font-bold text-[#707978]">
                    {sessionMix.map((s) => (
                      <span key={s.label} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        {s.label} ({s.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E6E9E9] p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-black text-[#181C1D]">آخر المواعيد</h3>
                <p className="text-xs text-[#707978]">أحدث ٥ مواعيد من جدولك</p>
              </div>
              {!loading && metrics.pendingCount > 0 && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                  {metrics.pendingCount} بانتظار الدفع
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#F7FAFA] animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-[#707978] py-6 text-center">لا توجد مواعيد بعد</p>
            ) : (
              <div className="divide-y divide-[#F1F4F4]">
                {recentActivity.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-[#181C1D]">{row.name}</p>
                      <p className="text-xs text-[#707978]">{row.when}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F7FAFA] text-[#707978] border border-[#E6E9E9]">
                        {row.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#316764]/10 text-[#316764]">
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analysis;
