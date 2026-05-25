export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const getDaysAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

export const getUrgencyColor = (iso: string): 'error' | 'warning' | 'default' => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days >= 3) return 'error';
  if (days >= 1) return 'warning';
  return 'default';
};

export const getBorderColor = (u: 'error' | 'warning' | 'default') =>
  u === 'error' ? 'error.main' : u === 'warning' ? 'warning.main' : 'primary.light';

export const maxUrgencyOf = (
  items: { submittedAt: string }[],
): 'error' | 'warning' | 'default' => {
  if (items.some((i) => getUrgencyColor(i.submittedAt) === 'error')) return 'error';
  if (items.some((i) => getUrgencyColor(i.submittedAt) === 'warning')) return 'warning';
  return 'default';
};
