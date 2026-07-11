import React, { useState } from 'react';
import { X } from 'lucide-react';

const GratitudeJournal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');

  const moods = [
    { label: 'سعيد', emoji: '😊' },
    { label: 'هادئ', emoji: '😌' },
    { label: 'قلق', emoji: '😟' },
    { label: 'حزين', emoji: '😢' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 left-6 p-2 hover:bg-neutral-100 rounded-full">
          <X className="w-6 h-6 text-neutral-500" />
        </button>

        <div className="text-right space-y-6">
          <h2 className="text-2xl font-black text-neutral-900">مفكرة اليوم</h2>
          
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0F766E] focus:outline-none"
            placeholder="عنوان المذكرة..."
          />

          <p className="text-sm text-neutral-500">ما هو الشيء الذي جعلك تبتسم اليوم بشكل غير متوقع؟</p>
          
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 p-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0F766E] focus:outline-none resize-none"
            placeholder="اكتب هنا..."
          />

          <div className="flex flex-row-reverse justify-center gap-4 my-6">
            {moods.map((m) => (
              <button
                type="button"
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  mood === m.label ? 'border-[#0F766E] bg-[#E6F0EF]' : 'border-neutral-100'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[10px] font-bold text-neutral-600">{m.label}</span>
              </button>
            ))}
          </div>

          <button 
            disabled={!mood || !title || !content} 
            onClick={() => onSave({ title, content, mood, date: new Date().toLocaleDateString('ar-EG') })}
            className={`w-full py-4 rounded-full font-bold text-white transition-all ${
              !mood || !title || !content ? 'bg-neutral-300 cursor-not-allowed' : 'bg-[#0F766E] hover:bg-[#316764]'
            }`}
          >
            حفظ المذكرة
          </button>
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal;