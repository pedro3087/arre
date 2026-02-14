import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import styles from './Login.module.css';
import { ArrowRight, Zap } from 'lucide-react';

export function Login() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoGroup}>
          <div className={styles.logoMark}><Zap size={24} fill="currentColor" /></div>
          <h1 className={styles.title}>Arre</h1>
        </div>
        
        <p className={styles.subtitle}>
          Focus on what matters. <br/>
          Organize the rest.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <button onClick={handleLogin} className={styles.googleButton}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className={styles.googleIcon} 
          />
          <span>Continue with Google</span>
          <ArrowRight size={16} className={styles.arrowIcon} />
        </button>

        <p className={styles.footer}>
          By continuing, you verify that you are ready for Deep Work.
        </p>
      </div>
    </div>
  );
}
