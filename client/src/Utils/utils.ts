export function getServerURL(): string {
  return process.env.SCRUM_POKER_SERVER || 'http://127.0.0.1:3000';
}

export function getDefaultTheme() {
  let defaultDark = false;
  if (typeof window !== 'undefined') {
    defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  const theme = defaultDark ? 'dark' : 'light';
  return theme;
}
