import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../app';
import { CalendarController } from '../controllers/calendarController';
import { AttendanceService } from '../services/attendanceService';
import { Attendance } from '../models';
import { HttpError } from '../utils/httpError';
import { authMiddleware } from '../middleware/authMiddleware';
import { comparePassword, generateToken, hashPassword, verifyToken } from '../utils/auth';

test('all API routers are mounted with the existing paths', () => {
  const app = createApp();
  const routers = app._router.stack.filter((layer: any) => layer.name === 'router');
  assert.equal(routers.length, 10);
  const paths = routers.flatMap((layer: any) => layer.handle.stack
    .filter((entry: any) => entry.route)
    .map((entry: any) => `${Object.keys(entry.route.methods)[0]} ${entry.route.path}`));
  for (const path of ['post /register', 'post /login', 'post /logout', 'get /user', 'put /profile',
    'get /stats', 'get /streak', 'get /today', 'post /clock-in', 'post /clock-out',
    'post /break-start', 'post /break-end', 'post /toggle', 'get /reminder-link', 'delete /:date']) {
    assert.ok(paths.includes(path), `Missing route: ${path}`);
  }
  for (const prefix of ['auth', 'goals', 'tasks', 'blog', 'feed', 'calendar-days', 'user-goal', 'analytics', 'attendance', 'whatsapp']) {
    assert.ok(routers.some((layer: any) => layer.regexp.test(`/api/${prefix}`)), `Missing mount: ${prefix}`);
  }
});

function response() {
  return {
    statusCode: 200,
    body: undefined as any,
    status(code: number) { this.statusCode = code; return this; },
    json(body: any) { this.body = body; return this; },
  };
}

test('calendar rejects invalid input before querying MongoDB', async () => {
  const res = response();
  await CalendarController.saveDay({ userId: 'test', body: { date: 'invalid' } } as any, res as any);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Invalid input');
});

test('protected routes reject missing and invalid tokens', () => {
  for (const headers of [{}, { authorization: 'Bearer invalid' }]) {
    const res = response();
    authMiddleware({ headers } as any, res as any, () => assert.fail('Unauthenticated request continued'));
    assert.equal(res.statusCode, 401);
  }
});

test('password and JWT helpers round trip', async () => {
  const hash = await hashPassword('test-password');
  assert.equal(await comparePassword('test-password', hash), true);
  assert.equal(await comparePassword('wrong', hash), false);
  assert.equal(verifyToken(generateToken('user-id'))?.userId, 'user-id');
});

test('attendance rejects clock-out before clock-in', async () => {
  const original = Attendance.findOne;
  Attendance.findOne = (() => Promise.resolve(null)) as any;
  try {
    await assert.rejects(AttendanceService.clockOut('user-id'), (error: unknown) =>
      error instanceof HttpError && error.status === 400 && error.message === 'Must clock in first');
  } finally {
    Attendance.findOne = original;
  }
});
