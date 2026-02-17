import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import styles from './Login.module.css';
import { ArrowRight, Zap } from 'lucide-react';

export function Login() {
  const { user, signInWithGoogle, signInAnonymouslyUser } = useAuth();
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
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleDevLogin = async () => {
    try {
      await signInAnonymouslyUser();
    } catch (err: any) {
      console.error("Dev login error:", err);
      setError(err.message || 'Failed to sign in anonymously.');
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

        {error && <div className={styles.error} style={{ color: 'var(--red)', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', wordBreak: 'break-word' }}>{error}</div>}

        <button onClick={handleLogin} className={styles.googleButton} data-testid="login-button">
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className={styles.googleIcon} 
          />
          <span>Continue with Google</span>
          <ArrowRight size={16} className={styles.arrowIcon} />
        </button>

        <button onClick={handleDevLogin} className={styles.secondaryButton} data-testid="dev-login-button" style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <span>Dev Login (Anonymous)</span>
        </button>

        <p className={styles.footer}>
          By continuing, you verify that you are ready for Deep Work.
          <br/>
          <span style={{ opacity: 0.3, fontSize: '0.7em' }}>v1.0.1</span>
        </p>
      </div>
    </div>
  );
}
