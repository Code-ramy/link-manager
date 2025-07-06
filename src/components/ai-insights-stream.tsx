
"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Category, WebApp } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import React, { useCallback, useEffect, useRef, useState, useId } from 'react';
import { useForm } from "react-hook-form";
import { useDebounce } from 'use-debounce';
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";


import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

const appSchema = z.object({
  name: z.string().min(1, "App name is required"),
  url: z.string().url("Invalid URL"),
  icon: z.string().min(1, "Icon is required"),
  categoryId: z.string(),
  clip: z.boolean().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
});

const getIcon = (name: string, props: any = {}) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon {...props} /> : <LucideIcons.Globe {...props} />;
};

const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.05 },
  },
  hidden: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};


const SortableItem = ({ id, children, isDragging }: { id: string | number, children: React.ReactNode, isDragging: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </div>
  );
};

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (e) {
    return '';
  }
};

function EditAppDialog({ app, categories, onSave, onOpenChange, open }: { app?: WebApp | null, categories: Category[], onSave: (data: WebApp) => void, open: boolean, onOpenChange: (open: boolean) => void }) {
  const form = useForm<z.infer<typeof appSchema>>({
    resolver: zodResolver(appSchema),
    defaultValues: { name: '', url: '', icon: 'Globe', categoryId: categories[0]?.id || '', clip: true },
  });

  const [urlToFetch] = useDebounce(form.watch('url'), 500);
  const [iconPreview, setIconPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (app) {
        form.reset({ ...app, clip: app.clip ?? true });
        setIconPreview(app.icon);
      } else {
        form.reset({ name: '', url: '', icon: 'Globe', categoryId: categories[0]?.id || '', clip: true });
        setIconPreview('');
      }
    }
  }, [app, open, categories, form]);

  useEffect(() => {
    const currentUrl = form.getValues('url');
    if (urlToFetch && z.string().url().safeParse(urlToFetch).success) {
      const newFavicon = getFaviconUrl(urlToFetch);
      if (newFavicon && (!app || urlToFetch !== app.url)) {
        setIconPreview(newFavicon);
        form.setValue('icon', newFavicon, { shouldValidate: true });
      }
    } else if (!currentUrl && !app) {
       setIconPreview('');
       form.setValue('icon', 'Globe');
    }
  }, [urlToFetch, app, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setIconPreview(dataUrl);
        form.setValue('icon', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof appSchema>) => {
    onSave({ ...data, id: app?.id || crypto.randomUUID() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm modal-card border-white/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-white">{app ? 'Edit App' : 'Add App'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 pt-2">
            <div className="flex flex-col items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black/20 border border-white/10 shrink-0 overflow-hidden shadow-inner">
                    {iconPreview ? (
                        <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <LucideIcons.ImageIcon className="w-7 h-7 text-muted-foreground" />
                    )}
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-white/10 border-white/20 hover:bg-white/20 text-sm h-9">
                        <LucideIcons.Upload className="mr-2 h-4 w-4" />
                        Upload Image
                    </Button>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </div>
            </div>
            
            <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>App Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Google" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://google.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clip"
                  render={({ field }) => (
                     <div className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/[.05] p-3 shadow-sm mt-1 hover:bg-white/10 transition-colors">
                        <Label>Clip Edges</Label>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                    </div>
                  )}
                />
            </div>
            <DialogFooter className="pt-4 mt-4 border-t border-white/10 gap-4 sm:justify-center">
              <Button asChild variant="outline" className="w-28 bg-white/10 border-white/20 hover:bg-white/20 text-white"><DialogClose>Cancel</DialogClose></Button>
              <Button type="submit" className="w-28 bg-primary hover:bg-primary/90 text-white">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ManageCategoriesDialog({ open, onOpenChange, categories, onCategoriesUpdate }: { open: boolean, onOpenChange: (isOpen: boolean) => void, categories: Category[], onCategoriesUpdate: (cats: Category[]) => void }) {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dndId = useId();

  useEffect(() => {
    if (open) {
      setLocalCategories(JSON.parse(JSON.stringify(categories)));
    }
  }, [open, categories]);
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: '' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setIconPreview(dataUrl);
        form.setValue('icon', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = (data: z.infer<typeof categorySchema>) => {
    if (editingCategory) {
      setLocalCategories(localCategories.map(c => c.id === editingCategory.id ? { ...editingCategory, ...data } : c));
    } else {
      setLocalCategories([...localCategories, { ...data, id: crypto.randomUUID() }]);
    }
    setEditingCategory(null);
    form.reset({ name: '', icon: '' });
    setIconPreview('');
  };

  const handleDeleteCategory = (id: string) => {
    if (editingCategory?.id === id) {
      setEditingCategory(null);
      form.reset({ name: '', icon: '' });
      setIconPreview('');
    }
    setLocalCategories(localCategories.filter(c => c.id !== id));
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localCategories.findIndex((c) => c.id === active.id);
      const newIndex = localCategories.findIndex((c) => c.id === over.id);
      setLocalCategories(arrayMove(localCategories, oldIndex, newIndex));
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));
  
  useEffect(() => {
    if (editingCategory) {
      form.reset(editingCategory);
      setIconPreview(editingCategory.icon);
    } else {
      form.reset({ name: '', icon: '' });
      setIconPreview('');
    }
  }, [editingCategory, form]);

  const handleSaveChanges = () => {
    onCategoriesUpdate(localCategories);
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    setEditingCategory(null);
    onOpenChange(false);
  }

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIconPreview('');
    form.reset({ name: '', icon: '' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto my-4 pr-4">
          <DndContext id={dndId} sensors={sensors} collisionDetector={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            <SortableContext items={localCategories.map(c => c.id)} strategy={rectSortingStrategy}>
              {localCategories.map(c => (
                <SortableItem key={c.id} id={c.id} isDragging={activeId === c.id}>
                  <div className="group flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 p-2 rounded-md bg-transparent group-hover:bg-white/5 transition-colors flex-grow">
                      <LucideIcons.GripVertical className="w-5 h-5 text-muted-foreground cursor-grab"/>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {c.icon && (c.icon.startsWith('data:image') || c.icon.startsWith('http')) ? (
                            <img src={c.icon} alt={c.name} className="w-full h-full object-contain rounded-sm" />
                        ) : (
                            getIcon(c.icon, { className: "w-5 h-5" })
                        )}
                      </div>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCategory(c)}>
                        <LucideIcons.Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(c.id)}>
                        <LucideIcons.Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveCategory)} className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
            <div className="flex flex-col gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-black/20 border border-white/10 shrink-0 overflow-hidden shadow-inner">
                          {iconPreview && iconPreview.startsWith('data:image') ? (
                              <img src={iconPreview} alt="Preview" className="w-full h-full object-contain" />
                          ) : iconPreview ? (
                              getIcon(iconPreview, { className: 'w-7 h-7' })
                          ) : (
                              <LucideIcons.ImageIcon className="w-7 h-7 text-muted-foreground" />
                          )}
                      </div>
                      <Button size="sm" type="button" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
                        <LucideIcons.Upload className="mr-2 h-4 w-4" />
                        Upload Icon
                      </Button>
                      <Button size="sm" type="submit">{editingCategory ? 'Update Category' : 'Add Category'}</Button>
                      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef}/>
                      <FormField control={form.control} name="icon" render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </FormItem>
                </div>
            </div>
            
            <div className="flex justify-end items-center gap-2 pt-2">
              {editingCategory && <Button size="sm" variant="ghost" type="button" onClick={handleCancelEdit}>Cancel Edit</Button>}
            </div>
          </form>
        </Form>
        <DialogFooter className="pt-4 mt-4 border-t border-white/10 sm:justify-center gap-4">
            <Button size="sm" onClick={handleCancel} variant="outline" className="w-28 bg-white/10 border-white/20 hover:bg-white/20 text-white">Cancel</Button>
            <Button size="sm" onClick={handleSaveChanges} className="w-28">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const AppIcon = ({ app, onEdit, onDelete, isDragging }: { app: WebApp, onEdit: () => void, onDelete: () => void, isDragging: boolean }) => {
  return (
    <div className="group flex flex-row items-start gap-0">
      {/* Container for icon and name */}
      <div className="flex flex-col items-center gap-2 text-center w-20">
        <div className="w-16 h-16">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
            draggable="false"
          >
            <div
              className={cn(
                'w-full h-full transition-all duration-200 ease-in-out flex items-center justify-center',
                isDragging
                  ? 'scale-110 shadow-2xl transform-gpu z-10'
                  : 'scale-100 shadow-none'
              )}
            >
              {app.icon.startsWith('data:image') || app.icon.startsWith('http') ? (
                <div className={cn(
                  "w-full h-full",
                  app.clip && "rounded-lg overflow-hidden"
                )}>
                  <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                getIcon(app.icon, { className: "w-9 h-9 text-white" })
              )}
            </div>
          </a>
        </div>
        <p className="text-sm text-white font-medium w-24 truncate">{app.name}</p>
      </div>
      
      {/* Buttons container */}
      <div className={cn(
        "flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -ml-2"
      )}>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={onEdit}>
          <LucideIcons.Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-400" onClick={onDelete}>
          <LucideIcons.Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
};

export function AiInsightsStream({ initialApps, initialCategories }: { initialApps: WebApp[], initialCategories: Category[] }) {
  const [apps, setApps] = useLocalStorage<WebApp[]>('web-apps', initialApps);
  const [categories, setCategories] = useLocalStorage<Category[]>('web-app-categories', initialCategories);
  const [currentFilter, setCurrentFilter] = useState('all');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const filterNavRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const dndId = useId();

  const importFileInputRef = useRef<HTMLInputElement>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const { toast } = useToast();

  const filteredApps = apps.filter(app => {
    if (currentFilter === 'all') return true;
    return app.categoryId === currentFilter;
  });

  const moveMarker = useCallback(() => {
    if (!filterNavRef.current) return;
    const activeBtn = filterNavRef.current.querySelector(`[data-filter="${currentFilter}"]`) as HTMLElement;
    if (!markerRef.current || !activeBtn) return;
  
    const navRect = filterNavRef.current.getBoundingClientRect();
    const targetRect = activeBtn.getBoundingClientRect();
    
    markerRef.current.style.width = `${targetRect.width}px`;
    markerRef.current.style.height = `${targetRect.height}px`;
    markerRef.current.style.transform = `translateX(${targetRect.left - navRect.left}px)`;
    
  }, [currentFilter]);

  useEffect(() => {
    moveMarker();
    window.addEventListener('resize', moveMarker);
    return () => {
      window.removeEventListener('resize', moveMarker);
    };
  }, [currentFilter, categories, moveMarker]);
  
  const handleFilterClick = (filter: string) => {
    setCurrentFilter(filter);
  };

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

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleAppDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id as string);
  };

  const handleAppDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setApps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
    setIsDragging(false);
  };
  
  const handleAppDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
  }

  const handleExport = () => {
    const data = {
      apps,
      categories,
    };
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
        if (typeof text !== 'string') {
          throw new Error("Could not read the file.");
        }
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
        if (event.target) {
            event.target.value = '';
        }
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
              <span className="text-blue-400"> Manager</span>
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

        <div className="flex justify-center my-24">
          <div className="flex items-center gap-4">
            <nav
              ref={filterNavRef}
              className="relative flex items-center justify-center flex-wrap gap-2 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div
                ref={markerRef}
                className="absolute top-2 left-0 h-[calc(100%-1rem)] rounded-full bg-primary/80 backdrop-blur-sm transition-all duration-500"
                style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
              ></div>
              <button
                data-filter="all"
                onClick={() => handleFilterClick('all')}
                className={cn(
                  'relative z-10 font-headline py-2 px-4 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 shrink-0 flex items-center gap-2',
                  currentFilter === 'all' ? 'text-white' : 'text-gray-300 hover:text-white'
                )}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  data-filter={c.id}
                  onClick={() => handleFilterClick(c.id)}
                  className={cn(
                    'relative z-10 font-headline py-2 px-4 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 shrink-0 flex items-center gap-2',
                    currentFilter === c.id ? 'text-white' : 'text-gray-300 hover:text-white'
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {c.icon && (c.icon.startsWith('data:image') || c.icon.startsWith('http')) ? (
                      <img src={c.icon} alt={c.name} className="w-full h-full object-contain" />
                    ) : (
                      getIcon(c.icon, {})
                    )}
                  </div>
                  <span>{c.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className={cn("pb-20", isDragging && '[&_a]:pointer-events-none')}>
          {!hasMounted ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8 justify-items-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center w-20">
                  <Skeleton className="w-16 h-16 rounded-lg !duration-1000" />
                  <Skeleton className="h-4 w-20 rounded-md !duration-1000" />
                </div>
              ))}
            </div>
           ) : (
            <DndContext 
              id={dndId}
              sensors={sensors} 
              collisionDetector={closestCenter} 
              onDragStart={handleAppDragStart}
              onDragEnd={handleAppDragEnd}
              onDragCancel={handleAppDragCancel}
            >
              <SortableContext items={apps.map(a => a.id)} strategy={rectSortingStrategy}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFilter}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8 justify-items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {filteredApps.map((app) => (
                      <SortableItem key={app.id} id={app.id} isDragging={activeId === app.id}>
                        <AppIcon
                          app={app}
                          onEdit={() => handleOpenEditDialog(app)}
                          onDelete={() => setAppToDelete(app)}
                          isDragging={activeId === app.id}
                        />
                      </SortableItem>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}
        </main>
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

      <Dialog open={!!appToDelete} onOpenChange={(isOpen) => !isOpen && setAppToDelete(null)}>
        <DialogContent className="modal-card sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{appToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 sm:justify-center gap-4">
            <Button variant="outline" onClick={() => setAppToDelete(null)} className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteApp} className="w-full">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
