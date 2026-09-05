import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  Search, 
  QrCode, 
  FileImage, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [manualId, setManualId] = useState('');
  const [scanError, setScanError] = useState(null);
  const [scanningFile, setScanningFile] = useState(false);
  const [fileSuccessMsg, setFileSuccessMsg] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (activeTab !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Failed to clear scanner', err));
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    const extractCleanEmployeeId = (text) => {
      if (!text) return null;
      let clean = decodeURIComponent(text.trim());
      if (clean.includes('/verify/')) {
        clean = clean.split('/verify/')[1] || clean;
      }
      clean = clean.split('?')[0].split('#')[0];
      clean = clean.replace(/^\/+|\/+$/g, '').trim();
      if (clean.includes('/')) {
        const segs = clean.split('/').filter(Boolean);
        clean = segs[segs.length - 1] || clean;
      }
      return clean.trim();
    };

    const onScanSuccess = (decodedText) => {
      scanner.clear().catch((err) => console.error(err));

      const employeeId = extractCleanEmployeeId(decodedText);

      if (employeeId) {
        navigate(`/verify/${employeeId}`);
      } else {
        setScanError('Invalid QR Code format.');
      }
    };

    const onScanError = () => {
      // Continuous scan
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Failed to clear scanner', err));
        scannerRef.current = null;
      }
    };
  }, [activeTab, navigate]);

  const processScannedCode = (decodedText) => {
    if (!decodedText) return;
    let clean = decodeURIComponent(decodedText.trim());
    if (clean.includes('/verify/')) {
      clean = clean.split('/verify/')[1] || clean;
    }
    clean = clean.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').trim();
    if (clean.includes('/')) {
      const segs = clean.split('/').filter(Boolean);
      clean = segs[segs.length - 1] || clean;
    }
    const employeeId = clean.trim();

    if (employeeId) {
      setFileSuccessMsg(`QR Code Detected! Employee ID: ${employeeId}`);
      setTimeout(() => {
        navigate(`/verify/${employeeId}`);
      }, 600);
    } else {
      setScanError('Invalid QR Code. Could not extract Employee ID.');
    }
  };

  const scanWithJsQR = async (imageFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            // Scale 1: Original Size
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'attemptBoth' });
            if (code && code.data) return resolve(code.data);

            // Scale 2: Downscaled to 800px (standard for large photos or high-res ID cards)
            if (img.width > 800 || img.height > 800) {
              const scale = Math.min(800 / img.width, 800 / img.height);
              canvas.width = Math.round(img.width * scale);
              canvas.height = Math.round(img.height * scale);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'attemptBoth' });
              if (code && code.data) return resolve(code.data);
            }

            // Scale 3: Sub-regions for full card images (top, center, bottom)
            const regions = [
              { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
              { x: 0.1, y: 0.35, w: 0.8, h: 0.65 }, // Bottom half (where ID card back QR sits)
              { x: 0.15, y: 0.15, w: 0.7, h: 0.7 }
            ];

            for (const r of regions) {
              const rx = Math.round(img.width * r.x);
              const ry = Math.round(img.height * r.y);
              const rw = Math.round(img.width * r.w);
              const rh = Math.round(img.height * r.h);

              canvas.width = rw;
              canvas.height = rh;
              ctx.drawImage(img, rx, ry, rw, rh, 0, 0, rw, rh);
              imgData = ctx.getImageData(0, 0, rw, rh);
              code = jsQR(imgData.data, rw, rh, { inversionAttempts: 'attemptBoth' });
              if (code && code.data) return resolve(code.data);
            }

            resolve(null);
          } catch (e) {
            console.error('jsQR decode error:', e);
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = reader.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageFile);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setScanError(null);
    setFileSuccessMsg(null);

    if (!file) return;

    try {
      setScanningFile(true);

      // Primary: High performance canvas jsQR scan (handles pure QR, full ID cards, screenshots)
      const decodedText = await scanWithJsQR(file);

      if (decodedText) {
        processScannedCode(decodedText);
        return;
      }

      // Fallback: Html5Qrcode if jsQR did not find it
      try {
        const html5QrCode = new Html5Qrcode('qr-file-reader-temp');
        const fallbackText = await html5QrCode.scanFile(file, false);
        if (fallbackText) {
          processScannedCode(fallbackText);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback scanner also failed:', fallbackErr);
      }

      setScanError('No valid QR Code detected in uploaded image. Please ensure the QR code image is clear and well-lit.');
    } catch (err) {
      console.error('QR Image File Scan Error:', err);
      setScanError('Unable to read QR code from this image. Please ensure the QR code is clearly visible.');
    } finally {
      setScanningFile(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(`/verify/${manualId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 relative">
      <div id="qr-file-reader-temp" className="hidden"></div>
      <div className="w-full max-w-md space-y-4 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="h-8 object-contain" />
          </div>
          <Link
            to="/login"
            className="btn-secondary text-xs"
          >
            Staff Login
          </Link>
        </div>

        {/* Scanner Card */}
        <div className="card-saas p-6 space-y-5 animate-fade-in bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shrink-0 shadow-2xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Verify Employee Identity</h2>
                <p className="text-xs text-slate-500">Scan camera or upload QR code image file</p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setScanError(null);
                setActiveTab('upload');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-slate-700" />
              Upload QR Image
            </button>

            <button
              onClick={() => {
                setScanError(null);
                setActiveTab('camera');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'camera'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-slate-700" />
              Live Camera
            </button>
          </div>

          {/* File Upload Mode */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-7 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input
                  type="file"
                  id="qr-image-upload-input"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={scanningFile}
                  className="hidden"
                />
                <label htmlFor="qr-image-upload-input" className="cursor-pointer block space-y-3">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-slate-800 transition-colors shadow-2xs">
                    {scanningFile ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-slate-800" />
                    ) : (
                      <FileImage className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors block">
                      {scanningFile ? 'Decoding QR Code...' : 'Choose or Drop QR Image File'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload downloaded ID Card PNG/JPG or screenshot
                    </p>
                  </div>
                  <div className="btn-secondary text-xs inline-flex items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Select QR Code Image
                  </div>
                </label>
              </div>

              {fileSuccessMsg && (
                <div className="badge-success p-3 rounded-xl text-xs flex items-center gap-2 font-semibold animate-fade-in">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{fileSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Live Camera Scanner Mode */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl bg-slate-900 border border-slate-800 min-h-[260px] flex flex-col justify-center relative">
                <div id="qr-reader" className="w-full text-white"></div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">Point your camera directly at the ID card QR code</p>
            </div>
          )}

          {scanError && (
            <div className="badge-danger p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Manual ID Search Entry */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Manual Employee ID Lookup</label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TSMGS001 or EMP001"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="input-saas uppercase font-mono font-semibold flex-1 text-xs"
              />
              <button
                type="submit"
                className="btn-primary text-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                Verify
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          THE SM GROUPS Live Identity Verification System
        </p>
      </div>
    </div>
  );
};

export default QRScannerPage;
