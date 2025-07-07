"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import type { Category, WebApp } from '@/lib/types';
import { initialCategories, initialWebApps } from '@/lib/data';

interface AppContextType {
  apps: WebApp[];
  setApps: (apps: WebApp[]) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  handleSaveApp: (appData: WebApp) => void;
  handleDeleteApp: (appId: string) => void;
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useLocalStorage<WebApp[]>('web-apps', initialWebApps);
  const [categories, setCategories] = useLocalStorage<Category[]>('web-app-categories', initialCategories);
  const [hasMounted, setHasMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSaveApp = (appData: WebApp) => {
    const appExists = apps.some(a => a.id === appData.id);
    if (appExists) {
      setApps(apps.map(a => a.id === appData.id ? appData : a));
      toast({ title: "Updated successfully!", variant: "success" });
    } else {
      setApps([...apps, appData]);
      toast({ title: "Added successfully!", variant: "success" });
    }
  };

  const handleDeleteApp = (appId: string) => {
    setApps(apps.filter(a => a.id !== appId));
    toast({ title: "Deleted successfully!", variant: "destructive" });
  };

  const handleExport = () => {
    const data = { apps, categories };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `link-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    toast({ title: 'Export Successful', description: 'Your data has been saved.', variant: 'success' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Could not read the file.");
        const importedData = JSON.parse(text);
        
        if (Array.isArray(importedData.apps) && Array.isArray(importedData.categories)) {
          setApps(importedData.apps);
          setCategories(importedData.categories);
          toast({ title: 'Import Successful', description: 'Your data has been restored.', variant: 'success' });
        } else {
          throw new Error("Invalid file format.");
        }
      } catch (error: any) {
        toast({ title: 'Import Failed', description: error.message || 'The file is not valid.', variant: 'destructive' });
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => {
        toast({ title: 'Import Failed', description: 'Error reading file.', variant: 'destructive' });
    }
    reader.readAsText(file);
  };

  const value = {
    apps,
    setApps,
    categories,
    setCategories,
    handleSaveApp,
    handleDeleteApp,
    handleExport,
    handleImport,
    hasMounted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
