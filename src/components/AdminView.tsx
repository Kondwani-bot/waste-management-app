import React, { useState, useMemo } from 'react';
import { WasteReport } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ZAMBIA_PROVINCES } from '../data/mockData';
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
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      if (activeFilter === 'pending' && r.status !== 'pending') return false;
      if (activeFilter === 'completed' && r.status !== 'completed') return false;

      // Province filter
      if (selectedProvince !== 'all') {
        const prov = (r.province || '').toLowerCase();
        if (!prov.includes(selectedProvince.toLowerCase())) return false;
      }

      // Location filter/search
      if (searchLocation.trim()) {
        const query = searchLocation.trim().toLowerCase();
        const loc = (r.locationName || '').toLowerCase();
        const prov = (r.province || '').toLowerCase();
        if (!loc.includes(query) && !prov.includes(query)) return false;
      }

      return true;
    });
  }, [reports, activeFilter, selectedProvince, searchLocation]);

  const isFiltered = activeFilter !== 'all' || selectedProvince !== 'all' || searchLocation.trim() !== '';

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSelectedProvince('all');
    setSearchLocation('');
  };

  const handleConfirmComplete = () => {
    if (selectedReportId) {
      onCompleteTask(selectedReportId);
      setSelectedReportId(null);
    }
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="admin-container" className="min-h-screen bg-neutral-100 text-neutral-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="admin-back-btn"
              onClick={onNavigateToUser}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Return to user report screen"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public App</span>
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>Waste Management Admin</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white uppercase tracking-wider">
                  Staff
                </span>
              </h1>
              <p className="text-xs text-neutral-500">Overview of submitted waste tasks</p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} Pending
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3 stroke-[3]" />
              {completedCount} Done
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Filters Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl">
              <button
                id="admin-filter-all"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                id="admin-filter-pending"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                id="admin-filter-completed"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Results count & reset */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">
                Showing <strong className="text-neutral-900">{filteredReports.length}</strong> of {reports.length}
              </span>
              {isFiltered && (
                <button
                  id="admin-clear-filters-btn"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Location & Province Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
            {/* Province Filter Dropdown */}
            <div>
              <label
                htmlFor="admin-province-filter"
                className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1"
              >
                <Building className="w-3 h-3" />
                <span>Filter by Province</span>
              </label>
              <div className="relative">
                <select
                  id="admin-province-filter"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className={`w-full py-2 px-3 pr-8 rounded-xl border text-xs font-bold transition-all appearance-none cursor-pointer outline-none ${
                    selectedProvince !== 'all'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 ring-2 ring-emerald-100'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <option value="all">All Provinces ({reports.length})</option>
                  {availableProvinces.map((prov) => {
                    const count = provinceCounts[prov] || 0;
                    return (
                      <option key={prov} value={prov}>
                        {prov} Province {count > 0 ? `(${count})` : '(0)'}
                      </option>
                    );
                  })}
                </select>
                {selectedProvince !== 'all' ? (
                  <button
                    onClick={() => setSelectedProvince('all')}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                    title="Clear province filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Filter className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Location Search / Filter */}
            <div>
              <label
                htmlFor="admin-location-search"
                className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Filter by Location / Street</span>
              </label>
              <div className="relative">
                <input
                  id="admin-location-search"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g. Cairo Road, Chawama, Market..."
                  className={`w-full py-2 pl-8 pr-8 rounded-xl border text-xs font-medium transition-all outline-none ${
                    searchLocation.trim()
                      ? 'bg-blue-50/60 border-blue-300 text-blue-900 ring-2 ring-blue-100'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 hover:bg-neutral-100'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3 pointer-events-none" />
                {searchLocation && (
                  <button
                    id="admin-clear-location-btn"
                    onClick={() => setSearchLocation('')}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No tasks match your filters</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Try adjusting your province or location search, or click below to view all tasks.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                id={`admin-task-card-${report.id}`}
                className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden flex flex-col justify-between ${
                  report.status === 'completed'
                    ? 'border-neutral-200 opacity-80'
                    : 'border-neutral-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Photo area */}
                  <div className="relative w-full h-52 bg-neutral-900 group overflow-hidden">
                    <img
                      src={report.photoUrl}
                      alt="Reported waste site"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                      onClick={() => setPreviewImage(report.photoUrl)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      {report.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Task
                        </span>
                      )}
                    </div>

                    {/* Enlarge click hint */}
                    <button
                      onClick={() => setPreviewImage(report.photoUrl)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors backdrop-blur-xs"
                      title="Enlarge photo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Province badge on photo */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide">
                        <Building className="w-3.5 h-3.5" /> {report.province} Province
                      </span>
                    </div>
                  </div>

                  {/* Details section */}
                  <div className="p-4 space-y-3">
                    {/* Location */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Location
                        </span>
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {report.locationName || 'Unknown Location'}
                        </p>
                        {report.latitude && report.longitude && (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time photo was taken */}
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
                  </div>
                </div>

                {/* Footer Action: Complete Task */}
                <div className="p-4 pt-2 border-t border-neutral-100 bg-neutral-50/50">
                  {report.status === 'completed' ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cleaned & Completed</span>
                    </div>
                  ) : (
                    <button
                      id={`complete-task-btn-${report.id}`}
                      onClick={() => setSelectedReportId(report.id)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Complete Task</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedReportId)}
        title="Complete Waste Task?"
        message="Is this task truly finished? Please confirm that the waste at this location has been cleared."
        confirmLabel="Yes, Finished"
        cancelLabel="Not Yet"
        onConfirm={handleConfirmComplete}
        onCancel={() => setSelectedReportId(null)}
      />

      {/* Lightbox for photo inspection */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl max-h-[90vh] relative">
            <img
              src={previewImage}
              alt="Enlarged waste site"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/20 text-white font-bold text-xs hover:bg-white/40 transition-colors backdrop-blur-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
