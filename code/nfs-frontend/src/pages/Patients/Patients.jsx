import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header";
import Sidebar from '../../Components/Sidebar/Sidebar';
import { fetchPatientsByDoctor } from '../../api/patients';
import { fetchTherapistByUserId } from '../../api/therapists';
import { useAuth } from '../../context/AuthContext';
import { userAvatarUrl } from '../../utils/userAvatar';
import './Patients.css';

const STATUS_FILTERS = ['الكل', 'نشط', 'في إجازة', 'مكتمل'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'الأحدث انضماماً' },
  { value: 'name', label: 'الاسم (أبجدي)' },
  { value: 'sessions', label: 'عدد الجلسات' },
];
const PAGE_SIZE = 10;

const statusClass = (status) =>
  status === 'نشط' ? 'text-active' : status === 'في إجازة' ? 'text-vacation' : 'text-completed';

function mapPatient(p) {
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return {
    id: p.patientId,
    patientId: p.patientId,
    userId: p.userId,
    name,
    img: userAvatarUrl(p.userId, p.profileImageUrl, name),
    profileImageUrl: p.profileImageUrl || null,
    condition: p.medicalHistory || p.notes || 'متابعة نفسية',
    medicalHistory: p.medicalHistory,
    notes: p.notes,
    status: 'نشط',
    last: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-EG') : '-',
    next: 'قيد المتابعة',
    nextClass: 'upcoming',
    mood: '😊',
    moodTitle: 'متابعة',
    sessions: 0,
    joinOrder: p.patientId,
  };
}

function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const viewProfile = (patient) => navigate('/doctor/patient-profile', { state: { patient } });

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState('—');
  const [activeStatus, setActiveStatus] = useState('الكل');
  const [sortBy, setSortBy] = useState('latest');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      navigate('/admin');
      return undefined;
    }

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
          if (!cancelled) setPatients([]);
          return;
        }
        const res = await fetchPatientsByDoctor(doctorId);
        if (!cancelled) setPatients((res.data || []).map(mapPatient));
      } catch (err) {
        console.error(err);
        if (!cancelled) setPatients([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [navigate, user?.therapistId, user?.userId]);

  useEffect(() => {
    const userId = user?.userId;
    if (!userId) return;
    fetchTherapistByUserId(userId)
      .then((res) => {
        const r = res.data?.rating;
        setMyRating(r != null && Number(r) > 0 ? Number(r).toFixed(1) : '—');
      })
      .catch(() => setMyRating('—'));
  }, [user?.userId]);

  const visiblePatients = useMemo(() => {
    let list = patients.filter((p) => activeStatus === 'الكل' || p.status === activeStatus);
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'sessions') return b.sessions - a.sessions;
      return b.joinOrder - a.joinOrder;
    });
    return list;
  }, [activeStatus, sortBy, patients]);

  const totalPages = Math.max(1, Math.ceil(visiblePatients.length / PAGE_SIZE) || 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, sortBy, patients.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedPatients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visiblePatients.slice(start, start + PAGE_SIZE);
  }, [visiblePatients, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="patients-page">
      <Header />

      <main className="doctor-work-main">
        <div className="doctor-work-container">
          <Sidebar activeTab="patients" />

          <section className="content-area">
            <div className="patients-content-wrapper">

              <div className="patients-stats-grid">
                <div className="stat-card-box">
                  <div className="stat-card-info">
                    <span className="stat-card-title">إجمالي المرضى</span>
                    <h3 className="stat-card-number">{patients.length}</h3>
                  </div>
                  <div className="stat-card-icon icon-patients"><i className="fa-solid fa-user-group"></i></div>
                </div>

                <div className="stat-card-box">
                  <div className="stat-card-info">
                    <span className="stat-card-title">جلسات اليوم</span>
                    <h3 className="stat-card-number">8</h3>
                  </div>
                  <div className="stat-card-icon icon-sessions"><i className="fa-solid fa-calendar-check"></i></div>
                </div>

                <div className="stat-card-box">
                  <div className="stat-card-info">
                    <span className="stat-card-title">متوسط التقييم</span>
                    <h3 className="stat-card-number">{myRating}</h3>
                  </div>
                  <div className="stat-card-icon icon-rating"><i className="fa-solid fa-star"></i></div>
                </div>
              </div>

              <div className="patients-filter-bar">
                <div className="filter-status-group">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      className={`filter-status-btn ${activeStatus === status ? 'active' : ''}`}
                      onClick={() => setActiveStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="filter-sort-group">
                  <span className="sort-label">ترتيب حسب:</span>
                  <div className="custom-sort-dropdown">
                    <button
                      type="button"
                      className={`custom-sort-trigger ${sortOpen ? 'open' : ''}`}
                      onClick={() => setSortOpen((o) => !o)}
                    >
                      <span>{activeSortLabel}</span>
                      <i className="fa-solid fa-chevron-down"></i>
                    </button>
                    {sortOpen && (
                      <>
                        <div className="sort-backdrop" onClick={() => setSortOpen(false)} />
                        <ul className="custom-sort-menu">
                          {SORT_OPTIONS.map((opt) => (
                            <li
                              key={opt.value}
                              className={`custom-sort-item ${sortBy === opt.value ? 'selected' : ''}`}
                              onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                            >
                              {opt.label}
                              {sortBy === opt.value && <i className="fa-solid fa-check"></i>}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="patients-cards-list">
                {loading && <p className="patients-empty-text">جاري تحميل المرضى...</p>}
                {!loading && visiblePatients.length === 0 && (
                  <p className="patients-empty-text">لا يوجد مرضى في هذه الفئة</p>
                )}

                {pagedPatients.map((p) => (
                  <div className="patient-wide-card" key={p.id}>
                    <div className="patient-card-main-info">
                      <div className="patient-avatar-wrapper">
                        <img src={p.img} alt={p.name} className="patient-avatar-img" />
                      </div>
                      <div className="patient-text-details">
                        <h4>{p.name}</h4>
                        <div className="patient-badges-row">
                          <span className="patient-condition-badge">{p.condition}</span>
                          <span className={`patient-status-text ${statusClass(p.status)}`}>· {p.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="patient-card-dates">
                      <div className="date-group">
                        <span className="date-label">الجلسة الأخيرة</span>
                        <span className="date-value">{p.last}</span>
                      </div>
                      <div className="date-group">
                        <span className="date-label">الجلسة القادمة</span>
                        <span className={`date-value ${p.nextClass}`}>{p.next}</span>
                      </div>
                    </div>

                    <div className="patient-card-emoji-mood">
                      <span className="mood-emoji" title={p.moodTitle}>{p.mood}</span>
                    </div>

                    <button className="view-patient-profile-btn" onClick={() => viewProfile(p)}>
                      <i className="fa-regular fa-id-card"></i>
                      عرض الملف
                    </button>
                  </div>
                ))}
              </div>

              {!loading && visiblePatients.length > 0 && totalPages > 1 && (
                <div className="patients-pagination-wrapper">
                  <div className="pagination-container">
                    <button
                      type="button"
                      className="pagination-arrow-btn"
                      disabled={currentPage <= 1}
                      title="الصفحة السابقة"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`pagination-number-btn ${currentPage === n ? 'active' : ''}`}
                        onClick={() => setCurrentPage(n)}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="pagination-arrow-btn"
                      disabled={currentPage >= totalPages}
                      title="الصفحة التالية"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Patients;
