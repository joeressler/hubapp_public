import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

interface RecaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY || '';

const Recaptcha: React.FC<RecaptchaProps> = ({ onVerify, onExpire }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      onVerify('dev-bypass');
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.google.com/recaptcha/api.js?render=explicit"]'
    );
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, [onVerify]);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !scriptLoaded || !containerRef.current || !window.grecaptcha) {
      return;
    }

    window.grecaptcha.ready(() => {
      if (!containerRef.current || widgetIdRef.current !== null) {
        return;
      }
      widgetIdRef.current = window.grecaptcha!.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: onVerify,
        'expired-callback': onExpire,
      });
    });
  }, [scriptLoaded, onVerify, onExpire]);

  if (!RECAPTCHA_SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} className="recaptcha-container" />;
};

export default Recaptcha;
