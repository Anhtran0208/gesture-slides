import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@xyflow/react/dist/style.css';
import App from './App.tsx'
import { ReactFlowProvider } from '@xyflow/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh'}}>
    <App />

      </div>
    </ReactFlowProvider>
  </StrictMode>,
)
