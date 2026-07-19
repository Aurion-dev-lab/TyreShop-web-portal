import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiTruck, FiSearch, FiCalendar } from 'react-icons/fi';

const TyreExportsPage = () => {
  const { exportRecords = [] } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExports = useMemo(() => {
    return exportRecords.filter(exp => {
      const company = (exp.company || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return company.includes(query);
    });
  }, [exportRecords, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiTruck className="text-emerald-500" /> Tyre Exports Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">View all export records and company shipments</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Company name..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Export Date</th>
                <th className="px-6 py-4 text-right">Price per Tyre</th>
                <th className="px-6 py-4 text-center">Tyres Exported</th>
                <th className="px-6 py-4 text-right">Total Shipment Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExports.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                    {exp.company || 'Unknown Company'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {exp.export_date || exp.date || exp.createdAt?.split('T')[0] || '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Rs. {(parseFloat(exp.comp_price) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    {exp.tyres || 0} units
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                    Rs. {(parseFloat(exp.total_amount) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredExports.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No export records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TyreExportsPage;
