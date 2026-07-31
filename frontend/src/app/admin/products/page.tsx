'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus, Search, Filter, MoreVertical, Edit, Copy, Trash2,
  ChevronDown, Download, ToggleLeft, ToggleRight, Package,
  Grid3X3, List, SlidersHorizontal, X
} from 'lucide-react'
import DataTable from '@/components/admin/DataTable'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  comparePrice: number | null
  stock: number
  lowStockThreshold: number
  status: 'active' | 'draft' | 'out_of_stock' | 'discontinued'
  image: string
  createdAt: string
}

const allProducts: Product[] = [
  { id: 'PRD-001', name: 'Silk Evening Gown', sku: 'YEB-SEG-001', category: 'Gowns', price: 42500, comparePrice: 52000, stock: 28, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop', createdAt: '2026-07-01' },
  { id: 'PRD-002', name: 'Velvet Blazer', sku: 'YEB-VB-002', category: 'Blazers', price: 28900, comparePrice: 35000, stock: 3, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400&auto=format&fit=crop', createdAt: '2026-07-05' },
  { id: 'PRD-003', name: 'Handcrafted Saree', sku: 'YEB-HS-003', category: 'Sarees', price: 35000, comparePrice: null, stock: 15, lowStockThreshold: 8, status: 'active', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop', createdAt: '2026-06-28' },
  { id: 'PRD-004', name: 'Designer Lehenga', sku: 'YEB-DL-004', category: 'Lehengas', price: 85000, comparePrice: 95000, stock: 5, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop', createdAt: '2026-06-20' },
  { id: 'PRD-005', name: 'Cashmere Shawl', sku: 'YEB-CS-005', category: 'Accessories', price: 15500, comparePrice: null, stock: 0, lowStockThreshold: 10, status: 'out_of_stock', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop', createdAt: '2026-06-15' },
  { id: 'PRD-006', name: 'Embroidered Kurta Set', sku: 'YEB-EKS-006', category: 'Kurtas', price: 12500, comparePrice: 16000, stock: 45, lowStockThreshold: 15, status: 'active', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop', createdAt: '2026-06-10' },
  { id: 'PRD-007', name: 'Sequined Crop Top', sku: 'YEB-SCT-007', category: 'Tops', price: 8900, comparePrice: null, stock: 22, lowStockThreshold: 10, status: 'draft', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', createdAt: '2026-06-05' },
  { id: 'PRD-008', name: 'Wide-Leg Silk Pants', sku: 'YEB-WSP-008', category: 'Bottoms', price: 18500, comparePrice: 22000, stock: 8, lowStockThreshold: 10, status: 'active', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop', createdAt: '2026-05-30' },
  { id: 'PRD-009', name: 'Floral Maxi Dress', sku: 'YEB-FMD-009', category: 'Dresses', price: 22000, comparePrice: 28000, stock: 0, lowStockThreshold: 10, status: 'discontinued', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop', createdAt: '2026-05-25' },
  { id: 'PRD-010', name: 'Statement Necklace', sku: 'YEB-SN-010', category: 'Jewelry', price: 12500, comparePrice: 15000, stock: 60, lowStockThreshold: 20, status: 'active', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop', createdAt: '2026-05-20' },
  { id: 'PRD-011', name: 'Leather Tote Bag', sku: 'YEB-LTB-011', category: 'Accessories', price: 32500, comparePrice: 40000, stock: 12, lowStockThreshold: 8, status: 'active', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', createdAt: '2026-05-15' },
  { id: 'PRD-012', name: 'Embellished Heels', sku: 'YEB-EH-012', category: 'Footwear', price: 18500, comparePrice: null, stock: 2, lowStockThreshold: 5, status: 'active', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop', createdAt: '2026-05-10' },
]

const tabs = ['All', 'Active', 'Draft', 'Out of Stock', 'Discontinued']

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Active' && p.status === 'active') ||
        (activeTab === 'Draft' && p.status === 'draft') ||
        (activeTab === 'Out of Stock' && p.status === 'out_of_stock') ||
        (activeTab === 'Discontinued' && p.status === 'discontinued')
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, search])

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 border-green-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      out_of_stock: 'bg-red-100 text-red-700 border-red-200',
      discontinued: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }
    const labels: Record<string, string> = {
      active: 'Active',
      draft: 'Draft',
      out_of_stock: 'Out of Stock',
      discontinued: 'Discontinued',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (row: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5E6C8]/50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-[#C9A84C]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row: Product) => (
        <span className="text-sm text-gray-600">{row.category}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (row: Product) => (
        <div>
          <span className="text-sm font-medium text-gray-900">₹{row.price.toLocaleString()}</span>
          {row.comparePrice && (
            <span className="text-xs text-gray-400 line-through ml-1.5">₹{row.comparePrice.toLocaleString()}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (row: Product) => {
        const isLow = row.stock <= row.lowStockThreshold
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  row.stock === 0 ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((row.stock / 100) * 100, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${row.stock === 0 ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-gray-700'}`}>
              {row.stock}
            </span>
            {isLow && (
              <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Low</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(row.status)}
          <button className="text-gray-400 hover:text-[#C9A84C] transition-colors">
            {row.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        </div>
      ),
    },
  ]

  const bulkActions = [
    { label: 'Delete Selected', icon: Trash2, action: () => {} },
    { label: 'Set Active', icon: ToggleRight, action: () => {} },
    { label: 'Set Draft', icon: ToggleLeft, action: () => {} },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filteredProducts.length} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-xl border border-gray-100 p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
          <Link href="/admin/products/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all"
            >
              <Plus size={16} />
              Add Product
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  ({allProducts.filter(p => {
                    if (tab === 'Active') return p.status === 'active'
                    if (tab === 'Draft') return p.status === 'draft'
                    if (tab === 'Out of Stock') return p.status === 'out_of_stock'
                    if (tab === 'Discontinued') return p.status === 'discontinued'
                    return false
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-transparent transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all">
            <SlidersHorizontal size={16} />
          </button>
          <button className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all">
            <Download size={16} />
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        onRowClick={(row) => window.location.href = `/admin/products/new?id=${row.id}`}
        pageSize={10}
      />
    </motion.div>
  )
}
