import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "horizontal" ? "items-center" : "flex-col",
        className
      )}
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-muted-foreground whitespace-nowrap", className)}
      {...props}
    />
  );
}
