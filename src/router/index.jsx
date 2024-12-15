import {createBrowserRouter, Navigate} from 'react-router-dom'
import Login from '../pages/login/Login'
import Game from '../pages/game/Game'
import Lobby from '../pages/lobby/Lobby'
import Register from '../pages/register/Register'
import ProtectedRoute from '../components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login/>,
  },
  {
    path: '/register',
    element: <Register/>,
  },
  {
    path: '/',
    element: <ProtectedRoute/>,
    children: [
      {
        index: true,
        element: <Navigate to='/lobby'/>
      },
      {
        path: '/lobby',
        element: <Lobby/>
      },
      {
        path: '/game/:roomId',
        element: <Game/>
      },
    ]
  }
])

export default router