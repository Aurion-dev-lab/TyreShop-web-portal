import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HelperProvider } from './context/helperContext'
import ProtectedRoute from './pages/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import WorkersPage from './pages/WorkersPage'
import InventoryPage from './pages/InventoryPage'
import SalaryManagementPage from './pages/SalaryManagementPage'
import ReportsPage from './pages/ReportsPage'
import ServiceLog from './pages/ServiceLog'
import InvoicesPage from './pages/InvoicesPage'
import CreditSalesPage from './pages/CreditSalesPage'
import TyreExportsPage from './pages/TyreExportsPage'
import ExpensesPage from './pages/ExpensesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workers"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <InventoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/salary-management"
          element={
            <ProtectedRoute>
              <Layout>
                <SalaryManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Layout>
                <ServiceLog />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoicesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/credit-sales"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditSalesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tyre-exports"
          element={
            <ProtectedRoute>
              <Layout>
                <TyreExportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App