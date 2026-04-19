/** @module ErrorMessage */
import { useTranslation } from 'react-i18next';

export default function ErrorMessage({ message }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mb-4">
      {message}
    </div>
  );
}
