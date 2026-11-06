import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { SyncProvider } from './context/SyncContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </ProfileProvider>
  </StrictMode>,
)
