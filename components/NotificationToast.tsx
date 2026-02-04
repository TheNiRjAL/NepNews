import React, { useEffect, useState } from 'react';
import { Flame, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  title: string;
  onClose: () => void;
  show: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, title, onClose, show }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
        const timer = setTimeout(() => {
            onClose();
        }, 8000); // Auto dismiss after 8 seconds
        return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-nepal-red p-4 transform transition-all duration-500 ease-in-out animate-slide-up dark:text-gray-100">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Flame className="h-5 w-5 text-nepal-red animate-pulse" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-snug">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};