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
        <div className="relative min-w-[300px]">
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

      <div className="rounded-3xl overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          {filteredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorkers.map((worker) => (
                <div key={worker.workerId || worker.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-2xl mb-4 shadow-inner relative z-10 ring-4 ring-white">
                    {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 relative z-10">{worker.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-5 relative z-10">{worker.jobRole}</p>
                  
                  <div className="w-full space-y-3 mt-auto border-t border-slate-100 pt-5 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Contact</span>
                      <span className="font-semibold text-slate-700">{worker.telephone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Type</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">{worker.salaryType}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Rate</span>
                      <span className="font-bold text-emerald-600">{worker.rate ? `Rs. ${worker.rate.toLocaleString()}` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <FiUsers className="text-6xl mb-4 text-slate-200" />
              <p className="text-sm font-medium">No workers found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkersPage;
