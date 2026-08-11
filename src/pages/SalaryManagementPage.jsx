import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import { FiDollarSign, FiBookOpen } from 'react-icons/fi';

const SalaryManagementPage = () => {
  const {
    workers = [],
    attendances = [],
    salaryPayments = [],
    salaryAdvances = [],
    workerCredits = [],
  } = useHelper();

  // Default to current year-month (YYYY-MM), e.g. 2026-08
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  const payrollList = useMemo(() => {
    return workers.map((w) => {
      const id = w.id || w.workerId;
      const workerName = w.name || 'Worker';

      // Match worker attendance within selected month
      const monthAttendances = attendances.filter((a) => {
        const wid = a.worker_id || a.workerId;
        const adate = a.attendance_date || a.attendanceDate || a.created_at || a.createdAt || a.date || '';
        return (wid === id || a.worker === workerName) && adate.startsWith(selectedMonth);
      });

      // Match worker advances within selected month
      const monthAdvances = salaryAdvances
        .filter((a) => {
          const wid = a.worker_id || a.workerId;
          const adate = a.advance_date || a.advanceDate || a.created_at || a.createdAt || a.date || '';
          return (wid === id || a.worker === workerName) && adate.startsWith(selectedMonth);
        })
        .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

      // Match worker salary payments within selected month
      const monthPayments = salaryPayments
        .filter((p) => {
          const wid = p.worker_id || p.workerId;
          const pdate = p.paid_at || p.paidAt || p.period_from || p.periodFrom || p.created_at || p.createdAt || p.date || '';
          return (wid === id || p.worker === workerName) && pdate.startsWith(selectedMonth);
        })
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Worker credits: ISSUE vs SETTLEMENT
      const creditIssue = workerCredits
        .filter((c) => {
          const wid = c.worker_id || c.workerId;
          const type = (c.credit_type || c.creditType || '').toUpperCase();
          const note = c.note || '';
          return (wid === id || c.worker === workerName) &&
            (type === 'ISSUE' || type === 'CREDIT' || !type) &&
            !note.includes('Auto-settled');
        })
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      // Payroll settled credits (auto-settled via payroll payouts)
      const payrollSettled = workerCredits
        .filter((c) => {
          const wid = c.worker_id || c.workerId;
          const type = (c.credit_type || c.creditType || '').toUpperCase();
          const note = c.note || '';
          const cdate = c.credit_date || c.creditDate || c.created_at || c.createdAt || c.date || '';
          return (wid === id || c.worker === workerName) &&
            (type === 'SETTLEMENT' || note.includes('Auto-settled')) &&
            cdate.startsWith(selectedMonth);
        })
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      // Outstanding credit balance (unsettled issues)
      const netCreditBalance = Math.max(0, creditIssue - payrollSettled);

      let present = 0;
      let halfDay = 0;
      let absent = 0;

      monthAttendances.forEach((a) => {
        const status = (a.status || '').toUpperCase();
        if (status === 'PRESENT') present++;
        else if (status === 'HALF_DAY' || status === 'HALF DAY') halfDay++;
        else if (status === 'ABSENT') absent++;
      });

      const daysCount = present + halfDay * 0.5;
      const rate = parseFloat(w.rate) || 0;
      const gross = daysCount * rate;

      // Desktop formula: netPayable = Math.max(0, gross - advances - creditBalance - payrollSettled)
      const netPayable = Math.max(0, gross - monthAdvances - netCreditBalance - payrollSettled);
      const remainingPayable = Math.max(0, netPayable - monthPayments);

      let status = 'READY';
      if (netPayable <= 0 && monthPayments === 0) {
        status = 'NO PAYABLE';
      } else if (monthPayments >= netPayable - 0.01 && netPayable > 0) {
        status = 'PAID';
      } else if (monthPayments > 0) {
        status = 'PARTIALLY PAID';
      }

      return {
        id,
        name: workerName,
        jobRole: w.role || w.jobRole || 'Mechanic',
        salaryType: w.salary_type || w.salaryType || 'Monthly',
        rate,
        present,
        halfDay,
        absent,
        daysCount,
        gross,
        advances: monthAdvances,
        creditBalance: netCreditBalance,
        payrollSettled,
        netPayable,
        remainingPayable,
        paid: monthPayments,
        status
      };
    });
  }, [workers, attendances, salaryPayments, salaryAdvances, workerCredits, selectedMonth]);

  // Combined Payouts & Advances Ledger
  const ledgerEntries = useMemo(() => {
    const entries = [];

    salaryPayments.forEach(p => {
      const wid = p.worker_id || p.workerId;
      const wMatch = workers.find(w => (w.id || w.workerId) === wid);
      const wName = wMatch ? wMatch.name : (p.worker || 'Worker');
      const pdate = p.paid_at || p.paidAt || p.period_from || p.periodFrom || p.created_at || p.createdAt || p.date || '-';

      entries.push({
        id: `pay_${p.id || Math.random()}`,
        date: pdate.split('T')[0],
        worker: wName,
        type: 'PAYOUT',
        note: p.period_from ? `Payroll payout (${p.period_from} to ${p.period_to || p.periodFrom})` : (p.note || 'Salary payment'),
        amount: parseFloat(p.amount) || 0
      });
    });

    salaryAdvances.forEach(a => {
      const wid = a.worker_id || a.workerId;
      const wMatch = workers.find(w => (w.id || w.workerId) === wid);
      const wName = wMatch ? wMatch.name : (a.worker || 'Worker');
      const adate = a.advance_date || a.advanceDate || a.created_at || a.createdAt || a.date || '-';

      entries.push({
        id: `adv_${a.id || Math.random()}`,
        date: adate.split('T')[0],
        worker: wName,
        type: 'ADVANCE',
        note: a.reason || a.note || 'Salary advance',
        amount: parseFloat(a.amount) || 0
      });
    });

    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [salaryPayments, salaryAdvances, workers]);

  // Aggregate stats
  const totalPaid = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.paid, 0);
  }, [payrollList]);

  const totalGross = useMemo(() => {
    return payrollList.reduce((sum, p) => sum + p.gross, 0);
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
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Calculate monthly payouts based on attendance
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">Cycle Period</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer text-slate-700"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-3xl shadow-sm">
          <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> PAID SALARY
          </p>
          <h2 className="text-2xl font-black text-emerald-800 mt-2">Rs. {totalPaid.toLocaleString()}</h2>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Paid in selected period</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span> NET PAYOUT
          </p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Rs. {totalNetPayout.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Gross: Rs. {totalGross.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span> TOTAL ADVANCES
          </p>
          <h2 className="text-2xl font-black text-amber-500 mt-2">Rs. {totalAdvances.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Deducted from gross</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-rose-400 rounded-full"></span> CREDIT BALANCE
          </p>
          <h2 className="text-2xl font-black text-rose-500 mt-2">Rs. {totalCredits.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Outstanding credits</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span> ACTIVE WORKERS
          </p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{workers.length}</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Out of {workers.length} registered</p>
        </div>
      </div>

      {/* Main Salary Table Card */}
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
                <th className="px-6 py-4 text-center">Remaining</th>
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
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        {worker.present}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        {worker.halfDay}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                        {worker.absent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                    Rs. {worker.gross.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-amber-500">
                    Rs. {worker.advances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-rose-500">
                    Rs. {worker.creditBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-emerald-600">
                    Rs. {worker.netPayable.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {worker.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                        ✓ Paid
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Rs. {worker.remainingPayable.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      worker.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : worker.status === 'PARTIALLY PAID'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : worker.status === 'READY'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payrollList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 text-sm font-medium">
                    No workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts & Advances Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiBookOpen className="text-indigo-500" /> Payouts & Advances Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              History of salary advances handed out and salary payments executed
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Worker</th>
                <th className="px-6 py-3 text-center">Type</th>
                <th className="px-6 py-3">Note / Period</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                  <td className="px-6 py-3 font-mono text-slate-500">
                    {entry.date}
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-800">
                    {entry.worker}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      entry.type === 'PAYOUT'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {entry.note}
                  </td>
                  <td className={`px-6 py-3 text-right font-black ${
                    entry.type === 'PAYOUT' ? 'text-emerald-600' : 'text-amber-500'
                  }`}>
                    Rs. {entry.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {ledgerEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-medium">
                    No ledger entries recorded yet.
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

export default SalaryManagementPage;
