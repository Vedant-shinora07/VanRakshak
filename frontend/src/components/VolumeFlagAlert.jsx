import { useTranslation } from 'react-i18next';

export default function VolumeFlagAlert({ receivedKg, dispatchedKg, onForceDispatch }) {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 bg-[#A32D2D] rounded-full flex items-center justify-center text-white shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#A32D2D] mb-1">⚠ {t('depot.anomaly_warning')}</h3>
          <p className="text-[14px] text-[#444441] leading-relaxed">
            Volume discrepancy detected. Review the figures below before proceeding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-[#D3D1C7]">
          <p className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1">{t('depot.received_kg')}</p>
          <p className="text-2xl font-bold text-[#0F6E56]">{receivedKg} kg</p>
        </div>
        <div className="bg-[#FDF5F5] rounded-lg p-4 border border-[#FAD6D6]">
          <p className="text-[11px] uppercase tracking-widest text-[#A32D2D] font-bold mb-1">{t('depot.dispatched_kg')}</p>
          <p className="text-2xl font-extrabold text-[#A32D2D]">{dispatchedKg} kg</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onForceDispatch}
          className="bg-[#A32D2D] hover:bg-[#791F1F] text-white rounded-lg px-6 py-2.5 text-[14px] font-semibold transition-colors"
        >
          {t('depot.force_dispatch')}
        </button>
      </div>
    </div>
  );
}
