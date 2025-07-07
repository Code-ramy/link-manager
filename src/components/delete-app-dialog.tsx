"use client";

import type { WebApp } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteAppDialogProps {
  appToDelete: WebApp | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAppDialog({ appToDelete, onClose, onConfirm }: DeleteAppDialogProps) {
  return (
    <Dialog open={!!appToDelete} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="modal-card sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{appToDelete?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 sm:justify-center gap-4">
          <Button variant="outline" onClick={onClose} className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
