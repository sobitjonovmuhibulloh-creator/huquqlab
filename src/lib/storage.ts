/**
 * localStorage uchun xavfsiz o'ram: private rejim, to'lgan xotira yoki
 * buzilgan JSON holatlarida ilova yiqilmasligi kerak.
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* e'tiborsiz */
  }
}

export const STORAGE_KEYS = {
  progress: "huquqlab:progress:v1",
  content: "huquqlab:content:v1",
  theme: "huquqlab:theme",
} as const;
