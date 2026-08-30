export function formatReadingDuration(hours: number | null): string {
  if (hours == null) return '—';

  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (remainingHours > 0) parts.push(`${remainingHours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}