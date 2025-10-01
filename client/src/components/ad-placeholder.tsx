import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  slot: string;
  format?: "leaderboard" | "rectangle" | "mobile-banner" | "large-rectangle";
  className?: string;
}

export function AdPlaceholder({ slot, format = "rectangle", className }: AdPlaceholderProps) {
  const sizeClasses = {
    "leaderboard": "h-[90px] max-w-[728px]",
    "rectangle": "h-[250px] w-[300px]",
    "mobile-banner": "h-[50px] w-full max-w-[320px]",
    "large-rectangle": "h-[600px] w-[300px]"
  };

  const responsiveClasses = {
    "leaderboard": "hidden md:block",
    "rectangle": "hidden md:block",
    "mobile-banner": "block md:hidden",
    "large-rectangle": "hidden lg:block"
  };

  return (
    <div 
      className={cn(
        "mx-auto my-6 flex items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg",
        sizeClasses[format],
        responsiveClasses[format],
        className
      )}
      data-ad-slot={slot}
      data-testid={`ad-slot-${slot}`}
    >
      <div className="text-center text-muted-foreground/60 text-sm px-4">
        <p className="font-mono">{format.toUpperCase()}</p>
        <p className="text-xs mt-1">Ad Slot: {slot}</p>
      </div>
    </div>
  );
}
