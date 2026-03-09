import { Settings as SettingsIcon, Sun, Moon, Laptop } from 'lucide-react';
import clsx from 'clsx';
import styles from './Settings.module.css';
import { useAuth } from '../lib/auth/AuthContext';
import { useTheme } from '../features/theme/ThemeProvider';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface GoogleTaskList {
  id: string;
  title: string;
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', Icon: Sun },
  { value: 'dark' as const, label: 'Dark', Icon: Moon },
  { value: 'system' as const, label: 'System', Icon: Laptop },
];

export function Settings() {
  const { user, connectGoogleTasks, disconnectGoogleTasks } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingInitialState, setLoadingInitialState] = useState(true);
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedTaskLists, setSelectedTaskLists] = useState<string[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  useEffect(() => {
    async function checkConnectionState() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'integrations', 'googleTasks');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsConnected(true);
          const data = docSnap.data();
          if (data.selectedLists) {
            setSelectedTaskLists(data.selectedLists);
          }
        } else {
          setIsConnected(false);
        }
      } catch (e) {
        console.error("Failed to check connection state", e);
      } finally {
        setLoadingInitialState(false);
      }
    }
    checkConnectionState();
  }, [user]);

  useEffect(() => {
    async function fetchTaskLists() {
      if (!isConnected || !user) return;
      setIsLoadingLists(true);
      try {
        const getLists = httpsCallable(functions, 'getGoogleTaskLists');
        const result = await getLists();
        const data = result.data as any;
        if (data.items) {
          setTaskLists(data.items);
        } else if (data.lists) {
          setTaskLists(data.lists);
        }
      } catch (e: any) {
        console.error("Failed to fetch task lists:", e);
        setError("Failed to load your Google Task lists.");
      } finally {
        setIsLoadingLists(false);
      }
    }
    fetchTaskLists();
  }, [isConnected, user]);

  const handleToggleList = async (listId: string) => {
    if (!user) return;
    const newSelected = selectedTaskLists.includes(listId)
      ? selectedTaskLists.filter(id => id !== listId)
      : [...selectedTaskLists, listId];
    
    setSelectedTaskLists(newSelected);
    
    try {
      const docRef = doc(db, 'users', user.uid, 'integrations', 'googleTasks');
      await updateDoc(docRef, {
        selectedLists: newSelected
      });
    } catch (e) {
      console.error("Failed to update selected lists:", e);
      setError("Failed to save list selection.");
    }
  };

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
      setTaskLists([]);
      setSelectedTaskLists([]);
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
          <h2>Appearance</h2>
          <div className={styles.themeSelector}>
            {THEME_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                className={clsx(styles.themeOption, theme === value && styles.themeOptionActive)}
                onClick={() => setTheme(value)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

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
          
          {isConnected && (
            <div className={styles.taskListsSection}>
              <h3>Select Lists to Sync</h3>
              {isLoadingLists ? (
                <p className={styles.loadingText}>Loading your lists...</p>
              ) : taskLists.length > 0 ? (
                <ul className={styles.taskLists}>
                  {taskLists.map(list => (
                    <li key={list.id} className={styles.taskListItem}>
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={selectedTaskLists.includes(list.id)}
                          onChange={() => handleToggleList(list.id)}
                        />
                        <span>{list.title}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.errorText}>No task lists found in your Google Account.</p>
              )}
            </div>
          )}



          {error && <p className={styles.errorText}>{error}</p>}
        </section>
      </div>
    </div>
  );
}
