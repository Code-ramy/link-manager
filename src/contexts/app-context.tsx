
"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useToast } from "@/hooks/use-toast";
import type { Category, WebApp } from '@/lib/types';

type SetCategoriesFunction = (
  newCategoriesValue: Category[] | ((cats: Category[]) => Category[]),
  currentFilter?: string,
  onFilterChange?: (filter: string) => void
) => void;

interface AppContextType {
  apps: WebApp[];
  setApps: (apps: WebApp[]) => Promise<void>;
  categories: Category[];
  setCategories: SetCategoriesFunction;
  handleSaveApp: (appData: Omit<WebApp, 'id' | 'order'> & { id?: string }) => Promise<void>;
  handleDeleteApp: (appId: string) => Promise<void>;
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  const apps = useLiveQuery(() => db.apps.orderBy('order').toArray(), []);
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []);

  useEffect(() => {
    if (apps !== undefined && categories !== undefined) {
      setHasMounted(true);
    }
  }, [apps, categories]);

  const setApps = async (newApps: WebApp[]) => {
    try {
      const updatedApps = newApps.map((app, index) => ({ ...app, order: index }));
      await db.apps.bulkPut(updatedApps);
    } catch (error) {
      console.error("Failed to reorder apps in DB:", error);
      toast({ title: 'Error', description: 'Could not save new order.', variant: 'destructive' });
    }
  };

  const setCategories: SetCategoriesFunction = useCallback(async (newCategoriesValue, currentFilter, onFilterChange) => {
    if (!categories) return;

    const oldCategories = categories;
    let newCategories: Category[];

    if (typeof newCategoriesValue === 'function') {
      newCategories = newCategoriesValue(oldCategories);
    } else {
      newCategories = newCategoriesValue;
    }

    const updatedCategories = newCategories.map((c, i) => ({ ...c, order: i }));
    
    try {
      const deletedCategoryIds = oldCategories
        .filter(oldCat => !updatedCategories.some(newCat => newCat.id === oldCat.id))
        .map(c => c.id);

      await db.transaction('rw', db.categories, db.apps, async () => {
        if (deletedCategoryIds.length > 0) {
          await db.apps.where('categoryId').anyOf(deletedCategoryIds).delete();
          
          if (currentFilter && onFilterChange && deletedCategoryIds.includes(currentFilter)) {
            const deletedCategoryIndex = oldCategories.findIndex(c => c.id === currentFilter);
            let nextFilter = 'all';
            if (deletedCategoryIndex > 0) {
              nextFilter = oldCategories[deletedCategoryIndex - 1].id;
            } else if (updatedCategories.length > 0 && deletedCategoryIndex !== 0) {
              nextFilter = updatedCategories[0].id;
            }
            onFilterChange(nextFilter);
          }
        }
        
        await db.categories.clear();
        if (updatedCategories.length > 0) {
          await db.categories.bulkAdd(updatedCategories);
        }
      });

    } catch (error) {
      console.error("Failed to update categories:", error);
      toast({ title: 'Error', description: 'Could not update categories.', variant: 'destructive' });
    }
  }, [categories, toast]);


  const handleSaveApp = async (appData: Omit<WebApp, 'id' | 'order'> & { id?: string }) => {
    try {
      if (appData.id) {
        await db.apps.update(appData.id, appData);
        toast({ title: "Updated successfully!", variant: "success" });
      } else {
        const newOrder = (apps?.length || 0);
        await db.apps.add({
          ...appData,
          id: crypto.randomUUID(),
          order: newOrder
        });
        toast({ title: "Added successfully!", variant: "success" });
      }
    } catch (error) {
       console.error("Failed to save app:", error);
       toast({ title: 'Error', description: 'Could not save the app.', variant: 'destructive' });
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      await db.apps.delete(appId);
      toast({ title: "Deleted successfully!", variant: "destructive" });
    } catch(error) {
      console.error("Failed to delete app:", error);
      toast({ title: 'Error', description: 'Could not delete the app.', variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    try {
        if (!apps || !categories) {
          toast({ title: 'Error', description: 'Data is not ready for export.', variant: 'destructive' });
          return;
        }
        const exportData = {
          apps: await db.apps.toArray(),
          categories: await db.categories.toArray(),
        };
        const jsonString = JSON.stringify(exportData, null, 2);
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
    } catch (error) {
        console.error("Failed to export data:", error);
        toast({ title: 'Error', description: 'Could not export your data.', variant: 'destructive' });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Could not read the file.");
        const importedData = JSON.parse(text);

        if (Array.isArray(importedData.apps)) {
          importedData.apps.forEach((item: any, index: number) => {
            if (typeof item.order !== 'number') {
              item.order = index;
            }
          });
        }
        if (Array.isArray(importedData.categories)) {
          importedData.categories.forEach((item: any, index: number) => {
            if (typeof item.order !== 'number') {
              item.order = index;
            }
          });
        }

        const isValidWebApp = (item: any): item is WebApp => 
            typeof item === 'object' && item !== null &&
            'id' in item && 'name' in item && 'url' in item && 
            'icon' in item && 'categoryId' in item && typeof item.order === 'number';
        
        const isValidCategory = (item: any): item is Category =>
            typeof item === 'object' && item !== null &&
            'id' in item && 'name' in item && 'icon' in item && typeof item.order === 'number';

        if (Array.isArray(importedData.apps) && Array.isArray(importedData.categories) &&
            importedData.apps.every(isValidWebApp) &&
            importedData.categories.every(isValidCategory)) 
        {
          await db.transaction('rw', db.apps, db.categories, async () => {
            await db.apps.clear();
            await db.categories.clear();
            await db.apps.bulkAdd(importedData.apps);
            await db.categories.bulkAdd(importedData.categories);
          });
          toast({ title: 'Import Successful', description: 'Your data has been restored.', variant: 'success' });
        } else {
          throw new Error("Invalid file format or structure.");
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

  const value: AppContextType = {
    apps: apps || [],
    setApps,
    categories: categories || [],
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
