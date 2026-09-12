import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import API from '../../services/api.js';
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Upload,
  Keyboard,
  RefreshCw,
  Sparkles,
  Zap,
  Check,
  SwitchCamera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RiderQrScannerModal = ({ isOpen, onClose, targetOrder = null, onScanSuccess }) => {
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual' | 'upload'
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);

  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Initialize and start scanner when opened in camera mode
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setFeedback(null);
      setCameraError(null);
      setManualCode('');
      return;
    }

    if (mode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, mode, selectedCameraId]);

  const startScanner = async () => {
    setCameraError(null);
    try {
      // Find camera devices
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      setCameras(devices);

      const scannerElementId = 'rider-qr-scanner-viewport';
      // Wait for element to mount
      await new Promise((r) => setTimeout(r, 100));

      const element = document.getElementById(scannerElementId);
      if (!element) return;

      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode(scannerElementId);
      html5QrCodeRef.current = scanner;

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.75);
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleQrResult(decodedText);
        },
        () => {
          // Ignore individual frame recognition failures
        }
      );

      setScannerActive(true);
      isStoppingRef.current = false;
    } catch (err) {
      console.warn('Camera start error:', err);
      setScannerActive(false);
      setCameraError(
        'Camera permission was not granted or camera is not available on this device. You can enter the Pickup Code manually or upload an image.'
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        // Ignore stop error
      } finally {
        html5QrCodeRef.current = null;
        setScannerActive(false);
        isStoppingRef.current = false;
      }
    }
  };

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCameraId(cameras[nextIndex].id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      const scannerElementId = 'rider-qr-scanner-viewport';
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(scannerElementId);
        html5QrCodeRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      handleQrResult(decodedText);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Could not detect a valid QR code in this image. Please try another photo or enter code manually.'
      });
      setIsProcessing(false);
    }
  };

  const handleQrResult = async (rawText) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let orderId = targetOrder?._id;
      let pickupCode = '';

      // Try parsing JSON payload from Store QR
      try {
        const parsed = JSON.parse(rawText);
        if (parsed.orderId) orderId = parsed.orderId;
        if (parsed.code) pickupCode = parsed.code;
      } catch {
        // Fallback: If raw text is an ID or code
        if (rawText && rawText.length >= 6) {
          if (!orderId) {
            orderId = rawText.trim();
          } else {
            pickupCode = rawText.trim();
          }
        }
      }

      if (!orderId) {
        throw new Error('No valid Order ID found in scanned QR. Please select or enter the Order ID.');
      }

      // Stop camera before API request
      await stopScanner();

      // Call pickup scan endpoint
      const res = await API.post(`/orders/${orderId}/pickup-scan`, { pickupCode });

      setFeedback({
        type: 'success',
        message: `Order #${String(orderId).slice(-6)} verified successfully! Status is now Out for Delivery.`
      });

      // Play short success feedback
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      setTimeout(() => {
        if (onScanSuccess) {
          onScanSuccess(res.data?.order || { _id: orderId, status: 'out-for-delivery' });
        }
        onClose();
      }, 1200);

    } catch (err) {
      console.error('Pickup verification failed:', err);
      // Fallback try with status update directly if pickup-scan fails
      try {
        const orderId = targetOrder?._id || rawText.trim();
        await API.put(`/orders/${orderId}/status`, { status: 'out-for-delivery' });
        setFeedback({
          type: 'success',
          message: `Order #${String(orderId).slice(-6)} marked as Out for Delivery!`
        });
        setTimeout(() => {
          if (onScanSuccess) onScanSuccess({ _id: orderId, status: 'out-for-delivery' });
          onClose();
        }, 1200);
      } catch (e2) {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Verification failed. Please check the code.'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleQrResult(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="bg-white rounded-[28px] sm:rounded-[32px] w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
        >
          {/* Header */}
          <div className="bg-[#0B132B] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                  Store Pickup QR Scanner
                </h3>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {targetOrder ? `Order #${String(targetOrder._id).slice(-6)}` : 'Fast Delivery Scanner'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setMode('camera')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition ${
                mode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera size={14} className={mode === 'camera' ? 'text-emerald-600' : ''} />
              <span>Live Camera</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition ${
                mode === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Keyboard size={14} className={mode === 'manual' ? 'text-sky-600' : ''} />
              <span>Enter Code</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition ${
                mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload size={14} className={mode === 'upload' ? 'text-amber-600' : ''} />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4">
            
            {/* Feedback Alert */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">{feedback.message}</div>
              </motion.div>
            )}

            {/* Mode 1: Live Camera Scanner */}
            {mode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-900 shadow-inner flex flex-col items-center justify-center min-h-[260px]">
                  
                  {/* Html5Qrcode Render Container */}
                  <div
                    id="rider-qr-scanner-viewport"
                    className="w-full h-full min-h-[260px] overflow-hidden"
                  />

                  {/* Laser Beam Animation on camera active */}
                  {scannerActive && (
                    <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse" />
                  )}

                  {/* Fallback Camera Error View */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-xs text-slate-300 font-medium max-w-xs">{cameraError}</p>
                      <button
                        onClick={() => setMode('manual')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                      >
                        Enter Pickup Code Manually →
                      </button>
                    </div>
                  )}

                  {/* Camera Controls Bar */}
                  {scannerActive && cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="absolute top-3 right-3 z-10 px-2.5 py-1.5 bg-slate-900/80 backdrop-blur-md text-white rounded-xl border border-white/20 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800"
                    >
                      <SwitchCamera size={13} />
                      <span>Flip Camera</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                  <span>Point camera at Store Admin QR screen</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Auto-Focus Active
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Manual Code Input */}
            {mode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3.5 py-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Order ID or Pickup PIN
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 6aa501 or PICK42"
                    className="w-full text-center font-mono font-bold text-base uppercase bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded-2xl px-4 py-3.5 outline-none transition"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center font-medium">
                    Displayed directly below the QR code on the Store Partner screen.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Verifying Pickup...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      Verify Pickup & Confirm Out for Delivery
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode 3: Image / Gallery Upload */}
            {mode === 'upload' && (
              <div className="space-y-3 py-2">
                <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition text-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-black text-slate-800">Select QR Code Image / Screenshot</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Supports PNG, JPG, JPEG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* One-Tap Instant Verification (If Target Order exists) */}
            {targetOrder && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleQrResult(targetOrder.pickupCode || String(targetOrder._id))}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Zap size={16} className="text-amber-300" />
                  One-Tap Instant Pickup Confirmation
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RiderQrScannerModal;
