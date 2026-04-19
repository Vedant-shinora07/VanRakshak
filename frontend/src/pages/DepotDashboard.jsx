import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { receiveShipment, dispatchShipment, getDepotFlags } from '../api';
import VolumeFlagAlert from '../components/VolumeFlagAlert';
import ConfirmModal from '../components/ConfirmModal';

export default function DepotDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('receive');
  const [flags, setFlags] = useState([]);
  const [anomaly, setAnomaly] = useState(null);
  const [pendingDispatchData, setPendingDispatchData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const receiveForm = useForm();
  const dispatchForm = useForm();

  const loadFlags = async () => {
    try {
      const data = await getDepotFlags();
      setFlags(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (tab === 'flags') loadFlags();
  }, [tab]);

  const onReceive = async (data) => {
    try {
      await receiveShipment(data);
      alert('Received');
      receiveForm.reset();
    } catch (e) { alert(t('common.error')); }
  };

  const onDispatch = async (data) => {
    try {
      await dispatchShipment(data);
      alert('Dispatched');
      dispatchForm.reset();
      setAnomaly(null);
    } catch (e) {
      if (e.response?.status === 409) {
        setAnomaly(e.response.data.details);
        setPendingDispatchData(data);
      } else {
        alert(t('common.error'));
      }
    }
  };

  const handleForceDispatch = async () => {
    try {
      await dispatchShipment({ ...pendingDispatchData, force: true });
      alert('Force Dispatched');
      dispatchForm.reset();
      setAnomaly(null);
      setShowConfirm(false);
    } catch (e) { alert(t('common.error')); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-semibold text-[#444441]">Depot Management</h1>
        <p className="text-[#888780] text-[15px] mt-1">Manage incoming shipments and handle outbound dispatch.</p>
      </div>

      {/* Main Card Wrapper */}
      <div className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden shadow-sm">
        
        {/* TABS */}
        <div className="flex border-b border-[#D3D1C7] bg-[#F1EFE8]">
          <button 
            onClick={() => setTab('receive')} 
            className={`px-6 py-4 text-[14px] font-semibold transition-colors flex items-center gap-2
              ${tab === 'receive' ? 'bg-white border-b-2 border-[#0F6E56] text-[#0F6E56]' : 'text-[#888780] hover:text-[#444441] hover:bg-[#E1F5EE]/50'}
            `}
          >
            {t('depot.tab_receive')}
          </button>
          <button 
            onClick={() => setTab('dispatch')} 
            className={`px-6 py-4 text-[14px] font-semibold transition-colors flex items-center gap-2
              ${tab === 'dispatch' ? 'bg-white border-b-2 border-[#0F6E56] text-[#0F6E56]' : 'text-[#888780] hover:text-[#444441] hover:bg-[#E1F5EE]/50'}
            `}
          >
            {t('depot.tab_dispatch')}
          </button>
          <button 
            onClick={() => setTab('flags')} 
            className={`px-6 py-4 text-[14px] font-semibold transition-colors flex items-center gap-2
              ${tab === 'flags' ? 'bg-white border-b-2 border-[#0F6E56] text-[#0F6E56]' : 'text-[#888780] hover:text-[#444441] hover:bg-[#E1F5EE]/50'}
            `}
          >
            {t('depot.tab_flags')}
            {flags.length > 0 && (
              <span className="ml-1.5 bg-[#A32D2D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {flags.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-8">
          
          {/* TAB: RECEIVE */}
          {tab === 'receive' && (
            <div className="max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-[#444441] mb-6">{t('depot.receive_title')}</h2>
              <form onSubmit={receiveForm.handleSubmit(onReceive)} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.batch_id')}</label>
                  <input type="text" placeholder="e.g. 0x8F92A..." {...receiveForm.register('batchId')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.quantity')}</label>
                  <input type="number" step="0.01" placeholder="0.00" {...receiveForm.register('quantityKg')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.location')}</label>
                  <input type="text" placeholder="Storage Zone A" {...receiveForm.register('location')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <button type="submit" className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors mt-2 shadow-sm">
                  {t('depot.submit')}
                </button>
              </form>
            </div>
          )}

          {/* TAB: DISPATCH */}
          {tab === 'dispatch' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-[#444441] mb-6">{t('depot.dispatch_title')}</h2>
              
              {anomaly && (
                <div className="mb-8 border-l-4 border-l-[#A32D2D] bg-[#FDF5F5] rounded-r-xl overflow-hidden shadow-sm">
                  <VolumeFlagAlert 
                    receivedKg={anomaly.totalReceived} 
                    dispatchedKg={anomaly.totalDispatched} 
                    onForceDispatch={() => setShowConfirm(true)} 
                  />
                </div>
              )}
              
              <form onSubmit={dispatchForm.handleSubmit(onDispatch)} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.batch_id')}</label>
                  <input type="text" placeholder="e.g. 0x8F92A..." {...dispatchForm.register('batchId')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.quantity')}</label>
                  <input type="number" step="0.01" placeholder="0.00" {...dispatchForm.register('quantityKg')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('depot.location')}</label>
                  <input type="text" placeholder="Transit Hub B" {...dispatchForm.register('location')} className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-all placeholder:text-[#D3D1C7]" />
                </div>
                <button type="submit" className="w-full bg-[#EF9F27] hover:bg-[#D98A1B] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors mt-2 shadow-sm">
                  {t('depot.submit')}
                </button>
              </form>
            </div>
          )}

          {/* TAB: FLAGS */}
          {tab === 'flags' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#444441]">{t('depot.flags_title')}</h2>
                  <p className="text-[13px] text-[#888780] mt-1">Review volume discrepancies</p>
                </div>
              </div>

              <div className="border border-[#D3D1C7] rounded-xl overflow-hidden bg-white">
                <table className="min-w-full divide-y divide-[#D3D1C7]">
                  <thead className="bg-[#085041]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">{t('depot.batch_id')}</th>
                      <th className="px-6 py-4 text-right text-[12px] font-bold text-white uppercase tracking-wider">{t('depot.received_kg')}</th>
                      <th className="px-6 py-4 text-right text-[12px] font-bold text-white uppercase tracking-wider">{t('depot.dispatched_kg')}</th>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider pl-8">{t('depot.flagged_at')}</th>
                      <th className="px-6 py-4 text-center text-[12px] font-bold text-white uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3D1C7]">
                    {flags.map((f, i) => (
                      <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1EFE8]'}>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-mono truncate max-w-[200px]">{f.batch_id}</td>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-semibold text-right">{f.received_kg}</td>
                        <td className="px-6 py-4 text-[13px] text-[#A32D2D] font-bold text-right">{f.dispatched_kg}</td>
                        <td className="px-6 py-4 text-[13px] text-[#888780] pl-8">{new Date(f.flagged_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          {f.status === 'open' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FDF5F5] text-[#A32D2D] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#FAD6D6]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A32D2D] animate-pulse"></span>
                              Open
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-bold uppercase tracking-wider rounded-full">
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {flags.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-[#888780] text-[14px]">
                          No anomalies detected.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal 
          title={t('depot.anomaly_warning')} 
          message="Are you sure you want to force dispatch this shipment? The volume discrepancy will be recorded permanently." 
          onConfirm={handleForceDispatch} 
          onCancel={() => setShowConfirm(false)} 
        />
      )}
    </div>
  );
}
