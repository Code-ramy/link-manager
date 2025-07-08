
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
import { useAppContext } from '@/contexts/app-context';
import { CategoryEmptyState } from './category-empty-state';

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
  appsToRender: WebApp[];
  onEdit: (app: WebApp) => void;
  onDelete: (app: WebApp) => void;
  onAddApp: () => void;
  currentFilter: string;
}

export function AppGrid({ appsToRender, onEdit, onDelete, onAddApp, currentFilter }: AppGridProps) {
  const { apps: allApps, setApps, hasMounted } = useAppContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dndId = useId();

  const isDragging = !!draggingId;

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleAppDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };

  const handleAppDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndexInFull = allApps.findIndex(app => app.id === active.id);
        const newIndexInFull = allApps.findIndex(app => app.id === over.id);

        if (oldIndexInFull !== -1 && newIndexInFull !== -1) {
            setApps(arrayMove(allApps, oldIndexInFull, newIndexInFull));
        }
    }
    setDraggingId(null);
  };
  
  const handleAppDragCancel = () => {
    setDraggingId(null);
  }

  if (!hasMounted) {
    return (
      <div className="grid grid-cols-7 gap-4 justify-items-center">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center w-20">
            <Skeleton className="w-16 h-16 rounded-lg !duration-1000" />
            <Skeleton className="h-4 w-20 rounded-md !duration-1000" />
          </div>
        ))}
      </div>
    );
  }
  
  if (appsToRender.length === 0) {
      return <CategoryEmptyState onAddApp={onAddApp} />
  }

  return (
    <div className={cn("pb-20 pt-12", isDragging && '[&_a]:pointer-events-none')}>
      <DndContext 
        id={dndId}
        sensors={sensors} 
        collisionDetector={closestCenter} 
        onDragStart={handleAppDragStart}
        onDragEnd={handleAppDragEnd}
        onDragCancel={handleAppDragCancel}
      >
        <SortableContext items={appsToRender.map(a => a.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFilter}
              className="grid grid-cols-7 gap-4 justify-items-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {appsToRender.map((app) => (
                <SortableItem key={app.id} id={app.id} isDragging={draggingId === app.id}>
                  <AppIcon
                    app={app}
                    onEdit={() => onEdit(app)}
                    onDelete={() => onDelete(app)}
                    isDragging={draggingId === app.id}
                  />
                </SortableItem>
              ))}
            </motion.div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  );
}
