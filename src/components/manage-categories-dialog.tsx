
"use client";

import React, { useEffect, useRef, useState, useId } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GripVertical, Pencil, Trash2, Tag, ImageIcon, Upload, PlusCircle, Save, X, Settings2, PlusSquare } from "lucide-react";
import type { Category } from '@/lib/types';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { Icon } from './icon';

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
});

const SortableItem = ({ id, children, isDragging }: { id: string | number, children: React.ReactNode, isDragging: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    transition: { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onCategoriesUpdate: (cats: Category[]) => void;
}

export function ManageCategoriesDialog({ open, onOpenChange, categories, onCategoriesUpdate }: ManageCategoriesDialogProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dndId = useId();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: '' },
  });

  useEffect(() => {
    if (open) {
      setLocalCategories(JSON.parse(JSON.stringify(categories)));
    } else {
      setEditingCategory(null);
      form.reset({ name: '', icon: '' });
      setIconPreview('');
    }
  }, [open, categories, form]);

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    form.reset(category);
    setIconPreview(category.icon);
  };

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
    activationConstraint: { distance: 5 },
  }));
  
  const handleSaveChanges = () => {
    onCategoriesUpdate(localCategories);
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-400" />
            Manage Categories
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto my-4 pr-4">
          <DndContext id={dndId} sensors={sensors} collisionDetector={closestCenter} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
            <SortableContext items={localCategories.map(c => c.id)} strategy={rectSortingStrategy}>
              {localCategories.map(c => (
                <SortableItem key={c.id} id={c.id} isDragging={activeId === c.id}>
                  <div
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg border mb-2 transition-colors",
                      editingCategory?.id === c.id
                        ? "bg-blue-600/20 border-blue-500"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0"/>
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <Icon name={c.icon} className="w-5 h-5" />
                      </div>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleEditClick(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-400" onClick={() => handleDeleteCategory(c.id)}>
                        <Trash2 className="w-4 h-4" />
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
            <h4 className="font-headline text-lg font-bold flex items-center gap-2">
              {editingCategory 
                ? <><Pencil className="w-4 h-4 text-blue-400" />Edit Category</>
                : <><PlusSquare className="w-4 h-4 text-blue-400" />Add New Category</>
              }
            </h4>
            <div className="flex flex-col gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Tag className="w-4 h-4 text-muted-foreground"/>Category Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="space-y-4">
                  <FormItem>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-black/20 border border-white/10 shrink-0 overflow-hidden shadow-inner">
                          {iconPreview ? (
                              <Icon name={iconPreview} className={iconPreview.startsWith('data:image') ? "w-full h-full object-contain" : 'w-7 h-7'} />
                          ) : (
                              <ImageIcon className="w-7 h-7 text-muted-foreground" />
                          )}
                      </div>
                      <Button size="sm" type="button" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Icon</Button>
                      <Button size="sm" type="submit" className="w-24">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {editingCategory ? 'Update' : 'Add'}
                      </Button>
                      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef}/>
                      <FormField control={form.control} name="icon" render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </FormItem>
                </div>
            </div>
          </form>
        </Form>
        <DialogFooter className="pt-4 mt-4 border-t border-white/10 sm:justify-center gap-2">
            <Button size="sm" onClick={handleCancel} variant="outline" className="w-full sm:w-28 bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveChanges} className="w-full sm:w-28">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
