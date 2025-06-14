"use client";

import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { ReunionData } from "@/hooks/use-meetings";
import { toast } from "sonner";

interface DeleteMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: ReunionData | null;
  onDelete: (id: string) => Promise<boolean>;
}

export function DeleteMeetingDialog({ 
  open, 
  onOpenChange, 
  meeting, 
  onDelete 
}: DeleteMeetingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!meeting) return;

    setIsLoading(true);
    try {
      const success = await onDelete(meeting._id);
      
      if (success) {
        toast.success("Reunión eliminada exitosamente");
        onOpenChange(false);
      } else {
        toast.error("Error al eliminar la reunión");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Error al eliminar la reunión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar reunión?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la reunión
            {meeting && (
              <span className="font-semibold"> "{meeting.titulo}"</span>
            )}
            {" "}y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
