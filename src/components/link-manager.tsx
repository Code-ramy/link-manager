"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Upload, Download, Settings, Plus } from "lucide-react";
import type { Category, WebApp } from '@/lib/types';
import { AppGrid } from '@/components/app-grid';
import { CategoryFilter } from '@/components/category-filter';
import { DeleteAppDialog } from '@/components/delete-app-dialog';
import { EditAppDialog } from '@/components/edit-app-dialog';
import { EmptyState } from '@/components/empty-state';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';
import { DropZone } from '@/components/drop-zone';

export function LinkManager() {
  const { apps, categories, hasMounted, handleExport, handleImport, setCategories, setApps, handleDeleteApp } = useAppContext();
  
  const [currentFilter, setCurrentFilter] = useState('all');
  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [urlToAutoFill, setUrlToAutoFill] = useState<string | undefined>(undefined);
  
  const handleOpenAddDialog = useCallback(() => {
    setEditingApp(null);
    setUrlToAutoFill(undefined);
    setIsEditAppOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((app: WebApp) => {
    setEditingApp(app);
    setUrlToAutoFill(undefined);
    setIsEditAppOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (appToDelete) {
      handleDeleteApp(appToDelete.id);
      setAppToDelete(null);
    }
  }, [appToDelete, handleDeleteApp]);

  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    setCategories(updatedCategories, currentFilter, setCurrentFilter);
  }, [setCategories, currentFilter]);

  const handleUrlDrop = useCallback((url: string) => {
    setEditingApp(null);
    setUrlToAutoFill(url);
    setIsEditAppOpen(true);
  }, []);

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={importFileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      <header className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 z-30">
        <div className="w-full px-4 sm:px-10 lg:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo width={36} height={36} />
            <h1 className="text-xl font-sans relative">
              <span className="font-bold text-white">Link</span>
              <span className="text-blue-500 hidden sm:inline"> Manager</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="sm" variant="outline" className="rounded-2xl text-white bg-white/10 border-white/20 hover:bg-white/20" onClick={() => importFileInputRef.current?.click()}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button size="sm" variant="outline" className="rounded-2xl text-white bg-white/10 border-white/20 hover:bg-white/20" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-primary-foreground hover:brightness-110 shadow-lg" onClick={() => setIsManageCategoriesOpen(true)}>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Categories</span>
            </Button>
            <Button size="sm" className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-primary-foreground hover:brightness-110 shadow-lg" onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add App</span>
            </Button>
          </div>
        </div>
      </header>

      <DropZone onUrlDrop={handleUrlDrop}>
        <main className="pt-16 flex flex-col h-screen">
          <div className="sticky top-16 z-20 pt-8 pb-4">
            <CategoryFilter 
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
            />
          </div>
          
          <div className="flex-grow overflow-y-auto pt-2 scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-2rem),transparent)]">
              <div className="w-full max-w-7xl mx-auto px-4">
                  {hasMounted && apps.length === 0 && categories.length === 0 ? (
                    <EmptyState onAddApp={handleOpenAddDialog} onAddCategory={() => setIsManageCategoriesOpen(true)} />
                  ) : (
                    <AppGrid
                      onEdit={handleOpenEditDialog}
                      onDelete={setAppToDelete}
                      onAddApp={handleOpenAddDialog}
                      currentFilter={currentFilter}
                    />
                  )}
              </div>
          </div>
        </main>
      </DropZone>


      <EditAppDialog
        open={isEditAppOpen}
        onOpenChange={setIsEditAppOpen}
        app={editingApp}
        defaultCategoryId={currentFilter !== 'all' ? currentFilter : undefined}
        urlToAutoFill={urlToAutoFill}
      />
      
      <ManageCategoriesDialog
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        categories={categories}
        onCategoriesUpdate={handleCategoriesUpdate}
      />

      <DeleteAppDialog 
        appToDelete={appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
