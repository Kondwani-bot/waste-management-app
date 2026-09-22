import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Video,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  Square,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaCaptured: (mediaUrl: string, mediaType: 'photo' | 'video') => void;
  onFallbackToFilePicker: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onMediaCaptured,
  onFallbackToFilePicker,
}) => {
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Photo capture state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isStartingCamera, setIsStartingCamera] = useState(true);

  const MAX_RECORDING_SECONDS = 30;

  // Stop active camera and microphone tracks
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Start webcam (and audio if in video mode)
  const startCamera = async (mode: 'user' | 'environment', includeAudio: boolean) => {
    stopStream();
    setIsStartingCamera(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.');
      setIsStartingCamera(false);
      return;
    }

    try {
      let stream: MediaStream;
      const videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: mode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: includeAudio,
        });
      } catch (firstErr) {
        // If audio request failed or facingMode is not supported on laptop webcam
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: includeAudio,
          });
        } catch {
          // Fallback to video only without microphone
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsStartingCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera or microphone permission was blocked. Please allow permissions in your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera hardware found on this device.');
      } else {
        setCameraError('Unable to access the camera.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setRecordedVideoUrl(null);
      setIsRecording(false);
      setRecordingSeconds(0);
      clearTimer();
      startCamera(facingMode, captureMode === 'video');
    } else {
      stopRecordingImmediate();
      stopStream();
      clearTimer();
    }
    return () => {
      stopRecordingImmediate();
      stopStream();
      clearTimer();
    };
  }, [isOpen, facingMode, captureMode]);

  // Capture Photo
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
      stopStream();
    }
  };

  // Start Video Recording
  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    let mimeType = 'video/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }
    }

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setRecordedVideoUrl(reader.result);
          } else {
            // Fallback to object URL
            const objUrl = URL.createObjectURL(blob);
            setRecordedVideoUrl(objUrl);
          }
        };
        reader.readAsDataURL(blob);
        stopStream();
      };

      recorder.start(250); // Slice data every 250ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start elapsed timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting MediaRecorder', err);
      setCameraError('Unable to record video in this browser.');
    }
  };

  // Stop recording normally
  const stopRecording = () => {
    clearTimer();
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Immediate abort cleanup
  const stopRecordingImmediate = () => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setRecordedVideoUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    clearTimer();
    startCamera(facingMode, captureMode === 'video');
  };

  const handleConfirmMedia = () => {
    if (captureMode === 'photo' && capturedPhoto) {
      onMediaCaptured(capturedPhoto, 'photo');
      onClose();
    } else if (captureMode === 'video' && recordedVideoUrl) {
      onMediaCaptured(recordedVideoUrl, 'video');
      onClose();
    }
  };

  const toggleFacingMode = () => {
    if (isRecording) return;
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleVideoPlayback = () => {
    if (!previewVideoRef.current) return;
    if (isVideoPlaying) {
      previewVideoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      previewVideoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isReviewing = Boolean(capturedPhoto || recordedVideoUrl);

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
          {/* Mode Switch Pills */}
          {!isReviewing ? (
            <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-full border border-neutral-700/60">
              <button
                id="camera-mode-photo-btn"
                onClick={() => {
                  if (isRecording) return;
                  setCaptureMode('photo');
                }}
                disabled={isRecording}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  captureMode === 'photo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>
              <button
                id="camera-mode-video-btn"
                onClick={() => {
                  if (isRecording) return;
                  setCaptureMode('video');
                }}
                disabled={isRecording}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  captureMode === 'video'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-white text-xs font-bold">
              {captureMode === 'photo' ? (
                <>
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Review Photo</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Review Video</span>
                </>
              )}
            </div>
          )}

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
          ) : capturedPhoto ? (
            /* Review captured photo */
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Photo Ready
              </div>
            </div>
          ) : recordedVideoUrl ? (
            /* Review recorded video */
            <div className="relative w-full h-full flex items-center justify-center bg-black group">
              <video
                ref={previewVideoRef}
                src={recordedVideoUrl}
                playsInline
                loop
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={toggleVideoPlayback}
              />
              <button
                onClick={toggleVideoPlayback}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-xs pointer-events-auto"
                title={isVideoPlaying ? 'Pause' : 'Play'}
              >
                {isVideoPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-1" />
                )}
              </button>
              <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Video Ready ({formatSeconds(recordingSeconds)})
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

              {/* Viewfinder crosshairs */}
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
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {isRecording ? (
                  <div className="flex items-center gap-1.5 bg-rose-600/90 text-white backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black tracking-wider animate-pulse shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>REC {formatSeconds(recordingSeconds)} / {formatSeconds(MAX_RECORDING_SECONDS)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Switch camera button */}
              {!isRecording && (
                <button
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                  title="Switch Camera (Front / Back)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          {isReviewing ? (
            /* Review state actions */
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                id="camera-retake-btn"
                onClick={handleRetake}
                className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                id="camera-use-media-btn"
                onClick={handleConfirmMedia}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use {captureMode === 'photo' ? 'Photo' : 'Video'}</span>
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
                disabled={isRecording}
                className="text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
              >
                Use File
              </button>

              {captureMode === 'photo' ? (
                /* Photo Shutter Button */
                <button
                  id="camera-shutter-photo-btn"
                  onClick={handleSnapPhoto}
                  disabled={Boolean(cameraError) || isStartingCamera}
                  className="relative w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform group disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Snap photo"
                >
                  <div className="w-12 h-12 rounded-full bg-white group-hover:bg-emerald-400 group-active:scale-95 transition-colors" />
                </button>
              ) : (
                /* Video Record / Stop Button */
                <button
                  id="camera-shutter-video-btn"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={Boolean(cameraError) || isStartingCamera}
                  className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center active:scale-90 transition-all group disabled:opacity-40 disabled:cursor-not-allowed ${
                    isRecording
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-white bg-transparent'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? (
                    <div className="w-6 h-6 rounded-md bg-rose-500 shadow-md group-hover:scale-95 transition-transform" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-500 group-active:scale-95 transition-colors" />
                  )}
                </button>
              )}

              <div className="w-12 text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  {captureMode}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
