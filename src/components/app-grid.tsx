
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragStartEvent, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WebApp } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppIcon } from '@/components/app-icon';
import { useAppContext } from '@/contexts/app-context';
import { CategoryEmptyState } from './category-empty-state';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
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
      duration: 550,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    position: 'relative',
    opacity: isDragging ? 0 : 1, // Hide original item smoothly
    zIndex: isDragging ? 0 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </div>
  );
};

interface AppGridProps {
  appsToRender: WebApp[];
  onEdit: (app: WebApp) => void;
  onDelete: (app: WebApp) => void;
  onAddApp: () => void;
  currentFilter: string;
}

export function AppGrid({ appsToRender, onEdit, onDelete, onAddApp, currentFilter }: AppGridProps) {
  const { setApps, hasMounted } = useAppContext();
  const [orderedApps, setOrderedApps] = useState<WebApp[]>([]);
  const [activeApp, setActiveApp] = useState<WebApp | null>(null);
  const [droppedId, setDroppedId] = useState<string | null>(null);
  
  useEffect(() => {
    setOrderedApps(appsToRender);
  }, [appsToRender]);

  const isDragging = !!activeApp;
  
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleAppDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveApp(orderedApps.find(app => app.id === active.id) || null);
  };

  const handleAppDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = orderedApps.findIndex(app => app.id === active.id);
        const newIndex = orderedApps.findIndex(app => app.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(orderedApps, oldIndex, newIndex);
            setOrderedApps(newOrder); // Optimistic update for UI
            setApps(newOrder); // Update database in the background
            setDroppedId(active.id as string);
            setTimeout(() => setDroppedId(null), 400);
        }
    }
    setActiveApp(null);
  };
  
  const handleAppDragCancel = () => {
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
    <div className={cn("pb-20", isDragging && '[&_a]:pointer-events-none')}>
      <DndContext 
        sensors={sensors} 
        collisionDetector={closestCenter} 
        onDragStart={handleAppDragStart}
        onDragEnd={handleAppDragEnd}
        onDragCancel={handleAppDragCancel}
      >
        <SortableContext items={orderedApps.map(a => a.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFilter}
              className="grid grid-cols-7 gap-12 justify-items-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
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

        <DragOverlay>
          {activeApp ? (
            <AppIcon
              app={activeApp}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
