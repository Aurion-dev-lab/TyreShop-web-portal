import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = () => api.get('/products');
export const getWorkers = () => api.get('/workers');
export const getAttendances = () => api.get('/attendance');
export const getCreditSales = () => api.get('/credit-sales');
export const getExportRecords = () => api.get('/export-records');
export const getServiceInvoices = () => api.get('/service-invoices');
export const getSalesInvoices = () => api.get('/sales-invoices');

export default api;