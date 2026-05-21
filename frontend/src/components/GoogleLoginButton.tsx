import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason: () => string;
          }) => void) => void;
          renderButton: (element: HTMLElement | null, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number;
            logo_alignment?: 'left' | 'center';
          }) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for GSI script to load
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setGsiLoaded(true);
      }
    };

    // Check immediately
    checkGsi();

    // Poll every 200ms for up to 5s
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGsiLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!gsiLoaded || !window.google?.accounts?.id) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID non configuré — bouton Google désactivé');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setLoading(true);
        try {
          await loginWithGoogle(response.credential);
          // Redirect handled by AuthContext useEffect
        } catch {
          // Error displayed by AuthContext
        } finally {
          setLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render Google's button in our container
    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320,
        logo_alignment: 'center',
      });
    }
  }, [gsiLoaded, loginWithGoogle]);

  const handleCustomClick = () => {
    if (!gsiLoaded || !window.google?.accounts?.id || loading) return;

    // Trigger the One Tap prompt if the user clicks the fallback area
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.debug('Google One Tap not displayed:', notification.getNotDisplayedReason());
      }
    });
  };

  if (!gsiLoaded) {
    return null;
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  return (
    <div onClick={handleCustomClick} className="cursor-pointer">
      {/* Google's rendered button */}
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
