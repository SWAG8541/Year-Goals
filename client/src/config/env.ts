const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4255'
).trim().replace(/\/+$/, '');

if (!/^https?:\/\//i.test(apiBaseUrl)) {
  throw new Error('VITE_API_BASE_URL must be an absolute HTTP or HTTPS URL');
}

export const env = {
  apiBaseUrl,
};
