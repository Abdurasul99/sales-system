"use client";

import { Bell, Search } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
