"use client";

import { cn } from '@/lib/utils';
import type { WebApp } from '@/lib/types';
import * as LucideIcons from "lucide-react";
import { Button } from './ui/button';
import { Icon } from './icon';

export const AppIcon = ({ app, onEdit, onDelete, isDragging }: { app: WebApp, onEdit: () => void, onDelete: () => void, isDragging: boolean }) => {
  return (
    <div className="group flex flex-row items-start gap-0">
      <div className="flex flex-col items-center gap-2 text-center w-20">
        <div className="w-16 h-16">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
            draggable="false"
          >
            <div
              className={cn(
                'w-full h-full transition-all duration-200 ease-in-out flex items-center justify-center',
                isDragging
                  ? 'scale-110 shadow-2xl transform-gpu z-10'
                  : 'scale-100 shadow-none'
              )}
            >
              <div className={cn(
                "w-full h-full flex items-center justify-center",
                app.icon.startsWith('data:image') || app.icon.startsWith('http') 
                  ? (app.clip && "rounded-lg overflow-hidden")
                  : ""
              )}>
                <Icon
                  name={app.icon}
                  alt={app.name}
                  className={app.icon.startsWith('data:image') || app.icon.startsWith('http') ? 'w-full h-full object-contain' : 'w-9 h-9 text-white'}
                />
              </div>
            </div>
          </a>
        </div>
        <p className="text-base text-white w-24 truncate">{app.name}</p>
      </div>
      
      <div className={cn(
        "flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -ml-2"
      )}>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={onEdit}>
          <LucideIcons.Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-400" onClick={onDelete}>
          <LucideIcons.Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
};
