"use client";

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LinkManager } from '@/components/link-manager';
import { AnimatedBackground } from '@/components/animated-background';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {isStarted ? (
          <LinkManager key="link-manager" />
        ) : (
          <WelcomeScreen key="welcome-screen" onGetStarted={() => setIsStarted(true)} />
        )}
      </AnimatePresence>
    </>
  );
}
