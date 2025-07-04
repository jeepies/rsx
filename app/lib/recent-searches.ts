const STORAGE_KEY = 'recentSearches';
const MAX_ITEMS = 5;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const existing = getRecentSearches().filter((q) => q !== query);
  const updated = [query, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const filtered = getRecentSearches().filter((q) => q !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
