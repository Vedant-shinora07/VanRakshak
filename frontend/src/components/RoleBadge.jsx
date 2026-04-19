/** @module RoleBadge */
export default function RoleBadge({ role }) {
  const colors = {
    harvester: 'bg-green-100 text-green-800',
    depot_manager: 'bg-blue-100 text-blue-800',
    trader: 'bg-yellow-100 text-yellow-800',
    end_buyer: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  };
  
  const colorClass = colors[role] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colorClass}`}>
      {role.replace('_', ' ')}
    </span>
  );
}
