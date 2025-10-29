import { StrictMode } from 'react'
import { AuthProvider } from '@/components/AuthContext.tsx';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { Toaster } from "@/components/ui/sonner";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/JRX-PortfolioProjects">
      <App />
      <Toaster position="top-right" expand={true} richColors  />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
