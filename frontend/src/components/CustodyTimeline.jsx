import React from 'react';
import { useTranslation } from 'react-i18next';
import ChainVerifyBadge from './ChainVerifyBadge';

const eventIcons = {
  harvested: '🌿',
  received: '🏭',
  dispatched: '🚛',
  transported: '🔄',
  delivered: '✅',
  ANOMALY_FLAG: '⚠'
};

export default function CustodyTimeline({ events, language }) {
  const { t } = useTranslation();

  if (!events || events.length === 0) return null;

  return (
    <div className="relative ml-4 md:ml-8 mt-8">
      {/* Vertical Line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#0F6E56]/40 to-[#0F6E56]/5 rounded-full"></div>

      {events.map((event, idx) => {
        const isAnomaly = event.event_type === 'ANOMALY_FLAG';
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id || idx} className={`relative pl-12 ${isLast ? '' : 'pb-8'}`}>
            {/* Timeline Dot */}
            <div className={`absolute left-[10px] top-2 w-3 h-3 rounded-full z-10 ring-4 ${
              isAnomaly
                ? 'bg-[#A32D2D] ring-[#FDF5F5]'
                : 'bg-[#0F6E56] ring-[#E1F5EE]'
            }`}></div>

            {/* Event Card */}
            <div className={`rounded-xl border p-5 transition-colors ${
              isAnomaly
                ? 'bg-[#FDF5F5] border-[#FAD6D6]'
                : 'bg-white border-[#D3D1C7] hover:border-[#0F6E56]/30'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`text-[11px] uppercase tracking-widest font-bold mb-1 ${
                    isAnomaly ? 'text-[#A32D2D]' : 'text-[#0F6E56]'
                  }`}>
                    {eventIcons[event.event_type] || '📌'} {t(`event.${event.event_type}`)}
                  </p>
                  <p className="text-[12px] text-[#888780]">
                    {new Date(event.timestamp).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN')}
                  </p>
                </div>
                <ChainVerifyBadge txHash={event.blockchain_tx_hash} blockHash={event.block_hash} />
              </div>

              <div className="space-y-1.5 text-[14px] text-[#444441]">
                <p><span className="font-semibold">{t('provenance.quantity')}:</span> {event.quantity_kg} kg</p>
                <p><span className="font-semibold">{t('provenance.location')}:</span> {event.location}</p>
                <p><span className="font-semibold">Actor:</span> {event.actor_name} <span className="text-[#888780]">({event.actor_role})</span></p>
                {event.notes && <p><span className="font-semibold">Notes:</span> {event.notes}</p>}

                {event.authority_name && (
                  <p className="text-[#1D9E75] font-semibold mt-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {t('provenance.verified_by')} {event.authority_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
