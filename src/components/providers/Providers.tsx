"use client";

import { ContentProvider } from "./ContentProvider";
import { ProgressProvider } from "./ProgressProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ContentProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </ContentProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
