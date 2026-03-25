import React, { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
};

function ensureTurnstileScriptLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.querySelector('script[data-turnstile="1"]');
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-turnstile", "1");
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export default function Turnstile({
  siteKey,
  onToken,
  onError,
  onExpired,
  theme = "auto",
  size = "normal",
}: TurnstileProps) {
  const reactId = useId();
  const containerId = `turnstile-${reactId.replace(/[:]/g, "")}`;
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    ensureTurnstileScriptLoaded().then(() => {
      if (!mounted) return;
      setReady(true);
    });

    return () => {
      mounted = false;
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!window.turnstile) return;
    const el = document.getElementById(containerId);
    if (!el) return;

    try {
      widgetIdRef.current = window.turnstile.render(el, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "error-callback": () => onError?.(),
        "expired-callback": () => onExpired?.(),
        theme,
        size,
      });
    } catch {
      onError?.();
    }

    return () => {
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onError, onExpired, onToken, ready, siteKey, size, theme]);

  return <div id={containerId} />;
}
