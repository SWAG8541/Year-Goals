import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';

export function firebaseAuth() {
  if (!env.firebaseProjectId) {
    throw Object.assign(new Error('FIREBASE_PROJECT_ID is required for Google sign-in'), {
      code: 'auth/missing-project-id',
    });
  }
  const app = getApps().find((app) => app.name === 'google-auth')
    ?? initializeApp({ projectId: env.firebaseProjectId }, 'google-auth');
  return getAuth(app);
}
