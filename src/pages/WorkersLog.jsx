import React from 'react'
import { FiArrowLeft, FiUsers, FiDollarSign } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useHelper } from '../context/helperContext.jsx'

const WorkersLog = () => {
  const navigate = useNavigate()
  const { workers, isLoading } = useHelper()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm text-slate-500 cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FiUsers className="text-indigo-600" /> Payroll & Workers Log
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Detailed roster of all active employees and payroll types.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading workers details...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <th className="px-6 py-4 whitespace-nowrap">Worker ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Job Role</th>
                    <th className="px-6 py-4">Telephone</th>
                    <th className="px-6 py-4 text-right">Salary Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers && workers.length > 0 ? (
                    workers.map((worker) => (
                      <tr key={worker.workerId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm whitespace-nowrap">
                          {worker.workerId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-semibold">
                          {worker.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-100">
                            {worker.jobRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                          {worker.telephone}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-600 font-medium whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-lg border border-slate-200 shadow-sm inline-flex items-center gap-1">
                            <FiDollarSign className="text-slate-400" />
                            {worker.salaryType}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50">
                        No workers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkersLog
