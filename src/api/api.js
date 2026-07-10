import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- Products ---
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- Workers ---
export const getWorkers = () => api.get('/workers');
export const getWorkerById = (id) => api.get(`/workers/${id}`);
export const createWorker = (data) => api.post('/workers', data);
export const updateWorker = (id, data) => api.put(`/workers/${id}`, data);
export const deleteWorker = (id) => api.delete(`/workers/${id}`);

// --- Attendance ---
export const getAttendances = () => api.get('/attendance');
export const getAttendanceById = (id) => api.get(`/attendance/${id}`);
export const createAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// --- Credit Sales ---
export const getCreditSales = () => api.get('/credit-sales');
export const getCreditSaleById = (id) => api.get(`/credit-sales/${id}`);
export const createCreditSale = (data) => api.post('/credit-sales', data);
export const updateCreditSale = (id, data) => api.put(`/credit-sales/${id}`, data);
export const deleteCreditSale = (id) => api.delete(`/credit-sales/${id}`);

// --- Export Records ---
export const getExportRecords = () => api.get('/export-records');
export const getExportRecordById = (id) => api.get(`/export-records/${id}`);
export const createExportRecord = (data) => api.post('/export-records', data);
export const updateExportRecord = (id, data) => api.put(`/export-records/${id}`, data);
export const deleteExportRecord = (id) => api.delete(`/export-records/${id}`);

// --- Service Invoices ---
export const getServiceInvoices = () => api.get('/service-invoices');
export const getServiceInvoiceById = (id) => api.get(`/service-invoices/${id}`);
export const createServiceInvoice = (data) => api.post('/service-invoices', data);
export const updateServiceInvoice = (id, data) => api.put(`/service-invoices/${id}`, data);
export const deleteServiceInvoice = (id) => api.delete(`/service-invoices/${id}`);

// --- Sales Invoices ---
export const getSalesInvoices = () => api.get('/sales-invoices');
export const getSalesInvoiceById = (id) => api.get(`/sales-invoices/${id}`);
export const createSalesInvoice = (data) => api.post('/sales-invoices', data);
export const updateSalesInvoice = (id, data) => api.put(`/sales-invoices/${id}`, data);
export const deleteSalesInvoice = (id) => api.delete(`/sales-invoices/${id}`);

export default {
  api, 
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker,
  getAttendances, getAttendanceById, createAttendance, updateAttendance, deleteAttendance,
  getCreditSales, getCreditSaleById, createCreditSale, updateCreditSale, deleteCreditSale,
  getExportRecords, getExportRecordById, createExportRecord, updateExportRecord, deleteExportRecord,
  getServiceInvoices, getServiceInvoiceById, createServiceInvoice, updateServiceInvoice, deleteServiceInvoice,
  getSalesInvoices, getSalesInvoiceById, createSalesInvoice, updateSalesInvoice, deleteSalesInvoice
};
