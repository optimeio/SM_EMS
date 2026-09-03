import React, { useEffect, useRef, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, Printer, Download, Layers, RefreshCw, ExternalLink, Sparkles, Edit3, QrCode } from 'lucide-react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const IDCardModal = ({ employee, onClose }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);

  const [frontDataUrl, setFrontDataUrl] = useState('');
  const [backDataUrl, setBackDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState('both'); // 'both', 'front', 'back', 'canva'
  const [rendering, setRendering] = useState(true);
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [canvaStatusMsg, setCanvaStatusMsg] = useState('');
  const [canvaAuthUrl, setCanvaAuthUrl] = useState('');

  const verificationUrl = employee ? `${window.location.origin}/verify/${employee.employeeId}` : '';

  // Formatted date of birth or default
  const formattedDOB = employee?.dateOfBirth
    ? new Date(employee.dateOfBirth).toLocaleDateString('en-GB')
    : '02/04/2004';

  useEffect(() => {
    if (!employee) return;
    let isMounted = true;

    const drawCards = async () => {
      setRendering(true);
      try {
        // -------------------------------------------------------------
        // 1. DRAW FRONT CARD CANVAS (680 x 1080 px)
        // -------------------------------------------------------------
        const frontCanvas = document.createElement('canvas');
        frontCanvas.width = 680;
        frontCanvas.height = 1080;
        const fctx = frontCanvas.getContext('2d');

        // Load Front Background Image
        const frontBg = new Image();
        frontBg.crossOrigin = 'anonymous';
        frontBg.src = '/front_card_bg.png';
        await new Promise((res, rej) => {
          frontBg.onload = res;
          frontBg.onerror = rej;
        });
        fctx.drawImage(frontBg, 0, 0, 680, 1080);

        // --- DRAW EMPLOYEE PHOTO (Circular Frame centered at X=350, Y=408, radius 170px) ---
        fctx.save();
        fctx.beginPath();
        fctx.arc(350, 408, 170, 0, Math.PI * 2, true);
        fctx.closePath();
        fctx.clip();

        if (employee.profilePhoto) {
          const empPhoto = new Image();
          empPhoto.crossOrigin = 'anonymous';
          empPhoto.src = employee.profilePhoto;
          await new Promise((res) => {
            empPhoto.onload = res;
            empPhoto.onerror = res; // fallback on error
          });
          if (empPhoto.complete && empPhoto.naturalWidth > 0) {
            fctx.drawImage(empPhoto, 350 - 170, 408 - 170, 340, 340);
          } else {
            drawPhotoFallback(fctx, employee.name);
          }
        } else {
          drawPhotoFallback(fctx, employee.name);
        }
        fctx.restore();

        // --- DRAW EMPLOYEE NAME (Centered at X=350, Y=610) ---
        fctx.font = '900 38px "Playfair Display", Georgia, serif';
        fctx.fillStyle = '#0f172a';
        fctx.textAlign = 'center';
        fctx.textBaseline = 'middle';
        fctx.fillText(employee.name, 350, 610);

        // --- DRAW DESIGNATION (Centered at X=350, Y=646) ---
        fctx.font = '900 22px "Montserrat", sans-serif';
        fctx.fillStyle = '#b91c1c';
        fctx.textAlign = 'center';
        fctx.textBaseline = 'middle';
        fctx.fillText((employee.designation || 'SALES EXECUTIVE').toUpperCase(), 350, 646);

        // --- DRAW TABLE DATA VALUES (Left aligned after colon at X=455) ---
        fctx.fillStyle = '#0f172a';
        fctx.textAlign = 'left';
        fctx.textBaseline = 'middle';

        // Employee ID (X=455, Y=710)
        fctx.font = '800 24px monospace';
        fctx.fillText(employee.employeeId, 455, 710);

        // Date of Birth (X=455, Y=755)
        fctx.font = '800 22px "Montserrat", sans-serif';
        fctx.fillText(formattedDOB, 455, 755);

        // Blood Group (X=455, Y=800)
        fctx.fillText(employee.bloodGroup || 'O+ve', 455, 800);

        // Department (X=455, Y=845)
        fctx.fillText(employee.department, 455, 845);

        // Contact Number (X=455, Y=890)
        fctx.fillText(employee.phone, 455, 890);

        const fUrl = frontCanvas.toDataURL('image/png');
        if (isMounted) setFrontDataUrl(fUrl);

        // -------------------------------------------------------------
        // 2. DRAW BACK CARD CANVAS (680 x 1080 px)
        // -------------------------------------------------------------
        const backCanvas = document.createElement('canvas');
        backCanvas.width = 680;
        backCanvas.height = 1080;
        const bctx = backCanvas.getContext('2d');

        // Load Back Background Image (contains pre-rendered corporate office address & contact details)
        const backBg = new Image();
        backBg.crossOrigin = 'anonymous';
        backBg.src = '/back_card_bg.png';
        await new Promise((res, rej) => {
          backBg.onload = res;
          backBg.onerror = rej;
        });
        bctx.drawImage(backBg, 0, 0, 680, 1080);

        // --- DRAW PERMANENT QR CODE (Centered around X=340, Y=314, size 260 x 260px) ---
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 240,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        });

        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((res) => {
          qrImg.onload = res;
        });

        // Fill white padding box behind QR inside red corner brackets
        bctx.fillStyle = '#ffffff';
        bctx.fillRect(340 - 130, 314 - 130, 260, 260);

        // Draw QR Image
        bctx.drawImage(qrImg, 340 - 120, 314 - 120, 240, 240);

        const bUrl = backCanvas.toDataURL('image/png');
        if (isMounted) setBackDataUrl(bUrl);

      } catch (err) {
        console.error('Canvas draw error:', err);
      } finally {
        if (isMounted) setRendering(false);
      }
    };

    drawCards();

    return () => {
      isMounted = false;
    };
  }, [employee]);

  // Helper: Photo fallback if employee photo fails to load
  const drawPhotoFallback = (ctx, name) => {
    const grad = ctx.createLinearGradient(350 - 170, 408 - 170, 350 + 170, 408 + 170);
    grad.addColorStop(0, '#b91c1c');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fillRect(350 - 170, 408 - 170, 340, 340);

    ctx.font = '800 120px "Montserrat", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || 'E')[0].toUpperCase(), 350, 408);
  };

  // PNG Download Handlers
  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Functionality (Strict CR80 Card Dimensions 54mm x 85.6mm)
  const handlePrint = () => {
    if (!frontDataUrl || !backDataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Card - ${employee.name} (${employee.employeeId})</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            @page {
              size: A4 portrait;
              margin: 15mm;
            }

            body {
              font-family: sans-serif;
              background-color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            
            .print-container {
              display: flex;
              gap: 15mm;
              flex-wrap: wrap;
              justify-content: center;
              align-items: center;
            }

            /* Standard CR80 ID Card Dimensions: 54mm x 85.6mm (2.125in x 3.375in) */
            .id-card-img {
              width: 54mm !important;
              height: 85.6mm !important;
              border-radius: 3.18mm !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              object-fit: cover;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            @media print {
              body { background: none !important; padding: 0 !important; margin: 0 !important; }
              .print-container { gap: 10mm !important; padding-top: 10mm !important; }
              .id-card-img { box-shadow: none !important; page-break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${frontDataUrl}" class="id-card-img" alt="Front ID Card" />
            <img src="${backDataUrl}" class="id-card-img" alt="Back ID Card" />
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Trigger Canva Connect API Autofill for this employee
  const handleCanvaAutofill = async () => {
    setCanvaLoading(true);
    setCanvaStatusMsg('');
    try {
      const res = await API.post('/canva/autofill', {
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        phone: employee.phone,
        dateOfBirth: formattedDOB,
        bloodGroup: employee.bloodGroup || 'O+ve'
      });

      if (res.data.success) {
        setCanvaAuthUrl('');
        setCanvaStatusMsg('Success! Canva ID Card generated via API.');
        if (res.data.job?.url) {
          window.open(res.data.job.url, '_blank');
        }
      } else if (res.data.needsAuth) {
        const authLink = res.data.authUrl || '';
        setCanvaAuthUrl(authLink);
        if (authLink) {
          window.open(authLink, 'CanvaAuth', 'width=600,height=700');
        }
        setCanvaStatusMsg('Canva account authorization required. Click the button below to authorize, then try Auto-Generate again.');
      } else {
        setCanvaStatusMsg(res.data.message || 'Canva API generation failed.');
      }
    } catch (err) {
      if (err.response?.data?.needsAuth) {
        const authLink = err.response.data.authUrl || '';
        setCanvaAuthUrl(authLink);
        if (authLink) {
          window.open(authLink, 'CanvaAuth', 'width=600,height=700');
        }
        setCanvaStatusMsg('Canva account authorization required. Click the button below to authorize, then try Auto-Generate again.');
      } else {
        setCanvaStatusMsg(err.response?.data?.message || err.message || 'Canva API generation failed.');
      }
    } finally {
      setCanvaLoading(false);
    }
  };

  // Download Unique Security QR Code PNG for this employee
  const handleDownloadQR = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 250,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `QR_${employee.employeeId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate QR PNG', err);
    }
  };

  if (!employee) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col relative space-y-5 shadow-2xl my-auto animate-fade-in-up">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700 text-white rounded-2xl shadow-md shadow-red-700/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Official Employee ID Card</h3>
              <p className="text-xs text-slate-500 font-medium">THE SM GROUPS • HTML5 Canvas Rendered • Zero-Shift Guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Selector Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'both' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Both Sides
              </button>
              <button
                onClick={() => setActiveTab('front')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'front' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Front Side
              </button>
              <button
                onClick={() => setActiveTab('back')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'back' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Back Side
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('canva')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'canva' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700 hover:text-purple-900'}`}
                >
                  Canva Live Design
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 py-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 min-h-[580px]">
            
            {rendering ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-red-700" />
                <p className="text-sm font-bold">Rendering HTML5 Canvas ID Cards...</p>
              </div>
            ) : (
              <>
                {/* FRONT ID CARD IMAGE */}
                {(activeTab === 'both' || activeTab === 'front') && frontDataUrl && (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={frontDataUrl}
                      alt="Front ID Card"
                      className="w-[340px] h-[540px] rounded-2xl shadow-2xl border border-slate-200 object-cover select-none transition-transform hover:scale-[1.01]"
                    />
                    <button
                      onClick={() => downloadImage(frontDataUrl, `${employee.employeeId}_Front.png`)}
                      className="text-xs font-bold text-slate-600 hover:text-red-700 flex items-center gap-1.5 pt-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Front PNG
                    </button>
                  </div>
                )}

                {/* BACK ID CARD IMAGE */}
                {(activeTab === 'both' || activeTab === 'back') && backDataUrl && (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={backDataUrl}
                      alt="Back ID Card"
                      className="w-[340px] h-[540px] rounded-2xl shadow-2xl border border-slate-200 object-cover select-none transition-transform hover:scale-[1.01]"
                    />
                    <button
                      onClick={() => downloadImage(backDataUrl, `${employee.employeeId}_Back.png`)}
                      className="text-xs font-bold text-slate-600 hover:text-red-700 flex items-center gap-1.5 pt-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Back PNG
                    </button>
                  </div>
                )}

                {/* CANVA LIVE EMBED IFRAME */}
                {isAdmin && activeTab === 'canva' && (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
                      <iframe
                        loading="lazy"
                        className="w-full h-full border-none"
                        src="https://www.canva.com/design/DAHT2AZD4rw/1oiyFvyXJU5kg1L0SUSOEQ/view?embed"
                        allowFullScreen
                        allow="fullscreen"
                        title="Canva ID Card Design (newiddesign)"
                      />
                    </div>
                    <a
                      href="https://canva.link/y2ux0vdd018dnqi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open "newiddesign" on Canva
                    </a>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100 shrink-0">
          {canvaStatusMsg && (
            <div className="text-xs font-bold p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>{canvaStatusMsg}</span>
              {canvaAuthUrl && (
                <a
                  href={canvaAuthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Connect Canva Account Now
                </a>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              HTML5 Canvas ID Card rendering. Zero element shift during printing.
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleDownloadQR}
                className="text-xs font-bold flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-md"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Download Unique QR
              </button>

              {isAdmin && (
                <a
                  href="https://canva.link/y2ux0vdd018dnqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl transition-all shadow-xs border border-purple-200"
                >
                  <Edit3 className="w-4 h-4 text-purple-700" />
                  Edit Canva Design
                </a>
              )}

              <button
                onClick={handlePrint}
                disabled={rendering}
                className="btn-primary text-xs font-bold flex items-center justify-center gap-2 py-2.5 px-5 bg-red-700 hover:bg-red-800 disabled:opacity-50 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print ID Card
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default IDCardModal;
