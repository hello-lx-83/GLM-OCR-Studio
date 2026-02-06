"use client";

import { AppSidebar } from "./AppSidebar";
import { Header } from "@/components/studio/Header";
import { SettingsProvider } from "@/contexts/SettingsContext";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header />
          {children}
        </main>
      </div>
    </SettingsProvider>
  );
}
