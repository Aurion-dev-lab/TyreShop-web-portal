import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiCreditCard, FiSearch, FiFileText, FiTruck, FiX, FiDollarSign, FiCalendar, FiList } from 'react-icons/fi';

const CreditSalesPage = () => {
  const {
    creditSales = [],
    salesInvoices = [],
    exportRecords = [],
    creditPayments = [],
    tyreExportPayments = [],
    customers = []
  } = useHelper();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('credit'); // 'credit', 'exports', or 'sales'
  const [selectedRecord, setSelectedRecord] = useState(null); // For Payment Breakdown Modal

  // Map Customer helper
  const getCustomerName = (customerId, fallbackName) => {
    if (fallbackName && fallbackName !== 'Unknown Customer') return fallbackName;
    if (customerId) {
      const match = customers.find(c => c.id === customerId);
      if (match && match.name) return match.name;
    }
    return fallbackName || 'Unknown Customer';
  };

  // Mapped Credit Sales
  const mappedCredits = useMemo(() => {
    return creditSales.map(cs => {
      const cid = cs.credit_id || cs.creditId || cs.id;
      const custName = getCustomerName(cs.customer_id || cs.customerId, cs.customer_name || cs.customerName || cs.customer);
      
      let partsText = '-';
      if (cs.parts) {
        let partsList = cs.parts;
        if (typeof partsList === 'string') {
          try { partsList = JSON.parse(partsList); } catch (e) { partsList = []; }
        }
        if (Array.isArray(partsList) && partsList.length > 0) {
          partsText = partsList.map(p => `${p.description || p.name || 'Part'} (x${p.quantity || p.qty || 1})`).join(', ');
        }
      }

      const grandTotal = parseFloat(cs.grand_total || cs.grandTotal || cs.sub_total || cs.subTotal || cs.amount) || 0;

      // Filter matching payments from creditPayments
      const matchingPayments = creditPayments.filter(cp => (cp.credit_id === cid || cp.creditId === cid));
      const totalPaidFromPayments = matchingPayments.reduce((sum, cp) => sum + (parseFloat(cp.amount) || 0), 0);
      const paidAmount = totalPaidFromPayments > 0 ? totalPaidFromPayments : (parseFloat(cs.settlement || cs.paid_amount) || 0);
      const remainingBalance = Math.max(0, grandTotal - paidAmount);

      let computedStatus = cs.status || (remainingBalance === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'));

      return {
        id: `cs_${cs.id}`,
        recordId: cid,
        type: 'credit',
        customerName: custName,
        details: partsText,
        date: cs.sale_date || cs.created_at?.split('T')[0] || cs.createdAt?.split('T')[0] || '-',
        grandTotal,
        paidAmount,
        remainingBalance,
        status: computedStatus.toUpperCase(),
        payments: matchingPayments
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [creditSales, creditPayments, customers]);

  // Mapped Tyre Exports
  const mappedExports = useMemo(() => {
    return exportRecords.map(ex => {
      const eid = ex.export_id || ex.exportId || ex.id;
      const company = ex.company || 'Direct Export';
      const tyres = parseInt(ex.tyres) || 0;
      const tyreMakeSize = `${ex.tyre_make || ex.tyreMake || 'Tyre'} (${ex.tyre_size || ex.tyreSize || 'N/A'}) x${tyres}`;

      const custPrice = parseFloat(ex.cust_price || ex.custPrice) || 0;
      const serviceFee = parseFloat(ex.service_fee || ex.serviceFee) || 0;
      const calcGrand = custPrice * tyres + serviceFee;
      const grandTotal = parseFloat(ex.grand_total || ex.grandTotal || ex.sub_total) || calcGrand || 0;

      // Filter matching payments from tyreExportPayments
      const matchingPayments = tyreExportPayments.filter(tp => (tp.export_id === eid || tp.exportId === eid));
      const totalPaidFromPayments = matchingPayments.reduce((sum, tp) => sum + (parseFloat(tp.amount) || 0), 0);
      const paidAmount = totalPaidFromPayments > 0 ? totalPaidFromPayments : (parseFloat(ex.settlement || ex.initial_payment || ex.paid_amount) || 0);
      const remainingBalance = Math.max(0, grandTotal - paidAmount);

      let computedStatus = ex.status || (remainingBalance === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'));

      return {
        id: `ex_${ex.id}`,
        recordId: eid,
        type: 'export',
        customerName: company,
        details: tyreMakeSize,
        date: ex.export_date || ex.created_at?.split('T')[0] || ex.createdAt?.split('T')[0] || '-',
        grandTotal,
        paidAmount,
        remainingBalance,
        status: computedStatus.toUpperCase(),
        payments: matchingPayments
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [exportRecords, tyreExportPayments]);

  // Mapped Sales Invoices
  const mappedSales = useMemo(() => {
    return salesInvoices.map(si => {
      const nestedItems = si.line_items;
      let itemsText = '-';
      if (nestedItems) {
        let parsed = nestedItems;
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          itemsText = parsed.map(p => `${p.product_name || p.name || p.description || 'Item'} (x${p.qty || p.quantity || 1})`).join(', ');
        }
      }

      const grandTotal = parseFloat(si.grandTotal || si.grand_total || si.amount) || 0;

      return {
        id: `si_${si.id}`,
        recordId: si.invoice_id || si.id,
        type: 'sale',
        customerName: si.customer || 'Walk-in Customer',
        details: itemsText,
        date: si.invoice_date || si.created_at?.split('T')[0] || si.createdAt?.split('T')[0] || '-',
        grandTotal,
        paidAmount: grandTotal,
        remainingBalance: 0,
        status: (si.status || 'PAID').toUpperCase(),
        payments: []
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [salesInvoices]);

  const displayedData = useMemo(() => {
    if (activeTab === 'credit') return mappedCredits;
    if (activeTab === 'exports') return mappedExports;
    return mappedSales;
  }, [activeTab, mappedCredits, mappedExports, mappedSales]);

  const filteredData = useMemo(() => {
    return displayedData.filter(item => {
      const customer = (item.customerName || '').toLowerCase();
      const status = (item.status || '').toLowerCase();
      const recordId = (item.recordId || '').toLowerCase();
      const details = (item.details || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return customer.includes(query) || status.includes(query) || recordId.includes(query) || details.includes(query);
    });
  }, [displayedData, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiCreditCard className="text-emerald-500" /> Sales & Exports Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Track credit sales, tyre export consignments, and invoice receipts</p>
      </div>

      {/* Tabs */}
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
          Credit Sales ({mappedCredits.length})
        </button>
        <button
          onClick={() => setActiveTab('exports')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'exports'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FiTruck />
          Tyre Exports ({mappedExports.length})
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
          Sales Invoices ({mappedSales.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer/Company name, ID, Status, or Items..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">{activeTab === 'exports' ? 'Company' : 'Customer'}</th>
                <th className="px-6 py-4">{activeTab === 'exports' ? 'Tyres / Spec' : 'Items'}</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
                {activeTab !== 'sales' && <th className="px-6 py-4 text-center">Payments</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {item.recordId}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                    {item.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.details}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'PAID' || item.status === 'SETTLED'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : item.status === 'PARTIAL'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                    Rs. {item.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-600">
                    Rs. {item.paidAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-rose-600">
                    Rs. {item.remainingBalance.toLocaleString()}
                  </td>
                  {activeTab !== 'sales' && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        <FiList className="text-xs" />
                        History ({item.payments.length})
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={activeTab !== 'sales' ? 9 : 8} className="p-10 text-center text-slate-400 text-sm font-medium">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Payment History Breakdown
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  {selectedRecord.customerName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Ref ID: {selectedRecord.recordId}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl mb-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
                <p className="text-sm font-bold text-slate-800">Rs. {selectedRecord.grandTotal.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Settled</span>
                <p className="text-sm font-bold text-emerald-600">Rs. {selectedRecord.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Due</span>
                <p className="text-sm font-bold text-rose-600">Rs. {selectedRecord.remainingBalance.toLocaleString()}</p>
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedRecord.payments.length > 0 ? (
                selectedRecord.payments.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <FiCalendar className="text-indigo-400" />
                        {p.payment_date || p.paymentDate || p.created_at?.split('T')[0] || '-'}
                        <span className="px-2 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {p.payment_method || p.paymentMethod || 'Cash'}
                        </span>
                      </div>
                      {p.notes && <p className="text-xs text-slate-400 mt-1">{p.notes}</p>}
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      + Rs. {(parseFloat(p.amount) || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  {selectedRecord.paidAmount > 0 ? (
                    <p>Initial payment of Rs. {selectedRecord.paidAmount.toLocaleString()} recorded at transaction creation.</p>
                  ) : (
                    <p>No individual payment transactions recorded yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditSalesPage;
