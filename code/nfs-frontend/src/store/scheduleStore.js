import { useSyncExternalStore } from 'react';

const SESSIONS_KEY = 'nafs_sessions';
const AVAIL_KEY = 'nafs_availability';
const EVENT = 'nafs-store-update';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
};

const defaultSessions = [
  { id: 's1', day: 'السبت', date: '04 يوليو', time: '04:00 م', patient: 'سارة أحمد', type: 'أونلاين', status: 'accepted' },
  { id: 's2', day: 'السبت', date: '04 يوليو', time: '07:30 م', patient: 'محمد علي', type: 'حضوري', status: 'accepted' },
  { id: 's3', day: 'الأحد', date: '05 يوليو', time: '05:00 م', patient: 'ياسمين عمر', type: 'أونلاين', status: 'accepted' },
  { id: 's4', day: 'الإثنين', date: '06 يوليو', time: '02:00 م', patient: 'أحمد خالد', type: 'حضوري', status: 'accepted' },
  { id: 's5', day: 'الثلاثاء', date: '07 يوليو', time: '06:00 م', patient: 'رانيا مصطفى', type: 'أونلاين', status: 'accepted' },
  { id: 's6', day: 'الخميس', date: '09 يوليو', time: '08:00 م', patient: 'عبدالله محمد', type: 'حضوري', status: 'accepted' },
];

let cache = {
  sessions: read(SESSIONS_KEY, null) || defaultSessions,
  availability: read(AVAIL_KEY, []),
};

if (!read(SESSIONS_KEY, null)) write(SESSIONS_KEY, cache.sessions);

const refresh = () => {
  cache = {
    sessions: read(SESSIONS_KEY, defaultSessions),
    availability: read(AVAIL_KEY, []),
  };
};

const subscribe = (callback) => {
  const handler = () => {
    refresh();
    callback();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};

const getSnapshot = () => cache;

export const acceptSession = (session) => {
  const sessions = read(SESSIONS_KEY, defaultSessions);
  const entry = {
    id: session.id || `s${Date.now()}`,
    day: session.day || 'السبت',
    date: session.date || '',
    time: session.time || '',
    patient: session.patient || 'مريض جديد',
    type: session.type || 'أونلاين',
    status: 'accepted',
  };
  write(SESSIONS_KEY, [...sessions, entry]);
  return entry;
};

export const addAvailability = (slot) => {
  const availability = read(AVAIL_KEY, []);
  const entry = {
    id: `a${Date.now()}`,
    day: slot.day,
    date: slot.date || '',
    from: slot.from,
    to: slot.to,
  };
  write(AVAIL_KEY, [...availability, entry]);
  return entry;
};

export const removeAvailability = (id) => {
  const availability = read(AVAIL_KEY, []);
  write(AVAIL_KEY, availability.filter((a) => a.id !== id));
};

export function useSchedule() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
