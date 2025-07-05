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
};
const CardIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const LucideIcon = iconMap[name as keyof typeof iconMap];
    if (!LucideIcon) return null;
    return <LucideIcon {...props} />;
};

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
    className={cn(
      'relative font-headline py-2 px-5 text-sm font-medium rounded-full transition-all shrink-0 flex items-center gap-2',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      currentFilter === filter 
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
        : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    )}
    onClick={() => onClick(filter)}
  >
    {icon && <CardIcon name={icon} className="h-4 w-4" />}
    <span>{text}</span>
  </button>
);

// --- Animation Variants ---
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    },
  },
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const modalContentVariants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { scale: 0.98, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export function AiInsightsStream({ developments }: { developments: AiDevelopment[] }) {
    const [currentFilter, setCurrentFilter] = useState('all');
    const [filteredDevelopments, setFilteredDevelopments] = useState<AiDevelopment[]>([]);
    const [selectedItem, setSelectedItem] = useState<AiDevelopment | null>(null);

    useEffect(() => {
        setFilteredDevelopments(
            currentFilter === 'all'
                ? developments
                : developments.filter(item => item.category === currentFilter)
        );
    }, [currentFilter, developments]);
    
    const filters = React.useMemo(() => [
      { key: 'all', text: 'الكل' },
      { key: 'official', text: 'رسمي', icon: 'Megaphone' },
      { key: 'tools', text: 'أدوات', icon: 'Wrench' },
      { key: 'products', text: 'منتجات', icon: 'Package' },
      { key: 'community', text: 'مجتمعي', icon: 'Users' },
    ], []);

    const handleCardClick = (item: AiDevelopment) => {
        setSelectedItem(item);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedItem(null);
        document.body.style.overflow = '';
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <header className="text-center mb-12 mt-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-headline text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary-foreground to-muted-foreground mb-4" 
                        style={{ textShadow: '0 2px 20px hsl(var(--primary) / 0.1)' }}
                    >
                        آخر تطورات Google في الذكاء الاصطناعي
                    </motion.h1>
                </header>
                
                <div className="flex justify-center mb-12">
                    <nav className="flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-full bg-secondary/30 backdrop-blur-sm border border-white/5">
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredDevelopments.map((item, index) => (
                            <motion.div 
                                layout
                                key={item.title} 
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                custom={index}
                                className="bg-secondary/40 border border-secondary rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-primary/70 hover:bg-secondary"
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
                                    <h3 className="font-headline font-bold text-lg text-foreground mb-3 line-clamp-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{item.shortDesc}</p>
                                </div>
                                <div className="text-xs mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="font-semibold flex items-center gap-1.5 text-yellow-400">
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
                        className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm" 
                        onClick={closeModal}
                        variants={modalBackdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div 
                            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition rounded-full h-8 w-8 z-10" onClick={closeModal}>
                                <X className="h-5 w-5" />
                            </Button>
                            
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 mb-4 border-b border-border">
                                <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                                    <CardIcon name={selectedItem.icon} className="w-8 h-8" />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="font-headline text-xl sm:text-2xl font-bold text-foreground">{selectedItem.title}</h2>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                        <p className="font-semibold flex items-center gap-1.5 text-yellow-400"><Bookmark className="w-3.5 h-3.5" /><span>{selectedItem.source}</span></p>
                                        <p className="flex items-center gap-1.5 text-green-400"><CalendarDays className="w-3.5 h-3.5" /><span>{selectedItem.date}</span></p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {selectedItem.details.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <Check className="flex-shrink-0 mt-1 w-5 h-5 text-primary bg-primary/10 p-0.5 rounded-full border-2 border-primary/30" />
                                        <FormattedText text={detail} />
                                    </div>
                                ))}
                            </div>

                            {selectedItem.link && selectedItem.link !== '#' && (
                                <div className="mt-6 pt-6 border-t border-border flex justify-center">
                                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-full transition-transform transform hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-primary/20">
                                        <span>اقرأ المصدر</span>
                                        <LinkIcon className="h-4 w-4" />
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
