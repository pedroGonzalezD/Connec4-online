import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/socketContext'
import { ModalProvider } from './context/ModalContext'
import router from './router'
import Modal from './components/modal/Modal'
import './index.scss'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router}/>
          <Modal/>
        </SocketProvider>
      </AuthProvider>
    </ModalProvider>
  </StrictMode>,
)
