import { cn } from "@/lib/utils";

type BadgeVariant =
  | "indigo"
  | "cyan"
  | "green"
  | "orange"
  | "violet"
  | "red"
  | "amber"
  | "default";

const variantStyles: Record<BadgeVariant, string> = {
  indigo:
    "bg-indigo-500/10 text-indigo-400/80 border border-indigo-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400/80 border border-cyan-500/20",
  green: "bg-green-500/10 text-green-400/80 border border-green-500/20",
  orange:
    "bg-orange-500/10 text-orange-400/80 border border-orange-500/20",
  violet:
    "bg-violet-500/10 text-violet-400/80 border border-violet-500/20",
  red: "bg-red-500/10 text-red-400/80 border border-red-500/20",
  amber:
    "bg-amber-500/10 text-amber-400/80 border border-amber-500/20",
  default:
    "bg-white/5 text-white/60 border border-white/10",
};

interface AiBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function AiBadge({
  children,
  variant = "default",
  className,
}: AiBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function categoryVariant(category?: string): BadgeVariant {
  if (!category) return "default";
  const map: Record<string, BadgeVariant> = {
    development: "indigo",
    writing: "cyan",
    marketing: "orange",
    analysis: "violet",
    "data-analysis": "violet",
    devops: "green",
  };
  return map[category.toLowerCase()] ?? "default";
}
