import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PWAProvider } from './hooks/PWAContext.jsx' // اضافه شدن Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PWAProvider>
      <App />
    </PWAProvider>
  </React.StrictMode>,
)
