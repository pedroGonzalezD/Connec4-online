import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/loader/Loader'
import styles from './Login.module.scss'


const Login = () => {
  const {
    register, 
    handleSubmit, 
    reset
  } = useForm()
  const { authenticate, isAuthenticated, loading, error } = useAuth()

  const onSubmit = handleSubmit((data) =>{
      authenticate(data)
      reset()
  })

  if(isAuthenticated){
    return <Navigate to='/'/>
  }

  return (
  <>
  {loading && <Loader/>}
    <div className={styles.container}>
      <div className={styles.cont}>
          <h2>Log In</h2>
          <p className={styles.message}>Log in to play with your friends</p>
        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            Username
            <input 
              type="text" 
              {...register('username')}
              autoComplete="off"
              />
          </label>
          <label>
            Password
            <input 
              type= "password"
              {...register('password')}  
              />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type='submit'>Log in</button>
        </form>
        <p className={styles.signUp}>Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  </>
  )
}

export default Login