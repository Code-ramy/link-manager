
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Logo } from './logo';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 13,
      mass: 0.8
    },
  },
};

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-neutral-950/70 text-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mb-5">
            <Logo width={80} height={80} />
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-white tracking-tighter">
                Link Manager
            </h1>
        </motion.div>
      <motion.p 
        className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8"
        variants={itemVariants}
      >
        Your personal space to organize, access, and manage all your favorite web applications and links in one place.
      </motion.p>
      <motion.div variants={itemVariants}>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg shadow-blue-500/20 transform transition-transform hover:scale-105 active:scale-100"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
