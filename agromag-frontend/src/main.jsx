import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from './components/UIComponents.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      {/* Toast global — montado una sola vez fuera del árbol de App */}
      <ToastContainer />
    </AuthProvider>
  </StrictMode>,
)
