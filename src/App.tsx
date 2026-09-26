import React, { useState, useEffect } from 'react';
import { OnboardingCarousel } from './components/OnboardingCarousel';
import { HomeFeed } from './components/HomeFeed';
import { ReportFlow } from './components/ReportFlow';
import { ThankYouModal } from './components/ThankYouModal';
import { AdminView } from './components/AdminView';
import { CouncilHelpModal } from './components/CouncilHelpModal';
import { WasteReport, AppView } from './types';
import {
  getStoredReports,
  completeReportTask,
  toggleReportLike,
  hasSeenOnboarding,
  markOnboardingSeen,
} from './utils/storage';
import { Lock, Home, Camera, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [reportKey, setReportKey] = useState<number>(1);

  // Initialize reports and URL routing
  useEffect(() => {
    // Check initial route
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.endsWith('/admin') || hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#report') {
        setCurrentView('reporter');
      } else {
        setCurrentView('home');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    // Load initial reports from web storage
    setReports(getStoredReports());

    // Listen for custom report update events
    const handleReportsUpdate = () => {
      setReports(getStoredReports());
    };
    window.addEventListener('swms-reports-updated', handleReportsUpdate);

    // Check if onboarding has been seen
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true);
    }

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('swms-reports-updated', handleReportsUpdate);
    };
  }, []);

  const handleCompleteOnboarding = () => {
    markOnboardingSeen();
    setShowOnboarding(false);
  };

  const handleReportSubmitted = () => {
    setReports(getStoredReports());
    setShowThankYou(true);
  };

  const handleCompleteTask = (id: string) => {
    const updated = completeReportTask(id);
    setReports(updated);
  };

  const handleToggleLike = (reportId: string) => {
    const updated = toggleReportLike(reportId);
    setReports(updated);
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (view === 'reporter') {
      window.history.pushState(null, '', '#report');
    } else {
      window.history.pushState(null, '', window.location.pathname.replace(/\/admin$/, '') || '/');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Onboarding Carousel Modal */}
      {showOnboarding && (
        <OnboardingCarousel onComplete={handleCompleteOnboarding} />
      )}

      {/* Thank You Animation Modal */}
      {showThankYou && (
        <ThankYouModal
          onClose={() => {
            setShowThankYou(false);
            navigateTo('home');
          }}
          onResetForm={() => {
            setReportKey((prev) => prev + 1);
            setShowThankYou(false);
            navigateTo('home');
          }}
        />
      )}

      {/* Main View Switcher */}
      {currentView === 'admin' ? (
        <AdminView
          reports={reports}
          onCompleteTask={handleCompleteTask}
          onNavigateToUser={() => navigateTo('home')}
        />
      ) : (
        <div className="flex-1 flex flex-col justify-between p-4 pt-4 sm:pt-6">
          {/* Navigation Pill Bar (Home vs Report) */}
          <div className="w-full max-w-sm mx-auto mb-4 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-1">
            <button
              id="nav-home-feed-btn"
              onClick={() => navigateTo('home')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'home'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Feed</span>
            </button>

            <button
              id="nav-report-waste-btn"
              onClick={() => navigateTo('reporter')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'reporter'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Waste</span>
            </button>
          </div>

          <main className="w-full flex-1">
            {currentView === 'home' ? (
              <HomeFeed
                reports={reports}
                onNavigateToReport={() => navigateTo('reporter')}
                onToggleLike={handleToggleLike}
                onOpenHelp={() => setShowOnboarding(true)}
              />
            ) : (
              <ReportFlow
                key={reportKey}
                onReportSubmitted={handleReportSubmitted}
                onOpenHelp={() => setShowOnboarding(true)}
                onBackToHome={() => navigateTo('home')}
              />
            )}
          </main>

          {/* Floating chatbot-style Council Help Ball */}
          <CouncilHelpModal />

          {/* Footer with Transparent Admin Button as requested */}
          <footer className="w-full max-w-md mx-auto py-4 flex flex-col items-center justify-center gap-2">
            <p className="text-[11px] text-neutral-400 font-medium text-center">
              Waste Watch • Community Cleanliness
            </p>

            {/* Transparent Admin button */}
            <button
              id="admin-transparent-entry-btn"
              onClick={() => navigateTo('admin')}
              className="opacity-25 hover:opacity-90 active:opacity-100 transition-opacity text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 bg-neutral-200/60 hover:bg-neutral-200 px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
              title="Temporary transparent button to access admin dashboard (will be accessible at /admin)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin Access</span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
