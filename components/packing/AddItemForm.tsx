"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addItem } from "@/actions/packing";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddItemFormProps {
  listId: string;
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await addItem(formData);

    if (!result.success) {
      toast.error(result.error || "Nie udało się dodać elementu");
    } else {
      formRef.current?.reset();
      toast.success("Element dodany");
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="container mx-auto max-w-4xl px-4">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="parentId" value="" />
      <div className="flex gap-3 p-3 bg-card/80 backdrop-blur-lg rounded-2xl shadow-elevated border border-border/50">
        <Input
          type="text"
          name="title"
          placeholder="Dodaj nowy element..."
          required
          className="flex-1 h-12 rounded-xl border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
          autoComplete="off"
        />
        <Button type="submit" className="btn-primary h-12 px-6 rounded-xl gap-2 touch-target">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Dodaj</span>
        </Button>
      </div>
    </form>
  );
}
