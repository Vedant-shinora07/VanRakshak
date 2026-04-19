import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import OfflineBadge from './OfflineBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'gu' : 'en');
  };

  const roleColors = {
    harvester: 'bg-green-100 text-green-800',
    depot_manager: 'bg-blue-100 text-blue-800',
    trader: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  };

  return (
    <>
      <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          <div className="font-bold text-xl text-[#085041] tracking-tight">{t('app.name')}</div>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
            <button onClick={toggleLanguage} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('nav.language')}
            </button>
            <button onClick={logout} className="text-sm text-red-600 font-medium hover:text-red-800">
              {t('nav.logout')}
            </button>
          </div>
        )}
      </nav>
      <OfflineBadge />
    </>
  );
}
