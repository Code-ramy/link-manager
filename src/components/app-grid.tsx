"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WebApp } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppIcon } from '@/components/app-icon';
import { useAppContext } from '@/contexts/app-context';
import { CategoryEmptyState } from './category-empty-state';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// ==== تحسين متغيرات الأنيميشن لجعلها انسيابية وناعمة ====
const containerVariants = {
  visible: {
    transition: { 
      staggerChildren: 0.13,
      delayChildren: 0.18,
      when: "beforeChildren"
    },
  },
  hidden: {
    transition: { 
      staggerChildren: 0.04, 
      staggerDirection: -1 
    },
  },
};

const itemVariants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 38,
      damping: 26,
      mass: 0.32,
      duration: 0.7,
      ease: [0.18, 0.89, 0.32, 1.28]
    }
  },
  hidden: {
    opacity: 0,
    y: 70,
    scale: 0.89,
    transition: {
      type: "tween",
      duration: 0.54,
      ease: [0.18, 0.89, 0.32, 1.28]
    }
  },
  exit: {
    opacity: 0,
    y: 35,
    scale: 0.87,
    transition: {
      type: "tween",
      duration: 0.25,
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
};

const SortableItem = ({ id, children }: { id: string | number, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 550, // رفع مدة السحب ليصبح أكثر نعومة
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    position: 'relative',
    opacity: isDragging ? 0 : 1, // Hide original item smoothly
    zIndex: isDragging ? 0 : 'auto',
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined, // إضافة ظل خفيف أثناء السحب
    borderRadius: '12px',
    willChange: 'transform, opacity'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div variants={itemVariants} exit="exit">
        {children}
      </motion.div>
    </div>
  );
};

interface AppGridProps {
  onEdit: (app: WebApp) => void;
  onDelete: (app: WebApp) => void;
  onAddApp: () => void;
  currentFilter: string;
}

export function AppGrid({ onEdit, onDelete, onAddApp, currentFilter }: AppGridProps) {
  const { apps, setApps, hasMounted } = useAppContext();
  const [orderedApps, setOrderedApps] = useState<WebApp[]>([]);
  const [droppedId, setDroppedId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<WebApp | null>(null);

  const getAppById = (id: string | null) => apps.find(app => app.id === id);
  const isDragging = !!activeApp;

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));
  
  useEffect(() => {
    let sortedApps;
    const filteredApps = apps.filter(app => currentFilter === 'all' || app.categoryId === currentFilter);

    if (currentFilter === 'all') {
      sortedApps = [...filteredApps].sort((a, b) => a.globalOrder - b.globalOrder);
    } else {
      sortedApps = [...filteredApps].sort((a, b) => {
        const orderA = a.categoryOrder?.[currentFilter] ?? a.globalOrder;
        const orderB = b.categoryOrder?.[currentFilter] ?? b.globalOrder;
        return orderA - orderB;
      });
    }
    setOrderedApps(sortedApps);
  }, [apps, currentFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveApp(getAppById(active.id as string) || null);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedApps.findIndex(app => app.id === active.id);
      const newIndex = orderedApps.findIndex(app => app.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(orderedApps, oldIndex, newIndex);
        setOrderedApps(newOrder); // Optimistic update for UI
        setApps(newOrder, currentFilter); // Update database in the background
        setDroppedId(active.id as string);
        setTimeout(() => setDroppedId(null), 400);
      }
    }
    setActiveApp(null);
  };

  const handleDragCancel = () => {
    setActiveApp(null);
  }

  if (!hasMounted) {
    return (
      <div className="grid grid-cols-7 gap-12 justify-items-center">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center w-24">
            <Skeleton className="w-16 h-16 rounded-lg !duration-1000" />
            <Skeleton className="h-4 w-20 rounded-md !duration-1000" />
          </div>
        ))}
      </div>
    );
  }

  if (orderedApps.length === 0) {
    return <CategoryEmptyState onAddApp={onAddApp} />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn("pb-20", isDragging && '[&_a]:pointer-events-none')}>
        <SortableContext items={orderedApps.map(a => a.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFilter}
              className="grid grid-cols-7 gap-12 justify-items-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {orderedApps.map((app) => (
                <SortableItem key={app.id} id={app.id}>
                  <AppIcon
                    app={app}
                    onEdit={() => onEdit(app)}
                    onDelete={() => onDelete(app)}
                    isDropped={droppedId === app.id}
                  />
                </SortableItem>
              ))}
            </motion.div>
          </AnimatePresence>
        </SortableContext>
      </div>
      <DragOverlay>
          {activeApp ? (
            <AppIcon
              app={activeApp}
              onEdit={() => { }}
              onDelete={() => { }}
              isDragging
            />
          ) : null}
      </DragOverlay>
    </DndContext>
  );
}
