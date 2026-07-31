'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Save, Plus, X, ChevronDown, Image, Upload, GripVertical,
  Trash2, Copy, Star, Hash, Eye, FileText, DollarSign,
  Layers, Search, Settings, Tags, AlignLeft, Type, Link as LinkIcon,
  RefreshCw, Check, AlertCircle
} from 'lucide-react'
import FormField from '@/components/admin/FormField'

interface Variant {
  id: string
  sku: string
  color: string
  colorHex: string
  size: string
  price: number | null
  stock: number
}

interface Feature {
  id: string
  text: string
}

const tabs = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'variants', label: 'Variants', icon: Layers },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'seo', label: 'SEO', icon: Search },
]

const colors = ['#FF0000', '#0000FF', '#008000', '#FFC0CB', '#000000', '#FFFFFF', '#C9A84C', '#800080', '#FFA500', '#808080']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free']

export default function NewProductPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [tags, setTags] = useState('')
  const [features, setFeatures] = useState<Feature[]>([{ id: '1', text: '' }])
  const [basePrice, setBasePrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [taxRate, setTaxRate] = useState('18')
  const [costPrice, setCostPrice] = useState('')
  const [variants, setVariants] = useState<Variant[]>([])
  const [images, setImages] = useState<{ id: string; file: File | null; preview: string; alt: string; primary: boolean }[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const autoGenerateSlug = (val: string) => {
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const addFeature = () => {
    setFeatures([...features, { id: String(Date.now()), text: '' }])
  }

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id))
  }

  const updateFeature = (id: string, text: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, text } : f))
  }

  const addVariant = () => {
    setVariants([...variants, {
      id: String(Date.now()),
      sku: '',
      color: '',
      colorHex: '#000000',
      size: '',
      price: null,
      stock: 0,
    }])
  }

  const updateVariant = (id: string, key: keyof Variant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [key]: value } : v))
  }

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const generateBulkVariants = () => {
    const newVariants: Variant[] = []
    colors.forEach((colorHex) => {
      sizes.forEach((size) => {
        newVariants.push({
          id: String(Date.now() + Math.random()),
          sku: '',
          color: '',
          colorHex,
          size,
          price: null,
          stock: 0,
        })
      })
    })
    setVariants(newVariants)
  }

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        setImages(prev => [...prev, {
          id: String(Date.now()),
          file,
          preview,
          alt: '',
          primary: prev.length === 0,
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== id)
      if (filtered.length > 0 && !filtered.some(i => i.primary)) {
        filtered[0].primary = true
      }
      return filtered
    })
  }

  const setPrimaryImage = (id: string) => {
    setImages(prev => prev.map(i => ({ ...i, primary: i.id === id })))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Product name is required'
    if (!slug.trim()) errs.slug = 'Slug is required'
    if (!basePrice || parseFloat(basePrice) <= 0) errs.basePrice = 'Valid base price is required'
    if (variants.length === 0) errs.variants = 'At least one variant is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = (action: 'save' | 'save_new') => {
    if (!validate()) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      if (action === 'save') router.push('/admin/products')
      else { resetForm(); setActiveTab('general') }
    }, 1500)
  }

  const resetForm = () => {
    setName(''); setSlug(''); setDescription(''); setShortDesc('')
    setCategory(''); setBrand(''); setTags(''); setFeatures([{ id: '1', text: '' }])
    setBasePrice(''); setComparePrice(''); setTaxRate('18'); setCostPrice('')
    setVariants([]); setImages([])
    setMetaTitle(''); setMetaDesc(''); setOgImage('')
    setErrors({})
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (!files) return
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setImages(prev => [...prev, { id: String(Date.now()), file, preview: event.target?.result as string, alt: '', primary: prev.length === 0 }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const tabContent = {
    general: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField label="Product Name" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); autoGenerateSlug(e.target.value) }}
              placeholder="Enter product name"
              className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug}>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="product-slug"
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
              />
            </div>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed product description..."
            rows={5}
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all resize-none"
          />
        </FormField>

        <FormField label="Short Description">
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Brief summary for product cards..."
            rows={2}
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all resize-none"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Select category</option>
              <option value="gowns">Gowns</option>
              <option value="sarees">Sarees</option>
              <option value="lehengas">Lehengas</option>
              <option value="blazers">Blazers</option>
              <option value="kurtas">Kurtas</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="dresses">Dresses</option>
              <option value="accessories">Accessories</option>
              <option value="jewelry">Jewelry</option>
              <option value="footwear">Footwear</option>
            </select>
          </FormField>
          <FormField label="Brand">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="YEZ BEE"
              className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Tags">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="luxury, silk, evening"
              className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
            />
          </FormField>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={feature.id} className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-300 cursor-grab" />
                <input
                  type="text"
                  value={feature.text}
                  onChange={(e) => updateFeature(feature.id, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  className="flex-1 px-4 py-2 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                />
                <button onClick={() => removeFeature(feature.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addFeature}
            className="mt-2 flex items-center gap-1.5 text-xs text-[#C9A84C] font-medium hover:underline"
          >
            <Plus size={14} /> Add feature
          </button>
        </div>
      </div>
    ),
    pricing: (
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Base Price (₹)" required error={errors.basePrice}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
              />
            </div>
          </FormField>
          <FormField label="Compare-at Price (₹)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
              />
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tax Rate (%)">
            <div className="relative">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="18"
                className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </FormField>
          <FormField label="Cost Price (₹)" helperText="Hidden from customers">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
              />
            </div>
          </FormField>
        </div>

        <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#F5E6C8]/50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pricing Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base Price</span>
              <span className="font-medium text-gray-900">₹{parseFloat(basePrice || '0').toLocaleString()}</span>
            </div>
            {comparePrice && (
              <div className="flex justify-between text-gray-600">
                <span>Compare-at Price</span>
                <span className="font-medium text-gray-400 line-through">₹{parseFloat(comparePrice).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax Rate</span>
              <span className="font-medium text-gray-900">{taxRate}%</span>
            </div>
            {basePrice && (
              <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
                <span>Margin</span>
                <span className="font-medium text-green-600">
                  {costPrice ? `${(((parseFloat(basePrice) - parseFloat(costPrice || '0')) / parseFloat(basePrice)) * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    variants: (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{variants.length} variant{variants.length !== 1 ? 's' : ''}</p>
            {errors.variants && <p className="text-red-500 text-xs mt-1">{errors.variants}</p>}
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateBulkVariants}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#C9A84C] border border-[#C9A84C]/30 rounded-xl hover:bg-[#C9A84C]/5 transition-all"
            >
              <RefreshCw size={14} /> Generate All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addVariant}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#C9A84C] rounded-xl hover:bg-[#A8882E] shadow-md shadow-[#C9A84C]/20 transition-all"
            >
              <Plus size={14} /> Add Variant
            </motion.button>
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-gray-200">
            <Layers size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">No variants yet</p>
            <p className="text-xs text-gray-400 mt-1">Add variants or generate all combinations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">Color</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">Size</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50"
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="w-28 px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                          placeholder="Color"
                          className="w-20 px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
                        />
                        <input
                          type="color"
                          value={v.colorHex}
                          onChange={(e) => updateVariant(v.id, 'colorHex', e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={v.size}
                        onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs bg-[#FAF7F2] rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all cursor-pointer"
                      >
                        <option value="">Size</option>
                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={v.price ?? ''}
                        onChange={(e) => updateVariant(v.id, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Base"
                        className="w-20 px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                        className="w-16 px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => removeVariant(v.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ),
    images: (
      <div className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-[#C9A84C]/50 transition-colors bg-[#FAF7F2] cursor-pointer group"
        >
          <div className="group-hover:scale-110 transition-transform">
            <Upload size={40} className="mx-auto text-gray-300 group-hover:text-[#C9A84C]" />
          </div>
          <p className="text-sm text-gray-500 font-medium mt-3">
            <span className="text-[#C9A84C]">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={addImage}
            className="hidden"
            id="imageUpload"
          />
          <label htmlFor="imageUpload" className="cursor-pointer" />
        </div>

        {images.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{images.length} image{images.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                    img.primary ? 'border-[#C9A84C] shadow-lg shadow-[#C9A84C]/20' : 'border-gray-100'
                  }`}
                >
                  <div className="aspect-square bg-[#FAF7F2]">
                    <img src={img.preview} alt={img.alt || 'Product'} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.primary && (
                      <button onClick={() => setPrimaryImage(img.id)} className="p-1.5 bg-white rounded-full text-gray-700 hover:text-[#C9A84C] shadow-md" title="Set as primary">
                        <Star size={14} />
                      </button>
                    )}
                    <button onClick={() => removeImage(img.id)} className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-500 shadow-md" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {img.primary && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#C9A84C] text-white text-[10px] font-medium rounded-md shadow-md">
                      Primary
                    </div>
                  )}
                  <div className="p-2">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => setImages(prev => prev.map(i => i.id === img.id ? { ...i, alt: e.target.value } : i))}
                      placeholder="Alt text"
                      className="w-full text-xs bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#C9A84C] outline-none transition-colors text-gray-600 placeholder-gray-300"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    seo: (
      <div className="space-y-6 max-w-2xl">
        <FormField label="Meta Title">
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={name || 'Product meta title'}
            className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
          />
          <span className="text-xs text-gray-400 mt-1">{metaTitle.length || 0} / 60 characters</span>
        </FormField>

        <FormField label="Meta Description">
          <textarea
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            placeholder={description || 'Product meta description'}
            rows={3}
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all resize-none"
          />
          <span className="text-xs text-gray-400 mt-1">{metaDesc.length || 0} / 160 characters</span>
        </FormField>

        <FormField label="OG Image URL">
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
          />
        </FormField>

        <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#F5E6C8]/50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Preview</h4>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[#C9A84C] text-xs font-medium uppercase tracking-wider">yezbee.com</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{metaTitle || name || 'Product Title'}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{metaDesc || description || 'Product description will appear here...'}</p>
            <p className="text-xs text-[#C9A84C] mt-1 break-all">{slug ? `/product/${slug}` : '/product/product-slug'}</p>
          </div>
        </div>
      </div>
    ),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">New Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Add a premium product to your catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave('save_new')}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all disabled:opacity-50"
          >
            Save & New
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave('save')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl transition-all disabled:opacity-70"
          >
            {saving ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save'}
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab as keyof typeof tabContent]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
