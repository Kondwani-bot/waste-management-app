import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Upload,
  Video,
  MapPin,
  Send,
  Sparkles,
  Check,
  RotateCcw,
  Navigation,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { ZAMBIA_PROVINCES } from '../data/mockData';
import { saveNewReport } from '../utils/storage';
import { CameraCaptureModal } from './CameraCaptureModal';
import { OptionalContactModal } from './OptionalContactModal';

interface ReportFlowProps {
  onReportSubmitted: () => void;
  onOpenHelp: () => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({
  onReportSubmitted,
  onOpenHelp,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [locationName, setLocationName] = useState<string>('');
  const [province, setProvince] = useState<string>('Lusaka');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleMediaCaptured = (mediaUrl: string, type: 'photo' | 'video') => {
    setPhotoUrl(mediaUrl);
    setMediaType(type);
    setIsCameraModalOpen(false);
  };

  const handleTakePhotoClick = () => {
    // If navigator.mediaDevices.getUserMedia exists, open the interactive live camera & recorder modal
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      // Fallback to native capture input
      cameraInputRef.current?.click();
    }
  };

  // Handle image/video upload from file or native camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const detectedType = isVideo ? 'video' : 'photo';
      setMediaType(detectedType);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Live Location fetcher (Google/Browser live location tool)
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS not supported by browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Getting live GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Reverse geocoding via OpenStreetMap nominatim for real human-readable address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const city = data.address?.city || data.address?.town || data.address?.village || 'Lusaka';
            const state = data.address?.state || '';

            const generatedName = road ? `${road}, ${city}` : (data.display_name?.split(',').slice(0, 2).join(',') || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            setLocationName(generatedName);

            // Auto-detect Zambian province if matched
            const matchedProvince = ZAMBIA_PROVINCES.find((p) =>
              (state && state.toLowerCase().includes(p.toLowerCase())) ||
              (city && city.toLowerCase().includes(p.toLowerCase()))
            );
            if (matchedProvince) {
              setProvince(matchedProvince);
            }
            setLocationStatus('Live location locked!');
          } else {
            setLocationName(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setLocationStatus('Live coordinates locked');
          }
        } catch {
          setLocationName(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setLocationStatus('Live coordinates locked');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        // Fallback demo location for presentations
        setLatitude(-15.4208);
        setLongitude(28.2833);
        setLocationName('Lusaka Central (Auto Demo)');
        setProvince('Lusaka');
        setLocationStatus('Using demo GPS coordinates');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = () => {
    if (!photoUrl) return;
    // Open prompt asking if citizen wants to provide optional contact details
    setIsContactModalOpen(true);
  };

  const handleFinalizeReport = (name?: string, phone?: string) => {
    setIsContactModalOpen(false);
    setIsSubmitting(true);

    const finalLocation = locationName.trim() || (latitude ? `GPS: ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Lusaka, Zambia');

    saveNewReport({
      photoUrl,
      mediaUrl: photoUrl,
      mediaType,
      locationName: finalLocation,
      province,
      latitude: latitude ?? -15.4208,
      longitude: longitude ?? 28.2833,
      reporterName: name,
      reporterPhone: phone,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onReportSubmitted();
    }, 400);
  };

  const handleReset = () => {
    setPhotoUrl(null);
    setMediaType('photo');
    setLocationName('');
    setLatitude(null);
    setLongitude(null);
    setLocationStatus('');
  };

  const isFormReady = Boolean(photoUrl && (locationName.trim() || latitude));

  return (
    <div id="report-flow-container" className="w-full max-w-md mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-neutral-900 tracking-tight leading-tight">
              Report Waste
            </h1>
            <p className="text-[11px] font-medium text-neutral-400">
              3 Steps • Anonymous
            </p>
          </div>
        </div>

        <button
          id="open-guide-btn"
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="View 3-Step Picture Guide"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Guide</span>
        </button>
      </div>

      {/* Visual 3-Step Stepper Header */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center ${
            photoUrl
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-neutral-200 text-neutral-700 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">1. Media</span>
            {photoUrl && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">Photo/Video</span>
        </div>

        <div
          className={`p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center ${
            latitude || locationName
              ? 'bg-blue-50 border-blue-300 text-blue-800'
              : 'bg-white border-neutral-200 text-neutral-700 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">2. Locate</span>
            {(latitude || locationName) && <Check className="w-3 h-3 text-blue-600 stroke-[3]" />}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">Live GPS</span>
        </div>

        <div
          className={`p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center ${
            isFormReady
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-white border-neutral-200 text-neutral-400 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">3. Send</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">Submit</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* STEP 1: SNAP OR RECORD (Camera or Upload) */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                1
              </span>
              <span className="text-sm font-bold text-neutral-900">Snap or Record Waste</span>
            </div>
            {photoUrl && (
              <button
                onClick={() => setPhotoUrl(null)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Change
              </button>
            )}
          </div>

          {photoUrl ? (
            /* Selected Media Preview (Photo or Video) */
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-inner bg-neutral-950 h-60 group flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={photoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={photoUrl}
                  alt="Selected waste"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {mediaType === 'video' ? (
                  <span className="bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                    <Video className="w-3.5 h-3.5" /> Video Ready
                  </span>
                ) : (
                  <span className="bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Photo Ready
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Snap Controls */
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Real Camera Button (Live webcam & video recorder on laptops, native capture on mobile) */}
                <button
                  id="snap-camera-btn"
                  onClick={handleTakePhotoClick}
                  className="py-5 px-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-extrabold tracking-tight block">Take Photo / Video</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Live Camera</span>
                  </div>
                </button>

                {/* File Upload Button (images & videos supported) */}
                <button
                  id="snap-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-5 px-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100/70 text-neutral-700 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-white flex items-center justify-center shadow-md">
                    <Upload className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-extrabold tracking-tight block">Upload File</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">Photo or Video</span>
                  </div>
                </button>
              </div>

              {/* Hidden native inputs supporting both images and videos */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* STEP 2: LOCATE (Live Google Location Tool style) */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
              2
            </span>
            <span className="text-sm font-bold text-neutral-900">Live Location Tool</span>
          </div>

          {/* Big Live GPS button like Google Location tool on forms */}
          <button
            id="get-live-location-btn"
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm ${
              isLocating
                ? 'bg-blue-100 text-blue-700 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
            }`}
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locating live position...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 stroke-[2.5]" />
                <span>Get My Live Location</span>
              </>
            )}
          </button>

          {locationStatus && (
            <p className="text-[11px] font-medium text-blue-700 text-center mt-2 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              {locationStatus}
            </p>
          )}

          {/* Location input & Province selector */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Street / Area Name
              </label>
              <div className="relative">
                <input
                  id="location-input"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Cairo Road or tap live location above"
                  className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium text-neutral-800 transition-all bg-neutral-50/50"
                />
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Province selection (Zambia Context from research) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Province
              </label>
              <select
                id="province-select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-semibold text-neutral-800 transition-all bg-neutral-50/50"
              >
                {ZAMBIA_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov} Province
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates display if available */}
            {latitude && longitude && (
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="font-mono">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> GPS Attached
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: SEND */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">
              3
            </span>
            <span className="text-sm font-bold text-neutral-900">Submit Report</span>
          </div>

          <button
            id="submit-report-btn"
            onClick={handleSubmit}
            disabled={!isFormReady || isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
              isFormReady && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.98] cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 stroke-[2.2]" />
                <span>Submit Task</span>
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-neutral-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Anonymous • No Sign-in</span>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal for laptops & mobile devices */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onMediaCaptured={handleMediaCaptured}
        onFallbackToFilePicker={() => cameraInputRef.current?.click()}
      />

      {/* Post-Submit Optional Contact Details Question Modal */}
      <OptionalContactModal
        isOpen={isContactModalOpen}
        onSaveContact={(name, phone) => handleFinalizeReport(name, phone)}
        onSkipAnonymous={() => handleFinalizeReport(undefined, undefined)}
      />
    </div>
  );
};
