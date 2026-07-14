import { resolveUserRole } from './config';
import { ensurePatientRecord } from './patientHelpers';
import { fetchTherapistByUserId } from './therapists';

/**
 * Shared post-login path used by email/password and Google OAuth.
 * Ensures patient/therapist ids and returns navigation target + session payload.
 */
export async function completeAuthSession(loginResponse) {
  if (!loginResponse?.accessToken) {
    throw new Error('Invalid login response');
  }

  const userRole = resolveUserRole(loginResponse.roles);
  let sessionData = { ...loginResponse };
  let doctorPendingVerification = false;

  if (userRole === 'user') {
    try {
      const patientId =
        loginResponse.patientId || (await ensurePatientRecord(loginResponse.userId));
      sessionData = { ...sessionData, patientId };
    } catch (err) {
      console.error('Failed to ensure patient record', err);
    }
  }

  if (userRole === 'doctor') {
    try {
      let therapistId = loginResponse.therapistId;
      let isVerified = false;
      const res = await fetchTherapistByUserId(loginResponse.userId);
      therapistId = therapistId || res.data?.therapistId;
      isVerified = !!res.data?.isVerified;
      sessionData = { ...sessionData, therapistId };
      doctorPendingVerification = !therapistId || !isVerified;
    } catch (err) {
      console.error('Failed to resolve therapist id', err);
      doctorPendingVerification = true;
    }
  }

  let path = '/dashboard';
  if (userRole === 'admin') path = '/admin';
  else if (userRole === 'doctor') path = doctorPendingVerification ? '/verification' : '/doctor/dashboard';

  return { sessionData, userRole, path };
}
