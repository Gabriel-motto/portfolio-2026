import posthog from 'posthog-js';

// No-op unless VITE_POSTHOG_KEY is set at build time
const key = import.meta.env.VITE_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    persistence: 'memory', // cookieless: no consent banner needed
    person_profiles: 'identified_only',
    autocapture: true,
    capture_pageview: 'history_change',
    disable_session_recording: true,
  });
}
