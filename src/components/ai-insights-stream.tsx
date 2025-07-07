"use client";

import React, { useRef, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import * as LucideIcons from "lucide-react";
import type { Category, WebApp } from '@/lib/types';

import { AppGrid } from '@/components/app-grid';
import { CategoryFilter } from '@/components/category-filter';
import { DeleteAppDialog } from '@/components/delete-app-dialog';
import { EditAppDialog } from '@/components/edit-app-dialog';
import { EmptyState } from '@/components/empty-state';
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';

export function AiInsightsStream() {
  const { apps, categories, hasMounted, handleExport, handleImport, setCategories, handleDeleteApp } = useAppContext();
  
  const [currentFilter, setCurrentFilter] = useState('all');
  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  
  const appsToRender = apps.filter(app => currentFilter === 'all' || app.categoryId === currentFilter);

  const handleOpenAddDialog = () => {
    setEditingApp(null);
    setIsEditAppOpen(true);
  }

  const handleOpenEditDialog = (app: WebApp) => {
    setEditingApp(app);
    setIsEditAppOpen(true);
  }

  const confirmDelete = () => {
    if (appToDelete) {
      handleDeleteApp(appToDelete.id);
      setAppToDelete(null);
    }
  };

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    const deletedCategoryIds = categories
      .filter((c) => !updatedCategories.some((uc) => uc.id === c.id))
      .map((c) => c.id);

    if (deletedCategoryIds.includes(currentFilter)) {
      const deletedCategoryIndex = categories.findIndex(
        (c) => c.id === currentFilter
      );

      if (deletedCategoryIndex > 0) {
        const previousCategory = categories[deletedCategoryIndex - 1];
        setCurrentFilter(previousCategory.id);
      } else {
        setCurrentFilter('all');
      }
    }

    setCategories(updatedCategories);
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

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 pt-28">
        <CategoryFilter 
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
        />
        
        {hasMounted && apps.length === 0 && categories.length === 0 ? (
          <EmptyState onAddApp={handleOpenAddDialog} onAddCategory={() => setIsManageCategoriesOpen(true)} />
        ) : (
          <AppGrid
            appsToRender={appsToRender}
            onEdit={handleOpenEditDialog}
            onDelete={setAppToDelete}
            currentFilter={currentFilter}
          />
        )}
      </main>

      <EditAppDialog
        open={isEditAppOpen}
        onOpenChange={setIsEditAppOpen}
        app={editingApp}
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
