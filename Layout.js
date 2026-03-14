import React, { useEffect } from 'react';

export default function Layout({ children }) {
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="google-site-verification"]');
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = 'qqbJbOzCw12bNI1LaBHnqJEvRyx8EVuteh4cDguhYe0';
      document.head.appendChild(meta);
    }
  }, []);
  return <div className="min-h-screen bg-[#1a1a1b]">{children}</div>;
}