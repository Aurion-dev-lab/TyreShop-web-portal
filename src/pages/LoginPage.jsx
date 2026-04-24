import React, { useState } from 'react'
import { FiTool, FiMail, FiArrowRight, FiAlertCircle } from 'react-icons/fi'

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const PREDEFINED_EMAIL = 'kline26@admin.com'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (email.toLowerCase() !== PREDEFINED_EMAIL.toLowerCase()) {
      setError('Access Denied. Unauthorized email address.')
      return
    }

    setIsLoading(true)
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans selection:bg-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-4 animate-bounce-subtle">
            <FiTool className="text-3xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Tyre<span className="text-indigo-600">Shop</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">Operational Intelligence Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Administrator Login</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your authorized email to access the hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kline26@admin.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none text-slate-700 font-medium ${
                    error ? 'border-rose-500 focus:border-rose-500' : 'border-transparent focus:border-indigo-500'
                  }`}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                  <FiAlertCircle />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 hover:-translate-y-1 transition-all shadow-lg shadow-slate-200 disabled:bg-slate-400 disabled:translate-y-0 group"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? 'Verifying Identity...' : 'Access Hub'}
                {!isLoading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-medium italic">
              Access is restricted to predefined administrator accounts.
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          &copy; 2026 TyreShop Operations Hub.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
