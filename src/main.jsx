import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FPVConsoleOS from './FPVOS_Final'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FPVConsoleOS />
  </StrictMode>
)
