export default function PermitBadge({ permitNumber, isActive = true }) {
  return (
    <span className={`px-2.5 py-1 inline-flex text-[12px] leading-5 font-mono font-medium rounded-lg ${
      isActive
        ? 'bg-[#E1F5EE] text-[#085041] border border-[#1D9E75]/30'
        : 'bg-[#FDF5F5] text-[#A32D2D] border border-[#FAD6D6]'
    }`}>
      {permitNumber}
    </span>
  );
}
