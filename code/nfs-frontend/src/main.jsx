import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import GoogleAuthProvider from './components/auth/GoogleAuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleAuthProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </GoogleAuthProvider>
  </StrictMode>,
)
