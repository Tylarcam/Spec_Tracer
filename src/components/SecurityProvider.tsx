
import React, { useEffect } from 'react';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Add Content Security Policy via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'"
    ].join('; ');
    
    document.head.appendChild(cspMeta);

    // Add other security headers via meta tags where possible
    const xFrameOptions = document.createElement('meta');
    xFrameOptions.httpEquiv = 'X-Frame-Options';
    xFrameOptions.content = 'DENY';
    document.head.appendChild(xFrameOptions);

    const xContentTypeOptions = document.createElement('meta');
    xContentTypeOptions.httpEquiv = 'X-Content-Type-Options';
    xContentTypeOptions.content = 'nosniff';
    document.head.appendChild(xContentTypeOptions);

    // Cleanup function
    return () => {
      document.head.removeChild(cspMeta);
      document.head.removeChild(xFrameOptions);
      document.head.removeChild(xContentTypeOptions);
    };
  }, []);

  return <>{children}</>;
};
