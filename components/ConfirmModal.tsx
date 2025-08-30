import React from 'react';
import { Icon } from './Icon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
}) => {
  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:h-10 sm:w-10">
            <Icon name="alert-triangle" className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-brand-text" id="modal-title">
              {title}
            </h2>
            <div className="mt-2">
              <p className="text-sm text-brand-text-secondary">{message}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-brand-text bg-brand-bg hover:bg-opacity-80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};