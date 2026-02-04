import React from 'react';
import { Party } from '../types';
import { TrendingUp } from 'lucide-react';

interface PartyCardProps {
  party: Party;
  labels: {
    ideology: string;
    latestStance: string;
  }
}

export const PartyCard: React.FC<PartyCardProps> = ({ party, labels }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 group transition-colors duration-300">
      {/* Background Image / Color overlay */}
      <div className="h-24 w-full relative">
        <div className={`absolute inset-0 ${party.color} opacity-90`}></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-8 left-6">
            <div className="h-16 w-16 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-3xl border-4 border-white dark:border-gray-700 z-10 transition-colors duration-300">
                {party.symbol}
            </div>
        </div>
      </div>

      <div className="pt-10 px-6 pb-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{party.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{party.fullName}</p>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{labels.ideology}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{party.description}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-nepal-blue dark:text-blue-400 mb-1">
                    <TrendingUp size={14} className="mr-1.5" />
                    <span className="text-xs font-bold uppercase">{labels.latestStance}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{party.recentStance}"</p>
            </div>
        </div>
      </div>
    </div>
  );
};