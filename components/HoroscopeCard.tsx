import React from 'react';
import { HoroscopeItem } from '../types';

interface HoroscopeCardProps {
  item: HoroscopeItem;
}

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ item }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-2xl bg-gray-50 dark:bg-gray-700 p-2 rounded-full w-12 h-12 flex items-center justify-center">
            {item.icon}
        </div>
        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
            {item.sign}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 font-sans leading-relaxed pl-1">
        {item.prediction}
      </p>
    </div>
  );
};