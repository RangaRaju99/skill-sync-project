/**
 * Intelligently formats timestamps into human-readable strings.
 */
export const formatHumanDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Never';
  
  let safeString = typeof dateString === 'string' ? dateString : dateString.toISOString();
  if (typeof safeString === 'string' && safeString.includes('T') && !safeString.endsWith('Z')) {
      safeString += 'Z';
  }
  const date = new Date(safeString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If future date (shouldn't happen for activity, but for safety)
  if (diffInMs < 0) return date.toLocaleDateString();

  // Same day
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // 2-6 days ago
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  // > 7 days
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
