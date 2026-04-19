import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function QRCodeDisplay({ batchId, qrHash }) {
  const { t } = useTranslation();
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${batchId}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const url = `${window.location.origin}/provenance/${batchId}`;

  return (
    <div className="flex flex-col items-center bg-white p-4 border rounded shadow-sm">
      <div ref={qrRef} className="bg-white p-2">
        <QRCodeSVG value={url} size={200} />
      </div>
      <div className="mt-2 text-xs font-mono text-gray-500 truncate w-48 text-center">
        {batchId}
      </div>
      <button onClick={downloadQR} className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
        Download QR
      </button>
    </div>
  );
}
