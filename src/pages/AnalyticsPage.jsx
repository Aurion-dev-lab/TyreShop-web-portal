import React, { useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiBarChart2, FiTrendingUp, FiBox, FiUsers, FiDollarSign } from 'react-icons/fi';

const AnalyticsPage = () => {
  const { 
    products = [], 
    salesInvoices = [], 
    invoiceLineItems = [],
    serviceInvoices = [],
    quickServices = [] 
  } = useHelper();

  // Top Products calculations
  const topProducts = useMemo(() => {
    const list = {};
    const completedInvoiceIds = new Set(
      salesInvoices
        .filter(i => i.status?.toLowerCase() === 'completed')
        .map(i => i.id || i.invoiceId)
    );
    
    invoiceLineItems
      .filter(il => completedInvoiceIds.has(il.invoice_id))
      .forEach(il => {
        const name = il.description || 'Unknown Product';
        if (!list[name]) {
          list[name] = { name, qty: 0, revenue: 0 };
        }
        list[name].qty += (parseInt(il.qty) || 0);
        list[name].revenue += (parseFloat(il.total) || 0);
      });

    return Object.values(list)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoiceLineItems, salesInvoices]);

  // Operational metrics
  const servicesCount = serviceInvoices.length + quickServices.length;
  const totalSalesRevenue = salesInvoices.reduce((sum, i) => sum + (parseFloat(i.grandTotal || i.grand_total) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiBarChart2 className="text-emerald-500" /> Analytics Charts
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Business analytics and performance insight charts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Chart (SVG Visual representation) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Top Selling Products</h3>
            <p className="text-xs text-slate-500">Highest grossing items by revenue</p>
          </div>
          <div className="space-y-4">
            {topProducts.map((prod, idx) => {
              const maxRev = Math.max(...topProducts.map(p => p.revenue), 1);
              const percent = Math.round((prod.revenue / maxRev) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-700">{prod.name} ({prod.qty} units)</span>
                    <span className="text-slate-950">Rs. {prod.revenue?.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                No product sales analytics found.
              </div>
            )}
          </div>
        </div>

        {/* Sales vs Services Revenue Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Revenue Streams Distribution</h3>
            <p className="text-xs text-slate-500">Sales transactions vs Service events</p>
          </div>

          <div className="my-8 flex justify-around items-center">
            {/* Visual breakdown widget */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                <FiTrendingUp />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase">Sales Revenue</p>
              <p className="text-lg font-black text-slate-800 mt-1">Rs. {totalSalesRevenue?.toLocaleString()}</p>
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                <FiDollarSign />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase">Services Tally</p>
              <p className="text-lg font-black text-slate-800 mt-1">{servicesCount} Completed</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-center">
            <span className="text-xs text-slate-500 font-medium">
              Data aggregates are updated dynamically in real-time from active API nodes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
