
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const ToastContext = React.createContext({
  showToast: () => {},
  hideToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    if (duration) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toastClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div
        className={`${
          toastClasses[type]
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}
      >
        <span>{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};