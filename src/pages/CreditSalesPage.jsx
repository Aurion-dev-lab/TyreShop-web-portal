import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiCreditCard, FiSearch, FiFileText } from 'react-icons/fi';

const CreditSalesPage = () => {
  const { creditSales = [], salesInvoices = [] } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('credit'); // 'credit' or 'sales'
  console.log(
    creditSales,
    salesInvoices
  );
  
  const mappedCredits = useMemo(() => {
    return creditSales.map(cs => {
      const partsText = (cs.parts || []).map(p => `${p.description || 'Part'} (x${p.quantity || 1})`).join(', ');
      
      return {
        id: `cs_${cs.id}`,
        invoiceId: cs.credit_id || cs.id,
        customerName: cs.customer_name || 'Unknown Customer',
        items: partsText || '-',
        date: cs.sale_date || cs.created_at?.split('T')[0] || '-',
        status: cs.status || 'UNPAID',
        amount: parseFloat(cs.amount) || 0,
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [creditSales]);

  const mappedSales = useMemo(() => {
    return salesInvoices.map(si => {
      const nestedItems = si.line_items;
      let itemsText = '';
      if (nestedItems && Array.isArray(nestedItems)) {
        itemsText = nestedItems.map(p => `${p.product_name || p.description || 'Item'} (x${p.qty || p.quantity || 1})`).join(', ');
      }

      return {
        id: `si_${si.id}`,
        invoiceId: si.invoice_id || si.id,
        customerName: si.customer || 'Walk-in Customer',
        items: itemsText || '-',
        date: si.invoice_date || si.created_at?.split('T')[0] || '-',
        status: si.status || 'PAID',
        amount: parseFloat(si.grandTotal || si.grand_total || si.amount) || 0,
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [salesInvoices]);

  const displayedData = activeTab === 'credit' ? mappedCredits : mappedSales;

  const filteredData = useMemo(() => {
    return displayedData.filter(item => {
      const customer = (item.customerName || '').toLowerCase();
      const status = (item.status || '').toLowerCase();
      const invoiceId = (item.invoiceId || '').toLowerCase();
      const items = (item.items || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return customer.includes(query) || status.includes(query) || invoiceId.includes(query) || items.includes(query);
    });
  }, [displayedData, searchQuery]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiCreditCard className="text-emerald-500" /> Sales Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Track all sales and credit transactions</p>
      </div>

      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('credit')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'credit'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FiCreditCard />
          Credit Sales
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'sales'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FiFileText />
          Sales Invoices
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer name, ID, Status, or Items..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {item.invoiceId}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                    {item.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.items}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status?.toLowerCase() === 'settled' || item.status?.toLowerCase() === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-850">
                    Rs. {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No transactions found.
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
