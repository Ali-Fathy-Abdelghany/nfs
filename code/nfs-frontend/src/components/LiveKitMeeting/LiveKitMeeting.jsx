import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { AlertCircle, Loader2, Video } from 'lucide-react';
import { fetchLiveKitToken } from '../../api/livekit';
import { getApiErrorMessage } from '../../utils/apiError';

export default function LiveKitMeeting({ role = 'patient' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const appointmentId =
    searchParams.get('appointmentId') || location.state?.appointmentId;
  // Never trust stale navigation state for doctor calls: doctors must always
  // return to their own session workspace.
  const exitPath =
    role === 'doctor'
      ? '/doctor/dashboard'
      : location.state?.exitPath || '/sessions';

  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!appointmentId) {
        setError('لم يتم تحديد الجلسة. ارجع إلى صفحة جلساتك وحاول مرة أخرى.');
        return;
      }

      try {
        setError('');
        const result = await fetchLiveKitToken(appointmentId);
        if (!cancelled) setCredentials(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              'تعذر دخول غرفة الجلسة. تأكد أن الموعد مؤكد وأنك تستخدم الحساب الصحيح.'
            )
          );
        }
      }
    }

    connect();
    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#102a29] flex items-center justify-center p-5 font-sans"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 mb-2">
            تعذر دخول العيادة الرقمية
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate(exitPath, { replace: true })}
            className="w-full py-3 rounded-full bg-[#316764] text-white font-bold hover:bg-[#254f4d] transition"
          >
            العودة إلى الجلسات
          </button>
        </div>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div
        className="min-h-screen bg-[#102a29] text-white flex flex-col items-center justify-center gap-4 font-sans"
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <Video className="w-8 h-8 text-[#A6CEC5]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Loader2 className="w-5 h-5 animate-spin" />
          جاري تجهيز غرفة الجلسة الآمنة...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#102a29]" dir="rtl">
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.serverUrl}
        connect
        video
        audio
        onDisconnected={() => navigate(exitPath, { replace: true })}
        onError={(err) =>
          setError(err?.message || 'حدث خطأ أثناء الاتصال بغرفة الجلسة.')
        }
        data-lk-theme="default"
        className="h-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
