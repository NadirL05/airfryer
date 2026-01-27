"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Hand } from "lucide-react";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: "default" | "footer";
}

export function Logo({ className, showTagline = false, variant = "default" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const isFooter = variant === "footer";
  
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
        {!imageError ? (
          <Image
            src="/images/logo.png"
            alt="AirFryer Deal"
            fill
            className="object-contain"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: Icon placeholder
          <div className={cn(
            "flex items-center justify-center h-full w-full rounded-lg",
            isFooter ? "bg-white/10" : "bg-primary/10"
          )}>
            <Hand className={cn(
              "h-6 w-6 sm:h-8 sm:w-8",
              isFooter ? "text-primary" : "text-primary"
            )} />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "text-xl font-bold tracking-tight sm:text-2xl",
          isFooter && "text-white"
        )}>
          <span className={isFooter ? "text-primary" : "text-primary"}>AIRFRYER</span>
          <span className={isFooter ? "text-secondary" : "text-secondary"}> DEAL</span>
        </span>
        {showTagline && (
          <span className={cn(
            "hidden text-[10px] sm:block",
            isFooter ? "text-gray-400" : "text-muted-foreground"
          )}>
            La cuisson saine, croustillante et sans huile
          </span>
        )}
      </div>
    </Link>
  );
}
