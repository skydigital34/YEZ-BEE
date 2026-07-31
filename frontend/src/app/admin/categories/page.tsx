'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, ChevronRight, ChevronDown, GripVertical,
  Edit2, Trash2, Eye, Image, FolderTree, X, Save,
  ChevronUp, ToggleLeft, ToggleRight
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  displayOrder: number
  status: 'active' | 'inactive'
  parentId: string | null
  children: Category[]
}

const allCategories: Category[] = [
  {
    id: 'cat-1', name: 'Clothing', slug: 'clothing', description: 'Premium apparel collection', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
    productCount: 45, displayOrder: 1, status: 'active', parentId: null,
    children: [
      { id: 'cat-1-1', name: 'Gowns', slug: 'gowns', description: 'Evening and bridal gowns', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop', productCount: 12, displayOrder: 1, status: 'active', parentId: 'cat-1', children: [] },
      { id: 'cat-1-2', name: 'Sarees', slug: 'sarees', description: 'Handcrafted silk sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop', productCount: 18, displayOrder: 2, status: 'active', parentId: 'cat-1', children: [] },
      { id: 'cat-1-3', name: 'Lehengas', slug: 'lehengas', description: 'Designer lehenga collection', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop', productCount: 8, displayOrder: 3, status: 'active', parentId: 'cat-1', children: [] },
      { id: 'cat-1-4', name: 'Kurtas', slug: 'kurtas', description: 'Traditional kurta sets', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400&auto=format&fit=crop', productCount: 7, displayOrder: 4, status: 'active', parentId: 'cat-1', children: [] },
    ],
  },
  {
    id: 'cat-2', name: 'Accessories', slug: 'accessories', description: 'Luxury accessories', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop',
    productCount: 28, displayOrder: 2, status: 'active', parentId: null,
    children: [
      { id: 'cat-2-1', name: 'Jewelry', slug: 'jewelry', description: 'Statement jewelry pieces', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop', productCount: 15, displayOrder: 1, status: 'active', parentId: 'cat-2', children: [] },
      { id: 'cat-2-2', name: 'Bags', slug: 'bags', description: 'Designer handbags and clutches', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', productCount: 8, displayOrder: 2, status: 'active', parentId: 'cat-2', children: [] },
    ],
  },
  {
    id: 'cat-3', name: 'Footwear', slug: 'footwear', description: 'Premium footwear', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
    productCount: 15, displayOrder: 3, status: 'active', parentId: null,
    children: [
      { id: 'cat-3-1', name: 'Heels', slug: 'heels', description: 'Designer heels', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop', productCount: 9, displayOrder: 1, status: 'active', parentId: 'cat-3', children: [] },
      { id: 'cat-3-2', name: 'Flats', slug: 'flats', description: 'Comfort luxury flats', image: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?q=80&w=400&auto=format&fit=crop', productCount: 6, displayOrder: 2, status: 'inactive', parentId: 'cat-3', children: [] },
    ],
  },
]

function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
  onToggleStatus,
  expanded,
  onToggleExpand,
}: {
  category: Category
  depth: number
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
  onToggleStatus: (c: Category) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  const hasChildren = category.children.length > 0

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAF7F2] transition-colors border-b border-gray-50 group ${
          depth > 0 ? 'ml-0' : ''
        }`}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <button
          onClick={onToggleExpand}
          className={`p-0.5 text-gray-300 hover:text-[#C9A84C] transition-colors ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="w-8 h-8 bg-[#F5E6C8]/50 rounded-lg flex items-center justify-center flex-shrink-0">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <FolderTree size={16} className="text-[#C9A84C]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{category.name}</p>
            <span className="text-xs text-gray-400">/{category.slug}</span>
          </div>
          {category.description && (
            <p className="text-xs text-gray-400 truncate">{category.description}</p>
          )}
        </div>

        <span className="text-sm text-gray-500 font-medium">{category.productCount} products</span>

        <button
          onClick={() => onToggleStatus(category)}
          className="text-gray-400 hover:text-[#C9A84C] transition-colors"
        >
          {category.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(category)} className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-[#F5E6C8]/30">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(category)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {category.children.map((child) => (
              <CategoryRow
                key={child.id}
                category={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                expanded={false}
                onToggleExpand={() => {}}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['cat-1', 'cat-2', 'cat-3']))
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    name: string; slug: string; description: string; image: string; parentId: string; displayOrder: number; status: 'active' | 'inactive';
  }>({
    name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 1, status: 'active',
  })

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAddRoot = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 1, status: 'active' })
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId || '',
      displayOrder: cat.displayOrder,
      status: cat.status,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    setShowModal(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organize your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddRoot}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            Add Root Category
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-0">
          {allCategories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              depth={0}
              onEdit={openEdit}
              onDelete={(c) => {}}
              onToggleStatus={(c) => {}}
              expanded={expandedIds.has(cat.id)}
              onToggleExpand={() => toggleExpand(cat.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Category name"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="category-slug"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">None (Root Category)</option>
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="text-[#C9A84C] focus:ring-[#C9A84C]/30"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="text-[#C9A84C] focus:ring-[#C9A84C]/30"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-[#FAF7F2] rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl transition-all"
                >
                  <Save size={16} />
                  {editingCategory ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
