import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Navbar - مطابقة لصفحة Auth */}
      <nav className="p-10 flex justify-between items-center w-full flex-row-reverse">
        <img src="/nafs_icon.png" alt="Nafs Logo" className="h-16 w-auto" />
        <button className="text-[#316764] font-bold text-lg hover:underline transition">مساعدة؟</button>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-[#2A5C58] mb-4">أهلاً بك في نفس</h1>
        <p className="text-gray-500 mb-16 text-lg max-w-md">
          منصة قائمة على التوجه والنتائج، اختر كيف تود الانضمام إلى مجتمعنا اليوم لنبدأ معاً.
        </p>

        {/* Bento Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          
          {/* كارت الطبيب */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="bg-[#E6F0EF] rounded-3xl h-48 mb-8 flex items-center justify-center text-6xl">
              👨‍⚕️
            </div>
            <h2 className="text-2xl font-bold text-[#2A5C58] mb-4">انضم كطبيب</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              كن جزءاً من النخبة، سهل عملية العلاج ووصل مع محتاجين للدعم النفسي في مجتمع أكثر أماناً.
            </p>
            <button 
              onClick={() => navigate('/doctor-signup')} 
              className="w-full py-4 bg-[#316764] text-white rounded-full font-bold hover:bg-[#254f4c] transition"
            >
              انضم الآن +
            </button>
          </div>

          {/* كارت المستخدم */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="bg-[#1C1C1C] rounded-3xl h-48 mb-8 flex items-center justify-center text-6xl">
              🌙
            </div>
            <h2 className="text-2xl font-bold text-[#2A5C58] mb-4">انضم كفرد</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              ابحث عن السلام الداخلي، سهل عملية العلاج ووصل مع مختصين للدعم النفسي في مجتمع أكثر أماناً.
            </p>
            {/* التعديل هنا لربط الزر بصفحة التسجيل للأفراد */}
            <button 
              onClick={() => navigate('/user-signup')} 
              className="w-full py-4 bg-[#316764] text-white rounded-full font-bold hover:bg-[#254f4c] transition"
            >
              ابدأ رحلتك +
            </button>
          </div>

        </div>
      </main>

      {/* Footer بسيط */}
      <footer className="text-center p-8 text-gray-400 text-sm">
        © 2026, Nafs Sanctuary. All rights reserved.
      </footer>
    </div>
  );
};

export default SelectionPage;