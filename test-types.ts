import { auth } from './src/firebase';
import { signInWithPopup, GoogleAuthProvider, UserCredential } from 'firebase/auth';

async function test() {
  const result: UserCredential = await signInWithPopup(auth, new GoogleAuthProvider());
  // Can we see result?
  const cred = GoogleAuthProvider.credentialFromResult(result);
  console.log(cred?.accessToken, result.user.refreshToken);
}
