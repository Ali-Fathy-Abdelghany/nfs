import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import {
  fetchTherapists,
  fetchPendingTherapists,
  approveTherapist,
} from '../../api/therapists';

function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};
  const [pending, setPending] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [tab, setTab] = useState('pending');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetchPendingTherapists(),
        fetchTherapists(),
      ]);
      setPending(pendingRes.data || []);
      setAllDoctors(allRes.data || []);
    } catch (err) {
      console.error(err);
      setMessage('تعذر تحميل بيانات الأطباء');
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

  const handleApprove = async (therapistId) => {
    setActingId(therapistId);
    setMessage('');
    try {
      await approveTherapist(therapistId);
      setMessage('تم اعتماد الطبيب بنجاح');
      await load();
    } catch (err) {
      console.error(err);
      setMessage('تعذر اعتماد الطبيب');
    } finally {
      setActingId(null);
    }
  };

  const handleLogout = async () => {
    await logout?.();
    navigate('/login');
  };

  const list = tab === 'pending' ? pending : verified;

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-['Cairo',sans-serif]" dir="rtl">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-sm p-6 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-[#2A5C58]">لوحة الإدارة</h1>
              <span className="text-[10px] font-bold text-[#316764] bg-[#E6F0EF] px-2 py-0.5 rounded-md border border-[#316764]/10">
                ADMIN
              </span>
            </div>
            <p className="text-sm text-[#707978]">
              مرحباً {user?.firstName || 'بالمسؤول'} — راجع طلبات انضمام الأطباء واعتمد الحسابات المؤهلة.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E6E9E9] bg-[#F7FAFA] text-[#707978] hover:text-rose-600 hover:border-rose-200 transition"
          >
            تسجيل الخروج
          </button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">طلبات معلّقة</p>
            <p className="text-2xl font-black text-[#316764]">{pending.length}</p>
          </div>
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">أطباء معتمدون</p>
            <p className="text-2xl font-black text-[#316764]">{verified.length}</p>
          </div>
          <div className="bg-white rounded-[20px] border border-[#E6E9E9] p-5">
            <p className="text-xs text-[#707978] font-bold mb-1">إجمالي الأطباء</p>
            <p className="text-2xl font-black text-[#316764]">{allDoctors.length}</p>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
            <h2 className="text-base font-black text-[#181C1D]">إدارة الأطباء</h2>
            <div className="flex bg-[#F7FAFA] p-0.5 rounded-xl border border-[#E6E9E9]">
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
            </div>
          </div>

          {message && (
            <p className="text-xs font-bold text-[#316764] bg-[#E6F0EF] border border-[#316764]/10 rounded-xl px-3 py-2">
              {message}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[#707978]">جاري التحميل...</p>
          ) : list.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#707978] bg-[#F7FAFA] rounded-2xl border border-dashed border-[#E6E9E9]">
              {tab === 'pending' ? 'لا توجد طلبات جديدة حالياً' : 'لا يوجد أطباء معتمدون بعد'}
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((doc) => (
                <div
                  key={doc.therapistId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E6E9E9] bg-[#F7FAFA] hover:border-[#316764]/30 transition"
                >
                  <div className="flex items-start gap-3 text-right">
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
                      <p className="text-[11px] text-[#707978] leading-relaxed max-w-xl">
                        {doc.bio || 'لا توجد نبذة'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-[#707978]">
                        <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                          {doc.email}
                        </span>
                        {doc.phone && (
                          <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                            {doc.phone}
                          </span>
                        )}
                        <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                          خبرة {doc.experienceYears} سنة
                        </span>
                        <span className="bg-white border border-[#E6E9E9] px-2 py-0.5 rounded-lg">
                          {doc.hourlyRate} ج.م / جلسة
                        </span>
                      </div>
                      {doc.qualifications && (
                        <p className="text-[11px] text-[#707978] pt-1">
                          <span className="font-bold text-[#181C1D]">المؤهلات: </span>
                          {doc.qualifications}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.isVerified ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                        معتمد
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(doc.therapistId)}
                        disabled={actingId === doc.therapistId}
                        className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
                      >
                        {actingId === doc.therapistId ? 'جاري الاعتماد...' : 'اعتماد الطبيب'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
