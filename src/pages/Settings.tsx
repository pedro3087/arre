import { Settings as SettingsIcon } from 'lucide-react';
import styles from './Settings.module.css';
import { useAuth } from '../lib/auth/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Settings() {
  const { user, connectGoogleTasks, disconnectGoogleTasks } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingInitialState, setLoadingInitialState] = useState(true);

  useEffect(() => {
    async function checkConnectionState() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'integrations', 'googleTasks');
        const docSnap = await getDoc(docRef);
        setIsConnected(docSnap.exists());
      } catch (e) {
        console.error("Failed to check connection state", e);
      } finally {
        setLoadingInitialState(false);
      }
    }
    checkConnectionState();
  }, [user]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectGoogleTasks();
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to connect Google Tasks:', err);
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await disconnectGoogleTasks();
      setIsConnected(false);
    } catch (err: any) {
      console.error('Failed to disconnect Google Tasks:', err);
      setError('Failed to disconnect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <SettingsIcon size={24} className={styles.headerIcon} />
          <h1>Settings</h1>
        </div>
      </header>

      <div className={styles.settingsContent}>
        <section className={styles.settingsSection}>
          <h2>Integrations</h2>
          
          <div className={styles.integrationCard}>
            <div className={styles.integrationInfo}>
              <div className={styles.integrationHeader}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Google_Tasks_2021.svg/1200px-Google_Tasks_2021.svg.png" 
                  alt="Google Tasks" 
                  className={styles.integrationLogo}
                />
                <h3>Google Tasks</h3>
              </div>
              <p className={styles.integrationDescription}>
                Sync your Google Tasks. We'll proxy requests directly to Google—saving nothing in our database.
              </p>
            </div>
            
            <div className={styles.integrationActions}>
              {loadingInitialState ? (
                <span className={styles.loadingText}>Loading...</span>
              ) : isConnected ? (
                <button 
                  className={styles.disconnectButton}
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <button 
                  className={styles.connectButton}
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Google Tasks'}
                </button>
              )}
            </div>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </section>
      </div>
    </div>
  );
}
