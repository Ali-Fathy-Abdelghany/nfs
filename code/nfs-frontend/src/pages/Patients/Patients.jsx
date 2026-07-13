import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header";
import Sidebar from '../../Components/Sidebar/Sidebar';
import { fetchPatients } from '../../api/patients';
import './Patients.css';

const STATUS_FILTERS = ['الكل', 'نشط', 'في إجازة', 'مكتمل'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'الأحدث انضماماً' },
  { value: 'name', label: 'الاسم (أبجدي)' },
  { value: 'sessions', label: 'عدد الجلسات' },
];

const statusClass = (status) =>
  status === 'نشط' ? 'text-active' : status === 'في إجازة' ? 'text-vacation' : 'text-completed';

function mapPatient(p) {
  return {
    id: p.patientId,
    patientId: p.patientId,
    userId: p.userId,
    name: `${p.firstName} ${p.lastName}`,
    img: p.profileImageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
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
  const viewProfile = (patient) => navigate('/doctor/patient-profile', { state: { patient } });

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('الكل');
  const [sortBy, setSortBy] = useState('latest');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetchPatients()
      .then((res) => setPatients((res.data || []).map(mapPatient)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visiblePatients = useMemo(() => {
    let list = patients.filter((p) => activeStatus === 'الكل' || p.status === activeStatus);
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'sessions') return b.sessions - a.sessions;
      return b.joinOrder - a.joinOrder;
    });
    return list;
  }, [activeStatus, sortBy, patients]);

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
                    <h3 className="stat-card-number">4.8</h3>
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

                {visiblePatients.map((p) => (
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

              <div className="patients-pagination-wrapper">
                <div className="pagination-container">
                  <button className="pagination-arrow-btn" disabled title="الصفحة السابقة">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                  <button className="pagination-number-btn active">1</button>
                  <button className="pagination-number-btn">2</button>
                  <button className="pagination-number-btn">3</button>
                  <button className="pagination-number-btn">4</button>
                  <span className="pagination-ellipsis">...</span>
                  <button className="pagination-number-btn">8</button>
                  <button className="pagination-arrow-btn" title="الصفحة التالية">
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Patients;
