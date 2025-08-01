
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionIdFromCookie() {
  const match = document.cookie.match(/(?:^|; )demoshop_session_id=([^;]*)/);
  if (match) return match[1];
  // If cookie missing, try to restore from localStorage
  const local = typeof window !== 'undefined' ? localStorage.getItem('demoshop_session_id') : null;
  if (local) {
    document.cookie = `demoshop_session_id=${local}; path=/; max-age=31536000`;
    return local;
  }
  return "";
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ensures a session ID cookie exists, creates one if missing
// Prevent multiple simultaneous session creations
let sessionPromise: Promise<string> | null = null;

export async function ensureSessionId() {
  let sessionId = getSessionIdFromCookie();
  if (sessionId) {
    // Always sync cookie to localStorage if not already
    if (typeof window !== 'undefined') localStorage.setItem('demoshop_session_id', sessionId);
    return sessionId;
  }
  // If a session creation is already in progress, return the same promise
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const cookieName = 'demoshop_session_id';
    // Try to get from localStorage first
    const local = typeof window !== 'undefined' ? localStorage.getItem(cookieName) : null;
    if (local) {
      document.cookie = `${cookieName}=${local}; path=/; max-age=31536000`;
      sessionPromise = null;
      return local;
    }
    // Try to generate session ID using API
    try {
      const res = await fetch('https://dev.demoshop.skyramp.dev/api/v1/generate', {
        headers: { 'Authorization': `Bearer ${getSessionIdFromCookie()}` }
      });
      await sleep(500);
      if (!res.ok) throw new Error('Failed to generate session ID');
      // The API returns a flat string, not JSON
      const text = await res.text();
      const newSessionId = text.trim();
      document.cookie = `${cookieName}=${newSessionId}; path=/; max-age=31536000`;
      if (typeof window !== 'undefined') localStorage.setItem(cookieName, newSessionId);
      sessionPromise = null;
      return newSessionId;
    } catch (err) {
      console.log("Error: ", err)
      // Fallback to random words if API fails
      const words = [
        'apple', 'banana', 'cherry', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet',
        'kilo', 'lima', 'mango', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango',
        'umbrella', 'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'orange', 'peach', 'plum', 'berry',
        'cloud', 'river', 'mountain', 'forest', 'ocean', 'desert', 'prairie', 'meadow', 'valley', 'hill',
        'star', 'moon', 'sun', 'comet', 'nova', 'orbit', 'galaxy', 'asteroid', 'meteor', 'nebula'
      ];
      const pick = () => words[Math.floor(Math.random() * words.length)];
      const fallbackId = `${pick()}-${pick()}-${pick()}`;
      document.cookie = `${cookieName}=${fallbackId}; path=/; max-age=31536000`;
      if (typeof window !== 'undefined') localStorage.setItem(cookieName, fallbackId);
      sessionPromise = null;
      return fallbackId;
    }
  })();
  return sessionPromise;
}