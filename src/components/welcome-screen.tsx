"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
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
      damping: 12,
    },
  },
};

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen text-center px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1 
        className="text-5xl md:text-7xl font-headline font-bold text-white mb-4"
        variants={itemVariants}
      >
        <span role="img" aria-label="brain" className="mr-4">🧠</span>
        Discover AI Tools
      </motion.h1>
      <motion.p 
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
        variants={itemVariants}
      >
        An organized platform to browse and filter AI applications by field and function.
      </motion.p>
      <motion.div variants={itemVariants}>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg transform transition-transform hover:scale-105 active:scale-100"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
