'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Layers,
  Tag,
  Shield,
  HelpCircle,
  X,
  Check,
  Grid,
} from 'lucide-react';
import {
  saveOrUpdateProduct,
  slugify,
  ProductVariant,
  CatalogProduct,
  getCategoryNameBySlug,
} from '@/data/products';
import { YEZBEE_CATEGORIES } from '@/data/categories';

// Standard swatch presets
const PRESET_COLORS = [
  { name: 'Peach Floral', hex: '#FFDAB9' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Sage Green', hex: '#8FBC8F' },
  { name: 'Blush Pink', hex: '#FFB6C1' },
  { name: 'Maroon Gold', hex: '#800000' },
  { name: 'Teal Blue', hex: '#008080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Indigo Blue', hex: '#3F51B5' },
  { name: 'Mustard Yellow', hex: '#FFC107' },
  { name: 'Coral Pink', hex: '#FF6F61' },
];

const ADULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const KIDS_SIZES = ['0-1Y', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-10Y', '10-12Y', '12-14Y'];

export default function CreateProductPage() {
  const router = useRouter();

  // Active Form Tab
  const [activeTab, setActiveTab] = useState<
    'basic' | 'media' | 'pricing' | 'variants' | 'attributes' | 'shipping' | 'seo'
  >('basic');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [category, setCategory] = useState('maternity-kurtis');
  const [subcategory, setSubcategory] = useState('Cotton Kurtis');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    'Soft breathable cotton fabric',
    'Generous bump space for pregnancy',
    'Discreet feeding access',
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  // Toggles
  const [maternity, setMaternity] = useState(true);
  const [feedingFriendly, setFeedingFriendly] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(true);

  // Pricing
  const [price, setPrice] = useState<number | ''>(1899);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(2499);
  const [costPrice, setCostPrice] = useState<number | ''>(950);

  // Media
  const [images, setImages] = useState<string[]>([
    '/images/categories/maternity-kurtis.jpg',
    '/images/maternity/slide1.jpg',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Colors & Sizes selection for Variant Builder
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    PRESET_COLORS[0],
    PRESET_COLORS[1],
  ]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { color: 'Peach Floral', size: 'S', sku: 'YZB-NEW-PCH-S', stock: 10, isActive: true },
    { color: 'Peach Floral', size: 'M', sku: 'YZB-NEW-PCH-M', stock: 15, isActive: true },
    { color: 'Navy Blue', size: 'M', sku: 'YZB-NEW-NAV-M', stock: 8, isActive: true },
    { color: 'Navy Blue', size: 'L', sku: 'YZB-NEW-NAV-L', stock: 5, isActive: true },
  ]);

  // Product Details
  const [fabric, setFabric] = useState('100% Pure Cotton');
  const [fit, setFit] = useState('Relaxed A-Line Silhouette');
  const [pattern, setPattern] = useState('Floral Printed');
  const [neckStyle, setNeckStyle] = useState('Mandarin Collar');
  const [sleeveLength, setSleeveLength] = useState('3/4th Sleeve');
  const [length, setLength] = useState('Calf Length (46")');
  const [occasion, setOccasion] = useState('Everyday & Office Wear');
  const [gender, setGender] = useState('Women');
  const [tags, setTags] = useState<string[]>(['maternity', 'kurti', 'cotton']);

  // Shipping & Policies
  const [careInstructions, setCareInstructions] = useState('Machine wash cold inside out.');
  const [shippingInfo, setShippingInfo] = useState('Dispatched within 24 hours. Free shipping available.');
  const [returnPolicy, setReturnPolicy] = useState('7-day doorstep return and exchange.');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Status & Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  // Matrix Variant Generator
  const handleGenerateVariants = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      alert('Please select at least one color and one size to generate variants.');
      return;
    }

    const baseCode = (slug || 'PROD').toUpperCase().slice(0, 6);
    const newVariants: ProductVariant[] = [];

    selectedColors.forEach((colorObj) => {
      const colorShort = colorObj.name.slice(0, 3).toUpperCase();
      selectedSizes.forEach((sz) => {
        const sku = `YZB-${baseCode}-${colorShort}-${sz}`;
        newVariants.push({
          color: colorObj.name,
          size: sz,
          sku,
          stock: 10,
          price: Number(price) || 0,
          compareAtPrice: Number(compareAtPrice) || 0,
          isActive: true,
        });
      });
    });

    setVariants(newVariants);
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      const [chosen] = updated.splice(index, 1);
      return [chosen, ...updated];
    });
  };

  // Add highlight bullet
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights((prev) => [...prev, newHighlight.trim()]);
    setNewHighlight('');
  };

  // Calculate Total Stock
  const totalStock = useMemo(() => {
    return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  }, [variants]);

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Product name is required';
    if (!category) errs.category = 'Category selection is required';
    if (!description.trim() && !shortDescription.trim()) errs.description = 'Full or short description is required';
    if (!price || Number(price) <= 0) errs.price = 'Selling price must be greater than 0';
    if (compareAtPrice && Number(compareAtPrice) < Number(price)) {
      errs.compareAtPrice = 'Original price cannot be lower than selling price';
    }
    if (images.length === 0) errs.images = 'At least one product image is required';
    if (variants.length === 0) errs.variants = 'At least one product variant is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save as Draft or Publish
  const handleSave = (publishStatus: 'published' | 'draft') => {
    if (publishStatus === 'published' && !validateForm()) {
      alert('Please fill in all required fields before publishing.');
      return;
    }

    setSaving(true);

    const productPayload: Partial<CatalogProduct> = {
      name: name || 'Draft Product',
      slug: slug || slugify(name || 'draft-product'),
      category,
      categoryName: getCategoryNameBySlug(category),
      subcategory,
      shortDescription,
      description: description || shortDescription,
      highlights,
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : 0,
      currency: 'INR',
      images,
      thumbnail: images[0] || '/images/categories/maternity-kurtis.jpg',
      colors: selectedColors,
      variants,
      fabric,
      fit,
      pattern,
      neckStyle,
      sleeveLength,
      length,
      occasion,
      gender,
      maternity,
      feedingFriendly,
      sizes: selectedSizes,
      stock: totalStock,
      lowStockThreshold: 5,
      rating: 5.0,
      reviewCount: 0,
      tags,
      careInstructions,
      shippingInfo,
      returnPolicy,
      featured,
      bestseller,
      newArrival,
      status: publishStatus,
      seo: {
        title: seoTitle || `${name} | YEZ BEE Fashion`,
        description: seoDescription || shortDescription || name,
      },
    };

    const saved = saveOrUpdateProduct(productPayload);
    setSaving(false);

    if (publishStatus === 'published') {
      alert(`Product "${saved.name}" published successfully!`);
    } else {
      alert(`Product "${saved.name}" saved as DRAFT.`);
    }

    router.push('/admin/products');
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-28 font-sans">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Create New Product</h1>
            <p className="text-xs text-gray-500">
              Add a new item to the official YEZ BEE catalog with color & size variants
            </p>
          </div>
        </div>
      </div>

      {/* Form Section Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'basic', label: '1. Basic Info' },
          { key: 'media', label: '2. Media & Images' },
          { key: 'pricing', label: '3. Pricing' },
          { key: 'variants', label: '4. Variants & Stock' },
          { key: 'attributes', label: '5. Product Specifications' },
          { key: 'shipping', label: '6. Shipping & Policy' },
          { key: 'seo', label: '7. SEO Meta' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[var(--color-dark)] text-white font-bold shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: BASIC INFORMATION ── */}
      {activeTab === 'basic' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Basic Information</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Latika Maternity Kurti"
                className={`w-full px-4 py-2.5 text-xs font-semibold rounded-xl border outline-none ${
                  errors.name ? 'border-rose-500 bg-rose-50' : 'border-gray-300 focus:border-[var(--color-primary-gold)]'
                }`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
            </div>

            {/* URL Slug */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setIsCustomSlug(true);
                }}
                placeholder="latika-maternity-kurti"
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Preview: /product/{slug || 'product-slug'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category (STRICTLY RESTRICTED TO 6 CATEGORIES) */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Official Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === 'kids-clothing') {
                    setMaternity(false);
                    setFeedingFriendly(false);
                    setSelectedSizes(KIDS_SIZES.slice(0, 5));
                  }
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-white"
              >
                {YEZBEE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Subcategory / Collection Edit</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Cotton Kurtis, Feeding Suits"
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-sentence product summary for card previews"
              className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Full Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description covering fabric feel, fit, pregnancy features, and styling advice..."
              className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
          </div>

          {/* Product Highlights Bullet Points */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Key Product Highlights (Bullet Points)</label>
            <div className="space-y-2 mb-3">
              {highlights.map((h, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs">
                  <span className="flex-1 font-semibold">{h}</span>
                  <button
                    onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add bullet highlight (e.g. Concealed 2-way zip nursing access)..."
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none focus:border-[var(--color-primary-gold)]"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold rounded-xl"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Badges & Flags Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={maternity} onChange={(e) => setMaternity(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>Maternity Wear</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={feedingFriendly} onChange={(e) => setFeedingFriendly(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>Feeding Friendly</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>Featured Product</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>Bestseller Badge</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>New Arrival Badge</span>
            </label>
          </div>
        </div>
      )}

      {/* ── TAB 2: MEDIA & IMAGES ── */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Media Gallery</h2>

          {/* Add Image URL */}
          <div className="flex gap-2 max-w-xl">
            <input
              type="text"
              placeholder="Paste Image URL (or upload asset path like /images/categories/maternity-kurtis.jpg)..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
            <button
              onClick={handleAddImage}
              className="px-5 py-2.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase rounded-xl hover:bg-black"
            >
              Add Image
            </button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-300 bg-gray-50 group">
                <Image src={img} alt={`Product ${index + 1}`} fill className="object-cover" />

                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-[var(--color-dark)] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Primary
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {index !== 0 && (
                    <button
                      onClick={() => handleSetPrimaryImage(index)}
                      className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: PRICING ── */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pricing Configuration</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Original / Compare-at Price (₹)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Cost Price (Admin Internal ₹)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50"
              />
            </div>
          </div>

          {price && compareAtPrice && Number(compareAtPrice) > Number(price) && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Sparkles size={16} /> Customer savings calculated: Save {Math.round(((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100)}% OFF!
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: VARIANTS & MATRIX BUILDER ── */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Color & Size Variant Builder</h2>

          {/* Color Presets */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Select Available Colors for Matrix</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col) => {
                const isSelected = selectedColors.some((c) => c.name === col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedColors((prev) => prev.filter((c) => c.name !== col.name));
                      } else {
                        setSelectedColors((prev) => [...prev, col]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: col.hex }} />
                    {col.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Options */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Select Available Sizes for Matrix</label>
            <div className="flex flex-wrap gap-2">
              {(category === 'kids-clothing' ? KIDS_SIZES : ADULT_SIZES).map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSizes((prev) => prev.filter((s) => s !== sz));
                      } else {
                        setSelectedSizes((prev) => [...prev, sz]);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateVariants}
            className="px-6 py-3 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all"
          >
            ⚡ Generate Color x Size Variant Matrix
          </button>

          {/* Generated Variants Table */}
          {variants.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Color</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Stock Quantity</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold">{v.color}</td>
                      <td className="p-3 font-bold text-[var(--color-primary-gold)]">{v.size}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].sku = e.target.value;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 text-xs border rounded font-mono w-40"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].stock = Number(e.target.value) || 0;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 text-xs border rounded font-bold w-20"
                        />
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          v.stock > 5 ? 'bg-emerald-100 text-emerald-800' : v.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {v.stock > 5 ? 'In Stock' : v.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: SPECIFICATIONS ── */}
      {activeTab === 'attributes' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Specifications & Attributes</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Fabric Material</label>
              <input type="text" value={fabric} onChange={(e) => setFabric(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Silhouette Fit</label>
              <input type="text" value={fit} onChange={(e) => setFit(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Pattern</label>
              <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Neck Style</label>
              <input type="text" value={neckStyle} onChange={(e) => setNeckStyle(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Sleeve Length</label>
              <input type="text" value={sleeveLength} onChange={(e) => setSleeveLength(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Garment Length</label>
              <input type="text" value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: SHIPPING ── */}
      {activeTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Shipping & Care Policy</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Care Instructions</label>
            <input type="text" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Shipping Info</label>
            <input type="text" value={shippingInfo} onChange={(e) => setShippingInfo(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Return Policy</label>
            <input type="text" value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
          </div>
        </div>
      )}

      {/* ── TAB 7: SEO ── */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Search Engine Optimization (SEO)</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">SEO Title</label>
            <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${name} | YEZ BEE Fashion`} className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">SEO Meta Description</label>
            <textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={shortDescription || name} className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none" />
          </div>

          {/* Google Search Result Preview */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Google Search Preview</span>
            <p className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer">{seoTitle || `${name || 'Product Title'} | YEZ BEE Fashion`}</p>
            <p className="text-[11px] text-emerald-700">https://yezbee.com/product/{slug || 'product-slug'}</p>
            <p className="text-xs text-gray-600 line-clamp-2">{seoDescription || shortDescription || 'Shop YEZ BEE official collection.'}</p>
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM ADMIN ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-dark)] text-white p-4 border-t border-[var(--color-primary-gold)] shadow-2xl flex items-center justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold">{name || 'New Product Draft'}</p>
          <p className="text-[10px] text-gray-400">Total Variants: {variants.length} · Total Stock: {totalStock}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Publish Product
          </button>
        </div>
      </div>

    </div>
  );
}
