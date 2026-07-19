import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import {
  FiFileText,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiTool
} from 'react-icons/fi';

const ReportsPage = () => {
  const { 
    products, 
    salesInvoices, 
    creditSales, 
    invoiceLineItems, 
    serviceInvoices, 
    quickServices, 
    exportRecords, 
    expenses, 
    salaryPayments, 
    fetchAllData 
  } = useHelper();

  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Real-time Financial Calculations inside Date Range ---
  const salesInvoicesInRange = useMemo(() => {
    return salesInvoices.filter(i => {
      const date = i.invoiceDate || i.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [salesInvoices, dateFrom, dateTo]);

  const creditSalesInRange = useMemo(() => {
    return creditSales.filter(cs => {
      const date = cs.saleDate || cs.date || cs.created_at?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [creditSales, dateFrom, dateTo]);

  const serviceInvoicesInRange = useMemo(() => {
    return serviceInvoices.filter(s => {
      const date = s.serviceDate || s.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [serviceInvoices, dateFrom, dateTo]);

  const quickServicesInRange = useMemo(() => {
    return quickServices.filter(qs => {
      const date = qs.serviceDate || qs.date || qs.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [quickServices, dateFrom, dateTo]);

  const exportRecordsInRange = useMemo(() => {
    return exportRecords.filter(r => {
      const date = r.exportDate || r.date || r.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [exportRecords, dateFrom, dateTo]);

  const expensesInRange = useMemo(() => {
    return expenses.filter(e => {
      const date = e.expenseDate || e.date || e.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [expenses, dateFrom, dateTo]);

  const salaryPaymentsInRange = useMemo(() => {
    return salaryPayments.filter(p => {
      const date = p.paidAt || p.paid_at || p.createdAt?.split('T')[0];
      return date >= dateFrom && date <= dateTo;
    });
  }, [salaryPayments, dateFrom, dateTo]);

  // Invoice line items in range
  const invoiceLineItemsInRange = useMemo(() => {
    const invoiceIds = new Set(salesInvoicesInRange.map(i => i.id || i.invoiceId));
    return invoiceLineItems.filter(il => invoiceIds.has(il.invoice_id));
  }, [invoiceLineItems, salesInvoicesInRange]);

  // Summaries
  const totalSales = useMemo(() => {
    const lineTotal = invoiceLineItemsInRange.reduce((sum, il) => sum + (parseFloat(il.total) || 0), 0);
    const creditTotal = creditSalesInRange.reduce((sum, cs) => sum + (parseFloat(cs.amount) || 0), 0);
    return lineTotal + creditTotal;
  }, [invoiceLineItemsInRange, creditSalesInRange]);

  const serviceRevenue = useMemo(() => {
    const sRev = serviceInvoicesInRange.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    const qRev = quickServicesInRange.reduce((sum, qs) => sum + (parseFloat(qs.price) || 0), 0);
    return sRev + qRev;
  }, [serviceInvoicesInRange, quickServicesInRange]);

  const tyreExportRevenue = useMemo(() => {
    return exportRecordsInRange.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
  }, [exportRecordsInRange]);

  const totalRevenue = useMemo(() => {
    return totalSales + serviceRevenue + tyreExportRevenue;
  }, [totalSales, serviceRevenue, tyreExportRevenue]);

  // Expenses
  const completedInvoiceProductCost = useMemo(() => {
    return invoiceLineItemsInRange.reduce((sum, il) => {
      const product = products.find(p => p.id === il.product_id);
      const buyPrice = product ? (parseFloat(product.buy_price) || 0) : 0;
      return sum + ((parseInt(il.qty) || 0) * buyPrice);
    }, 0);
  }, [invoiceLineItemsInRange, products]);

  const tyreExportCosts = useMemo(() => {
    return exportRecordsInRange.reduce((sum, r) => sum + ((parseFloat(r.comp_price) || 0) * (parseInt(r.tyres) || 0)), 0);
  }, [exportRecordsInRange]);

  const totalGeneralExpenses = useMemo(() => {
    return expensesInRange.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expensesInRange]);

  const totalExpenses = useMemo(() => {
    return totalGeneralExpenses + completedInvoiceProductCost + tyreExportCosts;
  }, [totalGeneralExpenses, completedInvoiceProductCost, tyreExportCosts]);

  const grossProfit = useMemo(() => {
    return totalRevenue - totalExpenses;
  }, [totalRevenue, totalExpenses]);

  const workerCosts = useMemo(() => {
    return salaryPaymentsInRange.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [salaryPaymentsInRange]);

  const netIncome = useMemo(() => {
    return totalRevenue - (totalExpenses + workerCosts);
  }, [totalRevenue, totalExpenses, workerCosts]);

  // Breakdown listings
  const salesBreakdown = useMemo(() => {
    const list = {};
    invoiceLineItemsInRange.forEach(il => {
      const desc = il.description || 'Unknown Product';
      list[desc] = (list[desc] || 0) + (parseFloat(il.total) || 0);
    });
    return Object.keys(list).map(name => ({ name, value: list[name] }));
  }, [invoiceLineItemsInRange]);

  const serviceBreakdown = useMemo(() => {
    const list = {};
    serviceInvoicesInRange.forEach(s => {
      const desc = s.description || s.name || 'General Service';
      list[desc] = (list[desc] || 0) + (parseFloat(s.price) || 0);
    });
    quickServicesInRange.forEach(qs => {
      const desc = qs.service || 'Quick Service';
      list[desc] = (list[desc] || 0) + (parseFloat(qs.price) || 0);
    });
    return Object.keys(list).map(name => ({ name, value: list[name] }));
  }, [serviceInvoicesInRange, quickServicesInRange]);

  const expensesList = useMemo(() => {
    const list = [];
    expensesInRange.forEach(e => {
      list.push({ desc: e.description || 'General Expense', value: parseFloat(e.amount) || 0, date: e.expenseDate || e.date });
    });
    if (completedInvoiceProductCost > 0) {
      list.push({ desc: 'Completed Invoice Cost (COGS)', value: completedInvoiceProductCost, date: '-' });
    }
    if (tyreExportCosts > 0) {
      list.push({ desc: 'Tyre Export Cost', value: tyreExportCosts, date: '-' });
    }
    if (workerCosts > 0) {
      list.push({ desc: 'Worker Salary Expenses', value: workerCosts, date: '-' });
    }
    return list;
  }, [expensesInRange, completedInvoiceProductCost, tyreExportCosts, workerCosts]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FiFileText className="text-emerald-500" /> Business Reports
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Analyze your shop's financial performance</p>
        </div>

        {/* Date Range controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-slate-400 text-sm ml-1" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            />
            <span className="text-slate-300 text-xs font-semibold">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            />
          </div>
          <div className="h-5 w-px bg-slate-200"></div>
          <button 
            onClick={() => fetchAllData()} 
            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <FiRefreshCw className="text-sm" />
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-slate-50 rounded-2xl text-indigo-500"><FiTrendingUp className="text-xl" /></span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">TOTAL SALES</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Rs. {totalSales.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-slate-50 rounded-2xl text-emerald-500"><FiDollarSign className="text-xl" /></span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">GROSS PROFIT</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Rs. {grossProfit.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-slate-50 rounded-2xl text-rose-500"><FiUsers className="text-xl" /></span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">WORKER COSTS</span>
          </div>
          <h2 className="text-3xl font-black text-rose-600 mt-1">Rs. {workerCosts.toLocaleString()}</h2>
        </div>

        {/* Navy Blue Styled Net Income Card matching Screenshot 1 */}
        <div className="bg-[#111827] text-white p-6 rounded-3xl border border-slate-900 shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-slate-800 rounded-2xl text-emerald-400"><FiCheckCircle className="text-xl" /></span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">NET INCOME</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">Rs. {netIncome.toLocaleString()}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50 p-2">
          {['summary', 'sales', 'services', 'expenses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === tab
                  ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab === 'summary' ? 'Summary' : 
               tab === 'sales' ? 'Sales Analysis' : 
               tab === 'services' ? 'Services' : 'Expenses'}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeSubTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sales Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-[10px]"><FiTrendingUp /> Sales Breakdown</h3>
                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto bg-slate-50/50 rounded-2xl border border-slate-150 p-3">
                  {salesBreakdown.map((row) => (
                    <div key={row.name} className="flex justify-between items-center py-2.5 px-2">
                      <span className="text-sm font-bold text-slate-700">{row.name}</span>
                      <span className="text-sm font-black text-slate-800">Rs. {row.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {salesBreakdown.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No sales logged in range.</p>}
                </div>
              </div>

              {/* Service Revenue */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-[10px]"><FiTool /> Service Revenue</h3>
                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto bg-slate-50/50 rounded-2xl border border-slate-150 p-3">
                  {serviceBreakdown.map((row) => (
                    <div key={row.name} className="flex justify-between items-center py-2.5 px-2">
                      <span className="text-sm font-bold text-slate-700">{row.name}</span>
                      <span className="text-sm font-black text-slate-800">Rs. {row.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {serviceBreakdown.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No services logged in range.</p>}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'sales' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Detailed Invoice Sales</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                      <th className="px-4 py-3">Invoice Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesInvoicesInRange.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{inv.invoiceId || inv.id?.substring(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{inv.customer || 'Walk-in'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 uppercase">{inv.type}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-800">Rs. {inv.grandTotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'services' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Logged Services Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBreakdown.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-850">Rs. {row.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'expenses' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Expense Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                      <th className="px-4 py-3">Expense Item / Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expensesList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.desc}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{row.date}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-rose-500">Rs. {row.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
