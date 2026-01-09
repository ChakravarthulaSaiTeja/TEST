import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-md px-3 py-2 text-base shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:bg-white/50 dark:focus-visible:bg-black/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
