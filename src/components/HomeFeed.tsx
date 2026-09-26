import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WasteReport } from '../types';
import { ZAMBIA_PROVINCES } from '../data/mockData';
import { calculateReportPriority } from '../utils/priority';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Plus,
  Camera,
  Video,
  Eye,
  Search,
  Filter,
  Sparkles,
  Building,
  Flame,
  Zap,
  Play,
  X,
  Share2,
} from 'lucide-react';

interface HomeFeedProps {
  reports: WasteReport[];
  onNavigateToReport: () => void;
  onToggleLike: (reportId: string) => void;
  onOpenHelp: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  reports,
  onNavigateToReport,
  onToggleLike,
  onOpenHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cleaned' | 'pending'>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);

  // Compute key community metrics
  const cleanedReports = reports.filter((r) => r.status === 'completed').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      if (activeTab === 'cleaned' && r.status !== 'completed') return false;
      if (activeTab === 'pending' && r.status !== 'pending') return false;

      // Province filter
      if (selectedProvince !== 'all') {
        const prov = (r.province || '').toLowerCase();
        if (!prov.includes(selectedProvince.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const loc = (r.locationName || '').toLowerCase();
        const prov = (r.province || '').toLowerCase();
        if (!loc.includes(q) && !prov.includes(q)) return false;
      }

      return true;
    });
  }, [reports, activeTab, selectedProvince, searchQuery]);

  const formatTimeAgo = (timestamp: number) => {
    const diffMin = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top App Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">
              Waste Watch
            </h1>
            <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
              Community Waste & Clean-Up Tracker
            </p>
          </div>
        </div>

        {/* Action button to report waste */}
        <button
          id="home-snap-report-top-btn"
          onClick={onNavigateToReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all active:scale-[0.97] cursor-pointer"
        >
          <Camera className="w-4 h-4 stroke-[2.2]" />
          <span>Report Waste</span>
        </button>
      </header>

      {/* Community Impact Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 shadow-xl overflow-hidden">
        {/* Ambient decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-emerald-500/20 pointer-events-none blur-lg" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 block mb-1">
                Zambia Clean Communities
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                Public Waste Reports & Cleared Sites
              </h2>
              <p className="text-xs text-emerald-100/85 mt-1 max-w-md leading-relaxed">
                Track real-time waste hotspots logged by citizens and celebrate spots cleared by municipal councils.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 block leading-none">{cleanedReports}</span>
              <span className="text-[11px] text-emerald-200 font-bold block mt-1">Cleaned Sites</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-none">{pendingReports}</span>
              <span className="text-[11px] text-emerald-200 font-bold block mt-1">Awaiting Clean-Up</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Callout: Snap, Locate, Send in 3 steps */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-black text-neutral-900">
            Spotted trash or illegal dumps in your area?
          </p>
          <p className="text-[11px] text-neutral-500">
            Takes 10 seconds: Snap photo, auto-locate, send.
          </p>
        </div>
        <button
          onClick={onNavigateToReport}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Snap Waste</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex bg-neutral-200/70 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('cleaned')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'cleaned'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cleaned Places ({cleanedReports})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Awaiting Cleanup ({pendingReports})
          </button>
        </div>

        {/* Province & Search Inputs */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Province Filter Dropdown */}
          <div className="sm:w-48 shrink-0">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">All Provinces (Zambia)</option>
              {ZAMBIA_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov} Province
                </option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by street, market, or area..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800">No reports found</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              No reported places match your filter. Be the first to report waste in this area!
            </p>
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Report Waste Now
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const priorityInfo = calculateReportPriority(report, reports);
            const isCompleted = report.status === 'completed';
            const isVideo = report.mediaType === 'video';
            const mediaUrl = report.mediaUrl || report.photoUrl;

            return (
              <article
                key={report.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-shadow ${
                  isCompleted ? 'border-emerald-200' : 'border-neutral-200/90'
                }`}
              >
                {/* Media banner */}
                <div className="relative aspect-16/10 sm:aspect-16/9 bg-neutral-900 w-full overflow-hidden">
                  {isVideo ? (
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={report.locationName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {/* Status badge */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cleaned by Council</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Clean-Up</span>
                      </span>
                    )}

                    {/* Priority Tier Indicator (if High or Medium) */}
                    {!isCompleted && priorityInfo.tier === 'high' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-md">
                        <Flame className="w-3 h-3 fill-rose-200" />
                        <span>High Priority Spot</span>
                      </span>
                    )}
                    {!isCompleted && priorityInfo.tier === 'medium' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-600 text-white shadow-md">
                        <Zap className="w-3 h-3" />
                        <span>Repeated Report</span>
                      </span>
                    )}

                    {/* Media preview button */}
                    <button
                      onClick={() => setPreviewMedia({ url: mediaUrl, type: isVideo ? 'video' : 'photo' })}
                      className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors backdrop-blur-xs cursor-pointer ml-auto"
                      title="Enlarge media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Province pill on image */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                      <Building className="w-3 h-3 text-neutral-300" />
                      <span>{report.province} Province</span>
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Reported Location</span>
                      </div>
                      <h3 className="text-base font-black text-neutral-900 leading-snug">
                        {report.locationName}
                      </h3>
                    </div>

                    {/* Heart Reaction Button */}
                    <button
                      onClick={() => onToggleLike(report.id)}
                      whileTap={{ scale: 0.85 }}
                      as={motion.button}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                        report.isLikedByUser
                          ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-rose-50/50 hover:text-rose-500'
                      }`}
                      title="React with a Heart to support"
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          report.isLikedByUser ? 'fill-rose-500 text-rose-500 scale-110' : 'text-neutral-400'
                        }`}
                      />
                      <span>{report.likesCount || 0}</span>
                    </button>
                  </div>

                  {/* Time and clean-up status */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        {isCompleted
                          ? `Cleaned ${report.completedAt ? formatTimeAgo(report.completedAt) : 'recently'}`
                          : `Reported ${formatTimeAgo(report.timestamp)}`}
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Cleared & Sanitized ✨
                      </span>
                    )}

                    {!isCompleted && priorityInfo.clusterCount > 1 && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {priorityInfo.clusterCount} citizens reported
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Media Enlarged Modal */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full max-h-[85vh] bg-black rounded-3xl overflow-hidden flex items-center justify-center"
            >
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt="Enlarged waste capture"
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
