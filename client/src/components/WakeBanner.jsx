import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// Render's free tier sleeps after ~15 min idle. Pinging on load means the wait
// lands here with an explanation, not silently on the login button
const SHOW_AFTER_MS = 2000;

function WakeBanner() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // Only surface the banner if it is slow enough that someone would notice
    const timer = setTimeout(() => setWaking(true), SHOW_AFTER_MS);

    fetch(`${API_URL}/`, { signal: controller.signal })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setWaking(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  if (!waking) return null;

  return (
    <div
      className="alert alert-info d-flex align-items-center gap-2 rounded-0 border-0 mb-0 py-2"
      role="status"
    >
      <span
        className="spinner-border spinner-border-sm flex-shrink-0"
        aria-hidden="true"
      />
      <span>
        Waking the server. The free hosting tier sleeps when idle, so this first
        load can take up to a minute.
      </span>
    </div>
  );
}

export default WakeBanner;
