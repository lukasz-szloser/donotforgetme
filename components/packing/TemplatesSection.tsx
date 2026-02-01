"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createFromTemplate } from "@/actions/packing";
import { toast } from "sonner";
import { packingTemplates } from "@/lib/templates";

export function TemplatesSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setCreatingTemplateId(templateId);
    startTransition(async () => {
      const result = await createFromTemplate(templateId);

      if (result.success && result.data) {
        toast.success("Lista utworzona z szablonu!");
        router.push(`/lists/${result.data.id}`);
      } else {
        toast.error(result.error || "Nie udało się utworzyć listy");
        setCreatingTemplateId(null);
      }
    });
  };

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Szablony list
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Zacznij szybko z gotowym szablonem i dostosuj go do swoich potrzeb
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {packingTemplates.map((template) => {
          const isCreating = creatingTemplateId === template.id;
          return (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {template.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {template.description}
              </p>
              <Button
                onClick={() => handleSelectTemplate(template.id)}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tworzenie...
                  </>
                ) : (
                  "Użyj szablonu"
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
