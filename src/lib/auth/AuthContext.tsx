import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  linkWithPopup
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymouslyUser: () => Promise<void>;
  logout: () => Promise<void>;
  connectGoogleTasks: () => Promise<void>;
  disconnectGoogleTasks: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInAnonymouslyUser = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const connectGoogleTasks = async () => {
    if (!auth.currentUser) throw new Error("User must be logged in to connect Google Tasks.");

    return new Promise<void>((resolve, reject) => {
      try {
        // @ts-ignore - google is loaded from external script
        const client = google.accounts.oauth2.initCodeClient({
          // Make sure this matches exactly with the Google Cloud Console Client ID
          client_id: '428395068609-g01n1r7c5lrls4oasc07pdt9a0n1m00a.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/tasks',
          ux_mode: 'popup',
          callback: async (response: any) => {
            if (response.error) {
              console.error("Google OAuth Error:", response.error);
              reject(new Error("Unable to obtain Google Tasks credentials."));
              return;
            }

            if (response.code) {
              try {
                const exchangeCode = httpsCallable(functions, 'exchangeGoogleAuthCode');
                await exchangeCode({ code: response.code });
                console.log("Google Tasks connected successfully.");
                resolve();
              } catch (err) {
                console.error("Error exchanging code:", err);
                reject(err);
              }
            } else {
               reject(new Error("No authorization code returned from Google."));
            }
          },
        });
        
        client.requestCode();
      } catch (e) {
        console.error("InitCodeClient Error:", e);
        reject(e);
      }
    });
  };


  const disconnectGoogleTasks = async () => {
    if (!auth.currentUser) throw new Error("User must be logged in to disconnect.");
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'integrations', 'googleTasks'));
      console.log("Google Tasks disconnected.");
    } catch (error) {
      console.error("Error disconnecting Google Tasks", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAnonymouslyUser, logout, connectGoogleTasks, disconnectGoogleTasks }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
