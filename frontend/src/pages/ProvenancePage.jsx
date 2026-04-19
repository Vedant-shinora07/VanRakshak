import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProvenance, verifyChain } from '../api';
import CustodyTimeline from '../components/CustodyTimeline';
import VolumeFlagAlert from '../components/VolumeFlagAlert';
import PermitBadge from '../components/PermitBadge';
import StatusBadge from '../components/StatusBadge';

export default function ProvenancePage() {
  const { batchId } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    i18n.changeLanguage('en');
    const fetchProv = async () => {
      try {
        const res = await getProvenance(batchId);
        setData(res);
      } catch (e) {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    if (batchId) fetchProv();
  }, [batchId, i18n, t]);

  const handleVerify = async () => {
    try {
      const res = await verifyChain(batchId);
      setVerifyResult(res);
    } catch (e) {
      alert(t('common.error'));
    }
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'gu' : 'en');

  if (loading) return (
    <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center">
      <div className="text-[#888780] text-[15px]">{t('common.loading')}</div>
    </div>
  );

  if (error || !data || !data.batchData) return (
    <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center">
      <div className="text-[#A32D2D] text-[15px] font-medium">{error || 'Batch not found'}</div>
    </div>
  );

  const { batchData: batch, provenance: events } = data;
  const hasAnomaly = events.some(e => e.event_type === 'ANOMALY_FLAG');

  return (
    <div className="min-h-screen bg-[#F1EFE8]">
      {/* Header */}
      <header className="bg-[#085041] text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#E1F5EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <span className="font-bold tracking-widest uppercase text-[15px]">VanRakshak</span>
        </div>
        <button onClick={toggleLang} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors">
          {i18n.language === 'en' ? 'EN' : 'ગુ'} | {i18n.language === 'en' ? 'ગુ' : 'EN'}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Page Title */}
        <h2 className="text-2xl font-semibold text-[#444441] mb-6">{t('provenance.title')}</h2>

        {/* Anomaly Alert */}
        {hasAnomaly && (
          <div className="mb-6 border-l-4 border-l-[#A32D2D] bg-[#FDF5F5] rounded-r-xl overflow-hidden border border-[#FAD6D6]">
            <VolumeFlagAlert receivedKg="?" dispatchedKg="?" onForceDispatch={() => {}} />
          </div>
        )}

        {/* Product Summary Card */}
        <div className="bg-white rounded-xl border border-[#D3D1C7] p-6 mb-6">
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-xl font-semibold text-[#444441]">{t(`product.${batch.product_type}`)}</h3>
            <StatusBadge status={batch.status} />
          </div>
          <div className="grid grid-cols-2 gap-5 text-[14px]">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('harvest.permit')}</p>
              <PermitBadge permitNumber={batch.permit_number} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('provenance.quantity')}</p>
              <p className="font-semibold text-[#444441]">{batch.quantity_kg} kg</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('harvest.date')}</p>
              <p className="font-semibold text-[#444441]">{new Date(batch.harvest_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Chain Integrity Card */}
        <div className="bg-white rounded-xl border border-[#D3D1C7] p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#444441]">Chain Integrity</h3>
            <button
              onClick={handleVerify}
              className="bg-[#0F6E56] hover:bg-[#085041] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              Verify Blockchain
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {verifyResult && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              verifyResult.isValid
                ? 'bg-[#E1F5EE] border border-[#1D9E75]/30 text-[#085041]'
                : 'bg-[#FDF5F5] border border-[#FAD6D6] text-[#A32D2D]'
            }`}>
              {verifyResult.isValid ? (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span className="text-[14px] font-semibold">
                {verifyResult.isValid
                  ? `✓ All ${verifyResult.totalBlocks} blocks verified — chain intact`
                  : `⚠ Tampered block detected at block #${verifyResult.tamperedAt}`
                }
              </span>
            </div>
          )}
        </div>

        {/* Custody Timeline */}
        <div className="bg-white rounded-xl border border-[#D3D1C7] p-6">
          <h3 className="text-lg font-semibold text-[#444441] mb-2">Chain of Custody</h3>
          <CustodyTimeline events={events} language={i18n.language} />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[12px] text-[#888780] pb-8">
          Scan the QR code on product packaging to view this page
        </div>
      </main>
    </div>
  );
}
