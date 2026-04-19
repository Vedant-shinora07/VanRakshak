import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  
  const colors = {
    harvested: 'bg-[#D3D1C7] text-[#2C2C2A]',
    in_transit: 'bg-[#E6F1FB] text-[#0C447C]',
    at_depot: 'bg-[#FAEEDA] text-[#633806]',
    dispatched: 'bg-[#FAECE7] text-[#712B13]',
    delivered: 'bg-[#E1F5EE] text-[#085041]'
  };

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-[11px] leading-5 font-medium rounded-full ${colors[status] || 'bg-[#D3D1C7] text-[#2C2C2A]'}`}>
      {t(`status.${status}`) || status}
    </span>
  );
}
