import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getProducts,
  getProductImages,
  getWorkers,
  getAttendances,
  getWorkerCredits,
  getSalaryPayments,
  getSalaryAdvances,
  getCreditSales,
  getCreditSaleParts,
  getExportRecords,
  getServiceInvoices,
  getQuickServices,
  getQuickServicePresets,
  getSalesInvoices,
  getInvoiceLineItems,
  getCustomers,
  getExpenses
} from '../api/api.js';

const HelperContext = createContext();

export const HelperProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [workerCredits, setWorkerCredits] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [creditSaleParts, setCreditSaleParts] = useState([]);
  const [exportRecords, setExportRecords] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [invoiceLineItems, setInvoiceLineItems] = useState([]);
  const [serviceInvoices, setServiceInvoices] = useState([]);
  const [quickServices, setQuickServices] = useState([]);
  const [quickServicePresets, setQuickServicePresets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        productsRes,
        productImagesRes,
        workersRes,
        attendancesRes,
        workerCreditsRes,
        salaryPaymentsRes,
        salaryAdvancesRes,
        creditSalesRes,
        creditSalePartsRes,
        exportRecordsRes,
        salesInvoicesRes,
        invoiceLineItemsRes,
        serviceInvoicesRes,
        quickServicesRes,
        quickServicePresetsRes,
        customersRes,
        expensesRes
      ] = await Promise.all([
        getProducts(),
        getProductImages(),
        getWorkers(),
        getAttendances(),
        getWorkerCredits(),
        getSalaryPayments(),
        getSalaryAdvances(),
        getCreditSales(),
        getCreditSaleParts(),
        getExportRecords(),
        getSalesInvoices(),
        getInvoiceLineItems(),
        getServiceInvoices(),
        getQuickServices(),
        getQuickServicePresets(),
        getCustomers(),
        getExpenses()
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
          workerId: w.id,
          name: w.name,
          jobRole: w.role,
          telephone: w.phone,
          salaryType: w.salary_type || 'Monthly',
          rate: w.rate ? parseFloat(w.rate) : 0,
        }));
        setWorkers(mappedWorkers);
      }

      if (attendancesRes?.data?.status === 'success') setAttendances(attendancesRes.data.data || []);
      if (productImagesRes?.data?.status === 'success') setProductImages(productImagesRes.data.data || []);
      if (workerCreditsRes?.data?.status === 'success') setWorkerCredits(workerCreditsRes.data.data || []);
      if (salaryPaymentsRes?.data?.status === 'success') setSalaryPayments(salaryPaymentsRes.data.data || []);
      if (salaryAdvancesRes?.data?.status === 'success') setSalaryAdvances(salaryAdvancesRes.data.data || []);
      if (creditSalesRes?.data?.status === 'success') setCreditSales(creditSalesRes.data.data || []);
      if (creditSalePartsRes?.data?.status === 'success') setCreditSaleParts(creditSalePartsRes.data.data || []);
      if (exportRecordsRes?.data?.status === 'success') setExportRecords(exportRecordsRes.data.data || []);

      if (salesInvoicesRes?.data?.status === 'success') {
        const mappedInvoices = (salesInvoicesRes.data.data || []).map(inv => ({
          ...inv,
          grandTotal: inv.grand_total
        }));
        setSalesInvoices(mappedInvoices);
      }
      if (invoiceLineItemsRes?.data?.status === 'success') setInvoiceLineItems(invoiceLineItemsRes.data.data || []);
      if (quickServicesRes?.data?.status === 'success') setQuickServices(quickServicesRes.data.data || []);
      if (quickServicePresetsRes?.data?.status === 'success') setQuickServicePresets(quickServicePresetsRes.data.data || []);
      if (customersRes?.data?.status === 'success') setCustomers(customersRes.data.data || []);
      if (expensesRes?.data?.status === 'success') setExpenses(expensesRes.data.data || []);

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
    fetchAllData();
  }, []);

  return (
    <HelperContext.Provider value={{
      products,
      productImages,
      workers,
      attendances,
      workerCredits,
      salaryPayments,
      salaryAdvances,
      creditSales,
      creditSaleParts,
      exportRecords,
      salesInvoices,
      invoiceLineItems,
      serviceInvoices,
      quickServices,
      quickServicePresets,
      customers,
      expenses,
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
