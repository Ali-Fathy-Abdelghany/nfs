import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { fetchPatients } from '../api/patients';
import { fetchAssessments } from '../api/assessments';

function Analysis() {
  const [patientCount, setPatientCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);

  useEffect(() => {
    fetchPatients()
      .then((res) => setPatientCount((res.data || []).length))
      .catch(console.error);
    fetchAssessments()
      .then((res) => setAssessmentCount((res.data || []).length))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col justify-between font-['Cairo',sans-serif]" style={{ direction: 'rtl' }}>
      <Header />

      {/* الـ Layout الأساسي: متجاوب بالكامل على كافة الشاشات */}
      <main className="w-full flex-1 flex flex-col lg:flex-row gap-8 max-w-[1240px] mx-auto px-4 py-10">
        
        {/* 1. القائمة الجانبية (الجانب الأيمن صريح) */}
          <Sidebar activeTab="analysis" />
        

        {/* 2. منطقة المحتوى والتحليلات الرئيسية الممتدة (الجانب الأيسر صريح) */}
        <div className="flex-1 w-full space-y-8 text-right pb-16">
          
          {/* قسم العنوان العلوي الفخم (Hero Section) */}
          <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#181C1D] tracking-tight">تحليلات الأداء والنتائج</h1>
              <p className="text-xs md:text-sm text-[#707978] font-medium">نظرة شاملة وموسعة على تقدم المرضى وفعالية الجلسات العلاجية.</p>
            </div>
            <div className="bg-[#F7FAFA] border border-[#E6E9E9] text-[#707978] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-3xs shrink-0">
              <i className="fa-regular fa-calendar-days text-[#316764]"></i>
              <span>آخر 30 يوم</span>
            </div>
          </div>

          {/* صف الإحصائيات العلوية الـ Bento Grid - متجاوب من 1 لـ 3 أعمدة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* كارت متوسط تحسن المرضى */}
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-7 flex items-center justify-between transition-all duration-300 hover:shadow-xs hover:-translate-y-0.5 group">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707978] block">متوسط تحسن المرضى</span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-black text-[#181C1D]">78%</h2>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">+2.4%</span>
                </div>
              </div>
              {/* أعمدة بيانية مصغرة */}
              <div className="flex items-end gap-1 h-12 pb-1 shrink-0">
                <div className="w-1.5 bg-slate-100 rounded-xs" style={{ height: '40%' }}></div>
                <div className="w-1.5 bg-slate-200 rounded-xs" style={{ height: '65%' }}></div>
                <div className="w-1.5 bg-slate-200 rounded-xs" style={{ height: '50%' }}></div>
                <div className="w-1.5 bg-[#316764] rounded-xs shadow-3xs transition-all group-hover:scale-y-105" style={{ height: '85%' }}></div>
              </div>
            </div>

            {/* كارت عدد الجلسات المنعقدة */}
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-7 flex items-center justify-between transition-all duration-300 hover:shadow-xs hover:-translate-y-0.5 group">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707978] block">عدد الجلسات المنعقدة</span>
                <h2 className="text-3xl font-black text-[#181C1D]">142</h2>
              </div>
              <div className="w-12 h-11 bg-[#F7FAFA] border border-[#E6E9E9] text-[#316764] rounded-xl flex items-center justify-center text-sm shadow-3xs shrink-0 transition-colors group-hover:bg-[#316764] group-hover:text-white">
                <i className="fa-solid fa-headset"></i>
              </div>
            </div>

            {/* كارت تقييم رضى المرضى */}
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-7 flex items-center justify-between transition-all duration-300 hover:shadow-xs hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1 group">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#707978] block">تقييم رضى المرضى</span>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-3xl font-black text-[#181C1D]">4.8</h2>
                  <span className="text-xs text-[#707978] font-bold">/ 5</span>
                </div>
                <p className="text-[11px] text-[#707978] font-medium">بناءً على 45 تقييم مجهول المصدر</p>
              </div>
              <div className="w-12 h-11 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center text-sm shadow-3xs shrink-0">
                <i className="fa-regular fa-star-half-stroke"></i>
              </div>
            </div>

          </div>

          {/* قسم المخطط البياني الطويل والممتد (اتجاهات الحالة المزاجية) */}
          <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#181C1D]">اتجاهات الحالة المزاجية للمرضى</h3>
                <p className="text-xs text-[#707978] font-medium">متوسط الحالة المزاجية المبلغ عنها ذاتياً من قبل المرضى أسبوعياً.</p>
              </div>
              
              {/* الرموز الدلالية (Legends) */}
              <div className="flex items-center gap-4 text-xs font-bold shrink-0 bg-[#F7FAFA] px-3 py-1.5 rounded-xl border border-[#E6E9E9]/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#316764]"></span>
                  <span className="text-[#707978]">سعيد</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#83B9B5]"></span>
                  <span className="text-[#707978]">هادئ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#db778d]"></span>
                  <span className="text-[#707978]">قلق</span>
                </div>
              </div>
            </div>

            {/* تم زيادة الطول هنا إلى h-80 لعرض ممتد وأكثر وضوحاً وطولاً */}
            <div className="w-full h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'الأسبوع ١', happy: 65, calm: 45, anxious: 30 },
                  { name: 'الأسبوع ٢', happy: 55, calm: 50, anxious: 40 },
                  { name: 'الأسبوع ٣', happy: 70, calm: 60, anxious: 25 },
                  { name: 'الأسبوع ٤', happy: 80, calm: 65, anxious: 15 },
                ]} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F7FAFA" vertical={false} />
                  <XAxis dataKey="name" stroke="#707978" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#707978" fontSize={12} tickLine={false} axisLine={false} tickCount={6} />
                  <Tooltip
                    cursor={{ stroke: '#316764', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E6E9E9',
                      borderRadius: '14px',
                      fontSize: '12px',
                      direction: 'rtl',
                      boxShadow: '0 12px 32px -4px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Line type="monotone" dataKey="happy" stroke="#316764" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#316764' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="calm" stroke="#83B9B5" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#83B9B5' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="anxious" stroke="#f8acc9" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#db778d' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* القسم السفلي المتجاوب المكون من عمودين ممتدين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* كارت توزيع الحالات والاضطرابات (الـ Donut Chart الطويل) */}
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-2xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#181C1D]">توزيع الحالات والاضطرابات</h3>
                <p className="text-xs text-[#707978] font-medium">نسبة انتشار الأعراض بين المرضى الحالية.</p>
              </div>

              {/* مرونة كاملة بالتنقل الرأسي على الشاشات الصغيرة جداً */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* تم زيادة طول وعرض الجرافيك الدائري لـ h-44 */}
                <div className="w-full sm:w-1/2 h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'قلق', value: 45 },
                          { name: 'اكتئاب', value: 35 },
                          { name: 'توتر', value: 20 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={66}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#316764" /> 
                        <Cell fill="#83B9B5" /> 
                        <Cell fill="#a6cec5" /> 
                      </Pie>
                      <Tooltip contentStyle={{ fontFamily: 'Cairo', borderRadius: '12px', direction: 'rtl', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* النِسب الجانبية المحاذية بدقة */}
                <div className="w-full sm:w-1/2 space-y-3 text-right font-bold text-xs">
                  <div className="flex items-center justify-between bg-[#F7FAFA] p-3 rounded-xl border border-[#E6E9E9]/50 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#316764]"></span>
                      <span className="text-[#181C1D]">القلق</span>
                    </div>
                    <span className="text-[#316764] text-sm">45%</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F7FAFA] p-3 rounded-xl border border-[#E6E9E9]/50 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#83B9B5]"></span>
                      <span className="text-[#181C1D]">الاكتئاب</span>
                    </div>
                    <span className="text-[#316764] text-sm">35%</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F7FAFA] p-3 rounded-xl border border-[#E6E9E9]/50 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a6cec5]"></span>
                      <span className="text-[#181C1D]">التوتر</span>
                    </div>
                    <span className="text-[#316764] text-sm">20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* كارت أداء الجلسات حسب النوع (الـ Progress Bars الطويلة والممتدة) */}
            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 space-y-6 transition-all duration-300 hover:shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#181C1D]">أداء الجلسات حسب النوع</h3>
                  <p className="text-xs text-[#707978] font-medium">مقارنة المؤشرات بين العلاج الفردي والجماعي.</p>
                </div>
                
                <div className="flex items-center gap-3 text-[11px] font-bold bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#316764]"></span>
                    <span className="text-[#707978]">فردي</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#83B9B5]"></span>
                    <span className="text-[#707978]">جماعي</span>
                  </div>
                </div>
              </div>

              {/* أشرطة التقدم الأطول والأكثر تباعداً لراحة بصرية فائقة */}
              <div className="space-y-5 flex-1 flex flex-col justify-center pt-2">
                
                {/* شريط 1 */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181C1D] font-black">الحضور والإلتزام</span>
                    <span className="text-[11px] text-[#707978]">65% فردي / 35% جماعي</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex shadow-3xs">
                    <div className="h-full bg-[#316764]" style={{ width: '65%' }}></div>
                    <div className="h-full bg-[#83B9B5]" style={{ width: '35%' }}></div>
                  </div>
                </div>

                {/* شريط 2 */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181C1D] font-black">مدى التحسن الملحوظ</span>
                    <span className="text-[11px] text-[#707978]">55% فردي / 45% جماعي</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex shadow-3xs">
                    <div className="h-full bg-[#316764]" style={{ width: '55%' }}></div>
                    <div className="h-full bg-[#83B9B5]" style={{ width: '45%' }}></div>
                  </div>
                </div>

                {/* شريط 3 */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#181C1D] font-black">تقييم الرضا العام</span>
                    <span className="text-[11px] text-[#707978]">70% فردي / 30% جماعي</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex shadow-3xs">
                    <div className="h-full bg-[#316764]" style={{ width: '70%' }}></div>
                    <div className="h-full bg-[#83B9B5]" style={{ width: '30%' }}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default Analysis;