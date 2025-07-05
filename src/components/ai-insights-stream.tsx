"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Category, WebApp } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { useDebounce } from 'use-debounce';
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from '@/hooks/use-toast';

const appSchema = z.object({
  name: z.string().min(1, "اسم التطبيق مطلوب"),
  url: z.string().url("رابط غير صالح"),
  icon: z.string().min(1, "الأيقونة مطلوبة"),
  categoryId: z.string(),
});

const categorySchema = z.object({
  name: z.string().min(1, "اسم الفئة مطلوب"),
  icon: z.string().min(1, "الأيقونة مطلوبة"),
});

const getIcon = (name: string, props: any = {}) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon {...props} /> : <LucideIcons.Globe {...props} />;
};

const SortableItem = ({ id, children }: { id: string | number, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'transform-gpu',
        isDragging ? 'z-10 scale-105 shadow-2xl' : 'shadow-none'
      )}
    >
      {children}
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
    defaultValues: { name: '', url: '', icon: 'Globe', categoryId: categories[0]?.id || '' },
  });

  const [urlToFetch] = useDebounce(form.watch('url'), 500);
  const [iconPreview, setIconPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (app) {
        form.reset(app);
        setIconPreview(app.icon);
      } else {
        form.reset({ name: '', url: '', icon: 'Globe', categoryId: categories[0]?.id || '' });
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
      <DialogContent className="sm:max-w-[425px] modal-card">
        <DialogHeader>
          <DialogTitle>{app ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}</DialogTitle>
          <DialogDescription>
            املأ التفاصيل أدناه. سيتم جلب الأيقونة تلقائيًا عند إدخال رابط صالح.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-center flex-col gap-4">
               <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
                {iconPreview ? (
                    <img src={iconPreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                    <LucideIcons.ImageIcon className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <LucideIcons.Upload className="mr-2 h-4 w-4" />
                رفع أيقونة
              </Button>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem><FormLabel>اسم التطبيق</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem><FormLabel>الرابط</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة</FormLabel>
                   <select {...field} defaultValue={field.value} className="w-full p-2 rounded-md bg-input border border-border">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">حفظ</Button>
              <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ManageCategoriesDialog({ categories, onCategoriesUpdate, children }: { categories: Category[], onCategoriesUpdate: (cats: Category[]) => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [internalCategories, setInternalCategories] = useState(categories);

  useEffect(() => {
    if (open) {
      setInternalCategories(categories);
    }
  }, [categories, open]);
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: 'Globe' },
  });

  const iconList = Object.keys(LucideIcons).filter(k => k.match(/^[A-Z]/));

  const handleSave = (data: z.infer<typeof categorySchema>) => {
    let updatedCategories;
    if (editingCategory) {
      updatedCategories = internalCategories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c);
    } else {
      updatedCategories = [...internalCategories, { ...data, id: crypto.randomUUID() }];
    }
    setInternalCategories(updatedCategories);
    onCategoriesUpdate(updatedCategories);
    setEditingCategory(null);
    form.reset({ name: '', icon: 'Globe' });
  };

  const handleDelete = (id: string) => {
    const updatedCategories = internalCategories.filter(c => c.id !== id);
    setInternalCategories(updatedCategories);
    onCategoriesUpdate(updatedCategories);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setInternalCategories((items) => {
        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over!.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        onCategoriesUpdate(newOrder);
        return newOrder;
      });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="modal-card">
        <DialogHeader>
          <DialogTitle>إدارة الفئات</DialogTitle>
          <DialogDescription>إضافة، تعديل، حذف، وإعادة ترتيب الفئات الخاصة بك.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto my-4 pr-2">
          <DndContext sensors={sensors} collisionDetector={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={internalCategories.map(c => c.id)} strategy={rectSortingStrategy}>
              {internalCategories.map(c => (
                <SortableItem key={c.id} id={c.id}>
                  <div className="flex items-center justify-between p-2 mb-2 rounded-md bg-background hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <LucideIcons.GripVertical className="w-5 h-5 text-muted-foreground cursor-grab"/>
                      {getIcon(c.icon)}
                      <span>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCategory(c); form.reset(c); }}>
                        <LucideIcons.Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
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
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="font-bold">{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h4>
            <div className="flex gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="flex-1"><FormLabel>اسم الفئة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>الأيقونة</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-[120px] justify-between">
                        <span className="truncate">{field.value}</span>
                        {getIcon(field.value, { className: "w-4 h-4" })}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-60 overflow-y-auto">
                      {iconList.map(iconName => (
                        <DropdownMenuItem key={iconName} onSelect={() => form.setValue('icon', iconName)}>
                          {getIcon(iconName, { className: "w-4 h-4 mr-2" })}
                          <span>{iconName}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="submit">حفظ الفئة</Button>
              {editingCategory && <Button variant="outline" onClick={() => { setEditingCategory(null); form.reset({ name: '', icon: 'Globe' }); }}>إلغاء التعديل</Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const AppIcon = ({ app, onEdit, onDelete, wasDragged }: { app: WebApp, onEdit: () => void, onDelete: () => void, wasDragged: React.MutableRefObject<boolean> }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (wasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative group flex flex-col items-center gap-2 text-center w-20">
      <a href={app.url} 
         onClick={handleClick}
         target="_blank" 
         rel="noopener noreferrer" 
         className="block w-16 h-16"
         draggable="false"
      >
         <div className="w-full h-full transition-all duration-300 group-hover:scale-110 flex items-center justify-center">
            {app.icon.startsWith('data:image') || app.icon.startsWith('http') ? (
              <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
            ) : (
              getIcon(app.icon, { className: "w-9 h-9 text-white" })
            )}
        </div>
      </a>
      <p className="text-sm text-white font-medium w-24 truncate">{app.name}</p>
      <div className="absolute top-0 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/50 hover:bg-black/80">
              <LucideIcons.MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onEdit}><LucideIcons.Pencil className="w-4 h-4 ml-2"/>تعديل</DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-destructive"><LucideIcons.Trash2 className="w-4 h-4 ml-2"/>حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
};

export function AiInsightsStream({ initialApps, initialCategories }: { initialApps: WebApp[], initialCategories: Category[] }) {
  const [apps, setApps] = useLocalStorage<WebApp[]>('web-apps', initialApps);
  const [categories, setCategories] = useLocalStorage<Category[]>('web-app-categories', initialCategories);
  const [currentFilter, setCurrentFilter] = useState('all');

  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);

  const filterNavRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const wasDragged = useRef(false);

  const filteredApps = apps.filter(app => {
    if (currentFilter === 'all') return true;
    return app.categoryId === currentFilter;
  });

  const moveMarker = useCallback(() => {
    const activeBtn = filterNavRef.current?.querySelector(`[data-filter="${currentFilter}"]`) as HTMLElement;
    if (!filterNavRef.current || !markerRef.current || !activeBtn) return;

    const navRect = filterNavRef.current.getBoundingClientRect();
    const targetRect = activeBtn.getBoundingClientRect();
    const offsetX = targetRect.left - navRect.left;

    markerRef.current.style.width = `${targetRect.width}px`;
    markerRef.current.style.height = `${targetRect.height}px`;
    markerRef.current.style.transform = `translateX(${offsetX}px)`;
  }, [currentFilter]);

  useEffect(() => {
    const timer = setTimeout(moveMarker, 50);
    window.addEventListener('resize', moveMarker);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', moveMarker);
    };
  }, [currentFilter, categories, moveMarker]);

  const handleFilterClick = (filter: string) => {
    if (filter === currentFilter) return;
    setCurrentFilter(filter);
  };

  const handleSaveApp = (appData: WebApp) => {
    const appExists = apps.some(a => a.id === appData.id);
    if (appExists) {
      setApps(apps.map(a => a.id === appData.id ? appData : a));
      toast({ title: "تم التحديث بنجاح!" });
    } else {
      setApps([...apps, appData]);
      toast({ title: "تمت الإضافة بنجاح!" });
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
      toast({ title: "تم الحذف بنجاح!", variant: "destructive" });
      setAppToDelete(null);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleAppDragStart = (event: DragStartEvent) => {
    wasDragged.current = true;
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
    setTimeout(() => {
      wasDragged.current = false;
    }, 0);
  };
  
  const handleAppDragCancel = () => {
    setActiveId(null);
    setTimeout(() => {
      wasDragged.current = false;
    }, 0);
  }

  return (
    <>
      <div id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center text-center mb-8 mt-4">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            ساحة عرض تطبيقات الويب
          </h1>
          <Button size="lg" className="rounded-full shadow-lg" onClick={handleOpenAddDialog}>
            <LucideIcons.Plus className="w-5 h-5 ml-2" />
            إضافة تطبيق
          </Button>
        </header>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <nav
              ref={filterNavRef}
              className="relative flex items-center justify-center flex-wrap gap-2 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div
                ref={markerRef}
                className="absolute top-2 left-0 h-[calc(100%-1rem)] rounded-full bg-[#4285F4] shadow-[0_0_8px_rgba(66,133,244,0.4)] transition-all duration-500"
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
                الكل
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
                  {getIcon(c.icon, {})}
                  <span>{c.name}</span>
                </button>
              ))}
            </nav>
            <ManageCategoriesDialog categories={categories} onCategoriesUpdate={setCategories}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-black/20 border border-white/10">
                      <LucideIcons.Settings className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>إدارة الفئات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ManageCategoriesDialog>
          </div>
        </div>

        <main className="pb-20">
          <DndContext 
            sensors={sensors} 
            collisionDetector={closestCenter} 
            onDragStart={handleAppDragStart}
            onDragEnd={handleAppDragEnd}
            onDragCancel={handleAppDragCancel}
          >
            <SortableContext items={apps.map(a => a.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8 justify-items-center">
                {filteredApps.map((app) => (
                  <SortableItem key={app.id} id={app.id}>
                    <AppIcon
                      app={app}
                      onEdit={() => handleOpenEditDialog(app)}
                      onDelete={() => setAppToDelete(app)}
                      wasDragged={wasDragged}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>

      <EditAppDialog
        open={isEditAppOpen}
        onOpenChange={setIsEditAppOpen}
        categories={categories}
        onSave={handleSaveApp}
        app={editingApp}
      />

      <Dialog open={!!appToDelete} onOpenChange={(isOpen) => !isOpen && setAppToDelete(null)}>
        <DialogContent className="modal-card">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف "{appToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteApp}>حذف</Button>
            <Button variant="outline" onClick={() => setAppToDelete(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
