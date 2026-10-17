import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';

export function firebaseAuth() {
  if (!env.firebaseProjectId) {
    throw new Error('FIREBASE_PROJECT_ID is required for Google sign-in');
  }

  const app =
    getApps().find((app) => app.name === 'google-auth') ??
    initializeApp(
      {
        credential: cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: env.firebasePrivateKey.replace(/\\n/g, '\n'),
        }),
      },
      'google-auth'
    );

  return getAuth(app);
}