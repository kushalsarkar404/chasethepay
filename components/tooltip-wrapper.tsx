"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
}

export function TooltipWrapper({
  children,
  content,
}: TooltipWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
