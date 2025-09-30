'use client';
import { useEffect } from 'react';

export default function Notification({ message, type = 'error', onClose, duration = 5000, visible = true }) {
  useEffect(() => {
    if (visible && message && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, message, duration, onClose]);

  if (!visible || !message) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const textColor = 'text-white';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div 
        className={`${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center justify-between`}
        role="alert"
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Fermer la notification"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
