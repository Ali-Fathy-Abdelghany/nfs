import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAY_LABELS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const MONTH_LABELS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(slot) {
  return new Date(slot.startTime).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSlotLabel(slot) {
  const date = new Date(slot.startTime).toLocaleDateString('ar-EG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${date} — ${formatTime(slot)}`;
}

/**
 * Pick exactly `needed` free slots for the same doctor (excludes excludedSlotIds).
 */
export default function BundleSlotPicker({
  slots,
  needed = 3,
  selectedSlots,
  onChange,
  excludedSlotIds = [],
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const excluded = useMemo(() => new Set(excludedSlotIds.map(Number)), [excludedSlotIds]);
  const selectedIds = useMemo(() => new Set((selectedSlots || []).map((s) => s.id)), [selectedSlots]);

  const freeSlots = useMemo(
    () => (slots || []).filter((s) => !excluded.has(s.id)),
    [slots, excluded]
  );

  const availableDates = useMemo(() => {
    const set = new Set();
    freeSlots.forEach((s) => set.add(toDateKey(s.startTime)));
    return set;
  }, [freeSlots]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const firstAvailable = useMemo(() => {
    const sorted = [...availableDates].sort();
    return sorted[0] || toDateKey(today);
  }, [availableDates, today]);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(`${firstAvailable}T00:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    if (!selectedDate && firstAvailable) setSelectedDate(firstAvailable);
  }, [firstAvailable, selectedDate]);

  const daysInMonth = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewMonth]);

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return freeSlots
      .filter((s) => toDateKey(s.startTime) === selectedDate)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [freeSlots, selectedDate]);

  const toggleSlot = (slot) => {
    const exists = selectedIds.has(slot.id);
    if (exists) {
      onChange((selectedSlots || []).filter((s) => s.id !== slot.id));
      return;
    }
    if ((selectedSlots || []).length >= needed) return;
    onChange([...(selectedSlots || []), slot]);
  };

  const removeSlot = (slotId) => {
    onChange((selectedSlots || []).filter((s) => s.id !== slotId));
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-black text-[#181C1D]">اختر {needed} مواعيد إضافية</h4>
        <span className="text-[11px] font-bold text-[#316764] bg-[#E6F0EF] px-2 py-1 rounded-lg">
          {(selectedSlots || []).length} / {needed}
        </span>
      </div>
      <p className="text-[11px] text-[#707978] leading-relaxed">
        الباقة تشمل ٤ جلسات مع نفس الطبيب. الجلسة الأولى محجوزة مسبقاً — حدّد تواريخ الجلسات الثلاث المتبقية من المواعيد المتاحة فقط.
      </p>

      {(selectedSlots || []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(selectedSlots || []).map((s, i) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white border border-[#316764]/20 text-[#316764] px-2.5 py-1.5 rounded-xl"
            >
              {i + 2}. {formatSlotLabel(s)}
              <button type="button" onClick={() => removeSlot(s.id)} className="text-[#707978] hover:text-rose-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="bg-[#F7FAFA] rounded-2xl border border-[#E6E9E9] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#E6F0EF] flex items-center justify-center text-[#316764]"
          >
            <ChevronLeft size={16} />
          </button>
          <h5 className="text-sm font-black text-[#181C1D]">
            {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </h5>
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#E6F0EF] flex items-center justify-center text-[#316764]"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-[#707978] py-1">
              {d}
            </div>
          ))}
          {daysInMonth.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const key = toDateKey(day);
            const has = availableDates.has(key);
            const isSelected = selectedDate === key;
            const isPast = day < today;
            return (
              <button
                key={key}
                type="button"
                disabled={!has || isPast}
                onClick={() => setSelectedDate(key)}
                className={`aspect-square rounded-xl text-[11px] font-bold transition ${
                  isSelected
                    ? 'bg-[#316764] text-white'
                    : has && !isPast
                      ? 'bg-white text-[#316764] border border-[#316764]/20 hover:bg-[#E6F0EF]'
                      : 'text-[#BFC8C7] cursor-not-allowed'
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {daySlots.length === 0 ? (
          <p className="text-[11px] text-[#707978]">لا مواعيد متاحة في هذا اليوم.</p>
        ) : (
          daySlots.map((slot) => {
            const picked = selectedIds.has(slot.id);
            const full = (selectedSlots || []).length >= needed && !picked;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={full}
                onClick={() => toggleSlot(slot)}
                className={`text-[11px] font-bold px-3 py-2 rounded-xl border transition ${
                  picked
                    ? 'bg-[#316764] text-white border-[#316764]'
                    : full
                      ? 'bg-[#F1F4F4] text-[#BFC8C7] border-transparent cursor-not-allowed'
                      : 'bg-white text-[#316764] border-[#E6E9E9] hover:border-[#316764]/40'
                }`}
              >
                {formatTime(slot)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
