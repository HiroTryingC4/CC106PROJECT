import React from 'react';

const variantStyles = {
  success: {
    badge: 'bg-green-100 text-green-700',
    button: 'bg-green-600 hover:bg-green-700'
  },
  error: {
    badge: 'bg-red-100 text-red-700',
    button: 'bg-red-600 hover:bg-red-700'
  },
  info: {
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700'
  }
};

const FeedbackModal = ({
  isOpen,
  type = 'info',
  title,
  message,
  actionLabel = 'Close',
  onAction,
  onClose
}) => {
  if (!isOpen) {
    return null;
  }

  const styles = variantStyles[type] || variantStyles.info;

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className={`px-6 py-4 ${styles.badge}`}>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-700 leading-6">{message}</p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAction}
              className={`rounded-lg px-4 py-2 text-white transition-colors ${styles.button}`}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;