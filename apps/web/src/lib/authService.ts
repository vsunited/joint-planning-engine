import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { IAuthService, AuthSession, UserProfile, UserRole } from '@jpe/shared';

class AuthService implements IAuthService {
  private currentSession: AuthSession | null = null;

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    return await this.syncUserProfile(fbUser);
  }

  async signIn(): Promise<AuthSession> {
    const user = await this.signInWithGoogle();
    this.currentSession = {
      user,
      providerType: 'firebase_dev',
      token: await auth.currentUser?.getIdToken() || '',
      expiresAt: Date.now() + 3600 * 1000,
    };
    return this.currentSession;
  }

  async signOut(): Promise<void> {
    await fbSignOut(auth);
    this.currentSession = null;
  }

  hasRole(requiredRole: UserRole): boolean {
    if (!this.currentSession) return false;
    const roleHierarchy: Record<UserRole, number> = {
      viewer: 1,
      planner: 2,
      commander: 3,
      admin: 4,
    };
    return roleHierarchy[this.currentSession.user.role] >= roleHierarchy[requiredRole];
  }

  async syncUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const newProfile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'Planning Officer',
      role: 'planner',
      serviceBranch: 'Joint',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

export const authService = new AuthService();
