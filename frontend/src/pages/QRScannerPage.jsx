import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
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

    const onScanSuccess = (decodedText) => {
      scanner.clear().catch((err) => console.error(err));

      let employeeId = decodedText;
      if (decodedText.includes('/verify/')) {
        const parts = decodedText.split('/verify/');
        employeeId = parts[parts.length - 1];
      }

      if (employeeId) {
        navigate(`/verify/${employeeId.trim()}`);
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
    let employeeId = decodedText;
    if (decodedText.includes('/verify/')) {
      const parts = decodedText.split('/verify/');
      employeeId = parts[parts.length - 1];
    }

    if (employeeId) {
      setFileSuccessMsg(`QR Code Detected! Employee ID: ${employeeId.trim()}`);
      setTimeout(() => {
        navigate(`/verify/${employeeId.trim()}`);
      }, 600);
    } else {
      setScanError('Invalid QR Code. Could not extract Employee ID.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setScanError(null);
    setFileSuccessMsg(null);

    if (!file) return;

    try {
      setScanningFile(true);
      const html5QrCode = new Html5Qrcode('qr-file-reader-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      processScannedCode(decodedText);
    } catch (err) {
      console.error('QR Image File Scan Error:', err);
      setScanError('No valid QR Code detected in uploaded image. Please ensure the QR code image is clear.');
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
