import React, { useState } from 'react'
import { FiTool, FiUser, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login({ user_name: userName, password })
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentialsss')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-4">
            <FiTool className="text-3xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Tyre<span className="text-indigo-600">Shop</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">Operational Intelligence Portal</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Administrator Login</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none text-slate-700 font-medium ${
                    error ? 'border-rose-500 focus:border-rose-500' : 'border-transparent focus:border-indigo-500'
                  }`}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold mt-2 ml-1">
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
        </div>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          &copy; 2026 TyreShop Operations Hub.
        </p>
      </div>
    </div>
  )
}

export default LoginPage