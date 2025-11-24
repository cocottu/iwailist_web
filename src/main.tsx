import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BasicAuthGate } from '@/components/security/BasicAuthGate'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BasicAuthGate>
      <App />
    </BasicAuthGate>
  </React.StrictMode>,
)
