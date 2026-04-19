import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { addTransport, deliverBatch, getTraderBatches } from '../api';
import BatchCard from '../components/BatchCard';

export default function TraderDashboard() {
  const { t } = useTranslation();
  const tForm = useForm();
  const dForm = useForm();
  const [batches, setBatches] = useState([]);

  const loadBatches = async () => {
    try { setBatches(await getTraderBatches()); } catch (e) { console.error(e); }
  };

  useEffect(() => { loadBatches(); }, []);

  const onTransport = async (data) => {
    try { await addTransport(data); tForm.reset(); loadBatches(); } catch (e) { alert(t('common.error')); }
  };

  const onDeliver = async (data) => {
    try { await deliverBatch(data); dForm.reset(); loadBatches(); } catch (e) { alert(t('common.error')); }
  };

  // Derive some simple stats from batches
  const activeCount = batches.filter(b => b.status === 'in_transit' || b.status === 'dispatched').length;
  const deliveredCount = batches.filter(b => b.status === 'delivered').length;
  const pendingCount = batches.filter(b => b.status === 'at_depot').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#444441]">Trader Dashboard</h1>
        <p className="text-[#888780] text-[15px] mt-1">Manage transport documents, confirm deliveries, and track assigned batches.</p>
      </div>

      {/* TOP ROW: Stat Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Shipments */}
        <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#888780] mb-1">Active Shipments</p>
              <p className="text-4xl font-semibold text-[#0C447C]">{activeCount}</p>
            </div>
            <div className="bg-[#E6F1FB] text-[#0C447C] w-10 h-10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-[12px] text-[#888780]">Batches in transit or dispatched</div>
        </div>

        {/* Delivered Today */}
        <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#888780] mb-1">Delivered</p>
              <p className="text-4xl font-semibold text-[#085041]">{deliveredCount}</p>
            </div>
            <div className="bg-[#E1F5EE] text-[#085041] w-10 h-10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-[12px] text-[#888780]">Completed deliveries</div>
        </div>

        {/* Pending Handoff */}
        <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#888780] mb-1">Pending Handoff</p>
              <p className="text-4xl font-semibold text-[#633806]">{pendingCount}</p>
            </div>
            <div className="bg-[#FAEEDA] text-[#633806] w-10 h-10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-[12px] text-[#888780]">Awaiting action</div>
        </div>
      </div>

      {/* MIDDLE ROW: Two Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Add Transport Document */}
        <div className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#D3D1C7] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E1F5EE] text-[#085041] flex items-center justify-center">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#444441]">{t('trader.transport_title')}</h2>
          </div>
          <form onSubmit={tForm.handleSubmit(onTransport)} className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.batch_id')}</label>
              <input
                type="text"
                placeholder="e.g. BATCH-VR-2024-003"
                {...tForm.register('batchId')}
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('trader.doc_hash')}</label>
              <input
                type="text"
                placeholder="SHA-256 transport document hash"
                {...tForm.register('transportDocHash')}
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.location')}</label>
              <input
                type="text"
                placeholder="Gir Forest Checkpost 04"
                {...tForm.register('location')}
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('trader.notes')}</label>
              <textarea
                placeholder="Describe status, weather or road conditions..."
                {...tForm.register('notes')}
                rows="2"
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7] resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {t('common.submit')}
            </button>
          </form>
        </div>

        {/* Right: Mark as Delivered */}
        <div className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#D3D1C7] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] text-[#0C447C] flex items-center justify-center">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#444441]">{t('trader.deliver_title')}</h2>
          </div>
          <form onSubmit={dForm.handleSubmit(onDeliver)} className="p-6 space-y-5 flex flex-col flex-1">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.batch_id')}</label>
              <input
                type="text"
                placeholder="Scan or type Batch ID"
                {...dForm.register('batchId')}
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.location')}</label>
              <input
                type="text"
                placeholder="Surat Distribution Hub"
                {...dForm.register('location')}
                className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
              />
            </div>
            <div className="mt-auto pt-2">
              <button
                type="submit"
                className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {t('common.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* BOTTOM ROW: Batch Table */}
      <div className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#D3D1C7] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#444441]">{t('harvest.my_batches')}</h2>
        </div>

        {batches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#085041]">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider">Batch ID</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider text-right">Quantity</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider">Chain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]">
                {batches.map((b, i) => (
                  <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1EFE8]'}>
                    <td className="px-6 py-4 text-[13px] text-[#444441] font-mono truncate max-w-[180px]">
                      {b.batch_id ? b.batch_id.slice(0, 12) + '...' : '—'}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#444441] font-medium">
                      {t(`product.${b.product_type}`)}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#444441] font-semibold text-right">
                      {b.quantity_kg} kg
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'delivered' && (
                        <span className="px-2.5 py-0.5 bg-[#E1F5EE] text-[#085041] text-[11px] font-medium rounded-full">Delivered</span>
                      )}
                      {b.status === 'in_transit' && (
                        <span className="px-2.5 py-0.5 bg-[#E6F1FB] text-[#0C447C] text-[11px] font-medium rounded-full">In Transit</span>
                      )}
                      {b.status === 'dispatched' && (
                        <span className="px-2.5 py-0.5 bg-[#FAECE7] text-[#712B13] text-[11px] font-medium rounded-full">Dispatched</span>
                      )}
                      {b.status === 'at_depot' && (
                        <span className="px-2.5 py-0.5 bg-[#FAEEDA] text-[#633806] text-[11px] font-medium rounded-full">At Depot</span>
                      )}
                      {b.status === 'harvested' && (
                        <span className="px-2.5 py-0.5 bg-[#D3D1C7] text-[#2C2C2A] text-[11px] font-medium rounded-full">Harvested</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#888780]">
                      {new Date(b.harvest_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {b.blockchain_tx_hash ? (
                        <span className="bg-[#1D9E75] text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">✓ On-chain</span>
                      ) : (
                        <span className="bg-[#EF9F27] text-white text-[11px] px-2.5 py-0.5 rounded-full">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-[#888780] text-[14px]">
            No batches assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}
