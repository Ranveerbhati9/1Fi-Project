import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Sparkles } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-800 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              ↑
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-950">
                1<span className="text-brand-700">Fi</span>
              </span>
              <span className="text-[10px] -mt-1 font-semibold text-gray-400 uppercase tracking-widest">
                Mutual Fund EMI
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-brand-700 transition-colors"
            >
              <Smartphone className="w-4 h-4 mr-1.5 text-gray-400" />
              All Smartphones
            </Link>
            <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              0% Interest Available
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}