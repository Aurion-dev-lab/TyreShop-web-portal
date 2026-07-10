import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getProducts, 
  getWorkers, 
  getAttendances, 
  getCreditSales, 
  getExportRecords, 
  getSalesInvoices, 
  getServiceInvoices 
} from '../api/api.js';

const HelperContext = createContext();

export const HelperProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [exportRecords, setExportRecords] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [serviceInvoices, setServiceInvoices] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        productsRes,
        workersRes,
        attendancesRes,
        creditSalesRes,
        exportRecordsRes,
        salesInvoicesRes,
        serviceInvoicesRes
      ] = await Promise.all([
        getProducts(),
        getWorkers(),
        getAttendances(),
        getCreditSales(),
        getExportRecords(),
        getSalesInvoices(),
        getServiceInvoices()
      ]);

      if (productsRes?.data?.status === 'success') setProducts(productsRes.data.data || []);
      if (workersRes?.data?.status === 'success') setWorkers(workersRes.data.data || []);
      if (attendancesRes?.data?.status === 'success') setAttendances(attendancesRes.data.data || []);
      if (creditSalesRes?.data?.status === 'success') setCreditSales(creditSalesRes.data.data || []);
      if (exportRecordsRes?.data?.status === 'success') setExportRecords(exportRecordsRes.data.data || []);
      if (salesInvoicesRes?.data?.status === 'success') setSalesInvoices(salesInvoicesRes.data.data || []);
      if (serviceInvoicesRes?.data?.status === 'success') setServiceInvoices(serviceInvoicesRes.data.data || []);

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
      workers, 
      attendances, 
      creditSales, 
      exportRecords, 
      salesInvoices, 
      serviceInvoices,
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
