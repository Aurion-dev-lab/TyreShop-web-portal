import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiCreditCard, FiSearch, FiFileText, FiTruck, FiX, FiDollarSign, FiCalendar, FiList, FiUser, FiTag } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SETTLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ paid, total }) => {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-rose-300'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('credit');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const getCustomerName = (customerId, fallbackName) => {
    if (fallbackName && fallbackName !== 'Unknown Customer') return fallbackName;
    if (customerId) {
      const match = customers.find(c => c.id === customerId);
      if (match && match.name) return match.name;
    }
    return fallbackName || 'Unknown Customer';
  };

  const mappedCredits = useMemo(() => {
    return creditSales.map(cs => {
      const cid = cs.credit_id || cs.creditId || cs.id;
      const custName = getCustomerName(cs.customer_id || cs.customerId, cs.customer_name || cs.customerName || cs.customer);
      let detailItems = [];
      if (cs.parts) {
        let partsList = cs.parts;
        if (typeof partsList === 'string') { try { partsList = JSON.parse(partsList); } catch (e) { partsList = []; } }
        if (Array.isArray(partsList) && partsList.length > 0) {
          detailItems = partsList.map(p => `${p.description || p.name || 'Part'} (x${p.quantity || p.qty || 1})`);
        }
      }
      const grandTotal = parseFloat(cs.grand_total || cs.grandTotal || cs.sub_total || cs.subTotal || cs.amount) || 0;
      const matchingPayments = creditPayments.filter(cp => (cp.credit_id === cid || cp.creditId === cid));
      const totalPaidFromPayments = matchingPayments.reduce((sum, cp) => sum + (parseFloat(cp.amount) || 0), 0);
      const paidAmount = totalPaidFromPayments > 0 ? totalPaidFromPayments : (parseFloat(cs.settlement || cs.paid_amount) || 0);
      const remainingBalance = Math.max(0, grandTotal - paidAmount);
      let computedStatus = cs.status || (remainingBalance === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'));
      return {
        id: `cs_${cs.id}`, recordId: cid, type: 'credit', customerName: custName, details: detailItems.join(' '), detailItems,
        date: cs.sale_date || cs.created_at?.split('T')[0] || cs.createdAt?.split('T')[0] || '-',
        grandTotal, paidAmount, remainingBalance, status: computedStatus.toUpperCase(), payments: matchingPayments
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [creditSales, creditPayments, customers]);

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
      const matchingPayments = tyreExportPayments.filter(tp => (tp.export_id === eid || tp.exportId === eid));
      const totalPaidFromPayments = matchingPayments.reduce((sum, tp) => sum + (parseFloat(tp.amount) || 0), 0);
      const paidAmount = totalPaidFromPayments > 0 ? totalPaidFromPayments : (parseFloat(ex.settlement || ex.initial_payment || ex.paid_amount) || 0);
      const remainingBalance = Math.max(0, grandTotal - paidAmount);
      let computedStatus = ex.status || (remainingBalance === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'));
      return {
        id: `ex_${ex.id}`, recordId: eid, type: 'export', customerName: company, details: tyreMakeSize, detailItems: [tyreMakeSize],
        date: ex.export_date || ex.created_at?.split('T')[0] || ex.createdAt?.split('T')[0] || '-',
        grandTotal, paidAmount, remainingBalance, status: computedStatus.toUpperCase(), payments: matchingPayments
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [exportRecords, tyreExportPayments]);

  const mappedSales = useMemo(() => {
    return salesInvoices.map(si => {
      const nestedItems = si.line_items;
      let detailItems = [];
      if (nestedItems) {
        let parsed = nestedItems;
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; } }
        if (Array.isArray(parsed) && parsed.length > 0) {
          detailItems = parsed.map(p => `${p.product_name || p.name || p.description || 'Item'} (x${p.qty || p.quantity || 1})`);
        }
      }
      const grandTotal = parseFloat(si.grandTotal || si.grand_total || si.amount) || 0;
      return {
        id: `si_${si.id}`, recordId: si.invoice_id || si.id, type: 'sale',
        customerName: si.customer || 'Walk-in Customer', details: detailItems.join(' '), detailItems,
        date: si.invoice_date || si.created_at?.split('T')[0] || si.createdAt?.split('T')[0] || '-',
        grandTotal, paidAmount: grandTotal, remainingBalance: 0,
        status: (si.status || 'PAID').toUpperCase(), payments: []
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
      const query = searchQuery.toLowerCase();
      return (item.customerName || '').toLowerCase().includes(query)
        || (item.status || '').toLowerCase().includes(query)
        || String(item.recordId || '').toLowerCase().includes(query)
        || (item.details || '').toLowerCase().includes(query);
    });
  }, [displayedData, searchQuery]);

  const tabAccent = activeTab === 'credit' ? 'emerald' : activeTab === 'exports' ? 'purple' : 'blue';

  const summaryStats = useMemo(() => ({
    total: displayedData.reduce((s, i) => s + i.grandTotal, 0),
    paid: displayedData.reduce((s, i) => s + i.paidAmount, 0),
    due: displayedData.reduce((s, i) => s + i.remainingBalance, 0),
  }), [displayedData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiCreditCard className="text-emerald-500" /> Sales &amp; Exports Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Track credit sales, tyre export consignments, and invoice receipts</p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Value', value: summaryStats.total, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Collected', value: summaryStats.paid, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Outstanding', value: summaryStats.due, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4`}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className={`text-xl font-black mt-1 ${s.color}`}>Rs. {s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {[
          { key: 'credit', label: 'Credit Sales', count: mappedCredits.length, icon: <FiCreditCard />, accent: 'emerald' },
          { key: 'exports', label: 'Tyre Exports', count: mappedExports.length, icon: <FiTruck />, accent: 'purple' },
          { key: 'sales', label: 'Sales Invoices', count: mappedSales.length, icon: <FiFileText />, accent: 'blue' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.key
                ? `border-${tab.accent}-500 text-${tab.accent}-600`
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === tab.key ? `bg-${tab.accent}-100 text-${tab.accent}-700` : 'bg-slate-100 text-slate-500'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID, status, or items..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
        />
      </div>

      {/* Card Grid */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FiFileText className="text-4xl mb-3 opacity-30" />
          <p className="font-semibold">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your search or tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className={`px-5 pt-5 pb-4 border-b border-slate-100`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'credit' ? 'bg-emerald-100 text-emerald-600'
                      : item.type === 'export' ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.type === 'credit' ? <FiCreditCard /> : item.type === 'export' ? <FiTruck /> : <FiFileText />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">#{String(item.recordId).substring(0, 12)}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 flex-1 space-y-3">
                {/* Details */}
                {item.detailItems && item.detailItems.length > 0 ? (
                  <ul className="space-y-1">
                    {item.detailItems.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No items recorded</p>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FiCalendar className="shrink-0 text-slate-300" />
                  <span className="font-mono">{item.date}</span>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <ProgressBar paid={item.paidAmount} total={item.grandTotal} />
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-emerald-600">Paid Rs. {item.paidAmount.toLocaleString()}</span>
                    <span className="text-slate-400">of Rs. {item.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Balance Due</p>
                  <p className={`text-sm font-black ${item.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Rs. {item.remainingBalance.toLocaleString()}
                  </p>
                </div>
                {activeTab !== 'sales' && (
                  <button
                    onClick={() => setSelectedRecord(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <FiList className="text-xs" />
                    History ({item.payments.length})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment History Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Payment History Breakdown
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{selectedRecord.customerName}</h3>
                <p className="text-xs text-slate-400 font-mono">Ref ID: {selectedRecord.recordId}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

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

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedRecord.payments.length > 0 ? (
                selectedRecord.payments.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <FiCalendar className="text-indigo-400" />
                        {p.payment_date || p.paymentDate || p.created_at?.split('T')[0] || '-'}
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
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
