import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiBox,
  FiFileText,
  FiTool,
  FiTrendingUp,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiBarChart2,
  FiAlertCircle,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSettings
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/workers', label: 'Workers', icon: <FiUsers /> },
    { path: '/inventory', label: 'Inventory', icon: <FiBox /> },
    { path: '/invoices', label: 'Invoices & Billing', icon: <FiFileText /> },
    { path: '/services', label: 'Services', icon: <FiTool /> },
    { path: '/credit-sales', label: 'Credit Sales', icon: <FiCreditCard /> },
    { path: '/tyre-exports', label: 'Tyre Exports', icon: <FiTruck /> },
    { path: '/expenses', label: 'Expenses', icon: <FiAlertCircle /> },
    { path: '/salary-management', label: 'Salary Management', icon: <FiDollarSign /> },
    { path: '/analytics', label: 'Analytics Charts', icon: <FiBarChart2 /> },
    { path: '/reports', label: 'Reports', icon: <FiFileText /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside 
        className={`bg-[#111827] text-white flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 border-r border-slate-800`}
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-800">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
              <FiTool className="text-lg" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight">
                Auto <span className="text-emerald-400">Services</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Quick Actions Button */}
          {!collapsed ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/10 cursor-pointer"
            >
              <FiSettings />
              <span>Manage Quick Actions</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl cursor-pointer"
              title="Quick Actions"
            >
              <FiSettings />
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {collapsed ? <FiChevronRight className="text-base" /> : <FiChevronLeft className="text-base" />}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <FiLogOut className="text-base shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
              Web Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-2 group">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                AD
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Admin Portal</p>
                <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Online</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
