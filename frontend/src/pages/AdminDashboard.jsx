import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getUsers, createUser, createPermit, getAdminFlags, getAdminAudit } from '../api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('users');
  const [data, setData] = useState([]);
  const [auditData, setAuditData] = useState(null);
  
  const userForm = useForm();
  const permitForm = useForm();
  const [auditPermit, setAuditPermit] = useState('');

  const loadData = async () => {
    try {
      if (tab === 'users') setData(await getUsers());
      if (tab === 'flags') setData(await getAdminFlags());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, [tab]);

  const onAddUser = async (d) => {
    try { await createUser({...d, secretCode: 'ADMIN_SECRET_HACKATHON'}); userForm.reset(); loadData(); } catch (e) { alert(t('common.error') + ': ' + (e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || e.message)); }
  };

  const onRegisterPermit = async (d) => {
    try { await createPermit(d); permitForm.reset(); alert('Permit created'); } catch (e) { alert(t('common.error') + ': ' + (e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || e.message)); }
  };

  const runAudit = async () => {
    try { setAuditData(await getAdminAudit(auditPermit)); } catch (e) { alert(t('common.error') + ': ' + (e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || e.message)); }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'harvester': return 'bg-[#E1F5EE] text-[#085041]';
      case 'depot_manager': return 'bg-[#E6F1FB] text-[#0C447C]';
      case 'trader': return 'bg-[#FAEEDA] text-[#633806]';
      case 'admin': return 'bg-[#EEEDFE] text-[#3C3489]';
      case 'end_buyer': return 'bg-[#FAECE7] text-[#712B13]';
      default: return 'bg-[#D3D1C7] text-[#2C2C2A]';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#444441]">Administration Panel</h1>
        <p className="text-[#888780] text-[15px] mt-1">Manage users, permits, anomaly flags, and run blockchain audits.</p>
      </div>

      {/* Main Card Wrapper */}
      <div className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">

        {/* TABS */}
        <div className="flex border-b border-[#D3D1C7] bg-[#F1EFE8]">
          {['users', 'permits', 'flags', 'audit'].map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-6 py-4 text-[14px] font-semibold transition-colors relative
                ${tab === tabKey
                  ? 'bg-white border-b-2 border-[#0F6E56] text-[#0F6E56]'
                  : 'text-[#888780] hover:text-[#444441] hover:bg-[#E1F5EE]/50'
                }
              `}
            >
              {t(`admin.tab_${tabKey}`)}
            </button>
          ))}
        </div>

        <div className="p-8">

          {/* ═══ TAB: USERS ═══ */}
          {tab === 'users' && (
            <div className="space-y-8">
              {/* Add User Form */}
              <div className="bg-[#F1EFE8] rounded-xl p-6 border border-[#D3D1C7]">
                <h3 className="text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-4">{t('admin.add_user')}</h3>
                <form onSubmit={userForm.handleSubmit(onAddUser)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Phone"
                    {...userForm.register('phone')}
                    className="border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                  <input
                    placeholder="PIN"
                    type="password"
                    {...userForm.register('pin')}
                    className="border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                  <input
                    placeholder="Name"
                    {...userForm.register('name')}
                    className="border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                  <select
                    {...userForm.register('role')}
                    className="border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="harvester">Harvester</option>
                    <option value="depot_manager">Depot Manager</option>
                    <option value="trader">Trader</option>
                    <option value="end_buyer">End Buyer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-colors"
                  >
                    {t('admin.add_user')}
                  </button>
                </form>
              </div>

              {/* Users Table */}
              <div className="border border-[#D3D1C7] rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-[#D3D1C7]">
                  <thead className="bg-[#085041]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3D1C7]">
                    {data.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1EFE8]'}>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-[13px] text-[#888780] font-mono">{u.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr><td colSpan="3" className="px-6 py-12 text-center text-[#888780] text-[14px]">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ TAB: PERMITS ═══ */}
          {tab === 'permits' && (
            <div className="max-w-lg">
              <h2 className="text-lg font-semibold text-[#444441] mb-6">{t('admin.register_permit')}</h2>
              <form onSubmit={permitForm.handleSubmit(onRegisterPermit)} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">{t('admin.permit_number')}</label>
                  <input
                    placeholder="PERMIT-GJ-2024-XXX"
                    {...permitForm.register('permitNumber')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Block Name</label>
                  <input
                    placeholder="Dandeli Block A"
                    {...permitForm.register('blockName')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Issued To (User ID)</label>
                  <input
                    placeholder="User ID"
                    type="number"
                    {...permitForm.register('issuedToUserId')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Product Type</label>
                  <select
                    {...permitForm.register('productType')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="tendu_leaves">Tendu Leaves</option>
                    <option value="timber">Timber</option>
                    <option value="bamboo">Bamboo</option>
                    <option value="medicinal_herbs">Medicinal Herbs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Licensed Quantity (kg)</label>
                  <input
                    placeholder="500"
                    type="number"
                    step="0.01"
                    {...permitForm.register('licensedQuantityKg')}
                    className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Issue Date</label>
                    <input
                      type="date"
                      {...permitForm.register('issueDate')}
                      className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#888780] font-bold mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      {...permitForm.register('expiryDate')}
                      className="w-full border border-[#D3D1C7] rounded-lg px-4 py-2.5 text-[14px] text-[#444441] focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg px-4 py-3 text-[14px] font-semibold transition-colors shadow-sm"
                >
                  {t('admin.register_permit')}
                </button>
              </form>
            </div>
          )}

          {/* ═══ TAB: FLAGS ═══ */}
          {tab === 'flags' && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#444441]">{t('admin.tab_flags')}</h2>
                  <p className="text-[13px] text-[#888780] mt-1">All volume anomaly flags across depots</p>
                </div>
              </div>
              <div className="border border-[#D3D1C7] rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-[#D3D1C7]">
                  <thead className="bg-[#085041]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-4 text-left text-[12px] font-bold text-white uppercase tracking-wider">Depot Manager</th>
                      <th className="px-6 py-4 text-right text-[12px] font-bold text-white uppercase tracking-wider">Received</th>
                      <th className="px-6 py-4 text-right text-[12px] font-bold text-white uppercase tracking-wider">Dispatched</th>
                      <th className="px-6 py-4 text-center text-[12px] font-bold text-white uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3D1C7]">
                    {data.map((f, i) => (
                      <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1EFE8]'}>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-mono truncate max-w-[200px]">{f.batch_id}</td>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-medium">{f.flagged_by_name}</td>
                        <td className="px-6 py-4 text-[13px] text-[#444441] font-semibold text-right">{f.total_received_kg}</td>
                        <td className="px-6 py-4 text-[13px] text-[#A32D2D] font-bold text-right">{f.total_dispatched_kg}</td>
                        <td className="px-6 py-4 text-center">
                          {f.status === 'open' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FDF5F5] text-[#A32D2D] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#FAD6D6]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A32D2D] animate-pulse"></span>
                              Open
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-bold uppercase tracking-wider rounded-full">
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-[#888780] text-[14px]">No flags found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ TAB: AUDIT ═══ */}
          {tab === 'audit' && (
            <div className="space-y-8">
              {/* Audit Search */}
              <div className="bg-[#F1EFE8] rounded-xl p-6 border border-[#D3D1C7] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888780]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <input
                    value={auditPermit}
                    onChange={e => setAuditPermit(e.target.value)}
                    placeholder={t('admin.permit_number')}
                    className="w-full pl-12 pr-4 py-3 border border-[#D3D1C7] rounded-lg text-[14px] text-[#444441] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent bg-white placeholder:text-[#D3D1C7]"
                  />
                </div>
                <button
                  onClick={runAudit}
                  className="bg-[#0F6E56] hover:bg-[#085041] text-white px-8 py-3 rounded-lg text-[14px] font-semibold transition-colors shadow-sm flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  {t('admin.run_audit')}
                </button>
              </div>

              {/* Audit Results */}
              {auditData && (
                <div className="space-y-6">
                  {/* Permit Header */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#444441]">Results for</h3>
                    <span className="font-mono text-lg font-bold text-[#0F6E56]">{auditData.permitNumber}</span>
                  </div>

                  {/* Batch Audit Cards */}
                  {auditData.batches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {auditData.batches.map(b => (
                        <div
                          key={b.batchId}
                          className={`rounded-xl border p-5 ${
                            b.isValid
                              ? 'bg-[#E1F5EE] border-[#1D9E75]/30'
                              : 'bg-[#FDF5F5] border-[#A32D2D]/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-mono text-[12px] text-[#5F5E5A]">{b.batchId}</span>
                            {b.isValid ? (
                              <span className="bg-[#1D9E75] text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">✓ Valid</span>
                            ) : (
                              <span className="bg-[#A32D2D] text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">✗ Tampered</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {b.isValid ? (
                              <svg className="w-5 h-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-[#A32D2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <span className={`text-[14px] font-semibold ${b.isValid ? 'text-[#085041]' : 'text-[#A32D2D]'}`}>
                              {b.isValid ? 'Chain Valid' : 'Chain Tampered'}
                            </span>
                            <span className="text-[12px] text-[#888780] ml-auto">{b.totalBlocks} blocks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#888780] bg-[#F1EFE8] rounded-xl border border-[#D3D1C7]">
                      No batches have been registered for this permit yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
