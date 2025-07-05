"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryText, icons } from '@/lib/data';
import type { AiDevelopment } from '@/lib/types';
import { cn } from '@/lib/utils';

// --- Formatted Text Component ---
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className="text-gray-300 leading-relaxed">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="text-white font-medium">
            {part}
          </strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

// --- Main Component ---
export function AiInsightsStream({ developments }: { developments: AiDevelopment[] }) {
    const [currentFilter, setCurrentFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<AiDevelopment | null>(null);

    const filterNavRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<HTMLDivElement>(null);

    // Filter developments directly based on the current filter state
    const filteredDevelopments = currentFilter === 'all'
        ? developments
        : developments.filter(item => item.category === currentFilter);
    
    const filters = React.useMemo(() => [
        { key: 'all', text: 'الكل' },
        { key: 'official', text: 'رسمي', icon: icons.official },
        { key: 'tools', text: 'أدوات', icon: icons.tools },
        { key: 'products', text: 'منتجات', icon: icons.products },
        { key: 'community', text: 'مجتمعي', icon: icons.community },
    ], []);

    const moveMarker = (targetButton: HTMLElement) => {
        if (!filterNavRef.current || !markerRef.current) return;
        const navRect = filterNavRef.current.getBoundingClientRect();
        const targetRect = targetButton.getBoundingClientRect();
        const offsetX = targetRect.left - navRect.left;
        
        markerRef.current.style.width = `${targetRect.width}px`;
        markerRef.current.style.height = `${targetRect.height}px`;
        markerRef.current.style.transform = `translateX(${offsetX}px)`;
    };
    
    useEffect(() => {
        const calculateAndMoveMarker = () => {
            const activeBtn = filterNavRef.current?.querySelector(`[data-filter="${currentFilter}"]`) as HTMLElement;
            if (activeBtn) {
                moveMarker(activeBtn);
            }
        };

        const timer = setTimeout(calculateAndMoveMarker, 50);
        window.addEventListener('resize', calculateAndMoveMarker);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateAndMoveMarker);
        };
    }, [currentFilter]);


    const handleFilterClick = (filter: string) => {
        if (filter === currentFilter) return;
        setCurrentFilter(filter);
    };

    const handleCardClick = (item: AiDevelopment) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' } },
        exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2, ease: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' } },
    };
    
    const modalBackdropVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };

    const containerVariants = {
        hidden: { opacity: 1 }, // Start with opacity 1 to avoid initial flash
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07, // This creates the sequential animation for children
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };


    return (
        <>
            <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8 mt-4">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        آخر تطورات Google في الذكاء الاصطناعي
                    </h1>
                </header>
                
                <div className="flex justify-center mb-10">
                    <nav 
                        ref={filterNavRef}
                        className="relative flex items-center justify-center flex-wrap gap-2 p-2 rounded-full"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                        <div
                            ref={markerRef}
                            className="absolute top-2 left-0 h-[calc(100%-1rem)] rounded-full bg-[#4285F4] shadow-[0_0_8px_rgba(66,133,244,0.4)] transition-all duration-500"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                        ></div>
                        {filters.map(f => (
                          <button 
                            key={f.key}
                            data-filter={f.key}
                            onClick={() => handleFilterClick(f.key)}
                            className={cn(
                                'relative z-10 font-headline py-2 px-4 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 shrink-0 flex items-center gap-2',
                                currentFilter === f.key ? 'text-white' : 'text-gray-300 hover:text-white'
                            )}
                          >
                            {f.icon && <span dangerouslySetInnerHTML={{ __html: f.icon }} />}
                            <span>{f.text}</span>
                          </button>
                        ))}
                    </nav>
                </div>

                <motion.main 
                    key={currentFilter} // IMPORTANT: Re-triggers the animation when the filter changes
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {filteredDevelopments.map((item) => (
                        <motion.div 
                            key={item.title} 
                            variants={cardVariants} // Variants are controlled by the parent's staggerChildren
                            className="glass-card rounded-2xl p-6 flex flex-col justify-between cursor-pointer"
                            onClick={() => handleCardClick(item)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: item.icon }} />
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/20 text-gray-200 border border-white/10">{getCategoryText(item.category)}</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-white mb-2">{item.title}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{item.shortDesc}</p>
                            </div>
                            <div className="text-xs mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="font-semibold text-yellow-400 flex items-center gap-2" dangerouslySetInnerHTML={{ __html: `${icons.source}<span>${item.source}</span>` }} />
                                <span className="flex items-center gap-1 text-green-400" dangerouslySetInnerHTML={{ __html: `${icons.date}<span>${item.date}</span>` }} />
                            </div>
                        </motion.div>
                    ))}
                </motion.main>
            </div>
            
            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex justify-center items-center p-4" 
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}
                        onClick={closeModal}
                        variants={modalBackdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div 
                            className="modal-card w-full max-w-2xl rounded-2xl shadow-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <button onClick={closeModal} className="absolute top-4 left-4 text-gray-300 hover:text-white transition">
                               <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="flex flex-col gap-4 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <span 
                                        className="bg-gradient-to-br from-blue-500/30 to-purple-600/30 p-3 rounded-xl text-white" 
                                        dangerouslySetInnerHTML={{ __html: selectedItem.icon.replace('width="20"','width="28"').replace('height="20"','height="28"')}} 
                                    />
                                    <div>
                                        <h2 className="font-headline text-xl font-bold text-white">{selectedItem.title}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <p className="font-semibold text-yellow-400 flex items-center gap-2" dangerouslySetInnerHTML={{ __html: `${icons.source}<span>${selectedItem.source}</span>` }} />
                                            <p className="text-green-400 flex items-center gap-2" dangerouslySetInnerHTML={{ __html: `${icons.date}<span>${selectedItem.date}</span>` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="py-6 space-y-4">
                                {selectedItem.details.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1 w-5 h-5 text-blue-400 bg-[#171424] p-0.5 rounded-full" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` }}/>
                                        <FormattedText text={detail} />
                                    </div>
                                ))}
                            </div>

                            {selectedItem.link && selectedItem.link !== '#' && (
                                <div className="mt-2 pt-6 border-t border-white/10 flex justify-center">
                                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-full transition-transform transform hover:scale-105 inline-flex items-center gap-2">
                                        <span>اقرأ المصدر</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
