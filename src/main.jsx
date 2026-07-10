import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { HelperProvider } from './context/helperContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelperProvider>
      <App />
    </HelperProvider>
  </StrictMode>,
)
