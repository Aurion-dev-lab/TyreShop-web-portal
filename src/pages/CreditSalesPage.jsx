import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiCreditCard, FiSearch, FiCalendar } from 'react-icons/fi';

const CreditSalesPage = () => {
  const { creditSales = [] } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCreditSales = useMemo(() => {
    return creditSales.filter(cs => {
      const customer = (cs.customer_name || cs.customerName || '').toLowerCase();
      const status = (cs.status || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return customer.includes(query) || status.includes(query);
    });
  }, [creditSales, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiCreditCard className="text-emerald-500" /> Credit Sales Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Track credit transactions and outstanding customer balances</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer name or Status..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Sale Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Credit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCreditSales.map((cs) => (
                <tr key={cs.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                    {cs.customer_name || cs.customerName || 'Unknown Customer'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {cs.sale_date || cs.date || cs.created_at?.split('T')[0] || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      cs.status?.toLowerCase() === 'settled' || cs.status?.toLowerCase() === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                    }`}>
                      {cs.status || 'UNPAID'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-850">
                    Rs. {(parseFloat(cs.amount) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredCreditSales.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No credit sales transactions found.
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

export default CreditSalesPage;
