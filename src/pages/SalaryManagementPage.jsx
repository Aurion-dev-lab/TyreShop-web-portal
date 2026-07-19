import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import api from '../api/api.js';
import {
  FiDollarSign,
  FiTrendingUp,
  FiBriefcase,
  FiBookOpen,
  FiCheck,
  FiSlash,
  FiX,
  FiCreditCard,
  FiActivity
} from 'react-icons/fi';

const SalaryManagementPage = () => {
  const { 
    workers, 
    attendances, 
    salaryPayments, 
    salaryAdvances, 
    workerCredits,
    fetchAllData 
  } = useHelper();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Process worker payroll cycles
  const payrollList = useMemo(() => {
    return workers.map((w) => {
      const id = w.id || w.workerId;
      
      // Filter records by selected month
      const monthAttendances = attendances.filter(
        (a) => a.worker_id === id && a.attendance_date.startsWith(selectedMonth)
      );
      const monthAdvances = salaryAdvances
        .filter((a) => (a.worker_id === id || a.workerId === id) && a.advance_date?.startsWith(selectedMonth))
        .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
      const monthPayments = salaryPayments
        .filter((p) => (p.worker_id === id || p.workerId === id) && p.paid_at?.startsWith(selectedMonth))
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Credits outstanding (not filtered by month, since outstanding is cumulative until settled)
      const creditsTotal = workerCredits
        .filter((c) => c.worker_id === id || c.workerId === id)
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      // Attendance counts
      let present = 0;
      let halfDay = 0;
      let absent = 0;
      monthAttendances.forEach((a) => {
        const status = a.status?.toUpperCase();
        if (status === 'PRESENT') present++;
        else if (status === 'HALF_DAY') halfDay++;
        else if (status === 'ABSENT') absent++;
      });

      const daysCount = present + halfDay * 0.5;
      const rate = w.rate || 0;
      const gross = daysCount * rate;
      const netPayable = Math.max(0, gross - monthAdvances - creditsTotal);

      // Payment Status
      let status = 'READY';
      if (netPayable <= 0) {
        status = 'NO PAYABLE';
      } else if (monthPayments >= netPayable - 0.0001) {
        status = 'PAID';
      } else if (monthPayments > 0) {
        status = 'PARTIALLY PAID';
      }

      return {
        ...w,
        id,
        present,
        halfDay,
        absent,
        daysCount,
        gross,
        advances: monthAdvances,
        creditBalance: creditsTotal,
        netPayable,
        paid: monthPayments,
        status
      };
    });
  }, [workers, attendances, salaryPayments, salaryAdvances, workerCredits, selectedMonth]);

  // Aggregate stats
  const totalPaid = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.paid, 0);
  }, [payrollList]);

  const totalNetPayout = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.netPayable, 0);
  }, [payrollList]);

  const totalAdvances = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.advances, 0);
  }, [payrollList]);

  const totalCredits = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.creditBalance, 0);
  }, [payrollList]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FiDollarSign className="text-emerald-500" /> Salary Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Calculate monthly payouts based on attendance</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">Cycle Period</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-3xl shadow-sm">
          <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Paid Salary
          </p>
          <h2 className="text-2xl font-black text-emerald-800 mt-2">Rs. {totalPaid.toLocaleString()}</h2>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span> Net Payout
          </p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Rs. {totalNetPayout.toLocaleString()}</h2>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span> Total Advances
          </p>
          <h2 className="text-2xl font-black text-amber-500 mt-2">Rs. {totalAdvances.toLocaleString()}</h2>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-rose-400 rounded-full"></span> Credit Balance
          </p>
          <h2 className="text-2xl font-black text-rose-500 mt-2">Rs. {totalCredits.toLocaleString()}</h2>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span> Active Workers
          </p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{workers.length}</h2>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Worker</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4 text-right">Gross Salary</th>
                <th className="px-6 py-4 text-right">Advances</th>
                <th className="px-6 py-4 text-right">Credit Balance</th>
                <th className="px-6 py-4 text-right">Net Payable</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollList.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{worker.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{worker.jobRole}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <FiCheck /> {worker.present}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                        <FiSlash /> {worker.halfDay}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                        <FiX /> {worker.absent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Rs. {worker.gross?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-amber-600">
                    Rs. {worker.advances?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-rose-500">
                    Rs. {worker.creditBalance?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                    Rs. {worker.netPayable?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      worker.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      worker.status === 'PARTIALLY PAID' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      worker.status === 'NO PAYABLE' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Ledger Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <FiBookOpen className="text-indigo-500 text-lg" />
          <h3 className="text-lg font-bold text-slate-900">Credit Ledger</h3>
        </div>
        <div className="p-8 text-center text-slate-400 text-sm font-medium">
          No credit ledger entries found for outstanding accounts.
        </div>
      </div>
    </div>
  );
};

export default SalaryManagementPage;
