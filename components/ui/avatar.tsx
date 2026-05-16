import * as React from "react";
import { Avatar as RadixAvatar, AvatarFallback as RadixFallback, AvatarImage as RadixImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixAvatar>) {
  return <RadixAvatar className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarImage({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixImage>) {
  return <RadixImage className={cn("h-full w-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixFallback>) {
  return (
    <RadixFallback
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-white", className)}
      {...props}
    />
  );
}
