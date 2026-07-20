import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiDollarSign,
  FiTool,
  FiTrendingUp,
  FiUser,
  FiChevronRight,
  FiDownload,
  FiCalendar,
  FiLayers,
  FiPieChart,
  FiShoppingCart,
} from 'react-icons/fi'
import { rangeOptions, rangeMetrics } from '../data/metrics.jsx'
import { useHelper } from '../context/helperContext.jsx'
import * as XLSX from 'xlsx'
import { useAuth } from '../context/AuthContext.jsx'

const DashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const helperData = useHelper()
  const {logout} = useAuth()

  const [activeRange, setActiveRange] = useState('daily')
  const [activeCategory, setActiveCategory] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')

  const currentRangeData = rangeMetrics[activeRange]

  const activeRangeLabel = useMemo(
    () => rangeOptions.find((range) => range.key === activeRange)?.label,
    [activeRange],
  )

  const { 
    products = [], 
    workers = [], 
    salesInvoices = [], 
    serviceInvoices = [], 
    creditSales = [], 
    invoiceLineItems = [],
    quickServices = [],
    exportRecords = [],
    expenses = [],
    salaryPayments = [],
    attendances = [],
    isLoading 
  } = helperData;

  console.log("helperData", {
    products,
    workers,
    salesInvoices,
    serviceInvoices,
    creditSales,
    invoiceLineItems,
    quickServices,
    exportRecords,
    expenses,
    salaryPayments,
    attendances,
  });

  const categoryOptions = [
    { key: 'all', label: 'All Operations', icon: <FiLayers /> },
    { key: 'sales', label: 'Sales', icon: <FiTrendingUp /> },
    { key: 'revenue', label: 'Revenue', icon: <FiDollarSign /> },
    { key: 'netIncome', label: 'Net Income', icon: <FiCheckCircle /> },
    { key: 'workers', label: 'Workers', icon: <FiUser /> },
  ]

  const inventoryRows = useMemo(() => {
    return products.map(p => {
      let trend = 'Healthy'
      if (p.quantity <= p.minStock) trend = 'Low'
      else if (p.quantity <= p.minStock * 1.5) trend = 'Normal'
      return {
        item: p.productName,
        stock: p.quantity,
        reorderAt: p.minStock,
        trend
      }
    })
  }, [products])

  const filteredInventory = useMemo(() => {
    return inventoryRows.filter(row =>
      row.item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [inventoryRows, searchQuery])


  const salaryRows = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const roles = workers.reduce((acc, w) => {
      const role = w.role || w.jobRole || 'Unassigned';
      if (!acc[role]) acc[role] = { totalWorkers: 0, paidWorkers: 0, totalPaidAmount: 0 };
      
      acc[role].totalWorkers += 1;
      
      const id = w.id;
      const monthPayments = salaryPayments
        .filter((p) => p.worker_id === id && p.paid_at?.startsWith(currentMonth))
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        
      if (monthPayments > 0) {
        acc[role].paidWorkers += 1;
        acc[role].totalPaidAmount += monthPayments;
      }
      
      return acc;
    }, {});

    return Object.keys(roles).map(role => ({
      team: role,
      paid: roles[role].paidWorkers,
      total: roles[role].totalWorkers,
      amount: 'Rs. ' + roles[role].totalPaidAmount.toLocaleString()
    }));
  }, [workers, salaryPayments]);

  const totalPaidWorkers = useMemo(() => {
    return salaryRows.reduce((sum, r) => sum + r.paid, 0);
  }, [salaryRows]);

  const filteredSalary = useMemo(() => {
    return salaryRows.filter(row =>
      row.team.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [salaryRows, searchQuery])

  const totalSales = useMemo(() => {
    return salesInvoices
      .filter(i => !i.status || ['completed', 'paid'].includes(i.status.toLowerCase()))
      .reduce((sum, si) => sum + (parseFloat(si.grandTotal || si.grand_total || si.amount) || 0), 0);
  }, [salesInvoices]);

  const totalCreditSales = useMemo(() => {
    return creditSales.reduce((sum, cs) => sum + (parseFloat(cs.amount) || 0), 0);
  }, [creditSales]);

  const salesValue = useMemo(() => {
    return totalSales + totalCreditSales;
  }, [totalSales, totalCreditSales]);

  const serviceRevenue = useMemo(() => {
    return serviceInvoices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  }, [serviceInvoices]);

  const quickServiceRevenue = useMemo(() => {
    return quickServices.reduce((sum, qs) => sum + (parseFloat(qs.price) || 0), 0);
  }, [quickServices]);

  const tyreExportRevenue = useMemo(() => {
    return exportRecords.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
  }, [exportRecords]);

  const totalRevenue = useMemo(() => {
    return totalSales + totalCreditSales + serviceRevenue + quickServiceRevenue + tyreExportRevenue;
  }, [totalSales, totalCreditSales, serviceRevenue, quickServiceRevenue, tyreExportRevenue]);

  const completedInvoiceProductCost = useMemo(() => {
    return salesInvoices
      .filter(i => !i.status || ['completed', 'paid'].includes(i.status.toLowerCase()))
      .reduce((total, inv) => {
        const items = inv.line_items || inv.items || inv.parts || inv.invoice_items || [];
        const invCost = items.reduce((sum, il) => {
          const product = products.find(p => p.id === il.product_id);
          const buyPrice = product ? (parseFloat(product.buy_price) || 0) : 0;
          return sum + ((parseInt(il.qty || il.quantity) || 0) * buyPrice);
        }, 0);
        return total + invCost;
      }, 0);
  }, [salesInvoices, products]);

  const tyreExportCosts = useMemo(() => {
    return exportRecords.reduce((sum, r) => sum + ((parseFloat(r.comp_price) || 0) * (parseInt(r.tyres) || 0)), 0);
  }, [exportRecords]);

  const workerCosts = useMemo(() => {
    return salaryPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [salaryPayments]);

  const totalGeneralExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenses]);

  const totalCosts = useMemo(() => {
    return totalGeneralExpenses + completedInvoiceProductCost + tyreExportCosts + workerCosts;
  }, [totalGeneralExpenses, completedInvoiceProductCost, tyreExportCosts, workerCosts]);

  const netIncome = useMemo(() => {
    return totalRevenue - totalCosts;
  }, [totalRevenue, totalCosts]);

  const grossProfit = useMemo(() => {
    return totalRevenue - (completedInvoiceProductCost + tyreExportCosts);
  }, [totalRevenue, completedInvoiceProductCost, tyreExportCosts]);

  const cogs = useMemo(() => {
    return completedInvoiceProductCost + tyreExportCosts;
  }, [completedInvoiceProductCost, tyreExportCosts]);

  const attendanceStats = useMemo(() => {
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    attendances.forEach(a => {
      const status = a.status?.toUpperCase();
      if (status === 'PRESENT') present++;
      else if (status === 'HALF_DAY') halfDay++;
      else if (status === 'ABSENT') absent++;
    });
    return { present, halfDay, absent };
  }, [attendances]);

  const salesChartData = useMemo(() => {
    const dailySales = {};
    const allInvoices = [
      ...salesInvoices.map(i => ({ date: i.createdAt?.split('T')[0], amount: i.grandTotal || 0 })),
      ...creditSales.map(i => ({ date: i.date?.split('T')[0], amount: i.amount || 0 }))
    ];
    
    allInvoices.forEach(inv => {
      if (!inv.date) return;
      if (!dailySales[inv.date]) dailySales[inv.date] = 0;
      dailySales[inv.date] += inv.amount;
    });
    
    const sortedDates = Object.keys(dailySales).sort();
    let dataPoints = sortedDates.slice(-7).map(d => dailySales[d]);
    if (dataPoints.length === 0) dataPoints = [20, 40, 60, 40, 80, 50, 90]; 
    if (dataPoints.length < 2) dataPoints = [0, ...dataPoints];
    
    const maxSale = Math.max(...dataPoints, 1);
    return dataPoints.map(val => Math.round((val / maxSale) * 100));
  }, [salesInvoices, creditSales]);

  const recentSales = useMemo(() => {
    const all = [
      ...salesInvoices.map(si => ({
        id: `si_${si.id}`,
        invoiceId: si.invoice_id || si.id,
        customer: si.customer || 'Walk-in Customer',
        type: 'Sale',
        amount: parseFloat(si.grand_total || si.amount || 0),
        date: si.invoice_date || si.created_at?.split('T')[0] || '-',
        status: si.status || 'PAID'
      })),
      ...creditSales.map(cs => ({
        id: `cs_${cs.id}`,
        invoiceId: cs.credit_id || cs.id,
        customer: cs.customer_name || 'Unknown Customer',
        type: 'Credit Sale',
        amount: parseFloat(cs.amount || 0),
        date: cs.sale_date || cs.created_at?.split('T')[0] || '-',
        status: cs.status || 'UNPAID'
      }))
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // top 5 recent
  }, [salesInvoices, creditSales]);

  const handleDownloadSaleReport = () => {
    setIsGenerating(true)

    setTimeout(() => {
      const statsData = [
        [`TyreShop Sales Report - ${activeRangeLabel} View`],
        ['Generated on:', new Date().toLocaleString()],
        ['Selection:', activeRange === 'daily' ? selectedDate : activeRangeLabel],
        ['Search Filter:', searchQuery || 'None'],
        [],
        ['Metric', 'Value', 'Status/Trend'],
        ['Sales', `Rs. ${salesValue.toLocaleString()}`, `${salesInvoices.length} Invoices | ${creditSales.length} Credits`],
        ['Gross Revenue', `Rs. ${totalRevenue.toLocaleString()}`, 'All streams'],
        ['Net Income', `Rs. ${netIncome.toLocaleString()}`, `Total Costs: Rs. ${totalCosts.toLocaleString()}`],
        ['Worker Costs', `Rs. ${workerCosts.toLocaleString()}`, `Attendance - Pres: ${attendanceStats.present} | Half: ${attendanceStats.halfDay} | Abs: ${attendanceStats.absent}`],
      ]

      const ws = XLSX.utils.aoa_to_sheet(statsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

      XLSX.writeFile(wb, `TyreShop_Sales_${activeRangeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
      setIsGenerating(false)
    }, 1500)
  }

  const topStats = [
    {
      key: 'sales',
      icon: <FiTrendingUp className="text-indigo-500" />,
      value: `Rs. ${salesValue.toLocaleString()}`,
      trend: `${salesInvoices.length} Invs | ${creditSales.length} Credits`,
      trendType: 'up',
      label: 'Sales (Invoices + Credit)'
    },
    {
      key: 'cogs',
      category: 'revenue',
      icon: <FiShoppingCart className="text-rose-500" />,
      value: `Rs. ${cogs.toLocaleString()}`,
      trend: 'Cost of Inventory',
      trendType: 'warning',
      label: 'Cost of Goods Sold (COGS)'
    },
    {
      key: 'grossProfit',
      category: 'revenue',
      icon: <FiPieChart className="text-blue-500" />,
      value: `Rs. ${grossProfit.toLocaleString()}`,
      trend: `Margin: ${totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0}%`,
      trendType: 'info',
      label: 'Gross Profit'
    },
    {
      key: 'revenue',
      icon: <FiDollarSign className="text-emerald-500" />,
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      trend: 'All streams active',
      trendType: 'up',
      label: 'Gross Revenue'
    },
    {
      key: 'netIncome',
      icon: <FiCheckCircle className="text-amber-500" />,
      value: `Rs. ${netIncome.toLocaleString()}`,
      trend: `Costs: Rs. ${totalCosts.toLocaleString()}`,
      trendType: netIncome >= 0 ? 'up' : 'down',
      label: 'Net Income'
    },
    {
      key: 'workers',
      icon: <FiUser className="text-rose-500" />,
      value: `Rs. ${workerCosts.toLocaleString()}`,
      trend: `P: ${attendanceStats.present} | H: ${attendanceStats.halfDay} | A: ${attendanceStats.absent}`,
      trendType: 'info',
      label: 'Worker Payroll & Attendance'
    }
  ]

  const visibleStats =
    activeCategory === 'all'
      ? topStats
      : topStats.filter((card) => (card.category || card.key) === activeCategory)

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              Operations Hub
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Operational Performance
          </h1>
          <p className="text-slate-500 mt-1 max-w-md">
            Real-time tracking of services, sales, inventory, and payroll metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">

          <button
            onClick={handleDownloadSaleReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-200 disabled:bg-slate-400 disabled:translate-y-0 animate-fade-in"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiDownload />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2">
        {categoryOptions.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all border shrink-0 ${activeCategory === category.key
              ? 'bg-white border-indigo-200 text-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-500'
              }`}
          >
            <span className={`text-lg ${activeCategory === category.key ? 'text-indigo-600' : 'text-slate-400'}`}>
              {category.icon}
            </span>
            <span className="font-semibold text-sm">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
        {visibleStats.map((card) => (
          <div
            key={card.key}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trendType === 'up' ? 'bg-emerald-50 text-emerald-600' :
                card.trendType === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                {card.trendType === 'up' && <FiTrendingUp />}
                {card.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{card.label}</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${activeCategory !== 'all' ? 'lg:grid-cols-1' : ''}`}>

        {(activeCategory === 'all' || activeCategory === 'sales') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Sales</h3>
                <p className="text-sm text-slate-500">Latest sales and credit transactions</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase">
                {activeRangeLabel}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {recentSales.length > 0 ? recentSales.map((row) => (
                <div key={row.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                      <FiDollarSign />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{row.customer}</p>
                      <p className="text-xs text-slate-500">
                        {row.type} &bull; <span className="font-mono text-slate-400">{row.invoiceId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900">Rs. {row.amount.toLocaleString()}</p>
                    <div className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${row.status === 'PAID' || row.status === 'settled' ? 'bg-emerald-100 text-emerald-700' :
                      row.status === 'UNPAID' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {row.status}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-slate-400 text-sm font-medium">No recent sales found.</div>
              )}
            </div>
            <button onClick={() => navigate('/credit-sales')} className="w-full p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 cursor-pointer">
              View Full Sales Ledger <FiChevronRight />
            </button>
          </div>
        )}


        {(activeCategory === 'all' || activeCategory === 'revenue') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Flow</h3>
                <p className="text-sm text-slate-500">Gross collections breakdown</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">Rs. {totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Revenue</p>
              </div>
            </div>
            <div className="flex-1 p-8 min-h-[240px]">
              {(() => {
                const data = salesChartData;
                const width = 600
                const height = 200
                const padding = 20
                const stepX = (width - padding * 2) / (data.length - 1 || 1)

                const points = data.map((value, index) => ({
                  x: padding + index * stepX,
                  y: height - padding - (value / 100) * (height - padding * 2),
                  value,
                  index,
                }))

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

                const labelFor = (index) =>
                  currentRangeData.salesLabel === 'Hourly' ? `H${index + 1}` :
                    currentRangeData.salesLabel === 'Daily' ? `D${index + 1}` : `W${index + 1}`

                return (
                  <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {[0, 25, 50, 75, 100].map((g) => (
                      <line
                        key={g}
                        x1={padding}
                        x2={width - padding}
                        y1={height - padding - (g / 100) * (height - padding * 2)}
                        y2={height - padding - (g / 100) * (height - padding * 2)}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}

                    <path d={areaPath} fill="url(#salesGradient)" />

                    <path
                      d={linePath}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {points.map((p) => (
                      <g key={p.index} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="white"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          className="transition-all"
                        />
                        <text
                          x={p.x}
                          y={height + 20}
                          textAnchor="middle"
                          className="fill-slate-400 text-[9px] font-bold uppercase"
                        >
                          {labelFor(p.index)}
                        </text>
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <rect x={p.x - 18} y={p.y - 32} width="36" height="20" rx="5" fill="#0f172a" />
                          <text x={p.x} y={p.y - 18} textAnchor="middle" className="fill-white text-[10px] font-bold">
                            {p.value}%
                          </text>
                        </g>
                      </g>
                    ))}
                  </svg>
                )
              })()}
            </div>
          </div>
        )}

        {(activeCategory === 'all' || activeCategory === 'netIncome') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inventory Status (Impacts COGS)</h3>
                <p className="text-sm text-slate-500">Stock availability & trends</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Data
              </div>
            </div>
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3">In Stock</th>
                      <th className="px-4 py-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredInventory.length > 0 ? filteredInventory.map((row) => (
                      <tr key={row.item} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-800 text-sm">{row.item}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`font-mono font-bold ${row.stock <= row.reorderAt ? 'text-rose-500' : 'text-slate-600'}`}>
                            {row.stock}
                          </span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-slate-400 text-xs">{row.reorderAt}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${row.trend === 'Low' ? 'bg-rose-50 text-rose-600' :
                            row.trend === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {row.trend}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-slate-400 text-sm font-medium">No matching inventory items found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeCategory === 'all' || activeCategory === 'workers') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Payroll Cycle</h3>
              <p className="text-sm text-slate-500">Disbursement progress by team</p>
            </div>
            <div className="p-6 space-y-6">
              {filteredSalary.length > 0 ? filteredSalary.map((row) => {
                const percent = row.total > 0 ? Math.round((row.paid / row.total) * 100) : 0;
                return (
                  <div key={row.team} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{row.team}</p>
                        <p className="text-xs text-slate-500">{row.paid} of {row.total} staff processed</p>
                      </div>
                      <p className="text-sm font-black text-indigo-600">{row.amount}</p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                         className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                         style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              }) : (
                <div className="p-4 text-center text-slate-400 text-sm font-medium">No matching teams found.</div>
              )}
            </div>
            <div className="mt-auto p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-200" />
                <span className="text-xs font-bold uppercase tracking-wider">{totalPaidWorkers} of {workers.length} salaries released</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
