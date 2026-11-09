import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SideNav from './SideNav';
import { Menu, Film, X, Search, Home, Clapperboard, Download, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';

const mobileTabs = [
  { label: 'Home', icon: Home, to: '/', available: true },
  { label: 'Shorts', icon: Clapperboard, to: null, available: false },
  { label: 'Movie Hub', icon: Film, to: '/browse', available: true },
  { label: 'Download', icon: Download, to: null, available: false },
  { label: 'Profile', icon: UserRound, to: null, available: false },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/95 border-b border-white/10 flex items-center justify-between px-4 z-40 shadow-lg backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2" aria-label="Movie-stars home">
          <span className="text-2xl font-display font-black tracking-tight text-brand-primary">M</span>
          <span className="text-lg font-display font-extrabold tracking-tight text-white">MOVIE<span className="text-brand-primary">-STARS</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/search" aria-label="Search movies" className="p-2 text-white/90 hover:text-brand-primary transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="p-2 text-white bg-white/5 rounded-lg border border-white/10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <SideNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 md:ml-64 pt-16 pb-24 px-4 md:pt-8 md:pb-8 md:px-8 overflow-x-hidden relative">
        {children}
      </main>

      <nav aria-label="Primary mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#090909]/95 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-[66px]">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            if (!tab.available || !tab.to) {
              return (
                <div key={tab.label} aria-disabled="true" title={`${tab.label} is not available yet`} className="flex flex-col items-center justify-center gap-1 text-white/30">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                  <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                </div>
              );
            }
            return (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) => cn(
                  'relative flex flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-white' : 'text-white/55 hover:text-white'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-0 h-[2px] w-8 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(229,9,20,0.8)]" />}
                    <Icon className={cn('w-5 h-5', isActive && 'text-brand-primary')} strokeWidth={isActive ? 2.3 : 1.8} />
                    <span className={cn('text-[10px] font-semibold leading-none', isActive && 'text-white')}>{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
