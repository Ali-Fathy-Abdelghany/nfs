import { GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google Identity Services button when VITE_GOOGLE_CLIENT_ID is set.
 * Calls onSuccess with the ID token (credential JWT).
 */
export default function GoogleSignInButton({ onSuccess, onError, disabled = false, text = 'signin_with' }) {
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div
      className={`w-full flex justify-center [&>div]:w-full ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) onSuccess?.(res.credential);
          else onError?.(new Error('Missing Google credential'));
        }}
        onError={() => onError?.(new Error('Google sign-in was cancelled or failed'))}
        useOneTap={false}
        text={text}
        shape="pill"
        theme="outline"
        size="large"
        width="100%"
        locale="ar"
      />
    </div>
  );
}

export function isGoogleSignInConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}
