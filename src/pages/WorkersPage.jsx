import { useState } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import {
  FiUsers,
  FiSearch
} from 'react-icons/fi';

const WorkersPage = () => {
  const { workers } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredWorkers = workers.filter(worker =>
    worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.telephone?.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FiUsers className="text-emerald-500" /> Worker Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage your team and view worker details</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Worker Directory</h3>
            <p className="text-sm text-slate-500">List of all active workers</p>
          </div>
          <div className="relative min-w-[250px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workers by name, role or phone..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Worker Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Salary Type</th>
                <th className="px-6 py-4">Daily Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.workerId || worker.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{worker.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{worker.jobRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {worker.telephone || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg">
                      {worker.salaryType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                    {worker.rate ? `Rs. ${worker.rate.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 text-sm font-medium">
                    No workers found matching your search.
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

export default WorkersPage;
