"use client";

import { useRef, useCallback, useLayoutEffect, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/app-context';
import { Icon } from './icon';

interface CategoryFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CategoryFilter({ currentFilter, onFilterChange }: CategoryFilterProps) {
  const { categories } = useAppContext();
  const filterNavRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: true, isOverflowing: false });

  const updateScrollState = useCallback(() => {
    const nav = filterNavRef.current;
    if (!nav) return;
    const buffer = 1;
    const isOverflowing = nav.scrollWidth > nav.clientWidth + buffer;
    const atStart = nav.scrollLeft <= 0;
    const atEnd = nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - buffer;
    setScrollState(prevState => {
      if (prevState.isOverflowing !== isOverflowing || prevState.atStart !== atStart || prevState.atEnd !== atEnd) {
        return { isOverflowing, atStart, atEnd };
      }
      return prevState;
    });
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    const nav = filterNavRef.current;
    if (nav) nav.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('resize', updateScrollState);
      if (nav) nav.removeEventListener('scroll', updateScrollState);
    };
  }, [categories, updateScrollState]);

  const moveMarker = useCallback(() => {
    if (!filterNavRef.current) return;
    const activeBtn = filterNavRef.current.querySelector(`[data-filter="${currentFilter}"]`) as HTMLElement;
    if (!markerRef.current || !activeBtn) return;
    const { offsetLeft, offsetWidth } = activeBtn;
    markerRef.current.style.width = `${offsetWidth}px`;
    markerRef.current.style.transform = `translateX(${offsetLeft}px)`;
  }, [currentFilter]);

  useEffect(() => {
    moveMarker();
    setTimeout(updateScrollState, 750); // Increased timeout to allow for the longer animation
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
    <div className="flex justify-center mt-24 mb-8 min-h-[56px] items-center">
      <div className="inline-flex max-w-3xl">
        <nav
          ref={filterNavRef}
          onScroll={updateScrollState}
          className={cn(
            "glass-bar relative flex items-center flex-nowrap overflow-x-auto scrollbar-hide gap-1 rounded-full p-1.5 shadow-lg",
            {
              'scroll-fade-both': scrollState.isOverflowing && !scrollState.atStart && !scrollState.atEnd,
              'scroll-fade-right': scrollState.isOverflowing && scrollState.atStart && !scrollState.atEnd,
              'scroll-fade-left': scrollState.isOverflowing && !scrollState.atStart && scrollState.atEnd,
            }
          )}
        >
          <div
            ref={markerRef}
            className="absolute left-0 top-1.5 h-[calc(100%-0.75rem)] origin-left rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
          ></div>
          <button
            data-filter="all"
            onClick={() => handleFilterClick('all')}
            className={cn(
              "relative z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300",
              currentFilter === "all" ? "text-white" : "text-gray-200 hover:bg-white/10 hover:text-white"
            )}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              data-filter={c.id}
              onClick={() => handleFilterClick(c.id)}
              className={cn(
                "relative z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300",
                currentFilter === c.id ? "text-white" : "text-gray-200 hover:bg-white/10 hover:text-white"
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
