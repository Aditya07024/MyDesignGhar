import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clear stale Clerk session cookies on fresh page load to prevent 400 errors
// from Clerk trying to resume an expired/corrupted sign-in session.
if (!sessionStorage.getItem('clerk_cookies_cleaned')) {
  document.cookie.split(';').forEach((c) => {
    const name = c.trim().split('=')[0];
    if (name.startsWith('__clerk') || name === '__session' || name === '__client_uat') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
  sessionStorage.setItem('clerk_cookies_cleaned', '1');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
