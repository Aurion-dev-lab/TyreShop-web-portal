import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiAlertCircle, FiSearch, FiCalendar } from 'react-icons/fi';

const ExpensesPage = () => {
  const { expenses = [] } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const category = (exp.category || '').toLowerCase();
      const desc = (exp.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return category.includes(query) || desc.includes(query);
    });
  }, [expenses, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FiAlertCircle className="text-emerald-500" /> Expenses Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Monitor all operational expenditures and general business costs</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Description or Category..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Expense Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-extrabold rounded-full uppercase border border-rose-100">
                      {exp.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {exp.expense_date || exp.date || exp.createdAt?.split('T')[0] || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {exp.description || 'General Operational Expense'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-rose-600">
                    Rs. {(parseFloat(exp.amount) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No expense records found.
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

export default ExpensesPage;
