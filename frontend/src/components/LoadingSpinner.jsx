/** @module LoadingSpinner */
import { useTranslation } from 'react-i18next';

export default function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      <span className="ml-2 text-gray-500">{t('common.loading')}</span>
    </div>
  );
}
