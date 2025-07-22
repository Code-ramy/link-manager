
"use client";

import { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/app-context';
import { Icon } from './icon';
import { LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CategoryFilter({ currentFilter, onFilterChange }: CategoryFilterProps) {
  const { categories } = useAppContext();
  const filterNavRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    const nav = filterNavRef.current;
    if (!nav) return;
    const buffer = 1;
    const isOverflowing = nav.scrollWidth > nav.clientWidth + buffer;
    const atStart = nav.scrollLeft <= 0;
    const atEnd = nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - buffer;
    
    nav.classList.toggle('scroll-fade-both', isOverflowing && !atStart && !atEnd);
    nav.classList.toggle('scroll-fade-right', isOverflowing && atStart && !atEnd);
    nav.classList.toggle('scroll-fade-left', isOverflowing && !atStart && atEnd);
  }, []);

  const moveMarker = useCallback(() => {
    const nav = filterNavRef.current;
    const marker = markerRef.current;
    if (!nav || !marker) return;

    const activeBtn = nav.querySelector(`[data-filter="${currentFilter}"]`) as HTMLElement;
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn;
      marker.style.width = `${offsetWidth}px`;
      marker.style.transform = `translateX(${offsetLeft}px)`;
    }
  }, [currentFilter]);

  useEffect(() => {
    moveMarker();
    
    const nav = filterNavRef.current;
    if (!nav) return;

    // Initial check and setup listeners
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    nav.addEventListener('scroll', updateScrollState, { passive: true });

    // Ensure state is correct after animations
    const timer = setTimeout(updateScrollState, 750);

    return () => {
      window.removeEventListener('resize', updateScrollState);
      nav.removeEventListener('scroll', updateScrollState);
      clearTimeout(timer);
    };
  }, [currentFilter, categories, moveMarker, updateScrollState]);


  const handleFilterClick = (filter: string) => {
    onFilterChange(filter);
    const nav = filterNavRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector(`[data-filter="${filter}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  if (categories.length === 0) {
    return <div className="min-h-[56px]" />;
  }

  return (
    <div className="flex justify-center mb-16 min-h-[56px] items-center">
      <div className="inline-flex max-w-3xl">
        <nav
          ref={filterNavRef}
          className={cn(
            "glass-bar relative flex items-center flex-nowrap overflow-x-auto scrollbar-hide gap-1 rounded-full p-1.5 shadow-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
            "scroll-smooth"
          )}
        >
          <div
            ref={markerRef}
            className="absolute left-0 top-1.5 h-[calc(100%-0.75rem)] origin-left rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]"
          ></div>
          <button
            data-filter="all"
            onClick={() => handleFilterClick('all')}
            className={cn(
              "relative z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 active:scale-95",
              currentFilter === "all" ? "text-white scale-110" : "text-gray-200 hover:bg-muted/10 hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Apps
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              data-filter={c.id}
              onClick={() => handleFilterClick(c.id)}
              className={cn(
                "relative z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 active:scale-95",
                currentFilter === c.id ? "text-white scale-110" : "text-gray-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                <Icon name={c.icon} alt={c.name} className="h-full w-full object-contain" />
              </div>
              <span>{c.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
