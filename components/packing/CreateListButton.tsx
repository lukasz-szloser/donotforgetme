"use client";

import { Button } from "@/components/ui/button";
import { createList } from "@/actions/packing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateListButton() {
  const router = useRouter();

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append("name", "Nowa lista");
    formData.append("description", "");

    const result = await createList(formData);

    if (!result.success) {
      toast.error(result.error || "Nie udało się utworzyć listy");
    } else {
      toast.success("Lista utworzona");
      // Navigate to the new list
      if (result.data?.id) {
        router.push(`/lists/${result.data.id}`);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
      + Nowa lista
    </Button>
  );
}
