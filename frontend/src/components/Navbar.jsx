import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar({ darkMode, onToggleDark, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 lg:pl-64"
      style={{ background: '#ece5d8', borderBottom: '1px solid #d4cdc0' }}>

      {/* Mobile hamburger */}
      <button onClick={onMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-beige-300 text-brown-400 transition-colors mr-2">
        <Menu className="w-4 h-4" />
      </button>

      <div className="ml-auto flex items-center gap-1">

        {/* Dark mode */}
        <button onClick={onToggleDark}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-brown-400 hover:bg-beige-300 transition-all">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-beige-300 transition-all">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold uppercase"
              style={{ background: '#2c2420' }}>
              {user?.email?.[0]}
            </div>
            <span className="hidden sm:block text-brown-500 text-sm max-w-[130px] truncate">{user?.email}</span>
            <ChevronDown className={`w-3 h-3 text-brown-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50 animate-scale-in shadow-md"
              style={{ background: '#f5f1ea', border: '1px solid #d4cdc0' }}>
              <div className="px-4 py-3 border-b border-beige-200">
                <div className="flex items-center gap-1 mb-0.5">
                  <User className="w-3 h-3 text-brown-300" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brown-300">{t('nav.signedInAs')}</p>
                </div>
                <p className="text-sm font-medium text-brown-600 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left px-3 py-2 text-sm text-brown-500 hover:bg-beige-200 rounded-lg flex items-center gap-2 transition-all">
                  <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
