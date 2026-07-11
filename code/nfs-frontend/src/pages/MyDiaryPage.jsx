import React, { useState } from 'react'; 
import { Eye, Edit2 } from 'lucide-react';

const DiaryEntry = ({ entry, onView, onEdit }) => {
  // دالة الإيموجي فقط
  const getMoodEmoji = (mood) => {
    switch (mood?.trim()) {
      case 'سعيد': return '😊';
      case 'هادئ': return '😌';
      case 'قلق': return '😟';
      case 'حزين': return '😢';
      default: return '😐';
    }
  };

  return (
    <div className="bg-[#83B9B5]/20 p-6 rounded-3xl border border-neutral-100 flex flex-row-reverse items-center justify-between gap-6 shadow-sm">
      <div className="flex-1 text-right">
        <div className="flex flex-row-reverse items-center gap-2 mb-2">
          <span className="text-[11px] text-neutral-400 font-medium">{entry.date}</span>
          <h4 className="font-bold text-neutral-900">{entry.title}</h4>
          <div className="flex flex-row-reverse items-center gap-1.5 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
            <span className="text-xs font-bold text-neutral-600">{entry.mood}</span>
            <span className="text-sm">{getMoodEmoji(entry.mood)}</span>
          </div>
        </div>
        <p className="text-sm text-neutral-500 truncate">{entry.content}</p>
      </div>
    
    <div className="flex flex-col gap-2 shrink-0">
      <button onClick={() => onView(entry)} className="flex items-center gap-1 text-xs bg-neutral-50 hover:bg-neutral-100 px-4 py-2 rounded-xl text-neutral-600 transition-all">
        <Eye className="w-3 h-3" /> عرض
      </button>
      <button onClick={() => onEdit(entry)} className="flex items-center gap-1 text-xs bg-neutral-50 hover:bg-neutral-100 px-4 py-2 rounded-xl text-neutral-600 transition-all">
        <Edit2 className="w-3 h-3" /> تعديل
      </button>
    </div>
  </div>
  );
};

  

// المكون الرئيسي - دالة واحدة فقط
const MyDiaryPage = ({ entries, onUpdateEntry, onOpenJournal }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filter, setFilter] = useState('الكل');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 2. الفلتر الآمن: إذا لم يجد مذكرات في الأسبوع، يستخدم كل المذكرات (ليظهر الرسم دائماً)
  const filtered = entries.filter(e => e.date && new Date(e.date) >= sevenDaysAgo);
  const weeklyEntries = filtered.length > 0 ? filtered : entries;

  // 3. دالة الحساب
  const countMood = (moodLabel) => weeklyEntries.filter(e => e.mood && e.mood.trim() === moodLabel.trim()).length;
  
  const moods = [
    { label: 'سعيد', count: countMood('سعيد') },
    { label: 'هادئ', count: countMood('هادئ') },
    { label: 'قلق', count: countMood('قلق') },
    { label: 'حزين', count: countMood('حزين') }
  ];

  const total = weeklyEntries.length;


  const maxMood = moods.reduce((prev, curr) => (curr.count > prev.count) ? curr : prev);
  const getMessage = () => {
    if (maxMood.count === 0) return "ابدأ بتدوين مشاعرك لنحلل رحلتك النفسية 📝";
    if (maxMood.label === 'سعيد') return "أنتِ في حالة ازدهار! 🌸";
    if (maxMood.label === 'قلق') return "نحتاج للتركيز على جلسات التنفس اليوم. 🍃";
    return "حالتك مستقرة، استمري في الاهتمام بنفسك! ✨";
  };
  
  return (

    
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-right">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 overflow-hidden rounded-3xl min-h-[220px]">
          <img src="/diary.jpg" alt="Diary visual" className="w-full h-full object-cover rotate-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl transition-transform duration-500" />
        </div>
        
        {/* المربع العلوي المحدث */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">مؤشر التوازن النفسي</h3>
            <span className="text-[10px] font-bold text-[#0F766E] bg-[#E6F0EF] px-3 py-1 rounded-full">
              {getMessage()}
            </span>
          </div>
          
         <div className="space-y-4">
  {moods.map((moodItem) => {
    const percentage = total > 0 ? (moodItem.count / total) * 100 : 0;
    
    return (
      <div key={moodItem.label} className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="font-bold text-neutral-600">{moodItem.label}</span>
          <span className="text-neutral-400">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0F766E] transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  })}
</div>
        </div>
<button
      onClick={onOpenJournal}
      className="px-6 py-3 bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-full font-bold shadow-md hover:scale-[1.02] transition-all"
    >
      + تدوين جديد
    </button>        
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">سجل المذكرات</h3>
 {/* شريط الفلاتر */}
<div className="flex flex-row-reverse justify-center gap-3 my-6">
  {['الكل', 'سعيد', 'هادئ', 'قلق', 'حزين'].map((f) => (
  <button 
    key={f}
    onClick={() => setFilter(f)} // عند الضغط، نغير الـ filter
    className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
      filter === f 
      ? 'bg-[#0F766E] text-white border-[#0F766E]' 
      : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#0F766E]'
    }`}
  >
    {f}
  </button>
))}
</div>

        <div className="space-y-4">
          {entries
    .filter(item => filter === 'الكل' || item.mood === filter) 
    .map(item => (
      <DiaryEntry 
        key={item.id} 
        entry={item} 
        onView={(e) => { setSelectedEntry(e); setIsViewOpen(true); }} 
        onEdit={(e) => { setSelectedEntry(e); setIsEditOpen(true); }} 
      />
    ))
  }
        </div>
       
      </section>

      {/* النوافذ المنبثقة */}

      {isViewOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full text-right">
            <h2 className="text-xl font-bold">{selectedEntry.title}</h2>
            <p className="mt-4 text-neutral-600">{selectedEntry.content}</p>
            <button onClick={() => setIsViewOpen(false)} className="mt-6 bg-neutral-200 px-6 py-2 rounded-full">إغلاق</button>
          </div>
        </div>
      )}
      {isEditOpen && selectedEntry && (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl max-w-lg w-full text-right">
        <h2 className="text-xl font-bold mb-4">تعديل المذكرة</h2>
        <textarea 
          defaultValue={selectedEntry.content} 
          className="w-full border p-4 rounded-xl"
          onChange={(e) => setSelectedEntry({...selectedEntry, content: e.target.value})} // تحديث الحالة مؤقتاً
        />
        <button 
          onClick={() => {
            onUpdateEntry(selectedEntry); // استدعاء دالة التحديث
            setIsEditOpen(false);
          }} 
          className="mt-4 bg-[#316764] text-white px-6 py-2 rounded-full"
        >
          حفظ التعديلات
        </button>
      </div>
        </div>
      )}
    </div>
  );
};

export default MyDiaryPage;