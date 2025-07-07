"use client";

import React, { useEffect, useRef, useState, useId } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as LucideIcons from "lucide-react";
import type { Category } from '@/lib/types';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
});

const getIcon = (name: string, props: any = {}) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon {...props} /> : <LucideIcons.Globe {...props} />;
};

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

  useEffect(() => {
    if (open) {
      setLocalCategories(JSON.parse(JSON.stringify(categories)));
    }
  }, [open, categories]);
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: '' },
  });

  useEffect(() => {
    if (editingCategory) {
      form.reset(editingCategory);
      setIconPreview(editingCategory.icon);
    } else {
      form.reset({ name: '', icon: '' });
      setIconPreview('');
    }
  }, [editingCategory, form]);

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
  };

  const handleDeleteCategory = (id: string) => {
    if (editingCategory?.id === id) setEditingCategory(null);
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
    setEditingCategory(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-card sm:max-w-sm">
        <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
        <div className="max-h-[300px] overflow-y-auto my-4 pr-4">
          <DndContext id={dndId} sensors={sensors} collisionDetector={closestCenter} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
            <SortableContext items={localCategories.map(c => c.id)} strategy={rectSortingStrategy}>
              {localCategories.map(c => (
                <SortableItem key={c.id} id={c.id} isDragging={activeId === c.id}>
                  <div className="group flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 p-2 rounded-md bg-transparent group-hover:bg-white/5 transition-colors flex-grow">
                      <LucideIcons.GripVertical className="w-5 h-5 text-muted-foreground cursor-grab"/>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {c.icon && (c.icon.startsWith('data:image') || c.icon.startsWith('http')) ? (
                            <img src={c.icon} alt={c.name} className="w-full h-full object-contain rounded-sm" />
                        ) : ( getIcon(c.icon, { className: "w-5 h-5" }) )}
                      </div>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCategory(c)}><LucideIcons.Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(c.id)}><LucideIcons.Trash2 className="w-4 h-4" /></Button>
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
                  <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-black/20 border border-white/10 shrink-0 overflow-hidden shadow-inner">
                          {iconPreview && iconPreview.startsWith('data:image') ? (
                              <img src={iconPreview} alt="Preview" className="w-full h-full object-contain" />
                          ) : iconPreview ? ( getIcon(iconPreview, { className: 'w-7 h-7' }) ) : (
                              <LucideIcons.ImageIcon className="w-7 h-7 text-muted-foreground" />
                          )}
                      </div>
                      <Button size="sm" type="button" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" onClick={() => fileInputRef.current?.click()}><LucideIcons.Upload className="mr-2 h-4 w-4" /> Upload Icon</Button>
                      <Button size="sm" type="submit" className="w-24">{editingCategory ? 'Update' : 'Add'}</Button>
                      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef}/>
                      <FormField control={form.control} name="icon" render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </FormItem>
                </div>
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
