import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Phone,
  Building2,
  Clock,
  Headphones,
} from 'lucide-react';

export const CouncilHelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Ball (Chatbot-style button in translucent blue & white) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {/* Subtle pill hint on desktop / initial view */}
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-blue-200/80 text-blue-900 text-xs font-bold shadow-md hover:bg-blue-50/80 transition-all cursor-pointer backdrop-blur-md"
        >
          <Headphones className="w-3.5 h-3.5 text-blue-600" />
          <span>Council Help</span>
        </motion.button>

        {/* Floating Ball / Button: Transparent Blue & White styling */}
        <motion.button
          id="floating-help-ball-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700/90 via-blue-600/85 to-sky-500/80 backdrop-blur-md text-white shadow-xl shadow-blue-600/35 flex items-center justify-center cursor-pointer border-2 border-white/70 focus:outline-hidden"
          title="Need Help? Contact Local Council"
          aria-label="Open Council Help"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 stroke-[2.2]" />
              {/* Online indicator dot */}
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-sky-300 ring-2 ring-blue-600" />
            </>
          )}
        </motion.button>
      </div>

      {/* Help Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header in Translucent Blue with White accents */}
              <div className="bg-gradient-to-r from-blue-700/95 via-blue-600/90 to-sky-600/85 backdrop-blur-md text-white p-5 flex items-start justify-between relative border-b border-white/10">
                {/* Translucent background glow accents */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none blur-xl" />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-sky-400/20 pointer-events-none blur-lg" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight leading-tight">
                      Local Council Support
                    </h2>
                    <p className="text-xs text-blue-100 font-medium mt-0.5">
                      Waste Management Directorate & Public Health
                    </p>
                  </div>
                </div>

                <button
                  id="close-council-help-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer relative z-10"
                  title="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="space-y-3.5">
                  {/* Primary Emergency Hotline Card with transparent blue styling */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 backdrop-blur-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        Emergency Waste Hotline
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200/80">
                        Toll-Free
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      For immediate hazard clearance, overflowing public drains, or illegal dumps.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="tel:+260211252509"
                        className="px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>+260 211 252 509</span>
                      </a>
                      <a
                        href="tel:0800111222"
                        className="px-3.5 py-2 rounded-xl bg-white/95 border border-blue-300/80 hover:bg-blue-50 text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <span>0800 111 222 (Toll Free)</span>
                      </a>
                    </div>
                  </div>

                  {/* Operational hours note */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-blue-950 text-xs">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Hours:</strong> Mon – Fri: 08:00 – 17:00. Emergency dispatch response runs 24/7.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-blue-50/40 border-t border-blue-100 flex items-center justify-end text-[11px] text-neutral-500">
                <button
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-blue-700 hover:text-blue-900 cursor-pointer px-2 py-1"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
