import React, { useMemo, useState } from 'react'
import {
  FiBox,
  FiCheckCircle,
  FiDollarSign,
  FiTool,
  FiTrendingUp,
  FiSearch,
  FiBell,
  FiUser,
  FiChevronRight,
  FiDownload,
  FiCalendar,
} from 'react-icons/fi'
import { rangeOptions, categoryOptions, rangeMetrics } from '../data/metrics.jsx'

const DashboardPage = ({ onLogout }) => {
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

  // Filtered Data Logic
  const filteredServices = useMemo(() => {
    return currentRangeData.servicesRows.filter(row => 
      row.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentRangeData, searchQuery])

  const filteredInventory = useMemo(() => {
    return currentRangeData.inventoryRows.filter(row => 
      row.item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentRangeData, searchQuery])

  const filteredSalary = useMemo(() => {
    return currentRangeData.salaryRows.filter(row => 
      row.team.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentRangeData, searchQuery])

  const handleDownloadSaleReport = () => {
    setIsGenerating(true)
    
    const headers = ['Metric', 'Value', 'Status/Trend']
    const statsRows = [
      ['Services', currentRangeData.stats.services.value, currentRangeData.stats.services.trend],
      ['Sales', currentRangeData.stats.sales.value, currentRangeData.stats.sales.trend],
      ['Inventory', currentRangeData.stats.inventory.value, currentRangeData.stats.inventory.trend],
      ['Salary', currentRangeData.stats.salary.value, currentRangeData.stats.salary.trend],
    ]
    
    const csvContent = [
      `TyreShop Sales Report - ${activeRangeLabel} View`,
      `Generated on: ${new Date().toLocaleString()}`,
      `Selection: ${activeRange === 'daily' ? selectedDate : activeRangeLabel}`,
      `Search Filter: ${searchQuery || 'None'}`,
      '',
      headers.join(','),
      ...statsRows.map(row => row.join(',')),
    ].join('\n')

    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `TyreShop_Sales_${activeRangeLabel}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsGenerating(false)
    }, 1500)
  }

  const topStats = [
    {
      key: 'services',
      icon: <FiTool className="text-indigo-500" />,
      ...currentRangeData.stats.services,
    },
    {
      key: 'sales',
      icon: <FiTrendingUp className="text-emerald-500" />,
      ...currentRangeData.stats.sales,
    },
    {
      key: 'inventory',
      icon: <FiBox className="text-amber-500" />,
      ...currentRangeData.stats.inventory,
    },
    {
      key: 'salary',
      icon: <FiDollarSign className="text-rose-500" />,
      ...currentRangeData.stats.salary,
    },
  ]

  const visibleStats =
    activeCategory === 'all'
      ? topStats
      : topStats.filter((card) => card.key === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <FiTool className="text-xl" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Tyre<span className="text-indigo-600">Shop</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operations..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none w-64"
                />
              </div>
              <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <FiBell className="text-xl" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={onLogout}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                    <FiUser />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-rose-600 transition-colors">Admin Portal</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Sign Out</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
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
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <div className="flex p-0.5 bg-slate-50 rounded-lg">
                {rangeOptions.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setActiveRange(range.key)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeRange === range.key
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              <div className="h-6 w-px bg-slate-200"></div>

              <div className="relative flex items-center gap-2 pr-2">
                <FiCalendar className="text-slate-400 text-sm" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setActiveRange('daily')
                  }}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleDownloadSaleReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-200 disabled:bg-slate-400 disabled:translate-y-0"
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

        {/* Category Filter Pills */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Details Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${activeCategory !== 'all' ? 'lg:grid-cols-1' : ''}`}>

          {/* Services Tracker */}
          {(activeCategory === 'all' || activeCategory === 'services') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Services Tracking</h3>
                  <p className="text-sm text-slate-500">Live operational status</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase">
                  {activeRangeLabel}
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredServices.length > 0 ? filteredServices.map((row) => (
                  <div key={row.service} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                        <FiTool />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{row.service}</p>
                        <p className="text-xs text-slate-500">
                          <span className="text-indigo-600 font-semibold">{row.count}</span> completed of <span className="font-semibold">{row.target}</span> target
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === 'Ahead' ? 'bg-emerald-100 text-emerald-700' :
                        row.status === 'Attention' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {row.status}
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 text-sm font-medium">No matching services found.</div>
                )}
              </div>
              <button className="w-full p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 border-t border-slate-100">
                View Full Service Log <FiChevronRight />
              </button>
            </div>
          )}

          {/* Sales Chart */}
          {(activeCategory === 'all' || activeCategory === 'sales') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Flow</h3>
                  <p className="text-sm text-slate-500">Gross collections breakdown</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{currentRangeData.salesValue}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Total {currentRangeData.salesLabel}</p>
                </div>
              </div>
              <div className="flex-1 p-8 flex items-end justify-between gap-3 min-h-[240px]">
                {currentRangeData.salesByPeriod.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full relative h-full flex flex-col justify-end">
                      <div
                        style={{ height: `${value}%` }}
                        className="w-full bg-slate-100 rounded-t-xl group-hover:bg-indigo-500 transition-all duration-500 relative"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {value}%
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {currentRangeData.salesLabel === 'Hourly' ? `H${index + 1}` :
                        currentRangeData.salesLabel === 'Daily' ? `D${index + 1}` : `W${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Health */}
          {(activeCategory === 'all' || activeCategory === 'inventory') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Inventory Status</h3>
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

          {/* Payroll Progress */}
          {(activeCategory === 'all' || activeCategory === 'salary') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Payroll Cycle</h3>
                <p className="text-sm text-slate-500">Disbursement progress by team</p>
              </div>
              <div className="p-6 space-y-6">
                {filteredSalary.length > 0 ? filteredSalary.map((row) => {
                  const percent = Math.round((row.paid / row.total) * 100)
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
                  <span className="text-xs font-bold uppercase tracking-wider">{currentRangeData.salaryFooter}</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 transition-colors">
                  Details
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden sticky bottom-0 z-50 bg-white border-t border-slate-200 flex items-center justify-around p-3 pb-6">
        {categoryOptions.slice(1).map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeCategory === category.key ? 'text-indigo-600' : 'text-slate-400'
              }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-[10px] font-bold uppercase">{category.key === 'all' ? 'Ops' : category.key}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default DashboardPage
