'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, Compass, BookOpen, Map, User } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/trips', label: 'Trips', icon: Map },
    { href: '#', label: 'Explore', icon: Compass },
    { href: '#', label: 'Journal', icon: BookOpen },
    { href: '#', label: 'Profile', icon: User },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/20">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/trips" className="text-2xl font-serif italic text-orange-900 hover:text-orange-800 transition-colors">
          Wanderer
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-orange-900 border-b-2 border-orange-800 pb-1'
                    : 'text-slate-600 hover:text-orange-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search (desktop) */}
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-48 p-0"
              placeholder="Search trips..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed">
            <div className="w-full h-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              W
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-white/80 backdrop-blur-md">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
