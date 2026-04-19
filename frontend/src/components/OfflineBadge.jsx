import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useTranslation } from 'react-i18next';

export default function OfflineBadge() {
  const { isOnline, pendingCount } = useOfflineQueue();
  const { t } = useTranslation();

  if (isOnline && pendingCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="bg-yellow-500 text-white text-center py-1 text-sm font-semibold">
        ● {t('common.offline')} — {pendingCount} {t('common.pending_sync')}
      </div>
    );
  }

  if (isOnline && pendingCount > 0) {
    return (
      <div className="bg-blue-500 text-white text-center py-1 text-sm font-semibold">
        ● {t('chain.syncing')}...
      </div>
    );
  }

  return null;
}
