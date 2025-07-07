"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDebounce } from 'use-debounce';
import * as LucideIcons from "lucide-react";
import type { Category, WebApp } from '@/lib/types';
import { getPageTitle } from '@/app/actions';
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
  categories: Category[];
  onSave: (data: WebApp) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppDialog({ app, categories, onSave, open, onOpenChange }: EditAppDialogProps) {
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

  useEffect(() => {
    const fetchTitle = async () => {
      if (urlToFetch && z.string().url().safeParse(urlToFetch).success && !form.getValues('name')) {
        try {
          const title = await getPageTitle(urlToFetch);
          if (title) {
            form.setValue('name', title, { shouldValidate: true });
          }
        } catch (error) {
          console.warn("Could not fetch page title from server:", error);
          try {
            const hostname = new URL(urlToFetch).hostname.replace(/^www\./, '');
            const mainDomain = hostname.split('.')[0];
            const fallbackTitle = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
            if (fallbackTitle) {
              form.setValue('name', fallbackTitle, { shouldValidate: true });
            }
          } catch(e) { /* Silently fail */ }
        }
      }
    };
    fetchTitle();
  }, [urlToFetch, form]);

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
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-white/10 border-white/20 hover:bg-white/20 text-sm h-9">
                <LucideIcons.Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            </div>
            <div className="grid gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>App Name</FormLabel><FormControl><Input placeholder="e.g., Google" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://google.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="clip" render={({ field }) => (
                <div className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/[.05] p-3 shadow-sm mt-1 hover:bg-white/10 transition-colors">
                  <Label>Clip Edges</Label>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
    </Dialog>
  );
}
