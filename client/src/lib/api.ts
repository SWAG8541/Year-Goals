import { env } from '@/config/env';

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.apiBaseUrl}/${path.replace(/^\/+/, '')}`;
}
