import * as React from "react";
import { Avatar as RadixAvatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixAvatar>) {
  return <RadixAvatar className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export { AvatarFallback, AvatarImage };
