import type { WebApp, Category } from './types';

export const initialCategories: Category[] = [
  { id: 'social', name: 'Social', icon: 'Users' },
  { id: 'work', name: 'Work', icon: 'Briefcase' },
  { id: 'media', name: 'Media', icon: 'PlaySquare' },
  { id: 'dev', name: 'Development', icon: 'Code' },
];

export const initialWebApps: WebApp[] = [
    { id: '1', name: 'Facebook', url: 'https://facebook.com', icon: 'https://www.google.com/s2/favicons?sz=128&domain=facebook.com', categoryId: 'social', clip: true },
    { id: '2', name: 'Gmail', url: 'https://gmail.com', icon: 'https://www.google.com/s2/favicons?sz=128&domain=gmail.com', categoryId: 'work', clip: false },
    { id: '3', name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?sz=128&domain=youtube.com', categoryId: 'media', clip: true },
    { id: '4', name: 'GitHub', url: 'https://github.com', icon: 'https://www.google.com/s2/favicons?sz=128&domain=github.com', categoryId: 'dev', clip: true },
];
