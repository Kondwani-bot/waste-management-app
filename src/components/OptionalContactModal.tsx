import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, User, Phone, Check, ShieldCheck, UserCheck } from 'lucide-react';

interface OptionalContactModalProps {
  isOpen: boolean;
  onSaveContact: (name?: string, phone?: string) => void;
  onSkipAnonymous: () => void;
}

export const OptionalContactModal: React.FC<OptionalContactModalProps> = ({
  isOpen,
  onSaveContact,
  onSkipAnonymous,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContact(name.trim() || undefined, phone.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Top banner in Transparent Blue & White */}
        <div className="bg-gradient-to-br from-blue-700/90 via-blue-600/85 to-sky-600/80 backdrop-blur-md text-white p-6 text-center relative overflow-hidden border-b border-white/10">
          {/* Subtle translucent circle shapes */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none blur-sm" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-sky-400/20 pointer-events-none blur-sm" />

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <UserCheck className="w-7 h-7 text-white stroke-[2.2]" />
          </div>

          <h2 className="text-lg font-black tracking-tight leading-tight">
            Add Contact Details?
          </h2>
          <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 border border-white/20 backdrop-blur-xs">
            Completely Optional
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70 backdrop-blur-xs text-neutral-700 text-xs leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Your report is <strong>100% anonymous</strong> by default. If you want the local council clean-up crew to reach you for directions or updates, you may leave your contact info below.
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Name (Optional)</span>
              </label>
              <input
                id="reporter-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Banda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200/80 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Phone / WhatsApp Number (Optional)</span>
              </label>
              <input
                id="reporter-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +260 977 000 000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200/80 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="save-contact-btn"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/90 to-sky-600/90 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {name.trim() || phone.trim() ? 'Save Contact & Submit' : 'Continue'}
              </span>
            </button>

            <button
              id="skip-contact-btn"
              type="button"
              onClick={onSkipAnonymous}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/90 text-neutral-600 hover:text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-200/50"
            >
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span>Skip / Keep 100% Anonymous</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
