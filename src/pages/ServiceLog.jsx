import React from 'react'
import { FiArrowLeft, FiTool, FiCalendar } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useHelper } from '../context/helperContext.jsx'

const ServiceLog = () => {
  const navigate = useNavigate()
  const { serviceInvoices, isLoading } = useHelper()

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
              <FiTool className="text-indigo-600" /> Service Log
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Detailed history of all completed services and maintenance.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading service details...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <th className="px-6 py-4 whitespace-nowrap">Invoice No</th>
                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4 whitespace-nowrap">Vehicle</th>
                    <th className="px-6 py-4">Service Type</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Labour Cost</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Parts Cost</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceInvoices && serviceInvoices.length > 0 ? (
                    serviceInvoices.map((invoice) => (
                      <tr key={invoice.invoiceId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm whitespace-nowrap">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-slate-400" />
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-semibold">
                          {invoice.customerName}
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{invoice.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-lg border border-slate-200 shadow-sm">
                            {invoice.vehicleNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-100">
                            {invoice.description || invoice.invoiceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-600 font-medium whitespace-nowrap">
                          Rs. {invoice.labourCost?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-600 font-medium whitespace-nowrap">
                          Rs. {invoice.partsCost?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-black text-slate-900 whitespace-nowrap">
                          Rs. {invoice.totalAmount?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50">
                        No service invoices found.
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

export default ServiceLog
