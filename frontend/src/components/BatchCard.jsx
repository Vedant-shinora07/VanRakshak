import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PermitBadge from './PermitBadge';

export default function BatchCard({ batch, isPendingSync }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => batch.batch_id && setIsExpanded(!isExpanded)}
      className={`bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4 relative overflow-hidden transition-all duration-300 ${batch.batch_id ? 'hover:border-[#0F6E56] hover:shadow-md cursor-pointer' : ''}`}
    >
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
        <h4 className="text-lg font-semibold text-[#444441] flex items-center gap-2">
          {t(`product.${batch.product_type}`)}
          {batch.batch_id && (
            <svg className={`w-4 h-4 text-[#888780] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </h4>
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
        <div className="text-[12px] text-[#888780] font-mono mt-1 break-all">
          ID: {batch.batch_id}
        </div>
      )}

      {/* Expanded Details Section */}
      {isExpanded && batch.batch_id && (
        <div className="mt-4 pt-4 border-t border-[#D3D1C7] space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            {batch.harvester_name && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-0.5">Harvester</p>
                <p className="text-[13px] font-medium text-[#444441]">{batch.harvester_name}</p>
              </div>
            )}
            {batch.block_name && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-0.5">Block Name</p>
                <p className="text-[13px] font-medium text-[#444441]">{batch.block_name}</p>
              </div>
            )}
            {batch.gps_lat && batch.gps_lng && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-0.5">GPS Coordinates</p>
                <p className="text-[13px] font-mono text-[#444441]">
                  {batch.gps_lat}, {batch.gps_lng}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
