import React from 'react'
import { 
  FiLayers, 
  FiTool, 
  FiTrendingUp, 
  FiBox, 
  FiDollarSign 
} from 'react-icons/fi'

export const rangeOptions = [
  { key: 'daily', label: 'Daily' },
  { key: '7days', label: '7 Days' },
  { key: 'month', label: 'Month' },
]

export const categoryOptions = [
  { key: 'all', label: 'All Operations', icon: <FiLayers /> },
  { key: 'services', label: 'Services', icon: <FiTool /> },
  { key: 'sales', label: 'Financials', icon: <FiTrendingUp /> },
  { key: 'inventory', label: 'Inventory', icon: <FiBox /> },
  { key: 'salary', label: 'Payroll', icon: <FiDollarSign /> },
]

export const rangeMetrics = {
  daily: {
    stats: {
      services: { label: 'Today Services', value: 26, trend: '+4 vs yesterday', trendType: 'up' },
      sales: { label: 'Today Sales', value: 'Rs. 58,000', trend: '+11% growth', trendType: 'up' },
      inventory: { label: 'Inventory Health', value: '82%', trend: '5 items low stock', trendType: 'warning' },
      salary: { label: 'Salary Progress', value: '74%', trend: 'Next payout in 2 days', trendType: 'info' },
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
      services: { label: '7-Day Services', value: 169, trend: '+13% vs previous week', trendType: 'up' },
      sales: { label: '7-Day Sales', value: 'Rs. 3,82,000', trend: '+9% growth', trendType: 'up' },
      inventory: { label: 'Inventory Health', value: '79%', trend: '8 items low stock', trendType: 'warning' },
      salary: { label: 'Salary Progress', value: '81%', trend: 'Payroll batch near completion', trendType: 'info' },
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
      services: { label: 'Monthly Services', value: 712, trend: '+15% vs last month', trendType: 'up' },
      sales: { label: 'Monthly Sales', value: 'Rs. 15,40,000', trend: '+12% growth', trendType: 'up' },
      inventory: { label: 'Inventory Health', value: '76%', trend: '12 items need reorder', trendType: 'warning' },
      salary: { label: 'Salary Progress', value: '100%', trend: 'All payouts completed', trendType: 'info' },
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
