"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateList } from "@/actions/packing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditListDialogProps {
  listId: string;
  currentName: string;
  currentDescription?: string | null;
}

export function EditListDialog({ listId, currentName, currentDescription }: EditListDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Podaj nazwę listy");
      return;
    }

    const formData = new FormData();
    formData.append("listId", listId);
    formData.append("name", name);
    formData.append("description", description);

    const result = await updateList(formData);

    if (!result.success) {
      toast.error(result.error || "Nie udało się zaktualizować listy");
    } else {
      toast.success("Lista zaktualizowana");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          Edytuj
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edytuj listę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nazwa listy</Label>
              <Input
                id="name"
                type="text"
                placeholder="Np. Walizka na Zakopane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-[48px]"
                maxLength={100}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Opis (opcjonalnie)</Label>
              <Input
                id="description"
                type="text"
                placeholder="Dodatkowe informacje..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[48px]"
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setName(currentName);
                setDescription(currentDescription || "");
              }}
            >
              Anuluj
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
