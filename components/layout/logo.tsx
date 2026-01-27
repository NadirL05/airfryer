"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: "default" | "footer";
}

export function Logo({ className, showTagline = false, variant = "default" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const isFooter = variant === "footer";
  
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      {/* Logo Image */}
      <div className="relative h-12 w-auto sm:h-14 flex-shrink-0">
        {!imageError ? (
          <Image
            src="/images/logo.png"
            alt="AirFryer Deal"
            width={120}
            height={48}
            className="object-contain h-full w-auto"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: Text only if image fails
          <div className={cn(
            "flex items-center justify-center h-full px-2",
            isFooter ? "text-white" : "text-foreground"
          )}>
            <span className="text-lg font-bold">AirFryer Deal</span>
          </div>
        )}
      </div>
      
      {/* Tagline - Only show if showTagline is true */}
      {showTagline && !imageError && (
        <span className={cn(
          "hidden text-xs sm:block whitespace-nowrap",
          isFooter ? "text-gray-300" : "text-muted-foreground"
        )}>
          La cuisson saine, croustillante et sans huile
        </span>
      )}
    </Link>
  );
}
