import React, { useState, useMemo } from 'react';
import { useHelper } from '../context/helperContext.jsx';
import api from '../api/api.js';
import {
  FiBox,
  FiSearch,
  FiPlus,
  FiAlertTriangle,
  FiLayers,
  FiDollarSign,
  FiTrendingUp,
  FiTrash2,
  FiEdit
} from 'react-icons/fi';

const InventoryPage = () => {
  const { products, fetchAllData } = useHelper();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  console.log(products);
  

  // Stats calculations
  const totalProducts = products.length;
  const unitsInStock = products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
  const lowStockCount = products.filter(p => (parseInt(p.stock) || 0) <= (parseInt(p.minimum_stock_alert) || 5)).length;

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.product_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FiBox className="text-emerald-500" /> Inventory
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Track and manage your vehicle parts stock</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-slate-500">
            <FiBox className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Products</p>
            <h2 className="text-3xl font-black text-slate-800 mt-1">{totalProducts}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-emerald-500">
            <FiLayers className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Units in Stock</p>
            <h2 className="text-3xl font-black text-slate-800 mt-1">{unitsInStock}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
            <FiAlertTriangle className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Low Stock</p>
            <h2 className="text-3xl font-black text-rose-500 mt-1">{lowStockCount}</h2>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or category..."
            className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((p) => {
          const isLow = (parseInt(p.stock) || 0) <= (parseInt(p.minimum_stock_alert) || 5);
          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                  <FiBox className="text-xl" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">{p.name || 'Unnamed Item'}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{p.product_code || p.id?.substring(0, 8)}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold rounded-full uppercase border border-indigo-100">
                      {p.category || 'General'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">
                      Buy: <span className="font-bold text-slate-700">Rs. {p.buy_price?.toLocaleString()}</span>
                    </span>
                    <span className="text-slate-400 text-xs font-medium">
                      Sell: <span className="font-bold text-slate-700">Rs. {p.sell_price?.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto gap-2">
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800">{p.stock || 0}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-1">units</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isLow ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {isLow ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm font-medium bg-white rounded-3xl border border-slate-200 shadow-sm">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
