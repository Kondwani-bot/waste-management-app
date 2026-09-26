import React from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck, Sparkles, Plus, Home } from 'lucide-react';

interface ThankYouModalProps {
  onClose: () => void;
  onResetForm: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({ onClose, onResetForm }) => {
  return (
    <div
      id="thank-you-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-100 p-6 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-100/70 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-teal-100/70 blur-2xl pointer-events-none" />

        {/* Animated Checkmark Circle */}
        <div className="relative mb-5 mt-2">
          {/* Pulsing halo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1.2], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute -inset-2 rounded-full bg-emerald-400"
          />
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 relative z-10"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </motion.div>
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-neutral-900 tracking-tight"
        >
          Report Received!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="text-xs font-medium text-neutral-500 mt-1 max-w-[240px] leading-relaxed"
        >
          Your waste report with precise GPS coordinates has been recorded in the Waste Watch system.
        </motion.p>

        {/* Action button */}
        <div className="w-full mt-6 flex flex-col gap-2">
          <button
            id="thank-you-view-feed-btn"
            onClick={onClose}
            className="w-full py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>View on Public Feed</span>
          </button>

          <button
            id="thank-you-new-report-btn"
            onClick={() => {
              onResetForm();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Another Site</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
