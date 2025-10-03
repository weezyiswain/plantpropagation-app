import { CircleCheck, CircleMinus, AlertCircle } from "lucide-react";

interface DifficultyBadgeProps {
  difficulty: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function DifficultyBadge({ difficulty, size = "md", showIcon = true }: DifficultyBadgeProps) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  
  const styles = {
    easy: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: CircleCheck,
    },
    medium: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      icon: CircleMinus,
    },
    hard: {
      bg: "bg-rose-100 dark:bg-rose-900/30",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800",
      icon: AlertCircle,
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const style = styles[normalizedDifficulty as keyof typeof styles] || styles.medium;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize ${style.bg} ${style.text} ${style.border} ${sizeStyles[size]}`}
      data-testid={`badge-difficulty-${normalizedDifficulty}`}
    >
      {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {difficulty}
    </span>
  );
}
