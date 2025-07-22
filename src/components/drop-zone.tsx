
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud } from 'lucide-react';
import { z } from 'zod';

const urlSchema = z.string().url();

interface DropZoneProps {
  children: React.ReactNode;
  onUrlDrop: (url: string) => void;
}

export function DropZone({ children, onUrlDrop }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    let url: string | null = null;

    // First, try to get the URL from 'text/uri-list'
    url = e.dataTransfer.getData('text/uri-list');

    // If that fails, try 'text/plain'
    if (!url) {
      url = e.dataTransfer.getData('text/plain');
    }
    
    // Check if what we got is a valid URL
    const validation = urlSchema.safeParse(url);
    if (validation.success) {
      onUrlDrop(validation.data);
    }

  }, [onUrlDrop]);

  useEffect(() => {
    const handleDragEnd = () => {
      dragCounter.current = 0;
      setIsDragging(false);
    };

    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <DownloadCloud className="w-24 h-24 text-primary mb-4" />
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white font-headline"
            >
              Drop link here to add
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
