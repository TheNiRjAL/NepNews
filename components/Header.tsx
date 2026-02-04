import React, { useState } from 'react';
import { Flag, Menu, Moon, Sun, Languages, X, Home, Star } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentPage: 'home' | 'horoscope';
  onNavigate: (page: 'home' | 'horoscope') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  language, 
  setLanguage, 
  isDark, 
  toggleTheme, 
  currentPage, 
  onNavigate 
}) => {
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (page: 'home' | 'horoscope') => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => handleNav('home')}
          >
            <div className="bg-nepal-red p-2 rounded-lg text-white">
              <Flag size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-nepal-blue dark:text-blue-400 tracking-tight">
                {t.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-sans tracking-wider uppercase">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
              <button 
                onClick={() => handleNav('home')}
                className={`hover:text-nepal-red dark:hover:text-red-400 transition-colors ${currentPage === 'home' ? 'text-nepal-red dark:text-red-400 font-bold' : ''}`}
              >
                {t.navHome}
              </button>
              <button 
                onClick={() => handleNav('horoscope')}
                className={`hover:text-nepal-red dark:hover:text-red-400 transition-colors flex items-center gap-1 ${currentPage === 'horoscope' ? 'text-nepal-red dark:text-red-400 font-bold' : ''}`}
              >
                <Star size={14} className={currentPage === 'horoscope' ? 'fill-current' : ''} />
                {t.navHoroscope}
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2 border-l pl-4 border-gray-200 dark:border-gray-700">
              
              {/* Language Toggle */}
              <button 
                onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                title="Switch Language"
              >
                <Languages size={18} />
                <span className="text-xs font-bold">{language.toUpperCase()}</span>
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? "Light Mode" : "Dark Mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-slide-down z-40">
          <div className="flex flex-col p-4 space-y-2">
            <button 
              onClick={() => handleNav('home')}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                currentPage === 'home' 
                  ? 'bg-nepal-red/10 text-nepal-red dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home size={20} className="mr-3" />
              <span className="font-medium">{t.navHome}</span>
            </button>
            
            <button 
              onClick={() => handleNav('horoscope')}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                currentPage === 'horoscope' 
                  ? 'bg-nepal-red/10 text-nepal-red dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Star size={20} className="mr-3" />
              <span className="font-medium">{t.navHoroscope}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};