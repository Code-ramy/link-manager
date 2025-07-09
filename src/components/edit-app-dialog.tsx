
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDebounce } from 'use-debounce';
import { ImageIcon, Upload, Package, Link2, FolderKanban, Scissors } from "lucide-react";
import type { WebApp } from '@/lib/types';
import { getPageTitle } from '@/app/actions';
import { useAppContext } from '@/contexts/app-context';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const appSchema = z.object({
  name: z.string().min(1, "App name is required"),
  url: z.string().url("Invalid URL"),
  icon: z.string().min(1, "Icon is required"),
  categoryId: z.string(),
  clip: z.boolean().optional(),
});

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (e) {
    return '';
  }
};

interface EditAppDialogProps {
  app?: WebApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryId?: string;
}

function EditAppDialogContent({ app, onOpenChange, defaultCategoryId }: EditAppDialogProps) {
  const { categories, handleSaveApp } = useAppContext();
  
  const form = useForm<z.infer<typeof appSchema>>({
    resolver: zodResolver(appSchema),
    defaultValues: app 
      ? { ...app, clip: app.clip ?? true }
      : { name: '', url: '', icon: 'Globe', categoryId: defaultCategoryId || (categories.length > 0 ? categories[0].id : ''), clip: true },
  });

  const [urlToFetch] = useDebounce(form.watch('url'), 500);
  const [iconPreview, setIconPreview] = useState(form.getValues('icon'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIconPreview(form.getValues('icon'));
  }, [app, form]);

  useEffect(() => {
    const validation = z.string().url().safeParse(urlToFetch);
    if (!validation.success) return;

    const fetchTitle = async () => {
      const currentName = form.getValues('name');
      // Only fetch title if name is empty, or if the URL changed from the initial app URL
      if (!currentName || (app && urlToFetch !== app.url)) {
        const title = await getPageTitle(urlToFetch);
        if (title) {
          form.setValue('name', title, { shouldValidate: true, shouldDirty: true });
        }
      }
    };
    
    const fetchFavicon = () => {
      // Only fetch favicon automatically if it's a new app or if the URL has changed
      if (!app || urlToFetch !== app.url) {
        const newFavicon = getFaviconUrl(urlToFetch);
        if (newFavicon) {
          setIconPreview(newFavicon);
          form.setValue('icon', newFavicon, { shouldValidate: true, shouldDirty: true });
        }
      }
    };

    fetchTitle();
    fetchFavicon();
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
    handleSaveApp({ ...data, id: app?.id || crypto.randomUUID() });
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-sm modal-card border-white/20">
      <DialogHeader>
        <DialogTitle className="font-headline text-lg text-white">{app ? 'Edit App' : 'Add App'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 pt-2">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black/20 border border-white/10 shrink-0 overflow-hidden shadow-inner">
              {iconPreview && (iconPreview.startsWith('data:') || iconPreview.startsWith('http')) ? (
                <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-white/10 border-white/20 hover:bg-white/20 text-sm h-9">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          </div>
          <div className="grid gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground"/>App Name</FormLabel>
                <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Link2 className="w-4 h-4 text-muted-foreground"/>URL</FormLabel>
                <FormControl><Input placeholder="https://google.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><FolderKanban className="w-4 h-4 text-muted-foreground"/>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="clip" render={({ field }) => (
              <div className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/[.05] p-3 shadow-sm mt-1 hover:bg-white/10 transition-colors">
                <Label htmlFor="clip-switch" className="flex items-center gap-2 cursor-pointer">
                  <Scissors className="w-4 h-4 text-muted-foreground"/>
                  Clip Edges
                </Label>
                <Switch id="clip-switch" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )} />
          </div>
          <DialogFooter className="pt-4 mt-4 border-t border-white/10 gap-4 sm:justify-center">
            <Button asChild variant="outline" className="w-28 bg-white/10 border-white/20 hover:bg-white/20 text-white"><DialogClose>Cancel</DialogClose></Button>
            <Button type="submit" className="w-28 bg-primary hover:bg-primary/90 text-white">Save</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}


export function EditAppDialog({ app, open, onOpenChange, defaultCategoryId }: EditAppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditAppDialogContent 
          key={app?.id || 'new-app'}
          app={app} 
          open={open}
          onOpenChange={onOpenChange}
          defaultCategoryId={defaultCategoryId} 
        />
      )}
    </Dialog>
  );
}
