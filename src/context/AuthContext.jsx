import { createContext, useContext, useState, useEffect} from 'react'
import { useModal } from './ModalContext'

const apiUrl = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext)

const getInitialAuthState = () =>{
  const isAuthenticated = localStorage.getItem("isAuthenticated")
  return isAuthenticated === "true"
}

export const AuthProvider = ({children}) =>{
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState)
  const [accessToken, setAccessToken] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading ] = useState(false)
  const [error, setError] = useState('')
  const {showModal} = useModal()

  useEffect(() =>{
    const checkAuth = async () =>{
      if(isAuthenticated && !accessToken){
        await newAccessToken()
      }
    }
    checkAuth()
  }, [])

  const newAccessToken = async () =>{
    try {
      const response = await fetch(`${apiUrl}/api/refresh-token`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      })
      
      const data = await response.json()

      if(!response.ok){
        setIsAuthenticated(false)
        localStorage.setItem("isAuthenticated", "false")
        return
      }

      setAccessToken(data.newAccessToken)
      setUsername(data.username)
      setIsAuthenticated(true)
      localStorage.setItem("isAuthenticated", "true")

      return data.newAccessToken


    } catch {

      setIsAuthenticated(false)
      localStorage.setItem("isAuthenticated", "false")
    }
  }

const authenticate = async (values) =>{
  setLoading(true)
  setError('')

  try {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(values),
      credentials: "include"
    })

    const data = await response.json()
    if(!response.ok){
      setLoading(false)
      if(response.status === 500){
        showModal({
          title: 'Error',
          message: data,
          type: 'error'
        })
        return
      }
      setError(data)
      return
    }

    setLoading(false)
    setAccessToken(data.accessToken)
    setUsername(data.username)
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated", "true")
    
  } catch {
    setLoading(false)
    showModal({
      title: 'Error',
      message: 'An unknown error occurred while trying to log you in. Please check your internet connection and try again.',
      type: 'error'
    })
  }
}

const logout = async () =>{
  try {
    const response = await fetch(`${apiUrl}/api/logout`,{
      method: 'POST',
      credentials: 'include'
    });
  
    if(response.ok){
      setIsAuthenticated(false)
      setAccessToken('')
      setUsername('')
      localStorage.removeItem("isAuthenticated")
    }
    
  } catch (err) {
    console.error('logout Error', err)
  }
}
  return (
    <AuthContext.Provider value={{isAuthenticated, authenticate, accessToken, username, loading, setLoading, error, logout}}>
      {children}
    </AuthContext.Provider>
  )
}