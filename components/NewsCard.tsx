import React, { useContext } from 'react';
import { Clock, ExternalLink, Share2 } from 'lucide-react';
import { NewsItem } from '../types';
import { translations } from '../translations';

// Note: To properly support language here without props, we could use context, 
// but for now we will rely on content being translated and simple static labels.
// Actually, let's pass language as a prop to keep it pure, or infer from somewhere.
// Since we didn't add context, we'll just update the component to support static labels via content or default to icons.
// However, "Read Full Story" needs translation.
// I'll make NewsCard accept the "readMore" label as a prop to keep it simple.

interface NewsCardProps {
  item: NewsItem;
  readMoreLabel: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, readMoreLabel }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-nepal-red dark:bg-red-900/30 dark:text-red-300">
          {item.source}
        </span>
        <span className="flex items-center text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} className="mr-1" />
          {item.timestamp}
        </span>
      </div>
      
      <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-nepal-blue dark:group-hover:text-blue-400 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow font-sans leading-relaxed">
        {item.summary}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <Share2 size={16} />
        </button>
        {item.url && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-nepal-blue dark:text-blue-400 hover:text-nepal-red dark:hover:text-red-400 transition-colors"
          >
            {readMoreLabel}
            <ExternalLink size={14} className="ml-1" />
          </a>
        )}
      </div>
    </div>
  );
};