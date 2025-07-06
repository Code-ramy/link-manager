import type { WebApp, Category } from './types';

export const initialCategories: Category[] = [
    { id: 'social', name: 'Social', icon: 'Users' },
    { id: 'design', name: 'Design', icon: 'Figma' },
    { id: 'dev', name: 'Development', icon: 'Code' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Clapperboard' },
];

export const initialWebApps: WebApp[] = [
    { id: '1', name: 'Facebook', url: 'https://facebook.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=facebook.com`, categoryId: 'social', clip: true },
    { id: '2', name: 'Instagram', url: 'https://instagram.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=instagram.com`, categoryId: 'social', clip: true },
    { id: '3', name: 'Twitter', url: 'https://x.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=x.com`, categoryId: 'social', clip: true },
    { id: '4', name: 'Figma', url: 'https://figma.com', icon: 'Figma', categoryId: 'design', clip: false },
    { id: '5', name: 'YouTube', url: 'https://youtube.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=youtube.com`, categoryId: 'entertainment', clip: true },
    { id: '6', name: 'Spotify', url: 'https://spotify.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=spotify.com`, categoryId: 'entertainment', clip: true },
    { id: '7', name: 'Github', url: 'https://github.com', icon: 'Github', categoryId: 'dev', clip: false },
    { id: '8', name: 'Google', url: 'https://google.com', icon: `https://www.google.com/s2/favicons?sz=128&domain=google.com`, categoryId: 'all', clip: true },
];
