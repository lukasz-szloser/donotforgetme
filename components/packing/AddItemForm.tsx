"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addItem } from "@/actions/packing";
import { toast } from "sonner";

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
      // Clear form on success
      formRef.current?.reset();
      toast.success("Element dodany");
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="container mx-auto max-w-4xl">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="parentId" value="" />
      <div className="flex gap-2">
        <Input
          type="text"
          name="title"
          placeholder="Dodaj nowy element..."
          required
          className="flex-1 min-h-[48px]"
          autoComplete="off"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6">
          Dodaj
        </Button>
      </div>
    </form>
  );
}
