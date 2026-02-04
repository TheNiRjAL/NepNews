import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { PartyCard } from './components/PartyCard';
import { HoroscopeCard } from './components/HoroscopeCard';
import { NotificationToast } from './components/NotificationToast';
import { fetchLatestNews, fetchPartyInsights, fetchDailyHoroscope } from './services/geminiService';
import { NewsItem, Party, HoroscopeItem, Language } from './types';
import { RefreshCw, Sparkles } from 'lucide-react';
import { translations } from './translations';

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [horoscopes, setHoroscopes] = useState<HoroscopeItem[]>([]);
  const [hotTopic, setHotTopic] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingParties, setLoadingParties] = useState(true);
  const [loadingHoroscope, setLoadingHoroscope] = useState(true);
  
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  
  // New States
  const [language, setLanguage] = useState<Language>('en');
  const [isDark, setIsDark] = useState(false);
  
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'horoscope'>('home');

  // Translation helper
  const t = translations[language];

  // Theme Management
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Data Fetching
  const loadNews = useCallback(async () => {
    if (currentPage !== 'home') return; // Only fetch if on home (optimization)
    setLoadingNews(true);
    const { news: fetchedNews, hotTopic: fetchedTopic } = await fetchLatestNews(language);
    setNews(fetchedNews);
    setLastUpdated(new Date().toLocaleTimeString());
    
    if (fetchedTopic) {
      setHotTopic(fetchedTopic);
      setShowNotification(true);
    }
    setLoadingNews(false);
  }, [language, currentPage]);

  const loadParties = useCallback(async () => {
    if (currentPage !== 'home' && parties.length > 0) return;
    setLoadingParties(true);
    const fetchedParties = await fetchPartyInsights(language);
    setParties(fetchedParties);
    setLoadingParties(false);
  }, [language, currentPage, parties.length]);

  const loadHoroscope = useCallback(async () => {
    // We can allow pre-fetching or just fetch when visited
    if (currentPage !== 'horoscope' && horoscopes.length > 0) return;
    setLoadingHoroscope(true);
    const fetchedHoroscopes = await fetchDailyHoroscope(language);
    setHoroscopes(fetchedHoroscopes);
    setLoadingHoroscope(false);
  }, [language, currentPage, horoscopes.length]);

  // Initial load and reload when language changes
  useEffect(() => {
    if (currentPage === 'home') {
        loadNews();
        loadParties();
    } else {
        loadHoroscope();
    }
  }, [loadNews, loadParties, loadHoroscope, currentPage]);

  // Refresh news interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPage === 'home') loadNews();
    }, 180000); 
    return () => clearInterval(interval);
  }, [loadNews, currentPage]);

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <Header 
        language={language} 
        setLanguage={setLanguage}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {currentPage === 'home' && (
          <div className="space-y-12 animate-fade-in">
            {/* News Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{t.updatesTitle}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.updatesSubtitle} • Updated: {lastUpdated}</p>
                </div>
                <button 
                  onClick={loadNews}
                  disabled={loadingNews}
                  className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${loadingNews ? 'animate-spin' : ''}`}
                  title={t.refresh}
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              {loadingNews && news.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                   ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((item) => (
                    <NewsCard key={item.id} item={item} readMoreLabel={t.readMore} />
                  ))}
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Parties Section */}
            <section id="parties">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{t.partiesTitle}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                  {t.partiesSubtitle}
                </p>
              </div>

              {loadingParties ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {parties.map((party) => (
                    <PartyCard 
                      key={party.id} 
                      party={party} 
                      labels={{ ideology: t.ideology, latestStance: t.latestStance }} 
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* Trending Section Placeholder */}
            <section id="trends" className="bg-nepal-blue dark:bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden transition-colors duration-300">
                 <div className="relative z-10 text-center">
                     <h2 className="text-2xl font-serif font-bold mb-4">{t.countdownTitle}</h2>
                     <p className="text-blue-100 max-w-lg mx-auto">
                        {t.countdownText}
                     </p>
                 </div>
                 {/* Decorative circles */}
                 <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-40 h-40 bg-nepal-red/30 rounded-full blur-3xl"></div>
            </section>
          </div>
        )}

        {currentPage === 'horoscope' && (
          <div className="animate-fade-in max-w-5xl mx-auto">
             <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                  <Sparkles className="text-purple-600 dark:text-purple-400 w-8 h-8" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">{t.horoscopeTitle}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    {t.horoscopeSubtitle}
                </p>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-2">
                    {new Date().toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
             </div>

              {loadingHoroscope ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                   ))}
                 </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {horoscopes.map((h, i) => (
                      <HoroscopeCard key={i} item={h} />
                    ))}
                 </div>
              )}
          </div>
        )}

      </main>

      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif text-lg text-gray-300 mb-2">{t.title}</p>
          <p className="text-sm">{t.footer}</p>
        </div>
      </footer>

      {/* Notification Toast */}
      {hotTopic && (
        <NotificationToast 
          message={hotTopic} 
          title={t.hotTopic}
          show={showNotification} 
          onClose={() => setShowNotification(false)} 
        />
      )}
    </div>
  );
};

export default App;