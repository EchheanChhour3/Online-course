"use client";

import { SettingsSidebar } from "@/components/settings";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex p-8 sm:p-10 lg:p-12 min-h-screen bg-gray-50">
      <SettingsSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
