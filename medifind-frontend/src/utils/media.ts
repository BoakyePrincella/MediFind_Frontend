const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost/api/v1';
const appBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const storageBaseUrl = import.meta.env.VITE_STORAGE_URL ?? `${appBaseUrl}/storage`;

export function storageUrl(path: string | null | undefined) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path
    .replace(/^\/storage\//, '')
    .replace(/^storage\//, '')
    .replace(/^\/+/, '');

  return `${storageBaseUrl.replace(/\/+$/, '')}/${normalizedPath}`;
}
