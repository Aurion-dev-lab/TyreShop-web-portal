import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getProducts,
  getWorkers,
  getAttendances,
  getWorkerCredits,
  getSalaryPayments,
  getSalaryAdvances,
  getCreditSales,
  getExportRecords,
  getServiceInvoices,
  getQuickServices,
  getQuickServicePresets,
  getSalesInvoices,
  getCustomers,
  getExpenses,
  getCreditPayments,
  getTyreExportPayments
} from '../api/api.js';

const HelperContext = createContext();

export const HelperProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [workerCredits, setWorkerCredits] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [exportRecords, setExportRecords] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [serviceInvoices, setServiceInvoices] = useState([]);
  const [quickServices, setQuickServices] = useState([]);
  const [quickServicePresets, setQuickServicePresets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [creditPayments, setCreditPayments] = useState([]);
  const [tyreExportPayments, setTyreExportPayments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {isAuthenticated} = useAuth();
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        productsRes,
        workersRes,
        attendancesRes,
        workerCreditsRes,
        salaryPaymentsRes,
        salaryAdvancesRes,
        creditSalesRes,
        exportRecordsRes,
        salesInvoicesRes,
        serviceInvoicesRes,
        quickServicesRes,
        quickServicePresetsRes,
        customersRes,
        expensesRes,
        creditPaymentsRes,
        tyreExportPaymentsRes
      ] = await Promise.all([
        getProducts().catch(() => null),
        getWorkers().catch(() => null),
        getAttendances().catch(() => null),
        getWorkerCredits().catch(() => null),
        getSalaryPayments().catch(() => null),
        getSalaryAdvances().catch(() => null),
        getCreditSales().catch(() => null),
        getExportRecords().catch(() => null),
        getSalesInvoices().catch(() => null),
        getServiceInvoices().catch(() => null),
        getQuickServices().catch(() => null),
        getQuickServicePresets().catch(() => null),
        getCustomers().catch(() => null),
        getExpenses().catch(() => null),
        getCreditPayments().catch(() => null),
        getTyreExportPayments().catch(() => null)
      ]);

      if (productsRes?.data?.status === 'success') {
        const mappedProducts = (productsRes.data.data || []).map(p => ({
          ...p,
          productName: p.name,
          quantity: p.stock,
          minStock: p.minimum_stock_alert || 5,
        }));
        setProducts(mappedProducts);
      }      

      if (workersRes?.data?.status === 'success') {
        const mappedWorkers = (workersRes.data.data || []).map(w => ({
          ...w,
          id: w.id,
          workerId: w.id,
          name: w.name,
          jobRole: w.role || w.jobRole,
          role: w.role || w.jobRole,
          telephone: w.phone || w.telephone,
          salaryType: w.salary_type || w.salaryType || 'Monthly',
          rate: w.rate ? parseFloat(w.rate) : 0,
        }));
        setWorkers(mappedWorkers);
      }

      const attendancesData = attendancesRes?.data?.data || attendancesRes?.data || [];
      if (Array.isArray(attendancesData)) setAttendances(attendancesData);
      else if (attendancesRes?.data?.status === 'success') setAttendances(attendancesRes.data.data || []);
      if (workerCreditsRes?.data?.status === 'success') setWorkerCredits(workerCreditsRes.data.data || []);
      if (salaryPaymentsRes?.data?.status === 'success') setSalaryPayments(salaryPaymentsRes.data.data || []);
      if (salaryAdvancesRes?.data?.status === 'success') setSalaryAdvances(salaryAdvancesRes.data.data || []);
      if (creditSalesRes?.data?.status === 'success') setCreditSales(creditSalesRes.data.data || []);
      if (exportRecordsRes?.data?.status === 'success') setExportRecords(exportRecordsRes.data.data || []);

      if (salesInvoicesRes?.data?.status === 'success') {
        const mappedInvoices = (salesInvoicesRes.data.data || []).map(inv => ({
          ...inv,
          grandTotal: inv.grand_total
        }));
        setSalesInvoices(mappedInvoices);
      }
      if (quickServicesRes?.data?.status === 'success') setQuickServices(quickServicesRes.data.data || []);
      if (quickServicePresetsRes?.data?.status === 'success') setQuickServicePresets(quickServicePresetsRes.data.data || []);
      if (customersRes?.data?.status === 'success') setCustomers(customersRes.data.data || []);
      if (expensesRes?.data?.status === 'success') setExpenses(expensesRes.data.data || []);
      if (creditPaymentsRes?.data?.status === 'success') setCreditPayments(creditPaymentsRes.data.data || []);
      if (tyreExportPaymentsRes?.data?.status === 'success') setTyreExportPayments(tyreExportPaymentsRes.data.data || []);

      if (serviceInvoicesRes?.data?.status === 'success') {
        const mappedServices = (serviceInvoicesRes.data.data || []).map(s => ({
          ...s,
          invoiceNumber: s.id ? s.id.substring(0, 8).toUpperCase() : 'SRV-000',
          createdAt: s.service_date ? s.service_date + "T00:00:00" : new Date().toISOString(),
          customerName: s.remark || 'Walk-in Customer',
          phoneNumber: 'N/A',
          vehicleNumber: 'N/A',
          description: s.name,
          labourCost: s.price,
          partsCost: 0,
          totalAmount: s.price,
        }));
        setServiceInvoices(mappedServices);
      }

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated]);

  return (
    <HelperContext.Provider value={{
      products,
      workers,
      attendances,
      workerCredits,
      salaryPayments,
      salaryAdvances,
      creditSales,
      exportRecords,
      salesInvoices,
      serviceInvoices,
      quickServices,
      quickServicePresets,
      customers,
      expenses,
      creditPayments,
      tyreExportPayments,
      isLoading,
      error,
      fetchAllData
    }}>
      {children}
    </HelperContext.Provider>
  );
};

export const useHelper = () => {
  const context = useContext(HelperContext);
  if (!context) {
    throw new Error('useHelper must be used within a HelperProvider');
  }
  return context;
};
