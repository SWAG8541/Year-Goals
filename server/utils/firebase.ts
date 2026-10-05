import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';

export function firebaseAuth() {
  if (!env.firebaseProjectId) throw new Error('FIREBASE_PROJECT_ID is required for Google sign-in');
  const app = getApps().find((app) => app.name === 'google-auth')
    ?? initializeApp({ projectId: env.firebaseProjectId }, 'google-auth');
  return getAuth(app);
}
