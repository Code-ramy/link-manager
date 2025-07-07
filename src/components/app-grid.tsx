"use client";

import { useId, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragStartEvent, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WebApp } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppIcon } from '@/components/app-icon';

const containerVariants = {
  visible: { transition: { staggerChildren: 0.05 } },
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const itemVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.6, y: 40, transition: { duration: 0.4, ease: "circOut" } }
};

const SortableItem = ({ id, children, isDragging }: { id: string | number, children: React.ReactNode, isDragging: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
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
  apps: WebApp[];
  allApps: WebApp[];
  setApps: (apps: WebApp[]) => void;
  onEdit: (app: WebApp) => void;
  onDelete: (app: WebApp) => void;
  hasMounted: boolean;
  currentFilter: string;
}

export function AppGrid({ apps, allApps, setApps, onEdit, onDelete, hasMounted, currentFilter }: AppGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dndId = useId();

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleAppDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id as string);
  };

  const handleAppDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndexInFiltered = apps.findIndex(app => app.id === active.id);
        const newIndexInFiltered = apps.findIndex(app => app.id === over.id);
        const activeApp = apps[oldIndexInFiltered];
        const overApp = apps[newIndexInFiltered];
        
        const oldIndexInFull = allApps.findIndex(app => app.id === activeApp.id);
        const newIndexInFull = allApps.findIndex(app => app.id === overApp.id);

        if (oldIndexInFull !== -1 && newIndexInFull !== -1) {
            setApps(arrayMove(allApps, oldIndexInFull, newIndexInFull));
        }
    }
    setActiveId(null);
    setIsDragging(false);
  };
  
  const handleAppDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
  }

  if (!hasMounted) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8 justify-items-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center w-20">
            <Skeleton className="w-16 h-16 rounded-lg !duration-1000" />
            <Skeleton className="h-4 w-20 rounded-md !duration-1000" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className={cn("pb-20 pt-12", isDragging && '[&_a]:pointer-events-none')}>
      <DndContext 
        id={dndId}
        sensors={sensors} 
        collisionDetector={closestCenter} 
        onDragStart={handleAppDragStart}
        onDragEnd={handleAppDragEnd}
        onDragCancel={handleAppDragCancel}
      >
        <SortableContext items={apps.map(a => a.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFilter}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8 justify-items-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {apps.map((app) => (
                <SortableItem key={app.id} id={app.id} isDragging={activeId === app.id}>
                  <AppIcon
                    app={app}
                    onEdit={() => onEdit(app)}
                    onDelete={() => onDelete(app)}
                    isDragging={activeId === app.id}
                  />
                </SortableItem>
              ))}
            </motion.div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </main>
  );
}
