import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  onFallbackToFilePicker: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onFallbackToFilePicker,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(true);

  // Stop current active stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start webcam
  const startCamera = async (mode: 'user' | 'environment') => {
    stopStream();
    setIsStartingCamera(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by this browser.');
      setIsStartingCamera(false);
      return;
    }

    try {
      // First try with requested facingMode, fallback to generic video if facingMode constraint fails on laptop webcams
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback for laptops that don't support facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Camera access denied or error:', err);
      setIsStartingCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Please allow camera in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera hardware found on this computer.');
      } else {
        setCameraError('Could not start camera feed.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Capture current frame from video into canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user camera, mirror for natural selfie preview
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopStream();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col relative"
      >
        {/* Top Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Camera</span>
          </div>
          <button
            id="camera-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Video Container */}
        <div className="relative w-full h-80 sm:h-96 bg-black flex items-center justify-center overflow-hidden">
          {/* Shutter flash effect */}
          <AnimatePresence>
            {isShutterFlashing && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white z-40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {cameraError ? (
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-neutral-300 mb-4 max-w-xs">
                {cameraError}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onFallbackToFilePicker();
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Upload from Files Instead
              </button>
            </div>
          ) : capturedImage ? (
            /* Review captured photo */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Photo Captured
              </div>
            </div>
          ) : (
            /* Active Live Video Feed */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {isStartingCamera && (
                <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center text-white gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-medium text-neutral-400">Starting camera...</span>
                </div>
              )}

              {/* Viewfinder crosshairs and guidelines */}
              <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
                  <div className="w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
                </div>
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
                  <div className="w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />
                </div>
              </div>

              {/* Live recording indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>

              {/* Switch camera button */}
              <button
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                title="Switch Camera (Front / Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          {capturedImage ? (
            /* Review state actions */
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                id="camera-retake-btn"
                onClick={handleRetake}
                className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                id="camera-use-photo-btn"
                onClick={handleConfirm}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use Photo</span>
              </button>
            </div>
          ) : (
            /* Live mode shutter button */
            <div className="w-full flex items-center justify-between px-2">
              <button
                onClick={() => {
                  onClose();
                  onFallbackToFilePicker();
                }}
                className="text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Use File
              </button>

              {/* Large circular shutter button */}
              <button
                id="camera-shutter-btn"
                onClick={handleSnap}
                disabled={Boolean(cameraError) || isStartingCamera}
                className="relative w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform group disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Snap photo"
              >
                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-emerald-400 group-active:scale-95 transition-colors" />
              </button>

              <div className="w-12" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
