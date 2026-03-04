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
import { auth, db } from '../firebase';

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

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/tasks');
    provider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline'
    });

    try {
      let result;
      // If user is anonymous, link the Google account to preserve their existing local tasks
      if (auth.currentUser.isAnonymous) {
        result = await linkWithPopup(auth.currentUser, provider);
      } else {
        // Otherwise, they are likely already a Google user, so we re-authenticate to prompt for the new scope
        result = await signInWithPopup(auth, provider);
      }
      
      const tokenResponse = (result as any)._tokenResponse;
      
      if (tokenResponse?.oauthRefreshToken) {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'integrations', 'googleTasks'), {
          refreshToken: tokenResponse.oauthRefreshToken,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Google Tasks connected successfully.");
      } else {
        console.warn("No refresh token returned. This can happen if offline access wasn't issued.");
      }
    } catch (error: any) {
       // if we tried to link, but the user's google account exists
       if (error.code === 'auth/credential-already-in-use') {
           console.log("Credential already in use, trying sign in...");
           const result = await signInWithPopup(auth, provider);
           const tokenResponse = (result as any)._tokenResponse;
           if (tokenResponse?.oauthRefreshToken) {
             await setDoc(doc(db, 'users', result.user.uid, 'integrations', 'googleTasks'), {
               refreshToken: tokenResponse.oauthRefreshToken,
               updatedAt: serverTimestamp()
             }, { merge: true });
             console.log("Google Tasks connected successfully after fallback.");
           } 
       } else {
           console.error("Error connecting Google Tasks", error);
           throw error;
       }
    }
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
