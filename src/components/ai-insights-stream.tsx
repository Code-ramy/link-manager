"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import type { Category, WebApp } from '@/lib/types';
import * as LucideIcons from "lucide-react";

import { AppGrid } from '@/components/app-grid';
import { CategoryFilter } from '@/components/category-filter';
import { DeleteAppDialog } from '@/components/delete-app-dialog';
import { EditAppDialog } from '@/components/edit-app-dialog';
import { EmptyState } from '@/components/empty-state';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';

export function AiInsightsStream({ initialApps, initialCategories }: { initialApps: WebApp[], initialCategories: Category[] }) {
  const [apps, setApps] = useLocalStorage<WebApp[]>('web-apps', initialApps);
  const [categories, setCategories] = useLocalStorage<Category[]>('web-app-categories', initialCategories);
  const [currentFilter, setCurrentFilter] = useState('all');

  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => { setHasMounted(true); }, []);

  const appsToRender = apps.filter(app => currentFilter === 'all' || app.categoryId === currentFilter);

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
  
  const handleOpenAddDialog = () => {
    setEditingApp(null);
    setIsEditAppOpen(true);
  }

  const handleOpenEditDialog = (app: WebApp) => {
    setEditingApp(app);
    setIsEditAppOpen(true);
  }

  const handleDeleteApp = () => {
    if (appToDelete) {
      setApps(apps.filter(a => a.id !== appToDelete.id));
      toast({ title: "Deleted successfully!", variant: "destructive" });
      setAppToDelete(null);
    }
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

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={importFileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      <header className="fixed top-0 left-0 w-full bg-black/50 backdrop-blur-xl border-b border-white/10 z-30">
        <div className="w-full px-8 sm:px-10 lg:px-12 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Logo width={48} height={48} />
            <h1 className="text-2xl font-sans relative">
              <span className="font-bold text-white">Link</span>
              <span className="text-blue-500"> Manager</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600 hover:text-white text-sm font-medium" onClick={() => importFileInputRef.current?.click()}>
              <LucideIcons.Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600 hover:text-white text-sm font-medium" onClick={handleExport}>
              <LucideIcons.Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm" onClick={() => setIsManageCategoriesOpen(true)}>
              <LucideIcons.Settings className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm" onClick={handleOpenAddDialog}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Add App
            </Button>
          </div>
        </div>
      </header>

      <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 pt-28">
        <CategoryFilter 
            categories={categories}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
        />
        
        {hasMounted && apps.length === 0 ? (
          <EmptyState onAddApp={handleOpenAddDialog} />
        ) : (
          <AppGrid
            apps={appsToRender}
            allApps={apps}
            setApps={setApps}
            onEdit={handleOpenEditDialog}
            onDelete={setAppToDelete}
            hasMounted={hasMounted}
            currentFilter={currentFilter}
          />
        )}
      </div>

      <EditAppDialog
        open={isEditAppOpen}
        onOpenChange={setIsEditAppOpen}
        categories={categories}
        onSave={handleSaveApp}
        app={editingApp}
      />
      
      <ManageCategoriesDialog
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        categories={categories}
        onCategoriesUpdate={setCategories}
      />

      <DeleteAppDialog 
        appToDelete={appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={handleDeleteApp}
      />
    </>
  );
}
