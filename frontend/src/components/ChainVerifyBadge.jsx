import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ChainVerifyBadge({ txHash, blockHash }) {
  const { t } = useTranslation();

  if (txHash) {
    const displayHash = `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 6)}`;
    return (
      <span title={`Tx: ${txHash}\nBlock: ${blockHash}`} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#1D9E75] text-white cursor-help">
        ✓ {t('chain.on_chain')} <span>{displayHash}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EF9F27] text-white">
      ⏳ {t('chain.syncing')}
    </span>
  );
}
