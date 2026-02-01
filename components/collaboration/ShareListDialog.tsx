"use client";

import { useState, useTransition } from "react";
import { Share2, X, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  shareList,
  removeCollaborator,
  type CollaboratorWithProfile,
} from "@/actions/collaboration";

interface ShareListDialogProps {
  listId: string;
  collaborators: CollaboratorWithProfile[];
  isOwner: boolean;
  currentUserId: string;
}

export function ShareListDialog({
  listId,
  collaborators,
  isOwner,
  currentUserId,
}: ShareListDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const handleShare = () => {
    if (!email.trim()) {
      toast.error("Wprowadź adres email");
      return;
    }

    startTransition(async () => {
      const result = await shareList(listId, email);

      if (result.success) {
        toast.success("Użytkownik został dodany do listy");
        setEmail("");
        // Keep dialog open to show updated list
      } else {
        toast.error(result.error || "Nie udało się udostępnić listy");
      }
    });
  };

  const handleRemove = (userId: string) => {
    setRemovingUserId(userId);
    startTransition(async () => {
      const result = await removeCollaborator(listId, userId);

      if (result.success) {
        const isSelf = userId === currentUserId;
        toast.success(isSelf ? "Opuściłeś listę" : "Użytkownik został usunięty");

        // If user removed themselves, close dialog
        if (isSelf) {
          setOpen(false);
        }
      } else {
        toast.error(result.error || "Nie udało się usunąć użytkownika");
      }
      setRemovingUserId(null);
    });
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Udostępnij listę">
          <Share2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Udostępnij listę</DialogTitle>
          <DialogDescription>
            Zaproś innych użytkowników do współpracy nad tą listą. Mogą oni dodawać, edytować i
            zaznaczać elementy.
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email użytkownika</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleShare();
                    }
                  }}
                  disabled={isPending}
                />
                <Button onClick={handleShare} disabled={isPending || !email.trim()}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span className="ml-2">Zaproś</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Użytkownik musi mieć konto w aplikacji
              </p>
            </div>
          </div>
        )}

        {collaborators.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Współpracownicy ({collaborators.length})</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {collaborators.map((collaborator) => {
                const canRemove = isOwner || collaborator.user_id === currentUserId;
                const isRemoving = removingUserId === collaborator.user_id;

                return (
                  <div
                    key={collaborator.user_id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(collaborator.profile.full_name, collaborator.profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {collaborator.profile.full_name || collaborator.profile.email}
                        </span>
                        {collaborator.profile.full_name && collaborator.profile.email && (
                          <span className="text-xs text-muted-foreground">
                            {collaborator.profile.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(collaborator.user_id)}
                        disabled={isRemoving}
                        className="h-8 w-8"
                        title={collaborator.user_id === currentUserId ? "Opuść listę" : "Usuń"}
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isOwner && collaborators.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Brak współpracowników
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
