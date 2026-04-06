import React, { useMemo, useState } from 'react'
import {
  FiBox,
  FiCheckCircle,
  FiDollarSign,
  FiLayers,
  FiPlus,
  FiTool,
  FiTrendingUp,
} from 'react-icons/fi'

const rangeOptions = [
  { key: 'daily', label: 'Daily' },
  { key: '7days', label: '7 Days' },
  { key: 'month', label: 'Month' },
]

const rangeMetrics = {
  daily: {
    stats: {
      services: { label: 'Today Services', value: 26, trend: '+4 vs yesterday' },
      sales: { label: 'Today Sales', value: 'Rs. 58,000', trend: '+11% growth' },
      inventory: { label: 'Inventory Health', value: '82%', trend: '5 items low stock' },
      salary: { label: 'Salary Progress', value: '74%', trend: 'Next payout in 2 days' },
    },
    servicesLabel: 'Today',
    salesLabel: 'Hourly',
    salesValue: 'Rs. 58,000',
    salesByPeriod: [48, 55, 62, 70, 66, 78, 85],
    servicesRows: [
      { service: 'Full Service', count: 7, target: 9, status: 'On Track' },
      { service: 'Wheel Alignment', count: 5, target: 6, status: 'On Track' },
      { service: 'Oil Change', count: 8, target: 7, status: 'Ahead' },
      { service: 'Quick Check', count: 6, target: 8, status: 'Attention' },
    ],
    inventoryRows: [
      { item: 'Tyre 185/65R15', stock: 31, reorderAt: 18, trend: 'Stable' },
      { item: 'Engine Oil 5W30', stock: 15, reorderAt: 20, trend: 'Low' },
      { item: 'Brake Pads Set', stock: 24, reorderAt: 16, trend: 'Healthy' },
      { item: 'Coolant 1L', stock: 11, reorderAt: 12, trend: 'Low' },
    ],
    salaryRows: [
      { team: 'Workshop Staff', paid: 12, total: 15, amount: 'Rs. 4,80,000' },
      { team: 'Field Staff', paid: 8, total: 10, amount: 'Rs. 2,15,000' },
      { team: 'Support Team', paid: 6, total: 6, amount: 'Rs. 1,20,000' },
    ],
    salaryFooter: '26 of 31 salaries released',
  },
  '7days': {
    stats: {
      services: { label: '7-Day Services', value: 169, trend: '+13% vs previous week' },
      sales: { label: '7-Day Sales', value: 'Rs. 3,82,000', trend: '+9% growth' },
      inventory: { label: 'Inventory Health', value: '79%', trend: '8 items low stock' },
      salary: { label: 'Salary Progress', value: '81%', trend: 'Payroll batch near completion' },
    },
    servicesLabel: '7 Days',
    salesLabel: 'Daily',
    salesValue: 'Rs. 3,82,000',
    salesByPeriod: [42, 57, 63, 70, 78, 74, 88],
    servicesRows: [
      { service: 'Full Service', count: 42, target: 38, status: 'Ahead' },
      { service: 'Wheel Alignment', count: 34, target: 36, status: 'On Track' },
      { service: 'Oil Change', count: 48, target: 44, status: 'Ahead' },
      { service: 'Quick Check', count: 45, target: 50, status: 'Attention' },
    ],
    inventoryRows: [
      { item: 'Tyre 185/65R15', stock: 26, reorderAt: 18, trend: 'Healthy' },
      { item: 'Engine Oil 5W30', stock: 12, reorderAt: 20, trend: 'Low' },
      { item: 'Brake Pads Set', stock: 20, reorderAt: 16, trend: 'Stable' },
      { item: 'Coolant 1L', stock: 9, reorderAt: 12, trend: 'Low' },
    ],
    salaryRows: [
      { team: 'Workshop Staff', paid: 14, total: 15, amount: 'Rs. 5,60,000' },
      { team: 'Field Staff', paid: 9, total: 10, amount: 'Rs. 2,52,000' },
      { team: 'Support Team', paid: 6, total: 6, amount: 'Rs. 1,24,000' },
    ],
    salaryFooter: '29 of 31 salaries released',
  },
  month: {
    stats: {
      services: { label: 'Monthly Services', value: 712, trend: '+15% vs last month' },
      sales: { label: 'Monthly Sales', value: 'Rs. 15,40,000', trend: '+12% growth' },
      inventory: { label: 'Inventory Health', value: '76%', trend: '12 items need reorder' },
      salary: { label: 'Salary Progress', value: '100%', trend: 'All payouts completed' },
    },
    servicesLabel: 'Month',
    salesLabel: 'Weekly',
    salesValue: 'Rs. 15,40,000',
    salesByPeriod: [38, 52, 64, 82],
    servicesRows: [
      { service: 'Full Service', count: 181, target: 165, status: 'Ahead' },
      { service: 'Wheel Alignment', count: 146, target: 150, status: 'On Track' },
      { service: 'Oil Change', count: 202, target: 190, status: 'Ahead' },
      { service: 'Quick Check', count: 183, target: 195, status: 'Attention' },
    ],
    inventoryRows: [
      { item: 'Tyre 185/65R15', stock: 22, reorderAt: 18, trend: 'Stable' },
      { item: 'Engine Oil 5W30', stock: 8, reorderAt: 20, trend: 'Low' },
      { item: 'Brake Pads Set', stock: 17, reorderAt: 16, trend: 'Healthy' },
      { item: 'Coolant 1L', stock: 7, reorderAt: 12, trend: 'Low' },
    ],
    salaryRows: [
      { team: 'Workshop Staff', paid: 15, total: 15, amount: 'Rs. 6,00,000' },
      { team: 'Field Staff', paid: 10, total: 10, amount: 'Rs. 2,80,000' },
      { team: 'Support Team', paid: 6, total: 6, amount: 'Rs. 1,32,000' },
    ],
    salaryFooter: '31 of 31 salaries released',
  },
}

