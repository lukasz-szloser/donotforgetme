"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CollaboratorWithProfile } from "@/actions/collaboration";

interface CollaboratorAvatarsProps {
  collaborators: CollaboratorWithProfile[];
  maxDisplay?: number;
}

export function CollaboratorAvatars({ collaborators, maxDisplay = 3 }: CollaboratorAvatarsProps) {
  if (collaborators.length === 0) {
    return null;
  }

  const displayedCollaborators = collaborators.slice(0, maxDisplay);
  const remainingCount = collaborators.length - maxDisplay;

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

  const getDisplayName = (collaborator: CollaboratorWithProfile) => {
    return collaborator.profile.full_name || collaborator.profile.email || "Użytkownik";
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div className="flex -space-x-2">
          {displayedCollaborators.map((collaborator) => (
            <Tooltip key={collaborator.user_id}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background hover:z-10 transition-transform hover:scale-110">
                  <AvatarImage src={collaborator.profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(collaborator.profile.full_name, collaborator.profile.email)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-medium">{getDisplayName(collaborator)}</p>
                  {collaborator.profile.full_name && collaborator.profile.email && (
                    <p className="text-muted-foreground">{collaborator.profile.email}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background hover:z-10 transition-transform hover:scale-110">
                  <AvatarFallback className="text-xs bg-muted">+{remainingCount}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-medium">
                    {remainingCount === 1
                      ? "1 dodatkowa osoba"
                      : `${remainingCount} dodatkowych osób`}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
