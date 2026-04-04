"use client";

import { Toaster as HotToaster, type ToasterProps } from "react-hot-toast";

export function Toaster(props: ToasterProps) {
  return (
    <HotToaster
      toastOptions={{
        className:
          "!bg-background !text-foreground !border !border-border !shadow-lg",
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
        },
        duration: 4000,
        success: {
          iconTheme: {
            primary: "var(--background)",
            secondary: "#22c55e",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--background)",
            secondary: "#ef4444",
          },
        },
      }}
      {...props}
    />
  );
}
