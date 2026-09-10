import { UserProfile, UserRole } from './types';

export type AuthProviderType = 'firebase_dev' | 'dod_icam_saml' | 'dod_cac_mtls';

export interface AuthSession {
  user: UserProfile;
  providerType: AuthProviderType;
  token: string;
  expiresAt: number;
}

export interface IAuthService {
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(credentials?: Record<string, any>): Promise<AuthSession>;
  signOut(): Promise<void>;
  hasRole(requiredRole: UserRole): boolean;
}
