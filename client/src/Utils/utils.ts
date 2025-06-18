export function getServerURL(): string {
  return import.meta.env.VITE_SCRUM_POKER_SERVER || 'http://127.0.0.1:3000';
}

export function getDefaultTheme() {
  let defaultDark = false;
  if (typeof window !== 'undefined') {
    defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  const theme = defaultDark ? 'dark' : 'light';
  return theme;
}

export function sanitize(str: string, limit = 24) {
  return str ? str.substring(0, limit).replace(/[^a-zA-Z0-9]/g, '') : str;
}
