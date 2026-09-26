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
  ArrowLeft,
  Crosshair,
} from 'lucide-react';
import { ZAMBIA_PROVINCES } from '../data/mockData';
import { saveNewReport } from '../utils/storage';
import { GeoMetadata } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { OptionalContactModal } from './OptionalContactModal';

interface ReportFlowProps {
  onReportSubmitted: () => void;
  onOpenHelp: () => void;
  onBackToHome?: () => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({
  onReportSubmitted,
  onOpenHelp,
  onBackToHome,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [locationName, setLocationName] = useState<string>('');
  const [province, setProvince] = useState<string>('Lusaka');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoMetadata, setGeoMetadata] = useState<GeoMetadata | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Proactively auto-capture precise GPS metadata when media is captured
  const acquirePreciseGps = (onSuccessName?: (name: string, prov: string) => void) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy * 10) / 10;

        const meta: GeoMetadata = {
          latitude: lat,
          longitude: lng,
          accuracy,
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          capturedAt: Date.now(),
          provider: 'gps-sensor',
        };

        setGeoMetadata(meta);
        setLatitude(lat);
        setLongitude(lng);
        setLocationStatus(`GPS lock active (±${accuracy}m precision)`);

        // Reverse geocoding for address
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

            const generated = road ? `${road}, ${city}` : (data.display_name?.split(',').slice(0, 2).join(',') || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            
            const matchedProv = ZAMBIA_PROVINCES.find((p) =>
              (state && state.toLowerCase().includes(p.toLowerCase())) ||
              (city && city.toLowerCase().includes(p.toLowerCase()))
            ) || 'Lusaka';

            if (onSuccessName) {
              onSuccessName(generated, matchedProv);
            } else if (!locationName) {
              setLocationName(generated);
              setProvince(matchedProv);
            }
          }
        } catch {
          // ignore geocode network errors
        }
      },
      () => {
        // GPS permission refused or timeout
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleMediaCaptured = (mediaUrl: string, type: 'photo' | 'video') => {
    setPhotoUrl(mediaUrl);
    setMediaType(type);
    setIsCameraModalOpen(false);
    // Auto-acquire precise GPS metadata
    acquirePreciseGps();
  };

  const handleTakePhotoClick = () => {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      cameraInputRef.current?.click();
    }
  };

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
          acquirePreciseGps();
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
    setLocationStatus('Acquiring precise satellite GPS lock...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy * 10) / 10;

        setLatitude(lat);
        setLongitude(lng);

        const meta: GeoMetadata = {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          altitude: pos.coords.altitude,
          capturedAt: Date.now(),
          provider: 'gps-sensor',
        };
        setGeoMetadata(meta);

        // Reverse geocoding via OpenStreetMap nominatim
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

            const matchedProvince = ZAMBIA_PROVINCES.find((p) =>
              (state && state.toLowerCase().includes(p.toLowerCase())) ||
              (city && city.toLowerCase().includes(p.toLowerCase()))
            );
            if (matchedProvince) {
              setProvince(matchedProvince);
            }
            setLocationStatus(`High-Precision GPS Locked (±${acc}m accuracy)`);
          } else {
            setLocationStatus(`GPS Locked (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          setLocationStatus(`GPS Locked (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationStatus('GPS permission was denied');
        } else {
          setLocationStatus('Could not get GPS fix. Please enter street below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = () => {
    if (!photoUrl) return;
    // Open prompt asking if citizen wants to provide optional contact details or remain anonymous
    setIsContactModalOpen(true);
  };

  const handleFinalizeReport = (name?: string, phone?: string) => {
    setIsContactModalOpen(false);
    setIsSubmitting(true);

    const finalLocation = locationName.trim() || (latitude ? `GPS: ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Lusaka, Zambia');

    const finalGeo: GeoMetadata = geoMetadata || {
      latitude: latitude ?? -15.4208,
      longitude: longitude ?? 28.2833,
      accuracy: 4.5,
      capturedAt: Date.now(),
      provider: 'browser-geolocation',
    };

    saveNewReport({
      photoUrl,
      mediaUrl: photoUrl,
      mediaType,
      locationName: finalLocation,
      province,
      latitude: latitude ?? -15.4208,
      longitude: longitude ?? 28.2833,
      geoMetadata: finalGeo,
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
    setGeoMetadata(null);
    setLocationStatus('');
  };

  const isFormReady = Boolean(photoUrl && (locationName.trim() || latitude));

  return (
    <div id="report-flow-container" className="w-full max-w-md mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs mr-1"
              title="Back to Home Feed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-neutral-900 tracking-tight leading-tight">
              Waste Watch
            </h1>
            <p className="text-[11px] font-medium text-neutral-400">
              3 Steps • Snap, Locate, Send
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider">2. GPS</span>
            {(latitude || locationName) && (
              <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">Precise Location</span>
        </div>

        <div
          className={`p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center ${
            isFormReady
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white border-neutral-200 text-neutral-400 opacity-60'
          }`}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5">3. Send</span>
          <span className={`text-[10px] ${isFormReady ? 'text-emerald-100' : 'text-neutral-400'} font-medium`}>
            Submit
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* STEP 1: SNAP / UPLOAD PHOTO OR VIDEO */}
        <section className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-black text-neutral-800 tracking-tight">
                Capture Waste Media
              </h2>
            </div>
            {photoUrl && (
              <button
                onClick={handleReset}
                className="text-xs text-neutral-400 hover:text-rose-500 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            )}
          </div>

          {photoUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-900 border border-neutral-200 shadow-inner group">
                {mediaType === 'video' ? (
                  <video
                    src={photoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={photoUrl}
                    alt="Captured waste"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  {mediaType === 'video' ? <Video className="w-3 h-3 text-rose-400" /> : <Camera className="w-3 h-3 text-emerald-400" />}
                  <span>{mediaType === 'video' ? 'Recorded Video' : 'Captured Photo'}</span>
                </div>
              </div>

              {/* Geo-Metadata Confirmation Badge */}
              {geoMetadata && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                    <span>Precise GPS Tagged:</span>
                  </div>
                  <span className="font-mono text-neutral-600">
                    {geoMetadata.latitude.toFixed(4)}, {geoMetadata.longitude.toFixed(4)} (±{geoMetadata.accuracy}m)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Take Photo / Record Video Button */}
                <button
                  id="take-photo-btn"
                  type="button"
                  onClick={handleTakePhotoClick}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border-2 border-dashed border-emerald-300 text-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black block">Take Photo / Video</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Use Laptop / Phone Camera</span>
                  </div>
                </button>

                {/* Upload Photo / Video File Button */}
                <button
                  id="upload-file-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border-2 border-dashed border-neutral-300 text-neutral-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-neutral-700 border border-neutral-200 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black block">Upload File</span>
                    <span className="text-[10px] text-neutral-400 font-medium">Photo or Video Clip</span>
                  </div>
                </button>
              </div>

              {/* Hidden file and camera inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="native-camera-input"
              />
            </div>
          )}
        </section>

        {/* STEP 2: PRECISE GEO-LOCATION */}
        <section className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-black text-neutral-800 tracking-tight">
                Pin Location
              </h2>
            </div>
            {latitude && longitude && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-blue-600" />
                <span>GPS Ready</span>
              </span>
            )}
          </div>

          {/* Quick Auto-Detect Live GPS Button */}
          <button
            id="get-live-location-btn"
            type="button"
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Getting satellite GPS fix...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Get Exact Live Location</span>
              </>
            )}
          </button>

          {locationStatus && (
            <p className="text-[11px] text-center font-bold text-blue-700 bg-blue-50/80 p-2 rounded-xl">
              {locationStatus}
            </p>
          )}

          {/* Manual Location Input & Province Selector */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Street / Area Description</span>
              </label>
              <input
                id="location-text-input"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Cairo Road, Near Post Office"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Province (Zambia)
              </label>
              <select
                id="province-select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {ZAMBIA_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov} Province
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* STEP 3: SUBMIT REPORT */}
        <section className="space-y-2 pt-1">
          <button
            id="submit-report-btn"
            type="button"
            disabled={!isFormReady || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isFormReady && !isSubmitting
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/30 active:scale-[0.98]'
                : 'bg-neutral-300 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting to Council...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Waste Report</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-400 font-medium flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anonymous submission with optional WhatsApp feedback</span>
          </p>
        </section>
      </div>

      {/* Interactive Camera & Video Recorder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onMediaCaptured={handleMediaCaptured}
        onFallbackToFilePicker={() => {
          setIsCameraModalOpen(false);
          fileInputRef.current?.click();
        }}
      />

      {/* Optional Contact Details Modal */}
      <OptionalContactModal
        isOpen={isContactModalOpen}
        onSaveContact={(name, phone) => handleFinalizeReport(name, phone)}
        onSkipAnonymous={() => handleFinalizeReport(undefined, undefined)}
      />
    </div>
  );
};
