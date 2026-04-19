import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const { t } = useTranslation();

  useEffect(() => {
    let scanner = null;
    const initScanner = async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(
        (text) => {
          if (scanner) {
            scanner.clear();
          }
          onScanSuccess(text);
        },
        (err) => {
          if (onScanError) onScanError(err);
        }
      );
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-2 font-semibold text-gray-700">Point camera at product QR code</div>
      <div id="qr-reader" className="w-full border-2 border-gray-300 rounded overflow-hidden"></div>
    </div>
  );
}
