import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiFileText, FiSearch, FiCalendar } from 'react-icons/fi';

const InvoicesPage = () => {
  const { salesInvoices = [] } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter(inv => {
      const id = (inv.invoice_id || inv.id || '').toLowerCase();
      const customer = (inv.customer || '').toLowerCase();
      const type = (inv.type || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return id.includes(query) || customer.includes(query) || type.includes(query);
    });
  }, [salesInvoices, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiFileText className="text-emerald-500" /> Invoices & Billing
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">View all invoice transactions and sales logs</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice ID, Customer name or Type..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                    {inv.invoice_id || inv.id?.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {inv.invoice_date || inv.createdAt?.split('T')[0] || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {inv.customer || 'Walk-in Customer'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-full uppercase border border-slate-200">
                      {inv.type || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      inv.status?.toLowerCase() === 'completed' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {inv.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-800">
                    Rs. {(parseFloat(inv.grand_total) || parseFloat(inv.grandTotal) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No invoice transactions found.
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

export default InvoicesPage;
