'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  getProductById,
  saveOrUpdateProduct,
  slugify,
  ProductVariant,
  CatalogProduct,
  getCategoryNameBySlug,
} from '@/data/products';
import { YEZBEE_CATEGORIES } from '@/data/categories';

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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<
    'basic' | 'media' | 'pricing' | 'variants' | 'attributes' | 'shipping' | 'seo'
  >('basic');

  const product = useMemo(() => getProductById(id), [id]);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('maternity-kurtis');
  const [subcategory, setSubcategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');

  // Toggles
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [maternity, setMaternity] = useState(true);
  const [feedingFriendly, setFeedingFriendly] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);

  // Pricing
  const [price, setPrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');

  // Media
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Variants
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Product Specs
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [pattern, setPattern] = useState('');
  const [neckStyle, setNeckStyle] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [length, setLength] = useState('');
  const [occasion, setOccasion] = useState('');
  const [gender, setGender] = useState('Women');
  const [tags, setTags] = useState<string[]>([]);

  // Shipping & Policies
  const [careInstructions, setCareInstructions] = useState('');
  const [shippingInfo, setShippingInfo] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [saving, setSaving] = useState(false);

  // Load product data into state on mount
  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setCategory(product.category);
      setSubcategory(product.subcategory);
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setHighlights(product.highlights || []);
      setStatus(product.status || 'published');
      setMaternity(product.maternity);
      setFeedingFriendly(product.feedingFriendly);
      setFeatured(product.featured);
      setBestseller(product.bestseller);
      setNewArrival(product.newArrival);
      setPrice(product.price);
      setCompareAtPrice(product.compareAtPrice || '');
      setCostPrice(product.costPrice || '');
      setImages(product.images || []);
      setSelectedColors(product.colors || []);
      setSelectedSizes(product.sizes || []);
      setVariants(product.variants || []);
      setFabric(product.fabric || '');
      setFit(product.fit || '');
      setPattern(product.pattern || '');
      setNeckStyle(product.neckStyle || '');
      setSleeveLength(product.sleeveLength || '');
      setLength(product.length || '');
      setOccasion(product.occasion || '');
      setGender(product.gender || 'Women');
      setTags(product.tags || []);
      setCareInstructions(product.careInstructions || '');
      setShippingInfo(product.shippingInfo || '');
      setReturnPolicy(product.returnPolicy || '');
      setSeoTitle(product.seo?.title || '');
      setSeoDescription(product.seo?.description || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="font-bold text-gray-700">Product not found in catalog database.</p>
        <Link href="/admin/products" className="text-xs text-[var(--color-primary-gold)] underline font-bold mt-2 inline-block">
          Return to Admin Products
        </Link>
      </div>
    );
  }

  const handleGenerateVariants = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      alert('Please select at least one color and one size.');
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

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  const handleSave = (publishStatus: 'published' | 'draft' | 'archived') => {
    setSaving(true);

    const productPayload: Partial<CatalogProduct> = {
      id,
      name,
      slug: slug || slugify(name),
      category,
      categoryName: getCategoryNameBySlug(category),
      subcategory,
      shortDescription,
      description,
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
      rating: product.rating,
      reviewCount: product.reviewCount,
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
    alert(`Product "${saved.name}" updated successfully!`);
    router.push('/admin/products');
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Edit Product: {product.name}</h1>
            <p className="text-xs text-gray-500">Product ID: {product.id} · Status: <span className="font-bold uppercase text-[var(--color-primary-gold)]">{status}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${product.id}/preview`}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye size={15} /> Customer Preview
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'basic', label: '1. Basic Info' },
          { key: 'media', label: '2. Media' },
          { key: 'pricing', label: '3. Pricing' },
          { key: 'variants', label: '4. Variants & Stock' },
          { key: 'attributes', label: '5. Specifications' },
          { key: 'shipping', label: '6. Shipping' },
          { key: 'seo', label: '7. SEO' },
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
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Official Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-white"
              >
                {YEZBEE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Subcategory</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
          </div>

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
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>Bestseller</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="rounded text-[var(--color-primary-gold)]" />
              <span>New Arrival</span>
            </label>
          </div>
        </div>
      )}

      {/* ── TAB 2: MEDIA ── */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Media</h2>
          <div className="flex gap-2 max-w-xl">
            <input
              type="text"
              placeholder="Add image URL..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
            />
            <button onClick={handleAddImage} className="px-5 py-2.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase rounded-xl">
              Add Image
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-300 bg-gray-50 group">
                <Image src={img} alt="" fill className="object-cover" />
                <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: PRICING ── */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Selling Price (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Compare-at Price (₹)</label>
              <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(Number(e.target.value))} className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Cost Price (₹)</label>
              <input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none bg-gray-50" />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VARIANTS & STOCK ── */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Variants & Inventory Management</h2>

          {variants.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Color</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Stock Quantity</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold">{v.color}</td>
                      <td className="p-3 font-bold text-[var(--color-primary-gold)]">{v.size}</td>
                      <td className="p-3 font-mono">{v.sku}</td>
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

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-dark)] text-white p-4 border-t border-[var(--color-primary-gold)] shadow-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-bold">{name}</p>
          <p className="text-[10px] text-gray-400">Total Stock: {totalStock}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase rounded-xl"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase rounded-xl font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
