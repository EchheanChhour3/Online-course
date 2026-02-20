"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  userName?: string;
  greeting?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function PageHeader({
  userName = "Andrew",
  greeting = "Welcome back",
  subtitle = "Ready to continue your learning journey?",
  searchPlaceholder = "Search for course, skills...",
  onSearch,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {greeting} {userName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10 border-gray-300 focus-visible:ring-blue-500"
          />
        </div>
      </div>
    </header>
  );
}
