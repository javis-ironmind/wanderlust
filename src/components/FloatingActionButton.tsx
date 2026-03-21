'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = 'Create New Trip' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 flex items-center gap-3 pl-5 pr-7 py-4 rounded-full bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white shadow-[0_8px_24px_rgba(14,29,37,0.06)] hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      <Plus className="w-6 h-6" />
      <span className="hidden md:inline font-semibold tracking-wide">{label}</span>
    </button>
  );
}
