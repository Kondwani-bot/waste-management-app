import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  User,
  Phone,
  Check,
  ShieldCheck,
  UserCheck,
  MessageCircle,
  BellOff,
  BellRing,
  Info,
} from 'lucide-react';

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
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Top banner in Transparent Blue & White */}
        <div className="bg-gradient-to-br from-blue-700/90 via-blue-600/85 to-sky-600/80 backdrop-blur-md text-white p-6 text-center relative overflow-hidden border-b border-white/10">
          {/* Subtle translucent circle shapes */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none blur-sm" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-sky-400/20 pointer-events-none blur-sm" />

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <UserCheck className="w-7 h-7 text-white stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-black tracking-tight leading-tight">
            Follow-Up Contact Options
          </h2>
          <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 border border-white/20 backdrop-blur-xs">
            Choose how you'd like to submit
          </span>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4">
          {/* Feedback transparency cards: Anonymous vs With Contact */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* WhatsApp Updates Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                  <span>If you provide your WhatsApp / Phone:</span>
                </div>
                <p className="text-emerald-800/90 text-[11px] mt-0.5 leading-relaxed">
                  You will be <strong>informed directly via WhatsApp by the Local Council</strong> when the clean-up team is dispatched and when the site is confirmed cleared.
                </p>
              </div>
            </div>

            {/* Anonymous notice Card */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0">
                <BellOff className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-neutral-800 block text-xs">
                  If you choose to remain Anonymous:
                </span>
                <p className="text-neutral-500 text-[11px] mt-0.5 leading-relaxed">
                  Your identity remains 100% private, but you will <strong>not receive feedback or status updates</strong> on your report.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSave} className="space-y-3.5 pt-1">
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
                placeholder="e.g. Kondwani Mbewe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200/80 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>WhatsApp / Phone Number</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  For WhatsApp Feedback
                </span>
              </label>
              <input
                id="reporter-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+260 97X XXX XXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200/80 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="save-contact-btn"
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/90 to-sky-600/90 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {phone.trim() || name.trim()
                    ? 'Submit & Receive WhatsApp Updates'
                    : 'Submit With Contact Details'}
                </span>
              </button>

              <button
                id="skip-contact-btn"
                type="button"
                onClick={onSkipAnonymous}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/90 text-neutral-600 hover:text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-200/50"
              >
                <Shield className="w-3.5 h-3.5 text-neutral-400" />
                <span>Stay 100% Anonymous (No Feedback)</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
