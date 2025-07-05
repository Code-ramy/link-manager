"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    Link as LinkIcon, 
    X,
    Megaphone,
    Wrench,
    Package,
    Users,
    Bookmark,
    CalendarDays,
    type LucideProps
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AiDevelopment } from '@/lib/types';
import { getCategoryText } from '@/lib/data';

// --- Icon Component ---
const iconMap = {
    Megaphone,
    Wrench,
    Package,
    Users,
    Bookmark,
    CalendarDays,
};

const CardIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const LucideIcon = iconMap[name as keyof typeof iconMap];
    if (!LucideIcon) return null; // Or a fallback icon
    return <LucideIcon {...props} />;
};
// ---

// --- Formatted Text Component ---
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className="text-muted-foreground leading-relaxed">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="text-foreground font-medium">
            {part}
          </strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

// --- Filter Button Component ---
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
      'filter-btn font-headline py-2 px-5 text-sm font-medium rounded-full transition-all shrink-0 flex items-center gap-2',
      currentFilter === filter ? 'active-btn' : ''
    )}
    onClick={() => onClick(filter)}
  >
    {icon && <CardIcon name={icon} className="h-4 w-4" />}
    <span>{text}</span>
  </button>
);


// --- Animation Variants ---
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } },
};

const modalContentVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.1 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};


export function AiInsightsStream({ developments }: { developments: AiDevelopment[] }) {
    const [currentFilter, setCurrentFilter] = useState('all');
    const [filteredDevelopments, setFilteredDevelopments] = useState<AiDevelopment[]>(developments);
    const [selectedItem, setSelectedItem] = useState<AiDevelopment | null>(null);

    useEffect(() => {
        if (currentFilter === 'all') {
            setFilteredDevelopments(developments);
        } else {
            setFilteredDevelopments(developments.filter(item => item.category === currentFilter));
        }
    }, [currentFilter, developments]);

    const handleCardClick = (item: AiDevelopment) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedItem) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem]);

    const filters = [
      { key: 'all', text: 'الكل' },
      { key: 'official', text: 'رسمي', icon: 'Megaphone' },
      { key: 'tools', text: 'أدوات', icon: 'Wrench' },
      { key: 'products', text: 'منتجات', icon: 'Package' },
      { key: 'community', text: 'مجتمعي', icon: 'Users' },
    ];

    return (
        <>
            <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <header className="text-center mb-16 mt-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-4" 
                        style={{ textShadow: '0 5px 25px rgba(0,0,0,0.3)' }}
                    >
                        آخر تطورات Google في الذكاء الاصطناعي
                    </motion.h1>
                </header>
                
                <div className="flex flex-col items-center gap-6 mb-12">
                    <nav id="filter-nav" className="flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-full relative">
                        {filters.map(f => (
                          <FilterButton 
                            key={f.key}
                            filter={f.key}
                            currentFilter={currentFilter}
                            onClick={setCurrentFilter}
                            text={f.text}
                            icon={f.icon}
                          />
                        ))}
                    </nav>
                </div>

                <motion.main 
                    layout 
                    id="cards-container" 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredDevelopments.map((item, index) => (
                            <motion.div 
                                layout="position"
                                key={item.title} 
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                custom={index}
                                className="glass-card p-6 flex flex-col justify-between cursor-pointer"
                                onClick={() => handleCardClick(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item)}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{getCategoryText(item.category)}</span>
                                        <CardIcon name={item.icon} className="text-muted-foreground w-5 h-5" />
                                    </div>
                                    <h3 className="font-headline font-bold text-xl text-foreground mb-3 h-16">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed h-20">{item.shortDesc}</p>
                                </div>
                                <div className="text-xs mt-6 pt-4 border-t border-border flex justify-between items-center">
                                    <span className="font-semibold flex items-center gap-2 text-yellow-400">
                                      <Bookmark className="h-3.5 w-3.5" />
                                      <span>{item.source}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 text-green-400">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      <span>{item.date}</span>
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.main>
            </div>
            
            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        id="modal-backdrop" 
                        className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60" 
                        onClick={closeModal}
                        variants={modalBackdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div 
                            id="modal-content" 
                            className="modal-card w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition rounded-full h-8 w-8" onClick={closeModal}>
                                <X className="h-5 w-5" />
                            </Button>
                            <div id="modal-body">
                                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 border-b border-border">
                                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-4 rounded-xl text-primary flex-shrink-0">
                                        <CardIcon name={selectedItem.icon} className="w-8 h-8" />
                                    </div>
                                    <div className="flex-grow">
                                        <h2 className="font-headline text-xl sm:text-2xl font-bold text-foreground">{selectedItem.title}</h2>
                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                            <p className="font-semibold flex items-center gap-2"><Bookmark className="w-3.5 h-3.5 text-yellow-500" /><span>{selectedItem.source}</span></p>
                                            <p className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5 text-green-500" /><span>{selectedItem.date}</span></p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="py-6 space-y-4">
                                    {selectedItem.details.map((detail, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="relative flex-shrink-0 mt-1.5">
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
                                                <Check className="relative z-10 w-5 h-5 text-primary bg-background p-0.5 rounded-full border-2 border-primary/50" />
                                            </div>
                                            <div className="w-full">
                                                <FormattedText text={detail} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedItem.link && selectedItem.link !== '#' && (
                                    <div className="mt-2 pt-6 border-t border-border flex justify-center">
                                        <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-full transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-primary/20">
                                            <span>اقرأ المصدر</span>
                                            <LinkIcon className="h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
