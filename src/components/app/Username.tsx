import { cn } from "@/lib/utils";

export function anonName(n: number | null | undefined) {
  return `User${n ?? "?"}`;
}

export function Username({
  anonNumber,
  className,
  isGuest,
}: {
  anonNumber: number | null | undefined;
  className?: string;
  isGuest?: boolean;
}) {
  return (
    <span className={cn("font-display font-semibold gradient-text", className)}>
      {anonName(anonNumber)}
      {isGuest ? <span className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground">guest</span> : null}
    </span>
  );
}
