import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createHarvestEntry, getMyBatches, syncOffline } from '../api';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import BatchCard from '../components/BatchCard';
import { QRCodeSVG } from 'qrcode.react';

export default function HarvesterDashboard() {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, reset } = useForm();
  const { isOnline, pendingCount, addToQueue } = useOfflineQueue();
  const [batches, setBatches] = useState([]);
  const [qrCodeData, setQrCodeData] = useState(null);

  const loadBatches = async () => {
    if (isOnline) {
      try {
        const data = await getMyBatches();
        setBatches(data);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => { loadBatches(); }, [isOnline]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setValue('gpsLat', pos.coords.latitude);
        setValue('gpsLng', pos.coords.longitude);
      });
    }
  };

  const onSubmit = async (data) => {
    const payload = { ...data, isOffline: !isOnline };
    if (!isOnline) {
      addToQueue('harvest_entry', payload);
      reset();
      alert(t('harvest.queued_offline'));
    } else {
      try {
        const res = await createHarvestEntry(payload);
        setQrCodeData({ qrHash: res.qrHash, batchId: res.batchId });
        reset();
        loadBatches();
      } catch (e) {
        alert(t('common.error') + ': ' + (e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || e.message));
        console.error(e.response || e);
      }
    }
  };

  const handleSync = async () => {
    try {
      await syncOffline();
      loadBatches();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Offline Warning Bar */}
      {!isOnline && (
        <div className="bg-[#EF9F27] text-white px-6 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-[14px] font-medium">{t('common.offline')} — {pendingCount} {t('common.pending_sync')}</span>
          </div>
          {pendingCount > 0 && (
            <button onClick={handleSync} className="text-[12px] font-bold uppercase tracking-widest underline hover:opacity-80 transition-opacity">
              {t('harvest.sync_now')}
            </button>
          )}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#444441]">{t('harvest.title')}</h1>
        <p className="text-[#888780] text-[15px] mt-1">Log new forest product harvests and track batch status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN — Form + QR Success */}
        <div className="lg:col-span-7 space-y-6">

          {/* QR Code Success Card */}
          {qrCodeData && (
            <div className="bg-white rounded-xl border border-[#D3D1C7] overflow-hidden">
              {/* Success Banner */}
              <div className="bg-[#1D9E75] px-6 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white font-semibold text-[14px]">{t('harvest.success')}</span>
              </div>
              {/* QR Content */}
              <div className="p-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="w-36 h-36 bg-white p-3 border border-[#D3D1C7] rounded-xl flex items-center justify-center shrink-0">
                  <QRCodeSVG value={`http://localhost:3000/scan?qr=${qrCodeData.qrHash}`} size={128} />
                </div>
                <div className="flex-grow space-y-3 text-center sm:text-left">
                  <div>
                    <p className="text-[11px] font-bold text-[#888780] uppercase tracking-widest mb-1.5">Generated Batch ID</p>
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                      <span className="font-mono text-lg font-bold text-[#444441]">{qrCodeData.batchId}</span>
                      <span className="bg-[#1D9E75] text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">✓ On-chain</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#888780] max-w-xs">
                    Copy this Batch ID to receive it in the Depot Manager dashboard.
                  </p>
                  <button
                    onClick={() => setQrCodeData(null)}
                    className="border border-[#D3D1C7] hover:bg-[#E1F5EE] text-[#444441] rounded-lg px-4 py-2 text-[14px] font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Harvest Entry Form Card */}
          <div className="bg-white rounded-xl border border-[#D3D1C7] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#D3D1C7] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#444441]">{t('harvest.title')}</h2>
              <span className="text-[11px] font-mono bg-[#F1EFE8] px-2.5 py-1 rounded text-[#888780] uppercase tracking-wider">Manual Entry</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Permit Number */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('harvest.permit')}</label>
                <input
                  type="text"
                  {...register('permitNumber', { required: true })}
                  className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  placeholder="PERMIT-GJ-2024-001"
                />
              </div>

              {/* Product Type + Quantity side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('harvest.product')}</label>
                  <select
                    {...register('productType')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="tendu_leaves">{t('product.tendu_leaves')}</option>
                    <option value="timber">{t('product.timber')}</option>
                    <option value="bamboo">{t('product.bamboo')}</option>
                    <option value="medicinal_herbs">{t('product.medicinal_herbs')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('harvest.quantity')}</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('quantityKg', { required: true })}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* GPS Coordinates */}
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold">GPS Coordinates</label>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="text-[12px] font-semibold text-[#0F6E56] hover:text-[#085041] flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('harvest.use_gps')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="any"
                    {...register('gpsLat')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="any"
                    {...register('gpsLng')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('harvest.date')}</label>
                <input
                  type="date"
                  {...register('harvestDate', { required: true })}
                  className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {t('harvest.submit')}
                </button>
                <p className="mt-3 text-center text-[12px] text-[#888780]">
                  No internet? Entry will be saved and synced automatically.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN — Batch List */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-[#D3D1C7] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#D3D1C7] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#444441]">{t('harvest.my_batches')}</h2>
              {isOnline && pendingCount > 0 && (
                <button
                  onClick={handleSync}
                  className="bg-[#E1F5EE] hover:bg-[#cceee2] text-[#085041] font-bold text-[12px] rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('harvest.sync_now')} ({pendingCount})
                </button>
              )}
            </div>

            {/* Batch Items */}
            <div className="divide-y divide-[#D3D1C7]">
              {/* Render pending local items placeholder */}
              {pendingCount > 0 && Array.from({length: pendingCount}).map((_, i) => (
                <BatchCard key={`pending-${i}`} batch={{ product_type: 'timber', quantity_kg: '?', harvest_date: new Date(), status: 'harvested' }} isPendingSync={true} />
              ))}

              {batches.map(b => <BatchCard key={b.id} batch={b} />)}

              {batches.length === 0 && pendingCount === 0 && (
                <div className="px-6 py-12 text-center text-[#888780] text-[14px]">
                  No batches recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
