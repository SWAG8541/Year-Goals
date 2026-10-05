import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuthController } from '../controllers/authController';
import { AuthError, AuthService } from '../services/authService';
import { firebaseAuth } from '../utils/firebase';
import { env } from '../config/env';
import { User } from '../models/User';
import { verifyToken } from '../utils/auth';

test('Google endpoint rejects untrusted profile input without an ID token', async () => {
  const res = { statusCode: 200, body: undefined as any,
    status(code: number) { this.statusCode = code; return this; },
    json(body: any) { this.body = body; return this; } };
  await AuthController.googleLogin({ body: { email: 'someone@example.com', uid: 'fake' } } as any, res as any);
  assert.equal(res.statusCode, 400);
});

test('Google service verifies identity before querying or issuing a session', async () => {
  env.firebaseProjectId ||= 'test-project';
  const auth = firebaseAuth();
  const originalVerify = auth.verifyIdToken;
  const originalFind = User.findOne;
  const queries: any[] = [];
  const identity = { uid: 'verified-uid', email: 'verified@example.com', email_verified: true,
    firebase: { sign_in_provider: 'google.com' } };
  try {
    User.findOne = (async (query: any) => {
      queries.push(query);
      return { firebaseUid: identity.uid, toObject: () => ({ _id: 'mongo-user', password: 'hidden' }) };
    }) as any;
    auth.verifyIdToken = (async () => { throw Object.assign(new Error('invalid'), { code: 'auth/invalid-id-token' }); }) as any;
    await assert.rejects(AuthService.googleLogin({ idToken: 'fake' }, () => {}),
      (error: unknown) => error instanceof AuthError && error.status === 401);
    assert.equal(queries.length, 0);
    auth.verifyIdToken = (async () => ({ ...identity, email_verified: false })) as any;
    await assert.rejects(AuthService.googleLogin({ idToken: 'test' }, () => {}), AuthError);
    assert.equal(queries.length, 0);
    auth.verifyIdToken = (async () => identity) as any;
    const result = await AuthService.googleLogin({ idToken: 'test' }, () => {});
    assert.deepEqual(queries, [{ firebaseUid: 'verified-uid' }]);
    assert.equal(verifyToken(result.token)?.userId, 'mongo-user');
    assert.equal('password' in result.user, false);
    queries.length = 0;
    User.findOne = (async (query: any) => query.firebaseUid ? null : { firebaseUid: 'another-uid' }) as any;
    await assert.rejects(AuthService.googleLogin({ idToken: 'test' }, () => {}),
      (error: unknown) => error instanceof AuthError && error.status === 409);
  } finally {
    auth.verifyIdToken = originalVerify;
    User.findOne = originalFind;
  }
});
