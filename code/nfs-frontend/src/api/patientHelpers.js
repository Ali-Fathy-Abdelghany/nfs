import { fetchPatients, createPatient } from './patients';

export async function ensurePatientRecord(userId) {
  const res = await fetchPatients();
  const existing = (res.data || []).find((p) => p.userId === userId);
  if (existing) return existing.patientId;

  const created = await createPatient({ userId });
  return created.data.patientId;
}

export async function getPatientIdForUser(userId) {
  try {
    const res = await fetchPatients();
    const existing = (res.data || []).find((p) => p.userId === userId);
    return existing?.patientId || null;
  } catch {
    return null;
  }
}
