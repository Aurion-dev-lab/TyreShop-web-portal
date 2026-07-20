import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import api from '../api/api.js';
import {
  FiCheck,
  FiSlash,
  FiX,
  FiCalendar,
  FiSearch,
} from 'react-icons/fi';

const AttendancePage = () => {
  const { workers, attendances } = useHelper();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [historySearch, setHistorySearch] = useState('');
  const [historyFrom, setHistoryFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [historyTo, setHistoryTo] = useState(new Date().toISOString().split('T')[0]);
  
  const filteredHistory = useMemo(() => {
    return attendances
      .filter(a => {
        const dateMatch = a.attendance_date >= historyFrom && a.attendance_date <= historyTo;
        const workerName = workers.find(w => w.id === a.worker_id || w.workerId === a.worker_id)?.name || '';
        const searchMatch = workerName.toLowerCase().includes(historySearch.toLowerCase());
        return dateMatch && searchMatch;
      })
      .sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));
  }, [attendances, workers, historyFrom, historyTo, historySearch]);

  const monthlySummary = useMemo(() => {
    const monthAttendances = attendances.filter(a => a.attendance_date.startsWith(selectedMonth));
    return workers.map(worker => {
      const wAttendances = monthAttendances.filter(a => a.worker_id === worker.id || a.worker_id === worker.workerId);
      let presentCount = 0;
      let halfDayCount = 0;
      wAttendances.forEach(a => {
        if (a.status?.toUpperCase() === 'PRESENT') presentCount++;
        else if (a.status?.toUpperCase() === 'HALF_DAY') halfDayCount++;
      });
      const days = presentCount + halfDayCount * 0.5;
      const rate = worker.rate || 0;
      const netPayable = days * rate;

      return {
        workerId: worker.id || worker.workerId,
        name: worker.name,
        days,
        netPayable
      };
    });
  }, [workers, attendances, selectedMonth]);
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FiCalendar className="text-emerald-500" /> Attendance Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Track and manage daily attendance records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Columns */}
        <div className="space-y-8">

          {/* Attendance History Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Attendance History</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search worker..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={historyFrom}
                    onChange={(e) => setHistoryFrom(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={historyTo}
                    onChange={(e) => setHistoryTo(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 sticky top-0">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Worker</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((att) => {
                    const worker = workers.find(w => w.id === att.worker_id || w.id === att.worker_id);
                    return (
                      <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-500 font-mono">
                          {att.attendance_date}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">
                          {worker?.name || 'Unknown Worker'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            att.status?.toUpperCase() === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                            att.status?.toUpperCase() === 'HALF_DAY' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {att.status || 'UNKNOWN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400 text-sm font-medium">
                        No history records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AttendancePage;
