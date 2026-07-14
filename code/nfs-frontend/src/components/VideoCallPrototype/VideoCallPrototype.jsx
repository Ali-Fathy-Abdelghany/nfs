import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  StickyNote,
  Save,
} from 'lucide-react';
import './VideoCallPrototype.css';

const REACTIONS = [
  { emoji: '🙏', label: 'امتنان' },
  { emoji: '😌', label: 'راحة' },
  { emoji: '⭐', label: 'فخر' },
  { emoji: '😢', label: 'ضيق' },
  { emoji: '🤍', label: 'تقبل' },
];

const DOCTOR_IMG =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&auto=format&fit=crop';
const PATIENT_IMG =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop';

/**
 * Prototype-only video consultation UI (no WebRTC).
 * @param {'patient' | 'doctor'} role
 */
function VideoCallPrototype({
  role = 'patient',
  remoteName,
  localLabel = 'أنت',
  exitPath,
}) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [floating, setFloating] = useState([]);
  const reactionTimers = useRef([]);

  const isDoctor = role === 'doctor';
  const resolvedRemoteName = remoteName || (isDoctor ? 'المريض' : 'د. مريم');
  const remoteSrc = isDoctor ? PATIENT_IMG : DOCTOR_IMG;
  const localSrc = isDoctor ? DOCTOR_IMG : PATIENT_IMG;
  const leaveTo =
    exitPath || (isDoctor ? '/doctor/sessions' : '/sessions');

  const clearReactionTimers = useCallback(() => {
    reactionTimers.current.forEach(clearTimeout);
    reactionTimers.current = [];
  }, []);

  useEffect(() => () => clearReactionTimers(), [clearReactionTimers]);

  const pushReaction = (reaction) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const offset = 18 + Math.random() * 42;
    setFloating((prev) => [...prev, { id, ...reaction, offset }]);
    const timer = setTimeout(() => {
      setFloating((prev) => prev.filter((r) => r.id !== id));
    }, 2400);
    reactionTimers.current.push(timer);
  };

  const handleLeave = () => {
    navigate(leaveTo);
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
    window.setTimeout(() => setNotesSaved(false), 1800);
  };

  return (
    <div className="vc-page">
      <header className="vc-topbar">
        <div className="vc-brand">
          <span className="vc-brand-mark">نفس</span>
          <div>
            العيادة الرقمية
            <span className="vc-brand-sub">
              {isDoctor ? 'واجهة الطبيب · نموذج تجريبي' : 'جلسة فيديو · نموذج تجريبي'}
            </span>
          </div>
        </div>

        <div className="vc-session-chip">
          <span className="vc-live-dot" aria-hidden />
          مباشر · {resolvedRemoteName}
        </div>

        <button type="button" className="vc-leave-btn" onClick={handleLeave}>
          مغادرة الجلسة
        </button>
      </header>

      <div className={`vc-body${isDoctor ? ' has-side' : ''}`}>
        <section className="vc-stage" aria-label="نافذة الفيديو">
          <img
            src={remoteSrc}
            alt={resolvedRemoteName}
            className="vc-remote"
          />
          <span className="vc-name-tag">{resolvedRemoteName}</span>

          <div className="vc-local" aria-label="الكاميرا المحلية">
            {cameraOff ? (
              <div className="vc-local-off">الكاميرا متوقفة</div>
            ) : (
              <img src={localSrc} alt={localLabel} />
            )}
            <span className="vc-local-badge">{localLabel}</span>
          </div>

          <div className="vc-reactions-layer" aria-live="polite">
            {floating.map((r) => (
              <div
                key={r.id}
                className="vc-float-reaction"
                style={{ insetInlineEnd: `${r.offset}%` }}
              >
                <span className="emoji">{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          <div className="vc-reaction-bar">
            <span className="vc-reaction-label">عبّر عن شعورك الحالي:</span>
            <div className="vc-reaction-row">
              {REACTIONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className="vc-reaction-btn"
                  title={r.label}
                  onClick={() => pushReaction(r)}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {isDoctor && (
          <aside className="vc-side">
            <div className="vc-notes">
              <h3>
                <StickyNote size={16} aria-hidden />
                ملاحظات الجلسة الحالية
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتبي هنا الأعراض، التشخيص المبدئي، أو التوصيات العلاجية للمريض..."
              />
              <button type="button" className="vc-save-notes" onClick={handleSaveNotes}>
                <Save size={16} aria-hidden />
                {notesSaved ? 'تم الحفظ (تجريبي)' : 'حفظ الملاحظات'}
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className="vc-controls" role="toolbar" aria-label="أدوات المكالمة">
        <button
          type="button"
          className={`vc-control${muted ? ' is-off' : ''}`}
          title={muted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          onClick={() => setMuted((v) => !v)}
        >
          {muted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          type="button"
          className={`vc-control${cameraOff ? ' is-off' : ''}`}
          title={cameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
          onClick={() => setCameraOff((v) => !v)}
        >
          {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
        <button
          type="button"
          className="vc-control"
          title="مشاركة الشاشة (تجريبي)"
          onClick={() => {}}
        >
          <Monitor size={20} />
        </button>
        <button
          type="button"
          className="vc-control end"
          title="إنهاء المكالمة"
          onClick={handleLeave}
        >
          <PhoneOff size={20} />
        </button>
      </div>

      <p className="vc-proto-hint">
        واجهة تجريبية فقط — لا يوجد اتصال فيديو حقيقي حالياً
      </p>
    </div>
  );
}

export default VideoCallPrototype;
