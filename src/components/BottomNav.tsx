'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Compass, Bookmark, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/trips', label: 'Trips', icon: Map },
    { href: '#', label: 'Explore', icon: Compass },
    { href: '#', label: 'Saved', icon: Bookmark },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl rounded-t-3xl border-t border-outline-variant/10 z-50 shadow-[-4px_0_24px_rgba(0,0,0,0.06)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-transform ${
              isActive
                ? 'bg-orange-100 text-orange-900 rounded-2xl scale-90'
                : 'text-slate-500 hover:text-orange-700'
            }`}
          >
            <Icon
              className="w-6 h-6"
              style={isActive ? { fill: 'currentColor' } : undefined}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
