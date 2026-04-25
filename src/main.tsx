import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { initSyncListener } from './lib/syncService'

registerSW({ immediate: true })
initSyncListener()

createRoot(document.getElementById('root')!).render(
  <App />
)
