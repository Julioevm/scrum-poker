export function getServerURL(): string {
  return process.env.SCRUM_POKER_SERVER || 'http://127.0.0.1:3000';
}
