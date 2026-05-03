import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import các file CSS của bạn để giao diện nhận Tailwind
import '../styles/index.css'
import '../styles/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)