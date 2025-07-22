"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LinkManager } from '@/components/link-manager';
import { AnimatedBackground } from '@/components/animated-background';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function Home() {
  const [isStarted, setIsStarted] = useState<boolean | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsStarted(true);
    } else {
      setIsStarted(false);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('hasVisited', 'true');
    setIsStarted(true);
  };

  if (isStarted === null) {
    return <AnimatedBackground />; // Or a loading spinner
  }

  return (
    <>
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {isStarted ? (
          <LinkManager key="link-manager" />
        ) : (
          <WelcomeScreen key="welcome-screen" onGetStarted={handleGetStarted} />
        )}
      </AnimatePresence>
    </>
  );
}
