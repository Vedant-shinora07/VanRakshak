import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProvenance } from '../api';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import CustodyTimeline from '../components/CustodyTimeline';
import StatusBadge from '../components/StatusBadge';
import PermitBadge from '../components/PermitBadge';

export default function BuyerScanPage() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('scan');
  const [batchIdInput, setBatchIdInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProv = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProvenance(id);
      if (!res.batchData) throw new Error('Not found');
      setData(res);
    } catch (e) {
      setError('Batch not found or error loading provenance');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (url) => {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      const id = parts[parts.length - 1];
      if (id) fetchProv(id);
    } catch (e) {
      fetchProv(url); // maybe just the id was scanned
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (batchIdInput) fetchProv(batchIdInput);
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'gu' : 'en');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors">
            {i18n.language === 'en' ? 'EN' : 'ગુ'} | {i18n.language === 'en' ? 'ગુ' : 'EN'}
          </button>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl border border-[#D3D1C7] p-1 flex">
            <button
              onClick={() => setMode('scan')}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'scan'
                  ? 'bg-[#0F6E56] text-white shadow-sm'
                  : 'text-[#888780] hover:text-[#444441]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan QR
            </button>
            <button
              onClick={() => setMode('enter')}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'enter'
                  ? 'bg-[#0F6E56] text-white shadow-sm'
                  : 'text-[#888780] hover:text-[#444441]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Enter Batch ID
            </button>
          </div>
        </div>

        {/* Scan / Input Section */}
        {!data && (
          <div className="bg-white rounded-xl border border-[#D3D1C7] overflow-hidden">
            {mode === 'scan' ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#444441] mb-4 text-center">Point your camera at the QR code</h3>
                <QRScanner onScanSuccess={handleScanSuccess} onScanError={() => {}} />
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#444441] mb-4 text-center">Enter Batch ID</h3>
                <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
                  <input
                    type="text"
                    value={batchIdInput}
                    onChange={e => setBatchIdInput(e.target.value)}
                    placeholder="Enter Batch ID (UUID)"
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors shadow-sm"
                  >
                    View Provenance
                  </button>
                </form>
              </div>
            )}
            {loading && (
              <div className="px-6 pb-6 text-center text-[#888780] text-[14px]">{t('common.loading')}</div>
            )}
            {error && (
              <div className="px-6 pb-6 text-center text-[#A32D2D] text-[14px] font-medium">{error}</div>
            )}
          </div>
        )}

        {/* Results */}
        {data && data.batchData && (
          <div className="space-y-6">
            <button
              onClick={() => setData(null)}
              className="text-[#0F6E56] hover:text-[#085041] text-[14px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Scan another
            </button>

            {/* Product Summary */}
            <div className="bg-white rounded-xl border border-[#D3D1C7] p-6">
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-xl font-semibold text-[#444441]">{t(`product.${data.batchData.product_type}`)}</h3>
                <StatusBadge status={data.batchData.status} />
              </div>
              <div className="grid grid-cols-2 gap-5 text-[14px]">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('harvest.permit')}</p>
                  <PermitBadge permitNumber={data.batchData.permit_number} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('provenance.quantity')}</p>
                  <p className="font-semibold text-[#444441]">{data.batchData.quantity_kg} kg</p>
                </div>
              </div>
            </div>

            {/* Custody Timeline */}
            <div className="bg-white rounded-xl border border-[#D3D1C7] p-6">
              <h3 className="text-lg font-semibold text-[#444441] mb-2">Chain of Custody</h3>
              <CustodyTimeline events={data.provenance} language={i18n.language} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
