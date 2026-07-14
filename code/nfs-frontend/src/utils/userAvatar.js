/** Shared avatar picker options (same URLs patients save to ProfileImageUrl). */
const BG = {
  blue: 'dbeafe',
  violet: 'ede9fe',
  sky: 'e0f2fe',
  amber: 'fef3c7',
  pink: 'fce7f3',
  green: 'dcfce7',
  orange: 'ffedd5',
  lilac: 'f3e8ff',
};

function lorelei(seed, backgroundColor) {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}`;
}

/** First five shown prominently in the profile avatar picker. */
export const AVATAR_OPTIONS_PRIMARY = [
  lorelei('Amina', BG.blue),
  lorelei('Youssef', BG.violet),
  lorelei('Laila', BG.sky),
  lorelei('Karim', BG.amber),
  lorelei('Nour', BG.pink),
];

/** Extra options available from the “more avatars” control. */
export const AVATAR_OPTIONS_MORE = [
  lorelei('Sara', BG.green),
  lorelei('Omar', BG.orange),
  lorelei('Hana', BG.lilac),
  lorelei('Tariq', BG.blue),
  lorelei('Maya', BG.violet),
  lorelei('Ziad', BG.sky),
  lorelei('Rania', BG.amber),
  lorelei('Hassan', BG.pink),
  lorelei('Dina', BG.green),
  lorelei('Fadi', BG.orange),
  lorelei('Salma', BG.lilac),
  lorelei('Adel', BG.blue),
  lorelei('Jana', BG.violet),
  lorelei('Bassem', BG.sky),
  lorelei('Farah', BG.amber),
  lorelei('Nabil', BG.pink),
  lorelei('Reem', BG.green),
  lorelei('Samir', BG.orange),
  lorelei('Yara', BG.lilac),
  lorelei('Khaled', BG.blue),
  lorelei('Lina', BG.violet),
  lorelei('Walid', BG.sky),
  lorelei('Mona', BG.amber),
  lorelei('Rami', BG.pink),
];

/** Full selectable set (primary first, then more). */
export const AVATAR_OPTIONS = [...AVATAR_OPTIONS_PRIMARY, ...AVATAR_OPTIONS_MORE];

const FALLBACK_COLORS = Object.values(BG);

/** UI labels that must never become a shared dicebear seed. */
const GENERIC_LABELS = new Set(['عضو', 'أنت', 'unknown', 'anonymous', 'me', 'other']);

function isGenericLabel(value) {
  const s = String(value || '').trim().toLowerCase();
  return !s || GENERIC_LABELS.has(s);
}

function stableSeedFromUserId(userId) {
  if (userId == null || userId === '') return null;
  const idNum = Number(userId);
  if (Number.isFinite(idNum) && idNum > 0) return `user-${idNum}`;
  const raw = String(userId).trim();
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return `user-${raw}`;
}

/**
 * Prefer saved profileImageUrl; otherwise a stable dicebear URL keyed by user id
 * so different users never share one static illustration (or one seed like «عضو»).
 */
export function userAvatarUrl(userId, profileImageUrl, displayName) {
  if (profileImageUrl) return profileImageUrl;

  // Always seed by user id first. Display names are privacy-masked to «عضو» in
  // community chat, so seeding on displayName collapsed every member to one doodle.
  const idSeed = stableSeedFromUserId(userId);
  const nameSeed =
    !isGenericLabel(displayName) ? String(displayName).trim() : null;
  const seedBase = idSeed || nameSeed || 'user-unknown';

  const idNum = Number(userId);
  const colorKey = Number.isFinite(idNum) && idNum > 0 ? idNum : seedBase.length;
  const colorIdx = Math.abs(colorKey) % FALLBACK_COLORS.length;

  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seedBase)}&backgroundColor=${FALLBACK_COLORS[colorIdx]}`;
}
