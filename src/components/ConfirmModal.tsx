import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirm Completion',
  message,
  confirmLabel = 'Yes, Complete Task',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-100 p-6 flex flex-col items-center text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
          <AlertCircle className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
          {message}
        </p>

        <div className="w-full grid grid-cols-2 gap-3 mt-6">
          <button
            id="confirm-cancel-btn"
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>{cancelLabel}</span>
          </button>
          <button
            id="confirm-action-btn"
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
