"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const pill =
  "tap-target inline-flex h-[38px] items-center gap-2.5 rounded-full bg-forest px-[25px] text-[15px] leading-none tracking-[0.02em] text-cream transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function DesignStudioButton({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "text";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          variant === "pill"
            ? cn(pill, "h-9 px-4 text-sm lg:h-[38px] lg:px-[25px] lg:text-[15px]")
            : "font-serif text-[34px] leading-none font-light tracking-[0.01em] outline-none focus-visible:underline focus-visible:underline-offset-8",
          className,
        )}
      >
        Design Studio
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Popup className="fixed inset-0 z-[100] flex flex-col bg-ivory outline-none">
            <Dialog.Title className="sr-only">Design Studio</Dialog.Title>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Design Studio"
              className="absolute top-4 right-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-forest text-cream outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50"
            >
              <X className="size-5" strokeWidth={1.3} />
            </button>
            <iframe
              src="/studio/studio.html"
              title="The Wed Theory Design Studio"
              className="h-full w-full border-0 bg-ivory"
              allow="fullscreen"
            />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
