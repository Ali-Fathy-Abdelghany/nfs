/** Gender-aware deterministic avatar when ProfileImageUrl is missing. */
const FEMALE_DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
];

const MALE_DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
];

const DOCTOR_AVATARS = [...FEMALE_DOCTOR_AVATARS, ...MALE_DOCTOR_AVATARS];

const FEMALE_FIRST_NAMES = [
  'سارة', 'شهد', 'ليلى', 'منى', 'هبة', 'نور', 'ندى', 'مريم', 'فاطمة', 'آية', 'اية',
];

function resolveGender(gender, displayName = '') {
  const normalized = String(gender ?? '').trim().toLowerCase();
  if (normalized === 'female' || normalized === '1' || normalized === 'أنثى' || normalized === 'انثى') {
    return 'female';
  }
  if (normalized === 'male' || normalized === '0' || normalized === 'ذكر') {
    return 'male';
  }

  const name = String(displayName);
  if (FEMALE_FIRST_NAMES.some((firstName) => name.includes(firstName))) return 'female';
  if (name.trim()) return 'male';
  return null;
}

export function doctorAvatarUrl(doctorId, profileImageUrl, gender, displayName) {
  if (profileImageUrl) return profileImageUrl;
  const resolvedGender = resolveGender(gender, displayName);
  const avatars = resolvedGender === 'female'
    ? FEMALE_DOCTOR_AVATARS
    : resolvedGender === 'male'
      ? MALE_DOCTOR_AVATARS
      : DOCTOR_AVATARS;
  const id = Number(doctorId) || 0;
  const idx = Math.abs(id) % avatars.length;
  return avatars[idx];
}
