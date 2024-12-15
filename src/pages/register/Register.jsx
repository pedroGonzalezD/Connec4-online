import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import Loader from '../../components/loader/Loader'
import { useModal } from '../../context/ModalContext'
import { useState, useEffect} from 'react'
import styles from './Register.module.scss'

const apiUrl = import.meta.env.VITE_API_URL

const Register = () => {
  const {loading, setLoading} = useAuth()
  const { showModal, modalInfo } = useModal()
  const [shouldNavigate, setShouldNavigate] = useState()
  const {
    register, 
    formState: {errors},
    handleSubmit,
    reset,
    watch
  } = useForm()
  const navigate = useNavigate()

  useEffect(() =>{
    if(!modalInfo.show && shouldNavigate){
      setShouldNavigate(false)
      navigate('/login')
    }
  }, [modalInfo.show, navigate, shouldNavigate])

  const onSubmit = handleSubmit( async (values) =>{
    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values)
      })

      const data = await response.json()
      
      if(!response.ok){
        setLoading(false)
        showModal({
          title: "Error",
          message: data,
          type: "error"
        })
        return
      }

      setLoading(false)
      showModal({
        title: 'Success',
        message: data,
        type: "success",
        autoClose: true,
      })
      reset()
      setShouldNavigate(true)
      return

    } catch {
      setLoading(false)
      showModal({
        title: "Error",
        message: 'An unknown error occurred while trying to log you in. Please check your internet connection and try again.',
        type: "error"
      })
      return
    }
    
  })

  return (
      <>
      { loading && <Loader/>}
  <div className={styles.container}>
    <div className={styles.cont}>
      <h2>Sign Up</h2>
      <p className={styles.message}>Sign up to start playing Connect 4</p>
      <form onSubmit={onSubmit} className={styles.form}>
        <label>
          Username
          <input 
            type="text" 
            autoComplete="off"
            {...register('username', {
              required: {
                value: true,
                message: 'Username is required.'
              },
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters long."
              },
              maxLength:{
                value: 20,
                message: "Username must be no more than 20 characters long."
              }
            })} 
            />
        {errors.username && <span className={styles.error}>{errors.username.message}</span>}
        </label>

        <label>
          Password
          <input 
            type="password"
            {...register('password', {
              required: {
                value: true,
                message: 'Password is required.'
              },
              minLength:{
                value: 6,
                message: "Password must be at least 6 character long."
              }
            })}
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </label>

        <label>
          Confirm password
          <input 
            type="password" 
            {...register('confirmPassword', {
              validate: value => value === watch('password') || "Passwords do not match."
            })}
            />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
        </label>
        <button type='submit'>Sing Up</button>
      </form>
      <p className={styles.logIn}>Already have an account? <Link to='/login'>Log in</Link></p>
    </div>
  </div>
  </>
  )
}

export default Register