const categoryOptions = [
  { key: 'all', label: 'All', icon: <FiLayers aria-hidden="true" /> },
  { key: 'services', label: 'Services', icon: <FiTool aria-hidden="true" /> },
  { key: 'sales', label: 'Sales', icon: <FiTrendingUp aria-hidden="true" /> },
  { key: 'inventory', label: 'Inventory', icon: <FiBox aria-hidden="true" /> },
  { key: 'salary', label: 'Salary', icon: <FiDollarSign aria-hidden="true" /> },
]

function App() {
  const [activeRange, setActiveRange] = useState('daily')
  const [activeCategory, setActiveCategory] = useState('all')

  const currentRangeData = rangeMetrics[activeRange]
  const topStats = [
    {
      key: 'services',
      icon: <FiTool aria-hidden="true" />,
      ...currentRangeData.stats.services,
    },
    {
      key: 'sales',
      icon: <FiTrendingUp aria-hidden="true" />,
      ...currentRangeData.stats.sales,
    },
    {
      key: 'inventory',
      icon: <FiBox aria-hidden="true" />,
      ...currentRangeData.stats.inventory,
    },
    {
      key: 'salary',
      icon: <FiDollarSign aria-hidden="true" />,
      ...currentRangeData.stats.salary,
    },
  ]

  const visibleStats =
    activeCategory === 'all'
      ? topStats
      : topStats.filter((card) => card.key === activeCategory)

  const activeLabel = useMemo(
    () => categoryOptions.find((category) => category.key === activeCategory)?.label,
    [activeCategory],
  )

  const activeRangeLabel = useMemo(
    () => rangeOptions.find((range) => range.key === activeRange)?.label,
    [activeRange],
  )

  return (
    <div className="tracker-shell">
      <header className="tracker-header">
        <div>
          <p className="eyebrow">Progress Tracker Portal</p>
          <h1>Daily Operations Overview</h1>
          <small>Services, sales, inventory, and salary in one tablet-ready view</small>
        </div>
        <div className="header-actions">
          <div className="range-filter" aria-label="Filter by date range">
            {rangeOptions.map((range) => (
              <button
                key={range.key}
                type="button"
                className={`range-btn ${activeRange === range.key ? 'active' : ''}`}
                onClick={() => setActiveRange(range.key)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="solid-btn" type="button">
            <FiPlus aria-hidden="true" />
            New Entry
          </button>
        </div>
      </header>

      <section className="category-strip" aria-label="Choose category to track">
        {categoryOptions.map((category) => (
          <button
            key={category.key}
            type="button"
            className={`category-btn ${activeCategory === category.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.key)}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </section>

      <section className="stats-grid" aria-label="Top stats">
        {visibleStats.map((card) => (
          <article className="stat-card" key={card.label}>
            <div className="stat-icon">{card.icon}</div>
            <div>
              <p>{card.label}</p>
              <h2>{card.value}</h2>
              <small>{card.trend}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="focus-label" aria-live="polite">
        <strong>{activeLabel}</strong>
        <span>
          {activeCategory === 'all' ? 'Showing all categories' : 'Showing one category view'}
          {' • '}
          {activeRangeLabel}
        </span>
      </section>

      <section className={`tiles-grid ${activeCategory !== 'all' ? 'single-view' : ''}`}>
        {(activeCategory === 'all' || activeCategory === 'services') && (
          <article className="tile">
            <div className="tile-head">
              <h3>Daily Services Tracker</h3>
              <span>{currentRangeData.servicesLabel}</span>
            </div>
            <div className="service-list">
              {currentRangeData.servicesRows.map((row) => (
                <div className="service-row" key={row.service}>
                  <div>
                    <strong>{row.service}</strong>
                    <p>
                      {row.count} completed / target {row.target}
                    </p>
                  </div>
                  <span className={`tag ${row.status.toLowerCase().replace(' ', '-')}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </article>
        )}

        {(activeCategory === 'all' || activeCategory === 'sales') && (
          <article className="tile sales-tile">
            <div className="tile-head">
              <h3>Sales Flow</h3>
              <span>{currentRangeData.salesLabel}</span>
            </div>
            <div className="sales-meta">
              <p>Collection</p>
              <strong>{currentRangeData.salesValue}</strong>
            </div>
            <div className="bars" aria-hidden="true">
              {currentRangeData.salesByPeriod.map((value, index) => (
                <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
              ))}
            </div>
          </article>
        )}

        {(activeCategory === 'all' || activeCategory === 'inventory') && (
          <article className="tile">
            <div className="tile-head">
              <h3>Inventory Going</h3>
              <span>
                <FiLayers aria-hidden="true" />
                Live
              </span>
            </div>
            <div className="inventory-list">
              {currentRangeData.inventoryRows.map((row) => (
                <div className="inventory-row" key={row.item}>
                  <div>
                    <strong>{row.item}</strong>
                    <p>
                      Stock {row.stock} / Reorder {row.reorderAt}
                    </p>
                  </div>
                  <span className={`tag ${row.trend.toLowerCase()}`}>{row.trend}</span>
                </div>
              ))}
            </div>
          </article>
        )}

        {(activeCategory === 'all' || activeCategory === 'salary') && (
          <article className="tile">
            <div className="tile-head">
              <h3>Salary Going</h3>
              <span>Monthly</span>
            </div>
            <div className="salary-list">
              {currentRangeData.salaryRows.map((row) => {
                const percent = Math.round((row.paid / row.total) * 100)
                return (
                  <div className="salary-row" key={row.team}>
                    <div className="salary-row-head">
                      <strong>{row.team}</strong>
                      <span>{row.amount}</span>
                    </div>
                    <p>
                      {row.paid} paid of {row.total} staff
                    </p>
                    <div className="meter" aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="salary-footer">
              <FiCheckCircle aria-hidden="true" />
              <span>{currentRangeData.salaryFooter}</span>
            </div>
          </article>
        )}
      </section>

      <nav className="tablet-bottom-nav" aria-label="Quick category switch">
        {categoryOptions
          .filter((category) => category.key !== 'all')
          .map((category) => (
            <button
              key={category.key}
              type="button"
              className={`bottom-nav-btn ${activeCategory === category.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
      </nav>
    </div>
  )
}

export default App