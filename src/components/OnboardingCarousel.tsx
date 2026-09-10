import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, Send, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Snap',
      badge: 'Step 1',
      tagline: 'Take or pick photo',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Outer camera ring */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 border-2 border-emerald-300 shadow-inner flex items-center justify-center"
          />
          {/* Visual camera device */}
          <div className="relative z-10 w-36 h-36 rounded-2xl bg-white shadow-lg border border-emerald-100 flex flex-col items-center justify-center p-3">
            <div className="w-8 h-1.5 bg-neutral-200 rounded-full mb-2" />
            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-10 h-10 stroke-[2.2]" />
              {/* Camera flash dot */}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-sm"
              />
            </div>
            <span className="mt-2 text-xs font-semibold text-emerald-700 tracking-wider">CAMERA</span>
          </div>
          {/* Visual floating badge */}
          <div className="absolute -bottom-2 -right-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Photo
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Locate',
      badge: 'Step 2',
      tagline: 'Live GPS Pin',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Radar wave */}
          <motion.div
            animate={{ scale: [0.8, 1.35], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-36 h-36 rounded-full border-2 border-blue-400 bg-blue-100/40"
          />
          <motion.div
            animate={{ scale: [0.6, 1.1], opacity: [0.9, 0] }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full border-2 border-indigo-400 bg-indigo-100/30"
          />
          {/* Map Grid container */}
          <div className="relative z-10 w-36 h-36 rounded-2xl bg-white shadow-lg border border-blue-100 flex flex-col items-center justify-center p-2 overflow-hidden">
            {/* Map lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
              <div className="border-r border-b border-neutral-400" />
              <div className="border-r border-b border-neutral-400" />
              <div className="border-b border-neutral-400" />
              <div className="border-r border-b border-neutral-400" />
              <div className="border-r border-b border-neutral-400 bg-blue-100/60" />
              <div className="border-b border-neutral-400" />
            </div>
            {/* Pin */}
            <motion.div
              animate={{ y: [-4, 2, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg relative z-20"
            >
              <MapPin className="w-8 h-8 fill-white/20 stroke-[2.2]" />
            </motion.div>
            <span className="mt-2 text-xs font-semibold text-blue-700 tracking-wider">LIVE GPS</span>
          </div>
          <div className="absolute -bottom-2 -right-1 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            📍 Auto Detect
          </div>
        </div>
      ),
    },
    {
      step: 3,
      title: 'Send',
      badge: 'Step 3',
      tagline: 'Anonymous & Free',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Target circle */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-100 to-orange-50 border-2 border-amber-300 shadow-inner" />
          <div className="relative z-10 w-36 h-36 rounded-2xl bg-white shadow-lg border border-amber-100 flex flex-col items-center justify-center p-3">
            <motion.div
              animate={{ rotate: [0, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md"
            >
              <Send className="w-8 h-8 ml-0.5 stroke-[2.2]" />
            </motion.div>
            <span className="mt-2 text-xs font-semibold text-orange-700 tracking-wider">SUBMIT</span>
          </div>
          <div className="absolute -bottom-2 -right-1 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            <Check className="w-3 h-3" /> Anonymous
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  return (
    <div id="onboarding-overlay" className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col"
      >
        {/* Top bar with step counter & skip */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-neutral-100">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Guide {currentStep + 1} / {steps.length}
          </span>
          <button
            id="onboarding-skip-btn"
            onClick={onComplete}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded-md transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Carousel Slide Area */}
        <div className="p-6 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col items-center"
            >
              {/* Visual illustration */}
              <div className="mb-4">{current.visual}</div>

              {/* Title & Tagline - few simple words */}
              <span className={`inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-1 ${current.bgColor} ${current.textColor} border ${current.borderColor}`}>
                {current.badge}
              </span>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">{current.title}</h2>
              <p className="text-sm font-medium text-neutral-500 mt-1 max-w-[220px]">
                {current.tagline}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Indicators */}
          <div className="flex items-center gap-2 mt-5 mb-2">
            {steps.map((s, idx) => (
              <button
                key={s.step}
                id={`onboarding-dot-${idx}`}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-7 bg-emerald-600' : 'w-2 bg-neutral-200 hover:bg-neutral-300'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              id="onboarding-prev-btn"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="p-3 rounded-2xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center shadow-sm"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              id="onboarding-next-btn"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex-1 py-3 px-5 rounded-2xl bg-neutral-900 hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="onboarding-start-btn"
              onClick={onComplete}
              className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Start</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
