import { cn } from "@/lib/utils";

const variants = {
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
  info: "bg-primary/10 text-primary",
};

interface StatusBadgeProps {
  label: string;
  variant: keyof typeof variants;
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant])}>
      {label}
    </span>
  );
}
