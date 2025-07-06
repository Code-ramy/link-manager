import type { WebApp, Category } from './types';

export const initialCategories: Category[] = [
    { id: 'social', name: 'تواصل اجتماعي', icon: 'Users' },
    { id: 'design', name: 'تصميم', icon: 'Figma' },
    { id: 'dev', name: 'تطوير', icon: 'Code' },
    { id: 'entertainment', name: 'ترفيه', icon: 'Clapperboard' },
];

export const initialWebApps: WebApp[] = [
    { id: '1', name: 'فيسبوك', url: 'https://facebook.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=facebook.com`, categoryId: 'social', clip: true },
    { id: '2', name: 'انستغرام', url: 'https://instagram.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=instagram.com`, categoryId: 'social', clip: true },
    { id: '3', name: 'تويتر', url: 'https://x.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=x.com`, categoryId: 'social', clip: true },
    { id: '4', name: 'فيجما', url: 'https://figma.com', icon: 'Figma', categoryId: 'design', clip: false },
    { id: '5', name: 'يوتيوب', url: 'https://youtube.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=youtube.com`, categoryId: 'entertainment', clip: true },
    { id: '6', name: 'سبوتيفاي', url: 'https://spotify.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=spotify.com`, categoryId: 'entertainment', clip: true },
    { id: '7', name: 'Github', url: 'https://github.com', icon: 'Github', categoryId: 'dev', clip: false },
    { id: '8', name: 'Google', url: 'https://google.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=google.com`, categoryId: 'all', clip: true },
];
