import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const employees = [
  { id: 'TSMG005', name: 'SACHIN_M' },
  { id: 'TSMG006', name: 'THARANEESH_K_P' },
  { id: 'TSMG007', name: 'GOKULRAJ_N' },
  { id: 'TSMG009', name: 'MITHUN_BALA_V' },
  { id: 'TSMG010', name: 'RUPASRI_K' },
  { id: 'TSMG011', name: 'SOUNDHARYA_NAGARAJ' },
  { id: 'TSMG012', name: 'AARON_M' },
  { id: 'TSMG013', name: 'SHYAMALA_K' },
];

const outDir = path.resolve('../PERMANENT_ID_CARD_QR_CODES');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function exportPNGs() {
  for (const emp of employees) {
    const verificationUrl = `https://ems.thesmgroups.com/verify/${emp.id}`;
    const filePath = path.join(outDir, `${emp.id}_${emp.name}_QR.png`);
    
    await QRCode.toFile(filePath, verificationUrl, {
      width: 1000, // Crystal-clear 1000x1000 for Canva and physical ID card printing
      margin: 3,   // Standard quiet zone so cameras and apps never fail
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H' // 30% error recovery for laminate and scratches
    });

    console.log(`Saved: ${filePath}`);
  }
  console.log('✅ Exported all 5 high-resolution QR PNGs!');
}

exportPNGs();
