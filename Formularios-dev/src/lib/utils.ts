export function isNextError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  return (
    message.includes('NEXT_REDIRECT') ||
    message.includes('NEXT_NOT_FOUND') ||
    message.includes('DYNAMIC_SERVER_USAGE')
  );
}