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
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif] text-[#111827]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Page Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111827] tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center text-lg">
              <FiCalendar />
            </span>
            Attendance Management
          </h1>
          <p className="text-[#6B7280] mt-1.5 text-[14px]">Track and manage daily attendance records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-[#EEF0F3] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search worker..."
              className="pl-9 pr-4 py-2 bg-[#F9FAFB] border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all outline-none w-full"
            />
          </div>
          <div className="h-6 w-px bg-[#EEF0F3] hidden sm:block"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] rounded-xl">
            <input
              type="date"
              value={historyFrom}
              onChange={(e) => setHistoryFrom(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#374151] outline-none cursor-pointer"
            />
            <span className="text-[#D1D5DB] text-xs">&mdash;</span>
            <input
              type="date"
              value={historyTo}
              onChange={(e) => setHistoryTo(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#374151] outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Columns */}
        <div className="space-y-8">

          {/* Attendance History Card */}
          <div className="bg-white rounded-3xl border border-[#EEF0F3] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
            <div className="px-7 py-5 border-b border-[#F3F4F6] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#111827]">Attendance History</h3>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{filteredHistory.length} record{filteredHistory.length === 1 ? '' : 's'} in range</p>
              </div>
            </div>
            <div className="h-[calc(100vh-320px)] min-h-[420px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest border-b border-[#F3F4F6] sticky top-0 z-10">
                    <th className="px-7 py-4">Date</th>
                    <th className="px-7 py-4">Worker</th>
                    <th className="px-7 py-4 text-center">Role</th>
                    <th className="px-7 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredHistory.map((att) => {
                    const worker = workers.find(w => w.id === att.worker_id || w.id === att.worker_id);
                    return (
                      <tr key={att.id} className="hover:bg-[#FAFAFB] transition-colors">
                        <td className="px-7 py-4 text-sm text-[#6B7280] font-medium tabular-nums">
                          {att.attendance_date}
                        </td>
                        <td className="px-7 py-4 text-sm font-semibold text-[#111827]">
                          {worker?.name || 'Unknown Worker'}
                        </td>
                        <td className="px-7 py-4 text-sm text-center">
                          <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-lg inline-block">{worker?.jobRole || '-'}</span>
                        </td>
                        <td className="px-7 py-4 text-right">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block uppercase tracking-wide ${att.status?.toUpperCase() === 'PRESENT' ? 'bg-[#0D9488]/10 text-[#0D9488]' :
                              att.status?.toUpperCase() === 'HALF_DAY' ? 'bg-[#D97706]/10 text-[#B45309]' : 'bg-[#E11D48]/10 text-[#E11D48]'
                            }`}>
                            {att.status || 'UNKNOWN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
                          <FiCalendar className="text-3xl mb-3 text-[#E5E7EB]" />
                          <span className="text-sm font-medium">No history records found.</span>
                        </div>
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