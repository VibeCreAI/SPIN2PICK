import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface GoogleAdSenseProps {
  adSlot: string;
  adClient?: string;
  style?: any;
  format?: string;
  responsive?: boolean;
}

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adSlot,
  adClient = 'ca-pub-7239598551330509',
  style,
  format = 'auto',
  responsive = true,
}) => {
  const [adError, setAdError] = useState<string | null>(null);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if we're on the production domain (Vercel app where ads should show)
      const isProductionDomain = typeof window !== 'undefined' && 
        (window.location.hostname.includes('spin2pick-app.vercel.app') ||
         window.location.hostname.includes('vercel.app')); // Allow Vercel domains for actual app monetization
         // vibecreai.com will show placeholder since it's just a redirect
      
      setIsProduction(isProductionDomain);

      if (!isProductionDomain) {
        setAdError('AdSense ads only show on spin2pick-app.vercel.app');
        console.log('AdSense: Not on production domain, ads will not display');
        return;
      }

      try {
        // Wait a bit for the script to load
        const timer = setTimeout(() => {
          // @ts-ignore
          if (window.adsbygoogle) {
            try {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              console.log('AdSense: Ad initialized successfully');
            } catch (pushError) {
              console.error('AdSense push error:', pushError);
              setAdError('Failed to initialize ad');
            }
          } else {
            console.error('AdSense: adsbygoogle not available');
            setAdError('AdSense script not loaded');
          }
        }, 100);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('AdSense error:', error);
        setAdError('AdSense initialization error');
      }
    }
  }, []);

  // Web에서만 렌더링
  if (Platform.OS !== 'web') {
    return null;
  }

  // Show fallback for non-production domains or errors
  if (!isProduction || adError) {
    return (
      <div style={{ 
        ...style,
        padding: '20px', 
        minHeight: '60px', // Reduced from 200px to eliminate excessive space
        backgroundColor: '#f8f9fa', 
        textAlign: 'center',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '14px', paddingTop: '10px' }}> 
          📊 AdSense Ad Space
        </div>
        <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
          {adError || 'Ads available on spin2pick-app.vercel.app'}
        </div>
      </div>
    );
  }

  return (
    <div style={{...style, minHeight: '60px', textAlign: 'center'}}> 
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}; 