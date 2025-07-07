"use client";

import { motion } from 'framer-motion';
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryEmptyStateProps {
  onAddApp: () => void;
}

export function CategoryEmptyState({ onAddApp }: CategoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-24">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      >
        <PackageOpen className="w-24 h-24 text-muted-foreground/50 mb-6" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-bold text-white mb-3 font-headline"
      >
        No apps in this category
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-muted-foreground text-lg mb-8 max-w-md"
      >
        Add a new application to this category to see it here.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex gap-4"
      >
        <Button size="lg" variant="outline" className="text-white bg-white/10 border-white/20 hover:bg-white/20 rounded-full" onClick={onAddApp}>
          <Plus className="mr-2 h-5 w-5" />
          Add App
        </Button>
      </motion.div>
    </div>
  );
}
