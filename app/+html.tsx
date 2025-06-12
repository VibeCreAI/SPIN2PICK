import React, { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO Meta Tags */}
        <title>Spin2Pick - Fun Activity Picker for Kids</title>
        <meta name="description" content="Spin the wheel to pick fun activities for kids! Add custom activities and let AI suggest new ones. Perfect for parents, teachers, and caregivers." />
        <meta name="keywords" content="kids activities, activity picker, family fun, children games, activity wheel, parenting tools" />
        <meta name="author" content="VibeCreAI" />
        
        {/* Critical SEO fixes */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://vibecreai.com/spin2pick/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vibecreai.com/spin2pick/" />
        <meta property="og:title" content="Spin2Pick - Fun Activity Picker for Kids" />
        <meta property="og:description" content="Spin the wheel to pick fun activities for kids! Add custom activities and let AI suggest new ones. Perfect for parents, teachers, and caregivers." />
        <meta property="og:image" content="https://vibecreai.com/spin2pick/og_image_spin2pick.png" />
        <meta property="og:site_name" content="VibeCreAI" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://vibecreai.com/spin2pick/" />
        <meta name="twitter:title" content="Spin2Pick - Fun Activity Picker for Kids" />
        <meta name="twitter:description" content="Spin the wheel to pick fun activities for kids! Add custom activities and let AI suggest new ones. Perfect for parents, teachers, and caregivers." />
        <meta name="twitter:image" content="https://vibecreai.com/spin2pick/og_image_spin2pick.png" />

        {/* Structured Data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Spin2Pick",
            "description": "Spin the wheel to pick fun activities for kids! Add custom activities and let AI suggest new ones.",
            "url": "https://vibecreai.com/spin2pick/",
            "applicationCategory": "Game",
            "operatingSystem": "Web Browser",
            "author": {
              "@type": "Organization",
              "name": "VibeCreAI"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />

        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7239598551330509"
          crossOrigin="anonymous"
        />

        {/*
          Enable body scrolling on web for better user experience.
          ScrollViewStyleReset was disabling scrolling - commented out to allow normal page scrolling.
        */}
        {/* <ScrollViewStyleReset /> */}

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
} 