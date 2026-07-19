import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = () => api.get('products');
export const getProductImages = () => api.get('productimages');
export const getWorkers = () => api.get('workers');
export const getAttendances = () => api.get('workerattendances');
export const getWorkerCredits = () => api.get('workercredits');
export const getSalaryPayments = () => api.get('salarypayments');
export const getSalaryAdvances = () => api.get('salaryadvances');
export const getCreditSales = () => api.get('creditsales');
export const getCreditSaleParts = () => api.get('creditsaleparts');
export const getExportRecords = () => api.get('tyreexports');
export const getServiceInvoices = () => api.get('serviceentitys');
export const getQuickServices = () => api.get('quickservices');
export const getQuickServicePresets = () => api.get('quickservicepresets');
export const getSalesInvoices = () => api.get('invoices');
export const getInvoiceLineItems = () => api.get('invoicelineitems');
export const getCustomers = () => api.get('customers');
export const getExpenses = () => api.get('expenses');

export default api;