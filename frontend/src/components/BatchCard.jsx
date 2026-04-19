import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import PermitBadge from './PermitBadge';

export default function BatchCard({ batch, isPendingSync }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4 relative overflow-hidden transition-colors hover:border-[#0F6E56]/30">
      {isPendingSync && (
        <div className="absolute top-0 right-0 bg-[#EF9F27] text-white text-[11px] px-3 py-1 rounded-bl-xl font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          {t('harvest.pending')}
        </div>
      )}
      {!isPendingSync && batch.blockchain_tx_hash && (
        <div className="absolute top-0 right-0 bg-[#1D9E75] text-white text-[11px] px-3 py-1 rounded-bl-xl font-mono font-medium">
          ✓ {t('harvest.on_chain')}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3 mt-2">
        <h4 className="text-lg font-semibold text-[#444441]">{t(`product.${batch.product_type}`)}</h4>
        <StatusBadge status={batch.status} />
      </div>
      <div className="text-[14px] text-[#888780] mb-3">
        <span className="font-semibold text-[#444441]">{batch.quantity_kg} kg</span> • {new Date(batch.harvest_date).toLocaleDateString()}
      </div>
      <div className="mb-3">
        <PermitBadge permitNumber={batch.permit_number} isActive={true} />
      </div>
      {batch.blockchain_tx_hash && (
        <div className="text-[12px] text-[#888780] font-mono truncate">
          {t('chain.tx_hash')}: {batch.blockchain_tx_hash}
        </div>
      )}
      {batch.batch_id && (
        <div className="text-[12px] text-[#888780] font-mono mt-1">
          ID: {batch.batch_id.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}
