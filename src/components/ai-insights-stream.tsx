"use client";

import React, { useState, useEffect } from 'react';
import { Check, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AiDevelopment } from '@/lib/types';
import { getCategoryText } from '@/lib/data';
import { icons, Icon } from './icons';

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

const FilterButton = ({
  filter,
  currentFilter,
  onClick,
  icon,
  text,
}: {
  filter: string;
  currentFilter: string;
  onClick: (filter: string) => void;
  icon?: string;
  text: string;
}) => (
  <button
    data-filter={filter}
    className={cn(
      'filter-btn py-2 px-5 text-sm font-medium rounded-full transition-all shrink-0 flex items-center gap-2',
      currentFilter === filter ? 'active-btn' : ''
    )}
    onClick={() => onClick(filter)}
  >
    {icon && <Icon svg={icon} />}
    <span>{text}</span>
  </button>
);

export function AiInsightsStream({ developments }: { developments: AiDevelopment[] }) {
    const [currentFilter, setCurrentFilter] = useState('all');
    const [filteredDevelopments, setFilteredDevelopments] = useState<AiDevelopment[]>([]);
    const [selectedItem, setSelectedItem] = useState<AiDevelopment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(true);

    useEffect(() => {
        setFilteredDevelopments(developments);
        setCardsLoading(false);
    }, [developments]);

    useEffect(() => {
        setCardsLoading(true);
        const timer = setTimeout(() => {
            const data = currentFilter === 'all' 
                ? developments 
                : developments.filter(item => item.category === currentFilter);
            setFilteredDevelopments(data);
            setCardsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [currentFilter, developments]);

    const handleFilterClick = (filter: string) => {
        setCurrentFilter(filter);
    };

    const handleCardClick = (item: AiDevelopment) => {
        setSelectedItem(item);
        setIsModalOpen(true);
        setIsModalClosing(false);
    };

    const closeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedItem(null);
        }, 300);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isModalOpen) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    const filters = [
      { key: 'all', text: 'الكل' },
      { key: 'official', text: 'رسمي', icon: icons.official },
      { key: 'tools', text: 'أدوات', icon: icons.tools },
      { key: 'products', text: 'منتجات', icon: icons.products },
      { key: 'community', text: 'مجتمعي', icon: icons.community },
    ];

    return (
        <>
            <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <header className="text-center mb-16 mt-8">
                    <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 3px 15px rgba(0,0,0,0.3)' }}>
                        آخر تطورات Google في الذكاء الاصطناعي
                    </h1>
                </header>
                
                <div className="flex flex-col items-center gap-6 mb-12">
                    <nav id="filter-nav" className="flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-full relative">
                        {filters.map(f => (
                          <FilterButton 
                            key={f.key}
                            filter={f.key}
                            currentFilter={currentFilter}
                            onClick={handleFilterClick}
                            text={f.text}
                            icon={f.icon}
                          />
                        ))}
                    </nav>
                </div>

                <main id="cards-container" className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 cards-container', { 'loading': cardsLoading })}>
                    {filteredDevelopments.map((item, index) => (
                        <div 
                            key={`${item.title}-${index}`} 
                            className="glass-card p-6 flex flex-col justify-between cursor-pointer fade-in-up"
                            style={{ animationDelay: `${index * 70}ms` }}
                            onClick={() => handleCardClick(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-medium px-3 py-1 rounded-md bg-black/20 text-gray-300 border border-white/10">{getCategoryText(item.category)}</span>
                                    <Icon svg={item.icon} className="text-gray-400" />
                                </div>
                                <h3 className="font-headline font-bold text-xl text-white mb-3 h-16">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed h-20">{item.shortDesc}</p>
                            </div>
                            <div className="text-xs mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-gray-500">
                                <span className="font-semibold flex items-center gap-2">
                                  <Icon svg={icons.source}/>
                                  <span>{item.source}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Icon svg={icons.date}/>
                                  <span>{item.date}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
            
            {isModalOpen && selectedItem && (
                <div id="modal-backdrop" className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/50" style={{ backdropFilter: 'blur(5px)' }} onClick={closeModal}>
                    <div 
                        id="modal-content" 
                        className={cn('modal-card w-full max-w-2xl rounded-2xl shadow-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto', isModalClosing ? 'modal-closing' : 'modal-opening')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-gray-300 hover:text-white transition rounded-full h-8 w-8" onClick={closeModal}>
                            <X className="h-5 w-5" />
                        </Button>
                        <div id="modal-body">
                            <div className="flex flex-col gap-4 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <span className="bg-gradient-to-br from-primary/30 to-accent/30 p-3 rounded-xl text-white">
                                        <Icon svg={selectedItem.icon.replace('width="20"','width="28"').replace('height="20"','height="28"')} />
                                    </span>
                                    <div>
                                        <h2 className="font-headline text-xl sm:text-2xl font-bold text-white">{selectedItem.title}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <p className="font-semibold flex items-center gap-2"><Icon svg={icons.source} /><span>{selectedItem.source}</span></p>
                                            <p className="flex items-center gap-2"><Icon svg={icons.date} /><span>{selectedItem.date}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="py-6 space-y-4">
                                {selectedItem.details.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0 mt-1.5">
                                            <div className="absolute top-2.5 right-1/2 translate-x-1/2 h-full w-0.5 bg-primary/30 rounded-full"></div>
                                            <Check className="relative z-10 w-5 h-5 text-primary bg-[#171424] p-0.5 rounded-full" />
                                        </div>
                                        <div className="w-full">
                                            <FormattedText text={detail} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedItem.link && selectedItem.link !== '#' && (
                                <div className="mt-2 pt-6 border-t border-white/10 flex justify-center">
                                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-full transition-all transform hover:scale-105 inline-flex items-center gap-2">
                                        <span>اقرأ المصدر</span>
                                        <LinkIcon className="h-4 w-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
