import React, { useState, useMemo } from 'react';
import { WasteReport, PriorityTier } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ZAMBIA_PROVINCES } from '../data/mockData';
import { calculateReportPriority } from '../utils/priority';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Filter,
  Eye,
  Check,
  Building,
  Search,
  X,
  RotateCcw,
  Video,
  Camera,
  Play,
  User,
  Shield,
  PhoneCall,
  Flame,
  Zap,
  Navigation,
  Copy,
  Crosshair,
} from 'lucide-react';

interface AdminViewProps {
  reports: WasteReport[];
  onCompleteTask: (id: string) => void;
  onNavigateToUser: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  reports,
  onCompleteTask,
  onNavigateToUser,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'standard'>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const completedCount = reports.filter((r) => r.status === 'completed').length;

  // Compute available provinces with report counts
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const p = r.province || 'Lusaka';
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [reports]);

  // Unique list of provinces present in reports or standard provinces
  const availableProvinces = useMemo(() => {
    const set = new Set<string>(['Lusaka', ...Object.keys(provinceCounts)]);
    ZAMBIA_PROVINCES.forEach((p) => set.add(p));
    return Array.from(set);
  }, [provinceCounts]);

  // Memoized priorities for all reports
  const reportPriorities = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateReportPriority>>();
    reports.forEach((r) => {
      map.set(r.id, calculateReportPriority(r, reports));
    });
    return map;
  }, [reports]);

  // Count high and medium priority reports
  const highPriorityCount = useMemo(() => {
    return reports.filter((r) => r.status === 'pending' && reportPriorities.get(r.id)?.tier === 'high').length;
  }, [reports, reportPriorities]);

  const filteredReports = useMemo(() => {
    const result = reports.filter((r) => {
      // Status filter
      if (activeFilter === 'pending' && r.status !== 'pending') return false;
      if (activeFilter === 'completed' && r.status !== 'completed') return false;

      // Priority filter
      const pInfo = reportPriorities.get(r.id);
      if (priorityFilter !== 'all' && pInfo?.tier !== priorityFilter) return false;

      // Province filter
      if (selectedProvince !== 'all') {
        const prov = (r.province || '').toLowerCase();
        if (!prov.includes(selectedProvince.toLowerCase())) return false;
      }

      // Location & Reporter search
      if (searchLocation.trim()) {
        const query = searchLocation.trim().toLowerCase();
        const loc = (r.locationName || '').toLowerCase();
        const prov = (r.province || '').toLowerCase();
        const name = (r.reporterName || '').toLowerCase();
        const phone = (r.reporterPhone || '').toLowerCase();
        if (!loc.includes(query) && !prov.includes(query) && !name.includes(query) && !phone.includes(query)) return false;
      }

      return true;
    });

    // Sort result
    return result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<PriorityTier, number> = { high: 3, medium: 2, standard: 1 };
        const aTier = reportPriorities.get(a.id)?.tier || 'standard';
        const bTier = reportPriorities.get(b.id)?.tier || 'standard';
        if (pOrder[bTier] !== pOrder[aTier]) {
          return pOrder[bTier] - pOrder[aTier];
        }
        return b.timestamp - a.timestamp;
      }
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });
  }, [reports, activeFilter, priorityFilter, selectedProvince, searchLocation, sortBy, reportPriorities]);

  const isFiltered =
    activeFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedProvince !== 'all' ||
    searchLocation.trim() !== '';

  const handleResetFilters = () => {
    setActiveFilter('all');
    setPriorityFilter('all');
    setSelectedProvince('all');
    setSearchLocation('');
    setSortBy('priority');
  };

  const handleConfirmComplete = () => {
    if (selectedReportId) {
      onCompleteTask(selectedReportId);
      setSelectedReportId(null);
    }
  };

  const handleCopyGps = (id: string, lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} at ${d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div id="admin-view-root" className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            id="admin-back-to-reporter-btn"
            onClick={onNavigateToUser}
            className="p-2.5 rounded-2xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Return to Public View"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Feed</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                Waste Watch Admin Portal
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-neutral-900 text-white">
                Council Staff
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Triage community reports, monitor high-priority hotspots & mark cleared tasks
            </p>
          </div>
        </div>

        {/* Priority Hotspot Alert & Summary Counts */}
        <div className="flex items-center gap-2">
          {highPriorityCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black animate-pulse">
              <Flame className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span>{highPriorityCount} High-Priority Hotspots!</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold">
              {pendingCount} Pending
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold">
              {completedCount} Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with Priority Controls */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Status Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'pending'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Priority Tier Filter */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                priorityFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                priorityFilter === 'high'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-100/50'
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>High (3+ reports)</span>
            </button>
            <button
              onClick={() => setPriorityFilter('medium')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                priorityFilter === 'medium'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Medium (2)</span>
            </button>
          </div>

          {/* Province Filter */}
          <div className="shrink-0 sm:w-44">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">All Provinces</option>
              {availableProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov} ({provinceCounts[prov] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search location, citizen, phone..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {searchLocation && (
              <button
                onClick={() => setSearchLocation('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort and active filter indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-800"
            >
              <option value="priority">Priority: Highest First</option>
              <option value="newest">Time: Newest First</option>
              <option value="oldest">Time: Oldest First</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No reports matched your filters</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your priority tier, province, or search query to see other tasks.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => {
            const isCompleted = report.status === 'completed';
            const isVid = report.mediaType === 'video';
            const mediaUrl = report.mediaUrl || report.photoUrl;
            const priorityInfo = reportPriorities.get(report.id) || {
              tier: 'standard',
              clusterCount: 1,
              reason: 'Standard Priority',
            };
            const isHighPriority = priorityInfo.tier === 'high';
            const isMediumPriority = priorityInfo.tier === 'medium';

            const lat = report.geoMetadata?.latitude ?? report.latitude ?? -15.4208;
            const lng = report.geoMetadata?.longitude ?? report.longitude ?? 28.2833;
            const accuracy = report.geoMetadata?.accuracy;
            const capturedAt = report.geoMetadata?.capturedAt ?? report.timestamp;

            return (
              <div
                key={report.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isHighPriority && !isCompleted
                    ? 'border-rose-400 ring-2 ring-rose-200'
                    : isMediumPriority && !isCompleted
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : isCompleted
                    ? 'border-emerald-200 opacity-90'
                    : 'border-neutral-200'
                }`}
              >
                <div>
                  {/* Priority Tier Alert Banner */}
                  <div
                    className={`px-4 py-2 text-xs font-black flex items-center justify-between ${
                      isHighPriority && !isCompleted
                        ? 'bg-rose-600 text-white'
                        : isMediumPriority && !isCompleted
                        ? 'bg-amber-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isHighPriority && !isCompleted && <Flame className="w-4 h-4 fill-white" />}
                      {isMediumPriority && !isCompleted && <Zap className="w-4 h-4 fill-white" />}
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      <span>
                        {isCompleted
                          ? 'CLEARED BY MUNICIPAL TEAM'
                          : isHighPriority
                          ? `HIGH PRIORITY HOTSPOT • ${priorityInfo.clusterCount} CITIZEN REPORTS`
                          : isMediumPriority
                          ? `MEDIUM PRIORITY • ${priorityInfo.clusterCount} REPORTS AT THIS SITE`
                          : 'STANDARD PRIORITY • SINGLE REPORT'}
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                      ID: {report.id.slice(-6)}
                    </span>
                  </div>

                  {/* Media visual container */}
                  <div className="relative aspect-16/10 bg-neutral-950 w-full overflow-hidden">
                    {isVid ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        playsInline
                        muted
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Report visual"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Media Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-md">
                        {isVid ? (
                          <>
                            <Video className="w-3 h-3 text-rose-400" /> Video
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3 text-emerald-400" /> Photo
                          </>
                        )}
                      </span>
                    </div>

                    {/* Enlarge / Fullscreen click hint */}
                    <button
                      onClick={() => setPreviewMedia({ url: mediaUrl, type: isVid ? 'video' : 'photo' })}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors backdrop-blur-xs cursor-pointer"
                      title={isVid ? 'Watch full video' : 'Enlarge photo'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Province badge on media */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide">
                        <Building className="w-3.5 h-3.5" /> {report.province} Province
                      </span>
                    </div>
                  </div>

                  {/* Details section */}
                  <div className="p-4 space-y-3.5">
                    {/* Location Name */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Reported Area / Street
                        </span>
                        <p className="text-sm font-bold text-neutral-900 leading-snug">
                          {report.locationName || 'Unknown Location'}
                        </p>
                      </div>
                    </div>

                    {/* PRECISE GEO-LOCATION METADATA SECTION */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                          Precise GPS Metadata
                        </span>
                        {accuracy ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            ±{accuracy}m precision
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-600">Standard Lock</span>
                        )}
                      </div>

                      {/* Coordinates display */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs text-neutral-800 space-y-0.5 min-w-0">
                          <div className="truncate">
                            <span className="text-neutral-400 mr-1.5">LAT:</span>
                            <strong>{lat.toFixed(6)}°</strong>
                          </div>
                          <div className="truncate">
                            <span className="text-neutral-400 mr-1.5">LNG:</span>
                            <strong>{lng.toFixed(6)}°</strong>
                          </div>
                        </div>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyGps(report.id, lat, lng)}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors text-[11px] font-bold flex items-center gap-1 shrink-0"
                          title="Copy GPS coordinates"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === report.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* GPS actions & capture info */}
                      <div className="flex items-center justify-between text-[11px] text-blue-800/80 pt-0.5">
                        <span className="truncate">
                          GPS Captured: {new Date(capturedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 shrink-0 underline decoration-blue-300"
                        >
                          <span>Open Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Time Reported */}
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600 bg-neutral-50 px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Reported At
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {formatTimestamp(report.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Reporter Contact Info */}
                    <div className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {report.reporterName || report.reporterPhone ? (
                          <>
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block leading-tight">
                                WhatsApp Feedback Requested
                              </span>
                              <p className="font-bold text-neutral-800 truncate text-xs">
                                {report.reporterName || 'Citizen'}
                              </p>
                              {report.reporterPhone && (
                                <p className="text-[11px] font-mono text-neutral-500">
                                  {report.reporterPhone}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-tight">
                                Reporter Identity
                              </span>
                              <span className="font-bold text-neutral-700 text-xs">100% Anonymous (No Feedback)</span>
                            </div>
                          </>
                        )}
                      </div>

                      {report.reporterPhone && (
                        <a
                          href={`https://wa.me/${report.reporterPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(report.reporterName || 'Citizen')},%20this%20is%20the%20Local%20Council%20Waste%20Management%20team%20regarding%20your%20report%20at%20${encodeURIComponent(report.locationName)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold"
                          title="Send WhatsApp update to citizen"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action: Complete Task button */}
                <div className="p-4 pt-2 border-t border-neutral-100 bg-neutral-50/50">
                  {isCompleted ? (
                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-emerald-100/70 text-emerald-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Task Completed & Site Cleared</span>
                      </span>
                      {report.completedAt && (
                        <span className="text-[10px] font-normal text-emerald-700">
                          {formatTimestamp(report.completedAt)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedReportId(report.id)}
                      className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Complete Task</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedReportId)}
        title="Complete Waste Clean-up Task?"
        message="Are you sure this waste site has been fully cleared, sanitized, and inspected by the municipal team? This marks the report as completed on the public feed."
        confirmText="Yes, Mark Cleared"
        cancelText="Not Yet"
        onConfirm={handleConfirmComplete}
        onCancel={() => setSelectedReportId(null)}
      />

      {/* Enlarged Media Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full max-h-[85vh] bg-black rounded-3xl overflow-hidden flex items-center justify-center">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 cursor-pointer"
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
          </div>
        </div>
      )}
    </div>
  );
};
